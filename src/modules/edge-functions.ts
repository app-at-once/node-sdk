import { HttpClient } from '../core/http-client';

export interface EdgeFunctionConfig {
  id?: string;
  name: string;
  description?: string;
  runtime: 'javascript' | 'typescript' | 'python' | 'php' | 'dart' | 'java' | 'go' | 'rust';
  code: string;
  entryPoint?: string;
  environment?: Record<string, string>;
  secrets?: Record<string, string>;
  routes?: string[];
  triggers?: EdgeFunctionTrigger[];
  kvNamespaces?: KVNamespaceBinding[];
  r2Buckets?: R2BucketBinding[];
  durableObjects?: DurableObjectBinding[];
  limits?: EdgeFunctionLimits;
  isActive?: boolean;
  deployImmediately?: boolean;
}

export interface EdgeFunctionTrigger {
  type: 'http' | 'cron' | 'webhook' | 'event';
  config: {
    schedule?: string;
    method?: string[];
    path?: string;
    event?: string;
    headers?: Record<string, string>;
  };
}

export interface KVNamespaceBinding {
  binding: string;
  namespaceId: string;
}

export interface R2BucketBinding {
  binding: string;
  bucketName: string;
}

export interface DurableObjectBinding {
  name: string;
  className: string;
  scriptName?: string;
}

export interface EdgeFunctionLimits {
  cpuMs?: number;
  memoryMb?: number;
  timeoutMs?: number;
  subrequests?: number;
}

export interface EdgeFunctionDeployment {
  id: string;
  functionId: string;
  environment: 'production' | 'staging' | 'development';
  deploymentId: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  logs?: string;
  error?: string;
  deployedBy?: string;
}

export interface EdgeFunctionLog {
  id: string;
  functionId: string;
  deploymentId?: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  executionId?: string;
  duration?: number;
  memoryUsed?: number;
  cpuTime?: number;
  statusCode?: number;
  requestId?: string;
  clientIp?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface EdgeFunctionMetrics {
  requests: number;
  errors: number;
  avgDuration: number;
  p95Duration: number;
  p99Duration: number;
  cpuTime: number;
  memoryUsage: number;
  bandwidth: {
    ingress: number;
    egress: number;
  };
}

export interface EdgeFunctionTemplate {
  name: string;
  description: string;
  runtime: string;
  category: string;
  tags: string[];
  code: string;
  environment?: Record<string, string>;
  dependencies?: string[];
  preview?: string;
}

export class EdgeFunctions {
  private client: HttpClient;
  private basePath = '/edge-functions';

  constructor(httpClient: HttpClient) {
    this.client = httpClient;
  }

  /**
   * Create a new edge function
   */
  async create(config: EdgeFunctionConfig): Promise<any> {
    return this.client.post(this.basePath, config);
  }

  /**
   * List all edge functions
   */
  async list(filters?: {
    status?: string;
    runtime?: string;
    isActive?: boolean;
  }): Promise<any[]> {
    const response = await this.client.get(this.basePath, { params: filters });
    return response.data || [];
  }

