import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { generateAndSaveThumbnail } from '@/lib/thumbnail';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageId = formData.get('imageId') as string;

    if (!file || !imageId) {
      return NextResponse.json({ error: 'Missing file or imageId' }, { status: 400 });
    }

    // 验证图片所有权
    const image = await prisma.image.findUnique({
      where: { id: parseInt(imageId) }
    });

    if (!image || image.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 保存编辑后的图片
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `${uuidv4()}-edited.jpg`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if exists
    }

    const filepath = path.join(uploadDir, uniqueFilename);
    await writeFile(filepath, buffer);

    // 生成新的缩略图
    const thumbnailUrl = await generateAndSaveThumbnail(buffer, uploadDir, uniqueFilename);

    // 获取编辑后图片的尺寸
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || null;
    const height = metadata.height || null;

    // 更新数据库中的图片 URL、缩略图 URL 和尺寸
    const updatedImage = await prisma.image.update({
      where: { id: parseInt(imageId) },
      data: {
        url: `/api/uploads/${uniqueFilename}`,
        thumbnailUrl: thumbnailUrl,
        size: buffer.length,
        width,
        height
      }
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('Edit image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

