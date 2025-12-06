import { prisma } from '@/lib/prisma';
import { SearchImagesParams, ImageBasicInfo } from '../types';

export async function searchImages(
  userId: number,
  params: SearchImagesParams
): Promise<ImageBasicInfo[]> {
  const { query, tagName, location, startDate, endDate } = params;

  const where: any = {
    userId,
  };

  // 搜索条件
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { location: { contains: query } },
      { camera: { contains: query } },
      { tags: { some: { name: { contains: query } } } },
    ];
  }

  // 标签筛选
  if (tagName) {
    where.tags = { some: { name: { contains: tagName } } };
  }

  // 地点筛选 - 同时搜索GPS坐标和解析后的地址
  if (location) {
    where.OR = where.OR ? [
      ...where.OR,
      { location: { contains: location } },
      { locationAddress: { contains: location } },
    ] : [
      { location: { contains: location } },
      { locationAddress: { contains: location } },
    ];
  }

  // 日期范围筛选
  if (startDate || endDate) {
    where.takenAt = {};
    if (startDate) {
      where.takenAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.takenAt.lte = new Date(endDate);
    }
  }

  const images = await prisma.image.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { tags: true },
    take: 50, // 限制返回数量
  });

  // 转换为基本信息格式
  return images.map((image) => ({
    id: image.id,
    title: image.title,
    url: image.url,
    thumbnailUrl: image.thumbnailUrl,
    takenAt: image.takenAt?.toISOString() || null,
    location: image.location,
    locationAddress: image.locationAddress || null, // 添加解析后的地址
    tags: image.tags.map((tag) => ({ id: tag.id, name: tag.name })),
  }));
}
