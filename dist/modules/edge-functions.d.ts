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
export declare class EdgeFunctions {
    private client;
    private basePath;
    constructor(httpClient: HttpClient);
    create(config: EdgeFunctionConfig): Promise<any>;
    list(filters?: {
        status?: string;
        runtime?: string;
        isActive?: boolean;
    }): Promise<any[]>;
    get(id: string): Promise<any>;
    update(id: string, updates: Partial<EdgeFunctionConfig> & {
        redeploy?: boolean;
    }): Promise<any>;
    delete(id: string): Promise<void>;
    deploy(id: string, options: {
        environment: 'production' | 'staging' | 'development';
        message?: string;
    }): Promise<EdgeFunctionDeployment>;
    rollback(id: string, deploymentId: string): Promise<EdgeFunctionDeployment>;
    execute(id: string, params?: {
        method?: string;
        path?: string;
        headers?: Record<string, string>;
        body?: any;
        query?: Record<string, string>;
    }): Promise<any>;
    getLogs(id: string, options?: {
        level?: string;
        limit?: number;
        startTime?: Date;
        endTime?: Date;
    }): Promise<EdgeFunctionLog[]>;
    getMetrics(id: string, period?: '1h' | '24h' | '7d' | '30d'): Promise<EdgeFunctionMetrics>;
    getDeployments(id: string, limit?: number): Promise<EdgeFunctionDeployment[]>;
    getVersions(id: string, limit?: number): Promise<any[]>;
    restoreVersion(id: string, versionNumber: number): Promise<any>;
    getTemplates(filters?: {
        runtime?: string;
        category?: string;
    }): Promise<EdgeFunctionTemplate[]>;
    createFromTemplate(templateName: string, config: {
        name: string;
        description?: string;
    }): Promise<any>;
    validateCode(code: string, runtime: string): Promise<{
        valid: boolean;
        errors?: string[];
    }>;
    streamLogs(id: string, onLog: (log: EdgeFunctionLog) => void): Promise<() => void>;
    static createHttpHandler(handler: (request: any) => any): string;
    static createCronHandler(schedule: string, handler: () => void): EdgeFunctionConfig;
    static createWebhookHandler(handler: (payload: any) => any): string;
}
