'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Calendar, MapPin, Tag, Download, Trash2, Edit, Info } from 'lucide-react';
import Link from 'next/link';
import { ImageEditor } from '@/components/features/ImageEditor';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchImage();
    }
  }, [id]);

  async function fetchImage() {
    try {
      const res = await fetch(`/api/images/${id}`);
      if (res.ok) {
        const data = await res.json();
        setImage(data);
      } else {
        // Handle 404 or 403
        router.push('/gallery');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('确定要删除这张图片吗？')) return;
    
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/gallery');
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) return <div className="p-8 text-center">加载中...</div>;
  if (!image) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/gallery">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 truncate max-w-md">{image.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            下载
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
            {/* Replace with actual Image component */}
            <div className="text-gray-400 flex flex-col items-center">
               <img src={image.url} alt={image.title} className="max-w-full max-h-full object-contain" />
            </div>
          </div>
          
          {/* Editor Placeholder (Hidden by default, shown when editing) */}
          {/* <ImageEditor /> */}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* AI Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                智能标签
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {image.tags && image.tags.length > 0 ? image.tags.map((tag: any) => (
                  <span key={tag.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                    {tag.name}
                  </span>
                )) : (
                  <span className="text-gray-400 text-sm">暂无标签</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-600" />
                详细信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">拍摄时间</p>
                  <p className="font-medium">{image.takenAt ? new Date(image.takenAt).toLocaleString() : '未知'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">拍摄地点</p>
                  <p className="font-medium">{image.location || '未知'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">分辨率</span>
                  <span className="font-medium">{image.width && image.height ? `${image.width} x ${image.height}` : '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">文件大小</span>
                  <span className="font-medium">{image.size ? `${(image.size / 1024 / 1024).toFixed(2)} MB` : '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">设备</span>
                  <span className="font-medium">{image.camera || '未知'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">自定义标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Reuse tags for now, or separate if schema supports it */}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="添加标签..." 
                  className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500"
                />
                <Button size="sm" variant="secondary">添加</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

