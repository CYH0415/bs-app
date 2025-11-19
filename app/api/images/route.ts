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

    const where: any = {
      userId: session.userId as number,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tags: { some: { name: { contains: search } } } },
      ];
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
