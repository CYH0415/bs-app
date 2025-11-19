import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tagId = searchParams.get('tagId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const location = searchParams.get('location');

    const where: any = {
      userId: session.userId as number,
    };

    // 搜索条件
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { location: { contains: search } },
        { camera: { contains: search } },
        { tags: { some: { name: { contains: search } } } },
      ];
    }

    // 标签筛选
    if (tagId) {
      where.tags = { some: { id: parseInt(tagId) } };
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

    // 地点筛选
    if (location) {
      where.location = { contains: location };
    }

    const images = await prisma.image.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Fetch images error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
