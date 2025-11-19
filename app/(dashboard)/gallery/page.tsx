'use client';

import { ImageGrid } from '@/components/features/ImageGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages(query = '') {
    setLoading(true);
    try {
      const url = query ? `/api/images?search=${encodeURIComponent(query)}` : '/api/images';
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchImages(search);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的图库</h1>
          <p className="text-sm text-gray-500">管理和浏览您的所有图片</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索图片..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="md" className="shrink-0" type="submit">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
        </form>
      </div>

      {/* Tags / Categories (Mock) */}
      <div className="flex flex-wrap gap-2 pb-2">
        {['全部', '风景', '人物', '建筑', '美食', '动物'].map((tag, i) => (
          <button
            key={tag}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              i === 0 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : (
        <ImageGrid images={images} />
      )}
    </div>
  );
}

