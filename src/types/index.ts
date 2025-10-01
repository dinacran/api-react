export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: string;
}

export interface AuthConfig {
  type: 'Basic' | 'Bearer' | 'JWT' | 'None';
  username?: string;
  password?: string;
  token?: string;
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
  error?: string;
}

export interface UrlHistory {
  url: string;
  timestamp: number;
}