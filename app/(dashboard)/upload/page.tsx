'use client';

import { UploadZone } from '@/components/features/UploadZone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          router.push('/gallery');
        } else {
          alert('Upload failed');
        }
      } catch (error) {
        console.error(error);
        alert('Upload error');
      } finally {
        setUploading(false);
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">上传图片</h1>
        <p className="text-sm text-gray-500">将图片添加到您的图库中</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>选择文件</CardTitle>
          <CardDescription>
            支持 JPG, PNG, GIF 等常见格式。单张图片最大 10MB。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            {uploading ? (
              <div className="text-blue-600">上传中...</div>
            ) : (
              <>
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileSelect}
                  accept="image/*"
                />
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">点击或拖拽上传图片</h3>
                <p className="text-sm text-gray-500 mb-6">支持 JPG, PNG 格式</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">选择文件</button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">提示：</p>
        <ul className="list-disc list-inside space-y-1 opacity-80">
          <li>上传后系统会自动提取图片的 EXIF 信息（拍摄时间、地点等）。</li>
          <li>AI 将自动分析图片内容并为您生成分类标签。</li>
        </ul>
      </div>
    </div>
  );
}

