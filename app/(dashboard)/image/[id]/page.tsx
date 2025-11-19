import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Calendar, MapPin, Tag, Download, Trash2, Edit, Info } from 'lucide-react';
import Link from 'next/link';
import { ImageEditor } from '@/components/features/ImageEditor';

export default async function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Mock data
  const image = {
    id: id,
    title: 'Mountain View.jpg',
    url: 'https://placehold.co/800x600', // Placeholder
    takenAt: '2023-10-15 14:30',
    location: 'Yosemite National Park, CA',
    resolution: '4032 x 3024',
    size: '4.2 MB',
    camera: 'iPhone 14 Pro',
    tags: ['风景', '山脉', '自然', '旅行', '天空'],
    aiTags: ['Mountain', 'Nature', 'Sky', 'Outdoor'],
  };

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
          <Button variant="danger" size="sm">
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
                {image.aiTags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                    {tag}
                  </span>
                ))}
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
                  <p className="font-medium">{image.takenAt}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">拍摄地点</p>
                  <p className="font-medium">{image.location}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">分辨率</span>
                  <span className="font-medium">{image.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">文件大小</span>
                  <span className="font-medium">{image.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">设备</span>
                  <span className="font-medium">{image.camera}</span>
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
                {image.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                    {tag}
                  </span>
                ))}
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
