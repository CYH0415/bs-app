'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/Button';
import { Sliders, RotateCcw, Check, X } from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  imageId: string;
  onSave?: (editedImageUrl: string) => void;
  onCancel?: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ 
  imageUrl, 
  imageId,
  onSave, 
  onCancel 
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [saving, setSaving] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    transform: `rotate(${rotation}deg)`
  };

  const handleReset = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
  };

  const handleSave = async () => {
    if (!imgRef.current || !canvasRef.current) return;
    
    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // 设置画布尺寸
      if (completedCrop) {
        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;
      } else {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
      }

      // 应用滤镜
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      
      // 绘制图片
      if (completedCrop) {
        ctx.drawImage(
          image,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        ctx.drawImage(image, 0, 0);
      }

      // 转换为 Blob 并上传
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('file', blob, 'edited.jpg');
        formData.append('imageId', imageId);

        const response = await fetch('/api/images/edit', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          onSave?.(data.url);
        } else {
          alert('保存失败');
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between pb-4 border-b">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          图片编辑
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 图片预览区 */}
        <div className="lg:col-span-3">
          <div className="bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Edit"
                style={filterStyle}
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>
        </div>

        {/* 调节面板 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              亮度: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              对比度: {contrast}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              饱和度: {saturation}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              旋转: {rotation}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              提示：拖拽图片可裁剪区域
            </p>
          </div>
        </div>
      </div>

      {/* 隐藏的画布用于生成编辑后的图片 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