  /**
   * Get a specific edge function by ID
   */
  async get(id: string): Promise<any> {
    const response = await this.client.get(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Update an edge function
   */
  async update(id: string, updates: Partial<EdgeFunctionConfig> & { redeploy?: boolean }): Promise<any> {
    const response = await this.client.put(`${this.basePath}/${id}`, updates);
    return response.data;
  }

  /**
   * Delete an edge function
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`${this.basePath}/${id}`);
  }

  /**
   * Deploy an edge function to Cloudflare Workers
   */
  async deploy(id: string, options: {
    environment: 'production' | 'staging' | 'development';
    message?: string;
  }): Promise<EdgeFunctionDeployment> {
    const response = await this.client.post(`${this.basePath}/${id}/deploy`, options);
    return response.data;
  }

  /**
   * Rollback to a previous deployment
   */
  async rollback(id: string, deploymentId: string): Promise<EdgeFunctionDeployment> {
    const response = await this.client.post(`${this.basePath}/${id}/rollback/${deploymentId}`);
    return response.data;
  }

  /**
   * Execute an edge function locally for testing
   */
  async execute(id: string, params?: {
    method?: string;
    path?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  }): Promise<any> {
    const response = await this.client.post(`${this.basePath}/${id}/execute`, params || {});
    return response.data;
  }

  /**
   * Get edge function logs
   */
  async getLogs(id: string, options?: {
    level?: string;
    limit?: number;
    startTime?: Date;
    endTime?: Date;
  }): Promise<EdgeFunctionLog[]> {
    const params: any = {};
    if (options) {
      if (options.level) params.level = options.level;
      if (options.limit) params.limit = options.limit;
      if (options.startTime) params.startTime = options.startTime.toISOString();
      if (options.endTime) params.endTime = options.endTime.toISOString();
    }
    const response = await this.client.get(`${this.basePath}/${id}/logs`, { params });
    return response.data || [];
  }

  /**
   * Get edge function metrics
   */
  async getMetrics(id: string, period?: '1h' | '24h' | '7d' | '30d'): Promise<EdgeFunctionMetrics> {
    const response = await this.client.get(`${this.basePath}/${id}/metrics`, { params: { period: period || '24h' } });
    return response.data;
  }

  /**
   * Get deployment history
   */
  async getDeployments(id: string, limit?: number): Promise<EdgeFunctionDeployment[]> {
    const response = await this.client.get(`${this.basePath}/${id}/deployments`, { params: { limit: limit || 20 } });
    return response.data || [];
  }

  /**
   * Get version history
   */
  async getVersions(id: string, limit?: number): Promise<any[]> {
    const response = await this.client.get(`${this.basePath}/${id}/versions`, { params: { limit: limit || 20 } });
    return response.data || [];
  }

  /**
   * Restore a specific version
   */
  async restoreVersion(id: string, versionNumber: number): Promise<any> {
    const response = await this.client.post(`${this.basePath}/${id}/versions/${versionNumber}/restore`);
    return response.data;
  }

  /**
   * Get available edge function templates
   */
  async getTemplates(filters?: {
    runtime?: string;
    category?: string;
  }): Promise<EdgeFunctionTemplate[]> {
    const response = await this.client.get(`${this.basePath}/templates`, { params: filters });
    return response.data || [];
  }

  /**
   * Create an edge function from a template
   */
  async createFromTemplate(templateName: string, config: {
    name: string;
    description?: string;
  }): Promise<any> {
    const response = await this.client.post(`${this.basePath}/from-template`, {
      templateName,
      ...config,
    });
    return response.data;
  }

  /**
   * Validate edge function code
   */
  async validateCode(code: string, runtime: string): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await this.client.post(`${this.basePath}/validate`, { code, runtime });
    return response.data;
  }

  /**
   * Get real-time logs via WebSocket (if available)
   */
  async streamLogs(id: string, onLog: (log: EdgeFunctionLog) => void): Promise<() => void> {
    // This would need WebSocket implementation
    // For now, return a placeholder
    console.warn('Real-time log streaming not yet implemented');
    return () => {};
  }

  /**
   * Helper method to create a simple HTTP handler
   */
  static createHttpHandler(handler: (request: any) => any): string {
    return `
export default {
  async fetch(request, env, ctx) {
    const handler = ${handler.toString()};
    return handler(request);
  },
};`;
  }

  /**
   * Helper method to create a cron job handler
   */
  static createCronHandler(schedule: string, handler: () => void): EdgeFunctionConfig {
    return {
      name: 'cron-job',
      runtime: 'javascript',
      code: `
export default {
  async scheduled(event, env, ctx) {
    const handler = ${handler.toString()};
    await handler();
  },
};`,
      triggers: [{
        type: 'cron',
        config: { schedule },
      }],
    };
  }

  /**
   * Helper method to create a webhook handler
   */
  static createWebhookHandler(handler: (payload: any) => any): string {
    return `
export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const payload = await request.json();
    const handler = ${handler.toString()};
    const result = await handler(payload);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};`;
  }
}