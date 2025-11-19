import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import exifParser from 'exif-parser';

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Parse EXIF
    let takenAt = new Date();
    let location = null;
    let camera = null;
    let width = 0;
    let height = 0;

    try {
      const parser = exifParser.create(buffer);
      const result = parser.parse();
      
      if (result.tags.DateTimeOriginal) {
        takenAt = new Date(result.tags.DateTimeOriginal * 1000);
      }
      
      // Combine Make and Model for better camera info
      if (result.tags.Make || result.tags.Model) {
        camera = [result.tags.Make, result.tags.Model].filter(Boolean).join(' ');
      }
      
      if (result.imageSize) {
        width = result.imageSize.width || 0;
        height = result.imageSize.height || 0;
      }

      // Extract GPS if available
      if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
        // Format as "Lat, Long" since we don't have a geocoding service
        location = `${result.tags.GPSLatitude.toFixed(6)}, ${result.tags.GPSLongitude.toFixed(6)}`;
      }
    } catch (e) {
      console.log('EXIF parsing failed', e);
    }

    const image = await prisma.image.create({
      data: {
        url: `/uploads/${filename}`,
        title: file.name,
        size: file.size,
        mimeType: file.type,
        width,
        height,
        takenAt,
        camera,
        userId: session.userId as number,
      },
    });

    return NextResponse.json({ message: 'Upload successful', image });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
