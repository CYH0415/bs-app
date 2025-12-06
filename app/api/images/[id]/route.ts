import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const imageId = parseInt(id);

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: { tags: true },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    if (image.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Fetch image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const imageId = parseInt(id);

    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    if (image.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.image.delete({
      where: { id: imageId },
    });

    // Note: In a real app, we should also delete the file from disk here.

    return NextResponse.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 更新图片标签
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const imageId = parseInt(id);
    const { action, tagId, tagIds, title } = await request.json();

    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    if (image.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'updateTitle' && title !== undefined) {
      // 更新标题
      await prisma.image.update({
        where: { id: imageId },
        data: { title: title.trim() }
      });
    } else if (action === 'addTag' && tagId) {
      // 添加单个标签
      await prisma.image.update({
        where: { id: imageId },
        data: {
          tags: {
            connect: { id: tagId }
          }
        }
      });
    } else if (action === 'removeTag' && tagId) {
      // 移除单个标签
      await prisma.image.update({
        where: { id: imageId },
        data: {
          tags: {
            disconnect: { id: tagId }
          }
        }
      });

      // 检查该标签是否还关联其他图片,如果没有则自动删除
      const tag = await prisma.tag.findUnique({
        where: { id: tagId },
        include: {
          _count: {
            select: { images: true }
          }
        }
      });

      if (tag && tag._count.images === 0) {
        // 标签已无关联图片,自动删除
        await prisma.tag.delete({
          where: { id: tagId }
        });
      }
    } else if (action === 'setTags' && Array.isArray(tagIds)) {
      // 设置所有标签
      await prisma.image.update({
        where: { id: imageId },
        data: {
          tags: {
            set: tagIds.map(id => ({ id }))
          }
        }
      });
    }

    const updatedImage = await prisma.image.findUnique({
      where: { id: imageId },
      include: { tags: true }
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Update image tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
