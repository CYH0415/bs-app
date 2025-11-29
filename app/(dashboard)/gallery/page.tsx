'use client';

import { ImageGrid } from '@/components/features/ImageGrid';
import { ImageCarousel } from '@/components/features/ImageCarousel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local state for inputs
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  
  const [tags, setTags] = useState<any[]>([]);

  // Carousel state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Sync inputs with URL params when they change externally
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setStartDate(searchParams.get('startDate') || '');
    setEndDate(searchParams.get('endDate') || '');
  }, [searchParams]);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [searchParams]);

  async function fetchTags() {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Failed to fetch tags', error);
    }
  }

  async function fetchImages() {
    setLoading(true);
    try {
      // Use searchParams directly as source of truth
      const queryString = searchParams.toString();
      const url = queryString ? `/api/images?${queryString}` : '/api/images';
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch images', error);
    } finally {
      setLoading(false);
    }
  }

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/gallery?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput });
  }

  function handleTagFilter(tagId: string | null) {
    // If clicking "All", clear tagId AND search (since search might be a tag name)
    if (!tagId) {
       // If we want to clear everything:
       // updateParams({ tagId: null, search: null });
       // But maybe user wants to keep search text?
       // The user said "gallery page filtering only relates to selected tag".
       // Let's just clear tagId.
       updateParams({ tagId: null });
    } else {
       updateParams({ tagId });
    }
  }
  
  function applyDateFilter() {
    updateParams({ startDate, endDate });
  }

  function clearFilters() {
    router.push('/gallery');
    setSearchInput('');
    setStartDate('');
    setEndDate('');
  }

  const currentTagId = searchParams.get('tagId');
  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的图库</h1>
          <p className="text-sm text-gray-500">
            {images.length} 张图片 {hasActiveFilters && '(已筛选)'}
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索图片、标签、地点..." 
              className="pl-9" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="md" 
            className="shrink-0" 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button size="md" type="submit">搜索</Button>
        </form>
      </div>

      {/* 高级筛选面板 */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">高级筛选</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                清除筛选
              </button>
            )}
          </div>
          
          {/* 日期范围 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                开始日期
              </label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                结束日期
              </label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <Button size="sm" onClick={applyDateFilter}>应用筛选</Button>
        </div>
      )}

      {/* Tags / Categories */}
      <div className="flex flex-wrap gap-2 pb-2">
        <button
          onClick={() => handleTagFilter(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !currentTagId
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          全部 ({images.length})
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagFilter(tag.id.toString())}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              currentTagId === tag.id.toString()
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tag.name} ({tag._count?.images || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {hasActiveFilters ? '没有符合条件的图片' : '还没有上传图片'}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              清除筛选
            </Button>
          )}
        </div>
      ) : (
        <>
          <ImageGrid 
            images={images} 
            onImageClick={(index) => setSelectedImageIndex(index)}
          />
          
          {selectedImageIndex !== null && (
            <ImageCarousel 
              images={images}
              initialIndex={selectedImageIndex}
              onClose={() => setSelectedImageIndex(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <GalleryContent />
    </Suspense>
  );
}

