import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'], // 只显示警告和错误，不显示查询日志
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
