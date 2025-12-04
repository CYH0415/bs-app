import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageCarouselProps {
  images: any[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  initialIndex, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Update index if initialIndex changes (though usually this component is mounted fresh)
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  }, [onClose, handlePrevious, handleNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling on body when carousel is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Navigation Buttons */}
      <button 
        onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors hidden md:block"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <button 
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors hidden md:block"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Main Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12" onClick={onClose}>
        <div 
          className="relative max-w-full max-h-[85vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
        >
          <img 
            src={currentImage.url || currentImage.thumbnailUrl} 
            alt={currentImage.title} 
            className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-sm"
          />
          
          {/* Image Info */}
          <div className="mt-4 text-center">
            <h3 className="text-white text-lg font-medium">{currentImage.title}</h3>
            {currentImage.tags && currentImage.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {currentImage.tags.map((tag: any) => (
                  <span key={tag.id} className="text-white/80 text-xs px-2 py-1 bg-white/20 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <p className="text-white/50 text-sm mt-2">
              {currentIndex + 1} / {images.length}
            </p>
            
            <a 
              href={`/image/${currentImage.id}`}
              className="inline-block mt-4 text-white/70 hover:text-white text-sm underline underline-offset-4 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              查看详情
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
