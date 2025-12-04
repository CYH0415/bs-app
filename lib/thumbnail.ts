import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * Generate a thumbnail from an image buffer
 * @param buffer - Original image buffer
 * @param maxWidth - Maximum width for the thumbnail (default: 400px)
 * @param quality - JPEG quality (default: 85)
 * @returns Thumbnail buffer
 */
export async function generateThumbnail(
  buffer: Buffer,
  maxWidth: number = 400,
  quality: number = 85
): Promise<Buffer> {
  const thumbnailBuffer = await sharp(buffer)
    .resize(maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality })
    .toBuffer();
  
  return thumbnailBuffer;
}

/**
 * Save a thumbnail to disk and return the relative URL
 * @param buffer - Thumbnail buffer to save
 * @param uploadDir - Directory to save the thumbnail
 * @param baseFilename - Base filename (will be prefixed with 'thumb-')
 * @returns Relative URL path to the thumbnail
 */
export async function saveThumbnail(
  buffer: Buffer,
  uploadDir: string,
  baseFilename: string
): Promise<string> {
  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore if exists
  }

  // Generate thumbnail filename
  const thumbnailFilename = `thumb-${baseFilename}`;
  const thumbnailPath = path.join(uploadDir, thumbnailFilename);
  
  // Save thumbnail
  await writeFile(thumbnailPath, buffer);
  
  // Return relative URL
  return `/uploads/${thumbnailFilename}`;
}

/**
 * Generate and save a thumbnail in one operation
 * @param buffer - Original image buffer
 * @param uploadDir - Directory to save the thumbnail
 * @param baseFilename - Base filename (will be prefixed with 'thumb-')
 * @param maxWidth - Maximum width for the thumbnail (default: 400px)
 * @param quality - JPEG quality (default: 85)
 * @returns Relative URL path to the thumbnail
 */
export async function generateAndSaveThumbnail(
  buffer: Buffer,
  uploadDir: string,
  baseFilename: string,
  maxWidth: number = 400,
  quality: number = 85
): Promise<string> {
  const thumbnailBuffer = await generateThumbnail(buffer, maxWidth, quality);
  return await saveThumbnail(thumbnailBuffer, uploadDir, baseFilename);
}
