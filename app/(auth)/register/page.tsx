import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Image as ImageIcon } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600 mb-6">
            <ImageIcon className="h-8 w-8" />
            <span>PicVault</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">创建账号</h2>
          <p className="mt-2 text-sm text-gray-600">
            注册以开始管理您的图片库
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>注册</CardTitle>
            <CardDescription>
              填写以下信息完成注册
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                id="username" 
                placeholder="johndoe" 
                label="用户名"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <Input 
                id="email" 
                placeholder="name@example.com" 
                label="邮箱"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>
            <div className="space-y-2">
              <Input 
                id="password" 
                placeholder="••••••••" 
                label="密码"
                type="password"
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500">密码长度至少为 6 个字符</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full">注册</Button>
            <div className="text-center text-sm text-gray-500">
              已有账号？{' '}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                直接登录
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
