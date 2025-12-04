# MCP 服务使用文档

## 概述

本应用已集成 MCP (Model Context Protocol) 服务，支持通过对话方式检索和查询图片。MCP 端点位于 `/api/mcp`，使用 JSON-RPC 2.0 协议。

## 端点信息

- **URL**: `http://localhost:3000/api/mcp`
- **协议**: JSON-RPC 2.0 over HTTP POST
- **认证**: JWT Token (支持 Cookie 或 Authorization Bearer Token)
- **内容类型**: `application/json`

## 认证方式

支持两种认证方式：

### 方式 1: Cookie 认证
通过浏览器登录应用后，Cookie 会自动携带在请求中。

### 方式 2: Bearer Token 认证（推荐用于 MCP 客户端）
在请求头中添加：
```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

**获取 Token 的方法：**
1. 通过浏览器登录应用
2. 打开浏览器开发者工具
3. 在 Application/Storage → Cookies 中找到 `token` 的值
4. 在 MCP 客户端配置中使用该 token

## 可用工具

### 1. searchImages - 搜索图片

搜索当前用户的图片，支持多种筛选条件。

**参数**:
- `query` (string, optional): 搜索关键词，会在标题、地点、相机、标签中搜索
- `tagName` (string, optional): 按标签名称筛选
- `location` (string, optional): 按地点筛选
- `startDate` (string, optional): 起始日期 (ISO 8601 格式，如 `2024-01-01`)
- `endDate` (string, optional): 结束日期 (ISO 8601 格式)

**返回**: 图片列表，每个图片包含 id, title, url, thumbnailUrl, takenAt, location, tags

**示例调用**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "searchImages",
    "arguments": {
      "query": "风景"
    }
  }
}
```

### 2. getImageDetails - 获取图片详情

获取指定图片的完整信息，包括 EXIF 数据。

**参数**:
- `imageId` (number, required): 图片 ID

**返回**: 完整图片信息，包括 EXIF 数据、相机参数、标签等

**示例调用**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "getImageDetails",
    "arguments": {
      "imageId": 123
    }
  }
}
```

### 3. listTags - 列出标签

列出当前用户的所有标签，按使用频率排序。

**参数**: 无

**返回**: 标签列表，每个标签包含 id, name, imageCount

**示例调用**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "listTags",
    "arguments": {}
  }
}
```

## 测试步骤

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 登录获取 Token

首先通过浏览器登录应用，获取 JWT token cookie。

### 3. 使用 curl 测试

#### 测试初始化

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<YOUR_JWT_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }'
```

#### 测试工具列表

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<YOUR_JWT_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

#### 测试搜索图片

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<YOUR_JWT_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "searchImages",
      "arguments": {
        "query": "风景"
      }
    }
  }'
```

#### 测试列出标签

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<YOUR_JWT_TOKEN>" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "listTags",
      "arguments": {}
    }
  }'
```

## 在 MCP 客户端中使用

### Cherry Studio 配置（推荐）

1. 先通过浏览器登录应用获取 JWT Token：
   - 访问 `http://localhost:3000` 并登录
   - 打开浏览器开发者工具（F12）
   - 转到 Application → Cookies → `http://localhost:3000`
   - 复制 `token` 的值

2. 在 Cherry Studio 中添加 MCP 服务器：
   - **Transport 类型**: 选择 "流式 HTTP"
   - **名称**: Image Gallery  
   - **URL**: `http://localhost:3000/api/mcp`
   - **Headers**: 添加认证头
     ```json
     {
       "Authorization": "Bearer <粘贴你的token>"
     }
     ```

3. 保存配置后即可使用

### 对话示例

- "帮我找一下风景照片"
- "列出所有标签"
- "显示图片 123 的详细信息"
- "找一下 2024 年拍的照片"
- "搜索带有旅行标签的图片"

## 注意事项

1. **认证**: 所有请求必须包含有效的 JWT token (通过 Cookie)
2. **权限**: 用户只能访问自己上传的图片
3. **数量限制**: searchImages 默认返回最多 50 张图片
4. **日期格式**: 日期参数使用 ISO 8601 格式 (如 `2024-01-01T00:00:00Z`)

## 错误码

- `-32600`: 无效的请求格式
- `-32601`: 方法不存在
- `-32001`: 未授权 (需要登录)
- `-32000`: 工具调用失败或图片不存在
- `-32603`: 服务器内部错误
