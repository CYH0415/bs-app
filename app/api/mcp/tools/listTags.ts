import { prisma } from '@/lib/prisma';
import { TagInfo } from '../types';

export async function listTags(userId: number): Promise<TagInfo[]> {
  const tags = await prisma.tag.findMany({
    where: { userId },
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: {
      images: {
        _count: 'desc',
      },
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    imageCount: tag._count.images,
  }));
}
