'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Calendar, MapPin, Tag, Download, Trash2, Edit, Info, Camera, Aperture } from 'lucide-react';
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
  const [allTags, setAllTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchImage();
      fetchTags();
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

  async function fetchTags() {
    try {
      const res = await fetch('/api/tags');
      if (res.ok) {
        const data = await res.json();
        setAllTags(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddTag(tagId: number) {
    try {
      const res = await fetch(`/api/images/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addTag', tagId })
      });
      if (res.ok) {
        const data = await res.json();
        setImage(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRemoveTag(tagId: number) {
    try {
      const res = await fetch(`/api/images/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'removeTag', tagId })
      });
      if (res.ok) {
        const data = await res.json();
        setImage(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateAndAddTag() {
    if (!newTagName.trim()) return;
    
    setAddingTag(true);
    try {
      // 创建新标签
      const createRes = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() })
      });
      
      if (createRes.ok) {
        const newTag = await createRes.json();
        // 添加到图片
        await handleAddTag(newTag.id);
        // 刷新标签列表
        await fetchTags();
        setNewTagName('');
      } else {
        const error = await createRes.json();
        alert(error.error || '创建标签失败');
      }
    } catch (error) {
      console.error(error);
      alert('创建标签失败');
    } finally {
      setAddingTag(false);
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? '取消编辑' : '编辑'}
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
          {isEditing ? (
            <ImageEditor 
              imageUrl={image.url} 
              imageId={id}
              onSave={(newUrl) => {
                setImage({ ...image, url: newUrl });
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
              <img src={image.url} alt={image.title} className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">


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
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">拍摄地点</p>
                  {image.locationAddress ? (
                    <>
                      <p className="font-medium text-gray-900">{image.locationAddress}</p>
                      {image.location && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          GPS: {image.location}
                        </p>
                      )}
                    </>
                  ) : image.location ? (
                    <p className="font-medium">{image.location}</p>
                  ) : (
                    <p className="font-medium">未知</p>
                  )}
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
                  <span className="text-gray-500">文件类型</span>
                  <span className="font-medium">{image.mimeType || '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">设备</span>
                  <span className="font-medium">{image.camera || '未知'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EXIF Information */}
          {(image.lensModel || image.aperture || image.shutterSpeed || image.iso) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-600" />
                  拍摄参数
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {image.lensModel && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">镜头</span>
                    <span className="font-medium">{image.lensModel}</span>
                  </div>
                )}
                {image.aperture && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">光圈</span>
                    <span className="font-medium">f/{image.aperture}</span>
                  </div>
                )}
                {image.shutterSpeed && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">快门速度</span>
                    <span className="font-medium">{image.shutterSpeed}s</span>
                  </div>
                )}
                {image.iso && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ISO</span>
                    <span className="font-medium">{image.iso}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Custom Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">自定义标签</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {image.tags && image.tags.length > 0 ? image.tags.map((tag: any) => (
                  <span 
                    key={tag.id} 
                    className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full font-medium flex items-center gap-1 group"
                  >
                    <Link href={`/gallery?search=${encodeURIComponent(tag.name)}`} className="hover:underline">
                      {tag.name}
                    </Link>
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                      title="移除标签"
                    >
                      ×
                    </button>
                  </span>
                )) : (
                  <span className="text-gray-400 text-sm">暂无标签</span>
                )}
              </div>
              
              {/* 添加已有标签 */}
              {allTags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">选择已有标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags
                      .filter(tag => !image.tags?.some((t: any) => t.id === tag.id))
                      .map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag.id)}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors"
                        >
                          + {tag.name}
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {/* 创建新标签 */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="创建新标签..." 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateAndAddTag()}
                  className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500"
                  disabled={addingTag}
                />
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={handleCreateAndAddTag}
                  disabled={addingTag || !newTagName.trim()}
                >
                  {addingTag ? '添加中...' : '添加'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

