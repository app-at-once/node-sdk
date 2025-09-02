import { HttpClient } from '../core/http-client';
export interface N8nWorkflow {
    id?: string;
    name: string;
    active: boolean;
    nodes: N8nNode[];
    connections: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
    versionId?: string;
    tags?: string[];
    pinData?: Record<string, any>;
    settings?: Record<string, any>;
    staticData?: Record<string, any>;
}
export interface N8nNode {
    id: string;
    name: string;
    type: string;
    position: [number, number];
    parameters: Record<string, any>;
    credentials?: Record<string, any>;
    typeVersion?: number;
    webhookId?: string;
}
export interface N8nExecution {
    id: string;
    finished: boolean;
    mode: 'manual' | 'trigger' | 'webhook' | 'retry';
    retryOf?: string;
    startedAt: string;
    stoppedAt?: string;
    workflowData: N8nWorkflow;
    data?: {
        resultData: {
            runData: Record<string, any>;
            error?: {
                message: string;
                stack?: string;
                name: string;
            };
        };
    };
}
export interface N8nWebhookTestResponse {
    workflowId: string;
    executionId?: string;
    data?: any;
}
export declare class N8nWorkflowModule {
    private httpClient;
    private n8nBaseUrl;
    private n8nApiKey;
    constructor(httpClient: HttpClient, n8nConfig?: {
        baseUrl?: string;
        apiKey?: string;
    });
    private makeN8nRequest;
    listWorkflows(options?: {
        active?: boolean;
        tags?: string[];
        limit?: number;
    }): Promise<{
        workflows: N8nWorkflow[];
        total: number;
    }>;
    getWorkflow(workflowId: string): Promise<N8nWorkflow>;
    createWorkflow(workflow: {
        name: string;
        nodes: N8nNode[];
        connections: Record<string, any>;
        active?: boolean;
        tags?: string[];
        settings?: Record<string, any>;
    }): Promise<N8nWorkflow>;
    updateWorkflow(workflowId: string, updates: {
        name?: string;
        nodes?: N8nNode[];
        connections?: Record<string, any>;
        active?: boolean;
        tags?: string[];
        settings?: Record<string, any>;
    }): Promise<N8nWorkflow>;
    deleteWorkflow(workflowId: string): Promise<void>;
    duplicateWorkflow(workflowId: string, name?: string): Promise<N8nWorkflow>;
    activateWorkflow(workflowId: string): Promise<N8nWorkflow>;
    deactivateWorkflow(workflowId: string): Promise<N8nWorkflow>;
    executeWorkflow(workflowId: string, inputData?: Record<string, any>, options?: {
        waitTill?: 'completed' | 'started';
        loadStaticData?: boolean;
    }): Promise<N8nExecution>;
    executeWorkflowByName(workflowName: string, inputData?: Record<string, any>, options?: {
        waitTill?: 'completed' | 'started';
        loadStaticData?: boolean;
    }): Promise<N8nExecution>;
    getExecution(executionId: string): Promise<N8nExecution>;
    listExecutions(options?: {
        workflowId?: string;
        finished?: boolean;
        limit?: number;
        firstId?: string;
        lastId?: string;
    }): Promise<{
        executions: N8nExecution[];
        total: number;
    }>;
    deleteExecution(executionId: string): Promise<void>;
    retryExecution(executionId: string, loadWorkflow?: boolean): Promise<N8nExecution>;
    testWebhook(workflowId: string, webhookData?: Record<string, any>): Promise<N8nWebhookTestResponse>;
    chainWorkflows(workflows: Array<{
        workflowId: string;
        inputData?: Record<string, any>;
        waitForCompletion?: boolean;
    }>): Promise<N8nExecution[]>;
    executeWorkflowsInParallel(workflows: Array<{
        workflowId: string;
        inputData?: Record<string, any>;
    }>): Promise<Array<{
        workflowId: string;
        execution?: N8nExecution;
        error?: string;
    }>>;
    isWorkflowActive(workflowId: string): Promise<boolean>;
    getWorkflowsByTag(tag: string): Promise<N8nWorkflow[]>;
    searchWorkflows(searchTerm: string): Promise<N8nWorkflow[]>;
    healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        n8nVersion?: string;
        workflowCount: number;
        error?: string;
    }>;
}
