import React from 'react';
import { Upload, FileImage } from 'lucide-react';
import { Button } from '../ui/Button';

export const UploadZone: React.FC = () => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="bg-blue-50 p-4 rounded-full mb-4">
        <Upload className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">点击或拖拽上传图片</h3>
      <p className="text-sm text-gray-500 mb-6">支持 JPG, PNG 格式</p>
      <Button>选择文件</Button>
    </div>
  );
};
