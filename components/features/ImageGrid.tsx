import React from 'react';
import Link from 'next/link';
import { Image as ImageIcon } from 'lucide-react';

interface ImageGridProps {
  images?: any[]; // Replace with proper type later
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images = [] }) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">暂无图片</p>
        <p className="text-sm">上传一些图片开始吧</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Placeholder for images */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Link href={`/image/${i}`} key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <ImageIcon className="h-8 w-8" />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </Link>
      ))}
    </div>
  );
};
