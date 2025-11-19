import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// 删除标签
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tagId = parseInt(params.id);
    
    // 验证标签属于当前用户
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!tag || tag.userId !== session.userId) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    await prisma.tag.delete({
      where: { id: tagId }
    });

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 更新标签名称
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tagId = parseInt(params.id);
    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    // 验证标签属于当前用户
    const tag = await prisma.tag.findUnique({
      where: { id: tagId }
    });

    if (!tag || tag.userId !== session.userId) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: { name: name.trim() }
    });

    return NextResponse.json(updatedTag);
  } catch (error: any) {
    console.error('Update tag error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Tag name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
