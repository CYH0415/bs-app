import { UploadZone } from '@/components/features/UploadZone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function UploadPage() {
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
          <UploadZone />
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
