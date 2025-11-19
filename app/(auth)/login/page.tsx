'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      router.push('/gallery');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600 mb-6">
            <ImageIcon className="h-8 w-8" />
            <span>PicVault</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">欢迎回来</h2>
          <p className="mt-2 text-sm text-gray-600">
            请输入您的账号信息以登录
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>登录</CardTitle>
              <CardDescription>
                使用您的邮箱或用户名登录
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Input 
                  name="email"
                  id="email" 
                  placeholder="name@example.com" 
                  label="邮箱 / 用户名"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input 
                  name="password"
                  id="password" 
                  placeholder="••••••••" 
                  label="密码"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full" isLoading={isLoading}>登录</Button>
              <div className="text-center text-sm text-gray-500">
                还没有账号？{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                  立即注册
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

