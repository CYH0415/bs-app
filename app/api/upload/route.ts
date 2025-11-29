import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import exifr from 'exifr';
import sharp from 'sharp';
import convert from 'heic-convert';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    let buffer = Buffer.from(await file.arrayBuffer()) as Buffer;
    let filename = file.name.replace(/\s/g, '_');
    let mimeType = file.type;
    
    // Parse EXIF from the original buffer before any conversion
    let takenAt = new Date();
    let location = null;
    let camera = null;
    let lensModel = null;
    let aperture = null;
    let shutterSpeed = null;
    let iso = null;
    let exifDataFull = {};
    let width = 0;
    let height = 0;

    try {
      // Parse with explicit options to ensure we get what we need
      const exifData = await exifr.parse(buffer, {
        tiff: true,
        exif: true,
        gps: true,
        mergeOutput: true
      });
      
      if (exifData) {
        exifDataFull = exifData; // Store full EXIF data

        if (exifData.DateTimeOriginal) {
          takenAt = new Date(exifData.DateTimeOriginal);
        } else if (exifData.CreateDate) {
          takenAt = new Date(exifData.CreateDate);
        }
        
        // Combine Make and Model for better camera info
        if (exifData.Make || exifData.Model) {
          camera = [exifData.Make, exifData.Model].filter(Boolean).join(' ');
        }

        if (exifData.LensModel) {
          lensModel = exifData.LensModel;
        }

        if (exifData.FNumber) {
          aperture = exifData.FNumber;
        }

        if (exifData.ExposureTime) {
          // Convert exposure time to string (e.g., "1/50") if it's a number
          shutterSpeed = exifData.ExposureTime.toString();
          if (exifData.ExposureTime < 1 && exifData.ExposureTime > 0) {
             shutterSpeed = `1/${Math.round(1 / exifData.ExposureTime)}`;
          }
        }

        if (exifData.ISO) {
          iso = exifData.ISO;
        }
        
        if (exifData.ExifImageWidth && exifData.ExifImageHeight) {
          width = exifData.ExifImageWidth;
          height = exifData.ExifImageHeight;
        }

        // Extract GPS if available
        if (exifData.latitude !== undefined && exifData.longitude !== undefined) {
          location = `${exifData.latitude.toFixed(6)}, ${exifData.longitude.toFixed(6)}`;
        }
      }
    } catch (e) {
      console.log('EXIF parsing failed', e);
    }

    // Handle HEIC conversion
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic' || file.type === 'image/heif';
    
    if (isHeic) {
      console.log('Detected HEIC file, attempting conversion...');
      console.log('Buffer size:', buffer.length);
      try {
        // Convert HEIC to JPEG using heic-convert
        const outputBuffer = await convert({
          buffer: buffer as any, // Type conversion needed for compatibility
          format: 'JPEG',
          quality: 0.9
        });
        
        const convertedBuffer = Buffer.from(outputBuffer);
        console.log('HEIC conversion successful, new size:', convertedBuffer.length);
        buffer = convertedBuffer;
        
        // Update filename extension and mime type
        filename = filename.replace(/\.heic$/i, '.jpg');
        mimeType = 'image/jpeg';
        
        // Update dimensions if we didn't get them from EXIF
        if (width === 0 || height === 0) {
          const metadata = await sharp(buffer).metadata();
          width = metadata.width || 0;
          height = metadata.height || 0;
        }
      } catch (e) {
        console.error('HEIC conversion failed:', e);
        // If conversion fails, throw error to notify user
        return NextResponse.json({ error: 'Failed to convert HEIC image. Please try converting to JPG manually.' }, { status: 500 });
      }
    } else {
      console.log('Not a HEIC file:', file.name, file.type);
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${filename}`;
    const thumbnailFilename = `thumb-${uniqueFilename}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    // Save original image
    const filepath = path.join(uploadDir, uniqueFilename);
    await writeFile(filepath, buffer);

    // Generate thumbnail (max width 400px, maintain aspect ratio)
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    const thumbnailPath = path.join(uploadDir, thumbnailFilename);
    await writeFile(thumbnailPath, thumbnailBuffer);

    const image = await prisma.image.create({
      data: {
        url: `/uploads/${uniqueFilename}`,
        thumbnailUrl: `/uploads/${thumbnailFilename}`,
        title: file.name, // Keep original name as title
        size: buffer.length,
        mimeType: mimeType,
        width,
        height,
        takenAt,
        camera,
        location,
        lensModel,
        aperture,
        shutterSpeed,
        iso,
        exifData: exifDataFull as any, // Cast to any for Prisma Json type
        userId: session.userId as number,
      },
    });

    // Asynchronously generate AI tags
    // We don't await this to keep the upload response fast
    // But for this assignment, we might want to await it or handle it better
    // Let's await it for simplicity and immediate feedback
    try {
      const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;
      const { generateImageTags } = await import('@/lib/ai');
      const aiTags = await generateImageTags(base64Image);
      
      if (aiTags.length > 0) {
        const tagIds = [];
        for (const tagName of aiTags) {
          try {
             // Upsert tag for this user to ensure it exists
             const tag = await prisma.tag.upsert({
                where: { 
                  name_userId: { 
                    name: tagName, 
                    userId: session.userId as number 
                  } 
                },
                update: {},
                create: { 
                  name: tagName, 
                  userId: session.userId as number 
                }
             });
             tagIds.push({ id: tag.id });
          } catch (e) {
            console.error(`Failed to upsert tag ${tagName}`, e);
          }
        }
        
        if (tagIds.length > 0) {
          await prisma.image.update({
              where: { id: image.id },
              data: {
                  tags: {
                      connect: tagIds
                  }
              }
          });
        }
      }
    } catch (aiError) {
      console.error('Failed to generate AI tags:', aiError);
      // Don't fail the upload if AI fails
    }

    return NextResponse.json({ message: 'Upload successful', image });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
