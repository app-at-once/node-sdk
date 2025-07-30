import { HttpClient } from '../core/http-client';
import { Trigger, TriggerConfig, TriggerTarget, TriggerExecution } from '../types';
export declare class TriggersModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    createTrigger(trigger: {
        name: string;
        description?: string;
        type: 'cron' | 'webhook' | 'event';
        config: TriggerConfig;
        target: TriggerTarget;
        isActive?: boolean;
        metadata?: Record<string, any>;
    }): Promise<Trigger>;
    updateTrigger(triggerId: string, updates: {
        name?: string;
        description?: string;
        config?: TriggerConfig;
        target?: TriggerTarget;
        isActive?: boolean;
        metadata?: Record<string, any>;
    }): Promise<Trigger>;
    getTrigger(triggerId: string): Promise<Trigger>;
    listTriggers(options?: {
        type?: 'cron' | 'webhook' | 'event';
        targetType?: 'workflow' | 'logic' | 'node' | 'tool';
        isActive?: boolean;
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        triggers: Trigger[];
        total: number;
    }>;
    deleteTrigger(triggerId: string): Promise<void>;
    activateTrigger(triggerId: string): Promise<Trigger>;
    deactivateTrigger(triggerId: string): Promise<Trigger>;
    executeTrigger(triggerId: string, input?: any): Promise<TriggerExecution>;
    getExecution(executionId: string): Promise<TriggerExecution>;
    listExecutions(triggerId?: string, options?: {
        status?: 'pending' | 'running' | 'success' | 'failed';
        limit?: number;
        offset?: number;
        timeRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<{
        executions: TriggerExecution[];
        total: number;
    }>;
    getWebhookURL(triggerId: string): Promise<{
        url: string;
        method: string;
        headers?: Record<string, string>;
    }>;
    regenerateWebhookSecret(triggerId: string): Promise<{
        secret: string;
    }>;
    verifyWebhookSignature(_payload: string, _signature: string, _secret: string): Promise<boolean>;
    subscribeToEvent(event: {
        source: string;
        eventType: string;
        filters?: Record<string, any>;
        target: TriggerTarget;
    }): Promise<Trigger>;
    unsubscribeFromEvent(triggerId: string): Promise<void>;
    createCronTrigger(cron: {
        name: string;
        cronExpression: string;
        timezone?: string;
        target: TriggerTarget;
        metadata?: Record<string, any>;
    }): Promise<Trigger>;
    updateCronExpression(triggerId: string, cronExpression: string, timezone?: string): Promise<Trigger>;
    getNextRunTime(triggerId: string): Promise<{
        nextRun: string;
        timezone: string;
    }>;
    getTriggerStats(triggerId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        total_executions: number;
        successful_executions: number;
        failed_executions: number;
        success_rate: number;
        average_duration: number;
        last_execution?: string;
        executions_by_day: Array<{
            date: string;
            count: number;
            success_rate: number;
        }>;
    }>;
    getDefinitions(): Promise<Array<{
        name: string;
        type: string;
        description: string;
        requiredFieldTypes?: string[];
        optionalFieldTypes?: string[];
        defaultConfig?: Record<string, any>;
        features?: string[];
    }>>;
    getPatterns(): Promise<Array<{
        pattern: string;
        description: string;
        fieldTypes: string[];
        triggers: string[];
        confidence: number;
    }>>;
    detectPatterns(_tableName: string, _fields: Array<{
        name: string;
        type: string;
    }>): Promise<any[]>;
    getTableTriggers(tableName: string): Promise<Array<{
        tableName: string;
        fieldName: string;
        triggers: Array<{
            name: string;
            type: string;
            enabled: boolean;
            config?: any;
            lastProcessed?: Date;
            status?: 'active' | 'pending' | 'failed';
        }>;
    }>>;
    processTrigger(request: {
        tableName: string;
        fieldName: string;
        recordId: string;
        triggerType: string;
        data?: any;
    }): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    getJobStatus(jobId: string): Promise<{
        jobId: string;
        status: 'queued' | 'active' | 'completed' | 'failed';
        progress?: number;
        result?: any;
        error?: string;
        createdAt: Date;
        completedAt?: Date;
    }>;
    enableTableTriggers(tableName: string, triggers: string[]): Promise<{
        tableName: string;
        triggers: string[];
        status: string;
    }>;
    disableTableTriggers(tableName: string, triggers: string[]): Promise<{
        tableName: string;
        triggers: string[];
        status: string;
    }>;
    waitForJob(jobId: string, options?: {
        timeout?: number;
        pollInterval?: number;
    }): Promise<{
        jobId: string;
        status: 'queued' | 'active' | 'completed' | 'failed';
        progress?: number;
        result?: any;
        error?: string;
        createdAt: Date;
        completedAt?: Date;
    }>;
}
