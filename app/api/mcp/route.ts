import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  InitializeParams,
  InitializeResult,
  ToolCallParams,
  ToolCallResult,
  ToolDefinition,
} from './types';
import { searchImages } from './tools/searchImages';
import { getImageDetails } from './tools/getImageDetails';
import { listTags } from './tools/listTags';

// 定义可用工具
const TOOLS: ToolDefinition[] = [
  {
    name: 'searchImages',
    description: '搜索图片。支持按关键词、标签名称、地点、日期范围等条件筛选用户的图片。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词，会在标题、地点、相机、标签中搜索',
        },
        tagName: {
          type: 'string',
          description: '按标签名称筛选',
        },
        location: {
          type: 'string',
          description: '按地点筛选',
        },
        startDate: {
          type: 'string',
          description: '起始日期 (ISO 8601 格式)',
        },
        endDate: {
          type: 'string',
          description: '结束日期 (ISO 8601 格式)',
        },
      },
    },
  },
  {
    name: 'getImageDetails',
    description: '获取指定图片的详细信息，包括 EXIF 数据、标签、相机参数等。',
    inputSchema: {
      type: 'object',
      properties: {
        imageId: {
          type: 'number',
          description: '图片 ID',
        },
      },
      required: ['imageId'],
    },
  },
  {
    name: 'listTags',
    description: '列出当前用户的所有标签，按图片数量降序排序。',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// 创建 JSON-RPC 响应
function createResponse(id: string | number, result?: any): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

// 创建 JSON-RPC 错误响应
function createErrorResponse(
  id: string | number,
  code: number,
  message: string,
  data?: any
): JsonRpcResponse {
  const error: JsonRpcError = { code, message };
  if (data) error.data = data;
  return {
    jsonrpc: '2.0',
    id,
    error,
  };
}

// 处理 initialize 方法
async function handleInitialize(
  id: string | number,
  params: InitializeParams
): Promise<JsonRpcResponse> {
  const result: InitializeResult = {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'image-gallery-mcp',
      version: '1.0.0',
    },
  };
  return createResponse(id, result);
}

// 处理 tools/list 方法
async function handleToolsList(id: string | number): Promise<JsonRpcResponse> {
  return createResponse(id, { tools: TOOLS });
}

// 处理 tools/call 方法
async function handleToolsCall(
  id: string | number,
  userId: number,
  params: ToolCallParams
): Promise<JsonRpcResponse> {
  const { name, arguments: args } = params;

  try {
    let result: any;

    switch (name) {
      case 'searchImages': {
        const images = await searchImages(userId, args || {});
        const text = JSON.stringify(images, null, 2);
        result = {
          content: [{ type: 'text', text }],
        } as ToolCallResult;
        break;
      }

      case 'getImageDetails': {
        if (!args?.imageId || typeof args.imageId !== 'number') {
          return createErrorResponse(id, -32602, 'Invalid params: imageId is required and must be a number');
        }
        const imageParams: { imageId: number } = { imageId: args.imageId };
        const imageDetails = await getImageDetails(userId, imageParams);
        if (!imageDetails) {
          return createErrorResponse(id, -32000, '图片不存在或无权访问');
        }
        const text = JSON.stringify(imageDetails, null, 2);
        result = {
          content: [{ type: 'text', text }],
        } as ToolCallResult;
        break;
      }

      case 'listTags': {
        const tags = await listTags(userId);
        const text = JSON.stringify(tags, null, 2);
        result = {
          content: [{ type: 'text', text }],
        } as ToolCallResult;
        break;
      }

      default:
        return createErrorResponse(id, -32601, `未知的工具: ${name}`);
    }

    return createResponse(id, result);
  } catch (error) {
    console.error('Tool call error:', error);
    return createErrorResponse(
      id,
      -32000,
      '工具调用失败',
      error instanceof Error ? error.message : String(error)
    );
  }
}

// 主处理函数
export async function POST(request: Request) {
  try {
    // 验证登录状态 - 支持 Cookie 和 Bearer Token
    let session = await getSession();
    
    // 如果没有 Cookie session，尝试从 Authorization header 获取
    if (!session) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { verifyToken } = await import('@/lib/auth');
        session = await verifyToken(token);
      }
    }
    
    if (!session) {
      return NextResponse.json(
        createErrorResponse(0, -32001, 'Unauthorized: Please provide valid token via Cookie or Authorization header'),
        { status: 401 }
      );
    }

    const userId = session.userId as number;

    // 解析 JSON-RPC 请求
    const jsonRpcRequest: JsonRpcRequest = await request.json();
    const { id, method, params } = jsonRpcRequest;

    // 验证 JSON-RPC 格式
    if (jsonRpcRequest.jsonrpc !== '2.0') {
      return NextResponse.json(
        createErrorResponse(id, -32600, 'Invalid Request: jsonrpc must be 2.0')
      );
    }

    // 分发到对应的处理函数
    let response: JsonRpcResponse;

    switch (method) {
      case 'initialize':
        response = await handleInitialize(id, params as InitializeParams);
        break;

      case 'tools/list':
        response = await handleToolsList(id);
        break;

      case 'tools/call':
        response = await handleToolsCall(id, userId, params as ToolCallParams);
        break;

      default:
        response = createErrorResponse(id, -32601, `Method not found: ${method}`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('MCP endpoint error:', error);
    return NextResponse.json(
      createErrorResponse(0, -32603, 'Internal error'),
      { status: 500 }
    );
  }
}
