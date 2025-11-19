import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Image as ImageIcon, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <ImageIcon className="h-6 w-6" />
            <span>PicVault</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">功能</Link>
            <Link href="#about" className="hover:text-blue-600 transition-colors">关于</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 text-center px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              智能图片管理，<br />
              <span className="text-blue-600">让记忆井井有条</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
              基于 AI 的智能分类与检索，为您提供安全、高效的云端图片存储服务。
              自动提取元数据，轻松管理您的视觉资产。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  开始使用 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  浏览演示
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
              <p className="text-gray-500">为您打造的全方位图片管理体验</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI 智能分析</h3>
                <p className="text-gray-500">
                  集成 Google Gemini 模型，自动识别图片内容并生成标签，让检索变得前所未有的简单。
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">元数据管理</h3>
                <p className="text-gray-500">
                  自动提取 EXIF 信息，保留拍摄时间、地点等珍贵数据，支持多维度筛选。
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">安全存储</h3>
                <p className="text-gray-500">
                  基于 Next.js 全栈架构，提供安全的用户认证与数据隔离，守护您的隐私。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>© 2025 PicVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
