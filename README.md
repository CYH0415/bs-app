## 1. 项目概述 (Project Overview)

本项目是一个基于 Next.js 的全栈 Web 应用，旨在实现一个图片管理与展示系统。项目需要满足课程作业的提交要求，包括用户认证、图片上传处理、元数据管理、AI 分析以及响应式设计。

## 2. 功能需求 (Functional Requirements)

1. 实现用户注册、登录功能，用户注册时需要填写必要的信息并验证，如用户名、密码要
求在6字节以上，email的格式验证，并保证用户名和email在系统中唯一，用户登录后
可以进行以下操作。 
2. 通过PC或手机浏览器将照片或其他类型的图片上传到网站进行存储。 
3. 能够通过照片的exif信息自动创建图片分类标签及其他辅助信息，如时间、地点、图片
分辨率等。 
4. 可以给图片增加自定义分类标签，方便检索。 
5. 生产缩略图方便后续显示。 
6. 图片信息保存在数据库中，方便后续查询。 
7. 提供查询界面能根据各种条件查找图片。 
8. 提供友好的展示界面，如选择一定的图片进行轮播显示等 
9. 对选定的图片提供简单的编辑功能，如裁剪、修改色调等 
10. 提供删除功能 
11. 样式适配手机，开发手机 App 或能够在手机浏览器/微信等应用内置的浏览器中友好显
示。

增强功能： 
1. 调用AI模型分析图片，提供多类型的标签，如风景、人物、动物等 
2. 提供mcp接口，能通过大模型对话方式检索网站上的图片。

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