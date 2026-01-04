# Docker 部署说明

## 快速开始

### 1. 配置环境变量

在项目根目录修改 `.env` 文件

```env
# 数据库密码 - ⚠️ 请修改为您自己的密码
DB_PASSWORD=your_password_here

# JWT 密钥（可选修改）
JWT_SECRET=your-secret-key-change-this-in-production

# API Keys（已配置，无需修改）
ARK_API_KEY=xxx
TX_API_KEY=xxx
```

> **重要**: 请将 `DB_PASSWORD` 修改为您自己的数据库密码。其他 API 密钥已配置，无需修改。

### 2. 启动服务

```bash
# 构建并启动所有服务（后台运行）
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 访问网站

服务启动后，在浏览器中访问：**http://localhost:3000**

## 服务说明

| 服务 | 容器名称 | 端口 | 说明 |
|------|----------|------|------|
| MySQL 数据库 | bs-app-mysql | 3306 | MySQL 8.0 数据库 |
| Next.js 应用 | bs-app-web | 3000 | Web 应用服务 |

## 常用命令

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（会清空数据库）
docker-compose down -v

# 重新构建镜像
docker-compose build --no-cache

# 仅启动数据库
docker-compose up -d db

# 仅启动应用
docker-compose up -d app
```

## 数据库初始化

首次启动时，`database.sql` 文件会自动导入到 MySQL 数据库中，创建所需的表结构。

如需手动连接数据库：

```bash
docker exec -it bs-app-mysql mysql -u root -p bs-app
```

## 故障排除

### 应用无法连接数据库

1. 确保数据库服务已完全启动（健康检查通过）
2. 检查 `.env` 中的 `DB_PASSWORD` 是否正确
3. 查看日志：`docker-compose logs app`

### 端口被占用

如果 3000 或 3306 端口被占用，可以在 `docker-compose.yml` 中修改端口映射：

```yaml
ports:
  - "3001:3000"  # 将 3001 改为其他可用端口
```

## 文件结构

```
bs-app/
├── Dockerfile          # 应用镜像构建文件
├── docker-compose.yml  # Docker Compose 配置
├── .dockerignore       # Docker 构建忽略文件
├── database.sql        # 数据库初始化脚本
└── .env                # 环境变量配置（需要创建）
```
