import { HttpClient } from '../core/http-client';
import { LogicDefinition, LogicExecutionOptions, LogicExecutionResult, NodeResult, LogicNode } from '../types';
export declare class LogicModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    createLogicFlow(logic: {
        name: string;
        description?: string;
        nodes: LogicNode[];
        trigger?: {
            type: 'manual' | 'webhook' | 'schedule' | 'event' | 'api';
            config: Record<string, any>;
        };
        variables?: Record<string, any>;
        status?: 'draft' | 'active' | 'paused' | 'archived';
        tags?: string[];
    }): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'archived';
        version: number;
        created_at: string;
    }>;
    updateLogicFlow(logicId: string, updates: {
        name?: string;
        description?: string;
        nodes?: LogicNode[];
        trigger?: {
            type: 'manual' | 'webhook' | 'schedule' | 'event' | 'api';
            config: Record<string, any>;
        };
        variables?: Record<string, any>;
        status?: 'draft' | 'active' | 'paused' | 'archived';
        tags?: string[];
    }): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'archived';
        version: number;
        updated_at: string;
    }>;
    getLogicFlow(logicId: string): Promise<{
        id: string;
        name: string;
        description?: string;
        nodes: LogicNode[];
        trigger?: {
            type: 'manual' | 'webhook' | 'schedule' | 'event' | 'api';
            config: Record<string, any>;
        };
        variables?: Record<string, any>;
        status: 'draft' | 'active' | 'paused' | 'archived';
        tags: string[];
        version: number;
        created_at: string;
        updated_at: string;
        stats: {
            executions: number;
            success_rate: number;
            avg_duration: number;
        };
    }>;
    listLogicFlows(options?: {
        status?: 'draft' | 'active' | 'paused' | 'archived';
        tags?: string[];
        search?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'name' | 'created_at' | 'updated_at' | 'executions';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        flows: Array<{
            id: string;
            name: string;
            description?: string;
            status: 'draft' | 'active' | 'paused' | 'archived';
            tags: string[];
            version: number;
            created_at: string;
            execution_count: number;
            success_rate: number;
        }>;
        total: number;
    }>;
    deleteLogicFlow(logicId: string): Promise<void>;
    cloneLogicFlow(logicId: string, name: string): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'archived';
        version: number;
        created_at: string;
    }>;
    executeLogic(logicId: string, options?: LogicExecutionOptions): Promise<LogicExecutionResult>;
    executeLogicByName(logicName: string, options?: LogicExecutionOptions): Promise<LogicExecutionResult>;
    getExecution(executionId: string): Promise<{
        id: string;
        logicFlowId: string;
        status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
        input?: any;
        output?: any;
        error?: any;
        currentNodeId?: string;
        nodeResults: NodeResult[];
        variables?: Record<string, any>;
        startedAt?: string;
        completedAt?: string;
        duration?: number;
    }>;
    listExecutions(logicId?: string, options?: {
        status?: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
        limit?: number;
        offset?: number;
        timeRange?: {
            start: Date;
            end: Date;
        };
        sortBy?: 'started_at' | 'completed_at' | 'duration';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        executions: Array<{
            id: string;
            logicFlowId: string;
            status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
            startedAt: string;
            completedAt?: string;
            duration?: number;
            error?: any;
        }>;
        total: number;
    }>;
    cancelExecution(executionId: string): Promise<void>;
    getLogicVersions(logicId: string): Promise<Array<{
        version: number;
        created_at: string;
        is_active: boolean;
        executions_count: number;
        created_by: string;
    }>>;
    activateLogicVersion(logicId: string, version: number): Promise<void>;
    rollbackLogic(logicId: string, version: number): Promise<void>;
    validateLogic(logic: {
        nodes: LogicNode[];
        trigger?: {
            type: 'manual' | 'webhook' | 'schedule' | 'event' | 'api';
            config: Record<string, any>;
        };
        variables?: Record<string, any>;
    }): Promise<{
        valid: boolean;
        errors?: string[];
        warnings?: string[];
        suggestions?: string[];
    }>;
    testLogic(logicId: string, input?: Record<string, any>, options?: {
        debug?: boolean;
        timeout?: number;
        variables?: Record<string, any>;
    }): Promise<LogicExecutionResult>;
    getLogicStats(logicId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        total_executions: number;
        successful_executions: number;
        failed_executions: number;
        cancelled_executions: number;
        success_rate: number;
        average_duration: number;
        last_execution: string;
        executions_by_day: Array<{
            date: string;
            count: number;
            success_rate: number;
            average_duration: number;
        }>;
        node_performance: Array<{
            node_id: string;
            node_name: string;
            execution_count: number;
            success_rate: number;
            average_duration: number;
            failure_count: number;
        }>;
    }>;
    getExecutionLogs(logicId: string, options?: {
        executionId?: string;
        limit?: number;
        offset?: number;
        status?: 'success' | 'failed' | 'cancelled';
        timeRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<{
        logs: Array<{
            id: string;
            execution_id: string;
            node_id?: string;
            status: string;
            duration: number;
            error?: string;
            created_at: string;
        }>;
        total: number;
    }>;
    createTemplate(logicId: string, template: {
        name: string;
        description: string;
        category: string;
        tags?: string[];
        public?: boolean;
    }): Promise<{
        id: string;
        name: string;
        description: string;
        category: string;
        tags: string[];
        public: boolean;
        created_at: string;
    }>;
    listTemplates(options?: {
        category?: string;
        tags?: string[];
        search?: string;
        public?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        templates: Array<{
            id: string;
            name: string;
            description: string;
            category: string;
            tags: string[];
            public: boolean;
            author: string;
            created_at: string;
        }>;
        total: number;
    }>;
    createFromTemplate(templateId: string, name: string): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'archived';
        version: number;
        created_at: string;
    }>;
    createLogicWebhook(logicId: string, webhookUrl: string, events?: string[]): Promise<{
        id: string;
        url: string;
        events: string[];
        secret: string;
    }>;
    listLogicWebhooks(logicId: string): Promise<Array<{
        id: string;
        url: string;
        events: string[];
        created_at: string;
        last_triggered?: string;
    }>>;
    deleteLogicWebhook(logicId: string, webhookId: string): Promise<void>;
    publishLogic(name: string, definition: LogicDefinition, options?: {
        version?: string;
        description?: string;
        environment?: string;
        permissions?: string[];
        rateLimit?: {
            requests: number;
            window: string;
        };
        tags?: string[];
    }): Promise<{
        id: string;
        name: string;
        version: string;
        published: boolean;
        url: string;
    }>;
    executeLogicAsync(name: string, input: Record<string, any>, options?: LogicExecutionOptions): Promise<{
        executionId: string;
        status: string;
    }>;
    getExecutionStatus(executionId: string): Promise<{
        id: string;
        status: 'queued' | 'running' | 'completed' | 'failed';
        result?: any;
        error?: string;
        duration?: number;
        created_at: string;
        completed_at?: string;
    }>;
    listLogic(): Promise<Array<{
        id: string;
        name: string;
        version: string;
        description?: string;
        created_at: string;
        updated_at: string;
        executions_count: number;
        success_rate: number;
    }>>;
    getLogic(name: string): Promise<{
        id: string;
        name: string;
        version: string;
        definition: LogicDefinition;
        created_at: string;
        updated_at: string;
        stats: {
            executions: number;
            success_rate: number;
            avg_duration: number;
        };
    }>;
    deleteLogic(name: string): Promise<void>;
}
