import React from 'react';
import Link from 'next/link';
import { Image as ImageIcon, CheckCircle } from 'lucide-react';

interface ImageGridProps {
  images?: any[]; // Replace with proper type later
  selectable?: boolean;
  selectedIds?: (number | string)[];
  onSelect?: (id: number | string) => void;
  onImageClick?: (index: number) => void; // Kept for backward compatibility if needed, but we might not use it in new flow
}

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images = [], 
  selectable = false, 
  selectedIds = [], 
  onSelect,
  onImageClick 
}) => {
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
      {images.map((image, index) => {
        const isSelected = selectedIds.includes(image.id);
        
        return (
          <div 
            key={image.id} 
            className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-all ${selectable ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-blue-500' : ''}`}
            onClick={(e) => {
              if (selectable && onSelect) {
                e.preventDefault();
                onSelect(image.id);
              } else if (onImageClick) {
                e.preventDefault();
                onImageClick(index);
              }
            }}
          >
            {/* If selectable, we don't use Link, we just handle click on the div.
                If NOT selectable and NO onImageClick, we use Link.
            */}
            {selectable || onImageClick ? (
               <>
                 {image.thumbnailUrl || image.url ? (
                  <img 
                    src={image.thumbnailUrl || image.url} 
                    alt={image.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                
                {/* Selection Indicator */}
                {selectable && (
                  <div className={`absolute top-2 right-2 z-10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className={`rounded-full bg-white p-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                      <CheckCircle className={`h-6 w-6 ${isSelected ? 'fill-blue-600 text-white' : ''}`} />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{image.title}</p>
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {image.tags.slice(0, 2).map((tag: any) => (
                        <span key={tag.id} className="text-white/80 text-xs px-1.5 py-0.5 bg-white/20 rounded">
                          {tag.name}
                        </span>
                      ))}
                      {image.tags.length > 2 && (
                        <span className="text-white/80 text-xs px-1.5 py-0.5 bg-white/20 rounded">
                          +{image.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
               </>
            ) : (
              <Link href={`/image/${image.id}`} className="block w-full h-full">
                 {image.thumbnailUrl || image.url ? (
                  <img 
                    src={image.thumbnailUrl || image.url} 
                    alt={image.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs truncate">{image.title}</p>
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {image.tags.slice(0, 2).map((tag: any) => (
                        <span key={tag.id} className="text-white/80 text-xs px-1.5 py-0.5 bg-white/20 rounded">
                          {tag.name}
                        </span>
                      ))}
                      {image.tags.length > 2 && (
                        <span className="text-white/80 text-xs px-1.5 py-0.5 bg-white/20 rounded">
                          +{image.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};
