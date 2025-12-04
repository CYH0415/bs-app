import { prisma } from '@/lib/prisma';
import { GetImageDetailsParams, ImageDetailInfo } from '../types';

export async function getImageDetails(
  userId: number,
  params: GetImageDetailsParams
): Promise<ImageDetailInfo | null> {
  const { imageId } = params;

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
      userId, // 确保只能查看自己的图片
    },
    include: { tags: true },
  });

  if (!image) {
    return null;
  }

  return {
    id: image.id,
    title: image.title,
    url: image.url,
    thumbnailUrl: image.thumbnailUrl,
    takenAt: image.takenAt?.toISOString() || null,
    location: image.location,
    tags: image.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    width: image.width,
    height: image.height,
    size: image.size,
    mimeType: image.mimeType,
    camera: image.camera,
    lensModel: image.lensModel,
    aperture: image.aperture,
    shutterSpeed: image.shutterSpeed,
    iso: image.iso,
    exifData: image.exifData,
    createdAt: image.createdAt.toISOString(),
  };
}
