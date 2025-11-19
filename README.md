## 1. 项目概述 (Project Overview)

本项目是一个基于 Next.js 的全栈 Web 应用，旨在实现一个图片管理与展示系统。项目需要满足课程作业的提交要求，包括用户认证、图片上传处理、元数据管理、AI 分析以及响应式设计。

## 2. 功能需求 (Functional Requirements)

(以下内容源自原始需求)

基础功能：

- 用户认证： 实现用户注册、登录功能。

- 验证：用户名、密码（>6字符）、Email格式验证。

- 唯一性：保证用户名和Email在系统中唯一。

- 图片上传： 支持PC或手机浏览器上传图片（JPG/PNG等）并存储在服务器本地。

- 自动元数据提取： 解析上传图片的 EXIF 信息（时间、地点、分辨率等）并自动创建分类标签。

- 自定义标签： 用户可以给图片手动增加自定义分类标签，方便检索。

- 缩略图生成： 上传时自动生成缩略图，用于列表显示，优化性能。

- 数据持久化： 图片信息及元数据保存在数据库中。

- 图片检索： 提供查询界面，支持按时间、标签、地点等多条件查找图片。

- 展示界面： 友好的瀑布流或网格展示，支持点击图片进行轮播/大图浏览。

- 图片编辑： 对选定的图片提供简单编辑功能（裁剪、修改色调等）。

- 删除功能： 用户可删除自己上传的图片。

- 响应式适配： 样式必须适配手机，能够在手机浏览器/微信内置浏览器中友好显示。

增强功能：

- AI 分析： 调用 AI 模型（如 Gemini）分析图片，自动生成多类型标签（风景、人物、动物等）。

- AI 对话检索 (MCP)： 提供对话式接口，通过自然语言检索网站上的图片（RAG 模式）。

## 3. 技术栈选用 (Tech Stack)

为了满足全栈开发与 Docker 部署的需求，采用以下技术栈：

- Framework: Next.js 14+ (App Router)

- Language: TypeScript

- Styling: Tailwind CSS (配合 lucide-react 图标库)

- Database: SQLite (开发/提交首选) 或 MySQL。

- ORM: Prisma (用于数据建模和查询)。

- Image Processing: sharp (用于生成缩略图、裁剪、滤镜处理)。

- EXIF Parsing: exif-parser。

- Auth: 自定义 JWT 认证 (使用 jose 或 jsonwebtoken) 结合 Next.js Middleware，或者 NextAuth.js。

- AI Integration: Google Gemini API (Google Generative AI SDK).

## 4. 数据库设计 (Database Schema)

使用 Prisma Schema 描述。
```
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // 提交作业时改为 "file:./dev.db"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String   // 存储 bcrypt hash
  createdAt DateTime @default(now())
  images    Image[]
  tags      Tag[]
}

model Image {
  id            Int      @id @default(autoincrement())
  title         String?  @default("Untitled")
  originalPath  String   // 原始文件存储路径 (例如 /uploads/orig/...)
  thumbnailPath String   // 缩略图存储路径
  fileSize      Int
  mimeType      String
  width         Int?
  height        Int?
  location      String?  // 从 EXIF 提取的地点字符串
  takenAt       DateTime? // 从 EXIF 提取的拍摄时间
  
  exifData      String?  // 存储完整 EXIF JSON 字符串
  aiTags        String?  // 存储 AI 分析出的标签 JSON 字符串 (数组)
  
  createdAt     DateTime @default(now())
  userId        Int
  user          User     @relation(fields: [userId], references: [id])
  
  tags          Tag[]    // 自定义标签关系
}

model Tag {
  id     Int     @id @default(autoincrement())
  name   String
  userId Int
  user   User    @relation(fields: [userId], references: [id])
  images Image[]

  @@unique([name, userId]) // 同一个用户不能有重复同名标签
}
```

## 5. 代码结构 (Code Structure for Next.js App Router)

请严格遵循 Next.js App Router 的最佳实践：
```
src/
├── app/
│   ├── api/                 # 后端 API 路由
│   │   ├── auth/            # 登录/注册 API
│   │   ├── upload/          # 图片上传 API (处理 multipart/form-data)
│   │   ├── images/          # 图片查询 API
│   │   └── ai/              # AI 分析与对话 API
│   ├── (auth)/              # 认证页面组 (Login, Register)
│   ├── (dashboard)/         # 主应用页面组 (需要登录访问)
│   │   ├── gallery/         # 图片列表展示
│   │   ├── upload/          # 上传页面
│   │   └── image/[id]/      # 图片详情与编辑
│   ├── layout.tsx           # 全局布局
│   └── page.tsx             # 首页 (重定向或 Landing Page)
├── components/
│   ├── ui/                  # 通用 UI 组件 (Buttons, Inputs, Modals)
│   ├── features/            # 业务组件
│   │   ├── ImageGrid.tsx    # 瀑布流网格
│   │   ├── UploadZone.tsx   # 上传控件
│   │   └── ImageEditor.tsx  # 编辑器组件 (React-Image-Crop)
├── lib/
│   ├── prisma.ts            # Prisma Client 单例
│   ├── utils.ts             # 通用工具函数
│   ├── auth.ts              # JWT 验证逻辑
│   ├── storage.ts           # 文件保存与路径处理逻辑
│   └── ai-service.ts        # Gemini API 调用封装
├── prisma/
│   └── schema.prisma        # 数据库定义
└── public/
    └── uploads/             # (作业可使用自定义 Server Route 读取此目录)
```

6. 关键实现提示 (Implementation Notes for AI Agent)

- 文件上传： 由于 Next.js Server Actions 对 FormData 支持良好，优先使用 Server Actions 处理上传，或者使用 API Route `(POST /api/upload)` 配合 Busboy 或 node:stream 写入本地磁盘。

- 本地文件服务： 为了能在浏览器访问本地上传的图片，需要在 next.config.mjs 中配置 images 域名，或者创建一个专门的 API Route `(app/api/uploads/[...path]/route.ts)` 来读取磁盘文件流并返回给前端。

- AI 集成： 使用 Google Gemini Flash 模型进行图片分析，速度快且免费额度够用。

- 状态管理： 使用 React Context 或 Zustand 管理全局状态（如当前选中的图片、用户登录状态）。

- 样式： 使用 Tailwind CSS 也就是 Mobile-First 的写法（例如 grid-cols-1 md:grid-cols-3）。