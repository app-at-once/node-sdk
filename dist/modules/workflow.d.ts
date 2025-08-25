import { HttpClient } from '../core/http-client';
import { WorkflowExecution, WorkflowTrigger, WorkflowStep, WorkflowStepResult } from '../types';
export declare class WorkflowModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    createWorkflow(workflow: {
        name: string;
        description?: string;
        steps: WorkflowStep[];
        trigger?: WorkflowTrigger;
        status?: 'draft' | 'active' | 'paused' | 'archived';
        tags?: string[];
        metadata?: Record<string, any>;
    }): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'archived';
        created_at: string;
    }>;
    updateWorkflow(workflowId: string, updates: {
        name?: string;
        description?: string;
        steps?: WorkflowStep[];
        trigger?: WorkflowTrigger;
        status?: 'draft' | 'active' | 'paused' | 'archived';
        tags?: string[];
        metadata?: Record<string, any>;
    }): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'archived';
        updated_at: string;
    }>;
    getWorkflow(workflowId: string): Promise<{
        id: string;
        name: string;
        description?: string;
        steps: WorkflowStep[];
        trigger?: WorkflowTrigger;
        status: 'draft' | 'active' | 'paused' | 'archived';
        tags: string[];
        metadata: Record<string, any>;
        created_at: string;
        updated_at: string;
        stats: {
            total_executions: number;
            successful_executions: number;
            failed_executions: number;
            average_duration: number;
        };
    }>;
    listWorkflows(options?: {
        status?: 'draft' | 'active' | 'paused' | 'archived';
        tags?: string[];
        search?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'name' | 'created_at' | 'updated_at' | 'executions';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        workflows: Array<{
            id: string;
            name: string;
            description?: string;
            status: 'draft' | 'active' | 'paused' | 'archived';
            tags: string[];
            created_at: string;
            execution_count: number;
            success_rate: number;
        }>;
        total: number;
    }>;
    deleteWorkflow(workflowId: string): Promise<void>;
    cloneWorkflow(workflowId: string, name: string): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'active' | 'paused' | 'archived';
        created_at: string;
    }>;
    executeWorkflow(workflowId: string, input?: Record<string, any>, options?: {
        async?: boolean;
        timeout?: number;
        priority?: 'low' | 'normal' | 'high';
        metadata?: Record<string, any>;
    }): Promise<WorkflowExecution>;
    executeWorkflowByName(workflowName: string, input?: Record<string, any>, options?: {
        async?: boolean;
        timeout?: number;
        priority?: 'low' | 'normal' | 'high';
        metadata?: Record<string, any>;
    }): Promise<WorkflowExecution>;
    getExecution(executionId: string): Promise<{
        id: string;
        workflowId: string;
        status: 'pending' | 'running' | 'success' | 'failed';
        input?: any;
        output?: any;
        error?: any;
        currentStep: number;
        stepResults: WorkflowStepResult[];
        startedAt?: string;
        completedAt?: string;
        duration?: number;
        metadata: Record<string, any>;
    }>;
    listExecutions(workflowId?: string, options?: {
        status?: 'pending' | 'running' | 'success' | 'failed';
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
            workflowId: string;
            status: 'pending' | 'running' | 'success' | 'failed';
            startedAt: string;
            completedAt?: string;
            duration?: number;
            error?: any;
        }>;
        total: number;
    }>;
    cancelExecution(executionId: string): Promise<void>;
    retryExecution(executionId: string, options?: {
        fromStep?: string;
        input?: Record<string, any>;
    }): Promise<WorkflowExecution>;
    validateWorkflow(workflow: {
        steps: WorkflowStep[];
        trigger?: WorkflowTrigger;
    }): Promise<{
        valid: boolean;
        errors?: Array<{
            type: 'error' | 'warning';
            message: string;
            step?: string;
            field?: string;
        }>;
        suggestions?: string[];
    }>;
    getWorkflowStats(workflowId: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        total_executions: number;
        successful_executions: number;
        failed_executions: number;
        success_rate: number;
        average_duration: number;
        total_duration: number;
        executions_by_day: Array<{
            date: string;
            count: number;
            success_rate: number;
            average_duration: number;
        }>;
        step_performance: Array<{
            step_name: string;
            average_duration: number;
            success_rate: number;
            failure_count: number;
        }>;
    }>;
    getWorkflowLogs(workflowId: string, options?: {
        executionId?: string;
        level?: 'debug' | 'info' | 'warn' | 'error';
        limit?: number;
        offset?: number;
        timeRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<{
        logs: Array<{
            id: string;
            execution_id: string;
            step_name?: string;
            level: string;
            message: string;
            data?: any;
            timestamp: string;
        }>;
        total: number;
    }>;
    createTemplate(workflowId: string, template: {
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
        created_at: string;
    }>;
}
