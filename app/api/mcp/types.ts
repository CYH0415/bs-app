// JSON-RPC 2.0 类型定义
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

// MCP 协议类型
export interface InitializeParams {
  protocolVersion: string;
  capabilities: Record<string, any>;
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: {
    tools?: Record<string, any>;
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

// 工具定义
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolCallParams {
  name: string;
  arguments: Record<string, any>;
}

export interface ToolCallResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

// 工具参数类型
export interface SearchImagesParams {
  query?: string;
  tagName?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetImageDetailsParams {
  imageId: number;
}

export interface ListTagsParams {
  // 无参数
}

// 工具返回值类型
export interface ImageBasicInfo {
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  takenAt: string | null;
  location: string | null;
  tags: Array<{ id: number; name: string }>;
}

export interface ImageDetailInfo extends ImageBasicInfo {
  width: number | null;
  height: number | null;
  size: number | null;
  mimeType: string | null;
  camera: string | null;
  lensModel: string | null;
  aperture: number | null;
  shutterSpeed: string | null;
  iso: number | null;
  exifData: any;
  createdAt: string;
}

export interface TagInfo {
  id: number;
  name: string;
  imageCount: number;
}
