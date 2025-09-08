import { HttpClient } from '../core/http-client';
import { LogicDefinition, LogicExecutionOptions, LogicExecutionResult, NodeResult, LogicNode } from '../types';

export class LogicModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Logic flow creation and management
  async createLogicFlow(logic: {
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
  }> {
    const response = await this.httpClient.post('/logic', logic);
    return response.data;
  }

  async updateLogicFlow(logicId: string, updates: {
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
  }> {
    const response = await this.httpClient.patch(`/logic/${logicId}`, updates);
    return response.data;
  }

  async getLogicFlow(logicId: string): Promise<{
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
  }> {
    const response = await this.httpClient.get(`/logic/${logicId}`);
    return response.data;
  }

  async listLogicFlows(options?: {
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
  }> {
    const response = await this.httpClient.get('/logic', { params: options });
    return response.data;
  }

  async deleteLogicFlow(logicId: string): Promise<void> {
    await this.httpClient.delete(`/logic/${logicId}`);
  }

  async cloneLogicFlow(logicId: string, name: string): Promise<{
    id: string;
    name: string;
    status: 'draft' | 'active' | 'paused' | 'archived';
    version: number;
    created_at: string;
  }> {
    const response = await this.httpClient.post(`/logic/${logicId}/clone`, { name });
    return response.data;
  }

  // Logic execution
  async executeLogic(
    logicId: string,
    options?: LogicExecutionOptions
  ): Promise<LogicExecutionResult> {
    const response = await this.httpClient.post(`/logic/${logicId}/execute`, options);
    return response.data;
  }

  async executeLogicByName(
    logicName: string,
    options?: LogicExecutionOptions
  ): Promise<LogicExecutionResult> {
    const response = await this.httpClient.post(`/logic/execute/${logicName}`, options);
    return response.data;
  }

  async getExecution(executionId: string): Promise<{
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
  }> {
    const response = await this.httpClient.get(`/logic/executions/${executionId}`);
    return response.data;
  }

  async listExecutions(logicId?: string, options?: {
    status?: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
    limit?: number;
    offset?: number;
    timeRange?: { start: Date; end: Date };
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
  }> {
    const params: any = { ...options };
    if (options?.timeRange) {
      params.start_date = options.timeRange.start.toISOString();
      params.end_date = options.timeRange.end.toISOString();
      delete params.timeRange;
    }

    const url = logicId ? `/logic/${logicId}/executions` : '/logic/executions';
    const response = await this.httpClient.get(url, { params });
    return response.data;
  }

  async cancelExecution(executionId: string): Promise<void> {
    await this.httpClient.post(`/logic/executions/${executionId}/cancel`);
  }

  // Version management
  async getLogicVersions(logicId: string): Promise<Array<{
    version: number;
    created_at: string;
    is_active: boolean;
    executions_count: number;
    created_by: string;
  }>> {
    const response = await this.httpClient.get(`/logic/${logicId}/versions`);
    return response.data;
  }

  async activateLogicVersion(logicId: string, version: number): Promise<void> {
    await this.httpClient.post(`/logic/${logicId}/versions/${version}/activate`);
  }

  async rollbackLogic(logicId: string, version: number): Promise<void> {
    await this.httpClient.post(`/logic/${logicId}/rollback`, { version });
  }

  // Testing and validation
  async validateLogic(logic: {
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
  }> {
    const response = await this.httpClient.post('/logic/validate', logic);
    return response.data;
  }

  async testLogic(
    logicId: string,
    input?: Record<string, any>,
    options?: {
      debug?: boolean;
      timeout?: number;
      variables?: Record<string, any>;
    }
  ): Promise<LogicExecutionResult> {
    const response = await this.httpClient.post(`/logic/${logicId}/test`, {
      input,
      ...options,
    });
    return response.data;
  }

  // Statistics and analytics
  async getLogicStats(
    logicId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<{
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
  }> {
    const params: Record<string, any> = {};
    if (timeRange) {
      params.start_date = timeRange.start.toISOString();
      params.end_date = timeRange.end.toISOString();
    }

    const response = await this.httpClient.get(`/logic/${logicId}/stats`, { params });
    return response.data;
  }

  // Logs
  async getExecutionLogs(
    logicId: string,
    options?: {
      executionId?: string;
      limit?: number;
      offset?: number;
      status?: 'success' | 'failed' | 'cancelled';
      timeRange?: { start: Date; end: Date };
    }
  ): Promise<{
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
  }> {
    const params: Record<string, any> = {};
    
    if (options?.limit) params.limit = options.limit;
    if (options?.offset) params.offset = options.offset;
    if (options?.status) params.status = options.status;
    if (options?.executionId) params.execution_id = options.executionId;
    if (options?.timeRange) {
      params.start_date = options.timeRange.start.toISOString();
      params.end_date = options.timeRange.end.toISOString();
    }

    const response = await this.httpClient.get(`/logic/${logicId}/logs`, { params });
    return response.data;
  }

  // Templates
  async createTemplate(logicId: string, template: {
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
  }> {
    const response = await this.httpClient.post(`/logic/${logicId}/template`, template);
    return response.data;
  }

  async listTemplates(options?: {
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
  }> {
    const response = await this.httpClient.get('/logic/templates', { params: options });
    return response.data;
  }

  async createFromTemplate(templateId: string, name: string): Promise<{
    id: string;
    name: string;
    status: 'draft' | 'active' | 'paused' | 'archived';
    version: number;
    created_at: string;
  }> {
    const response = await this.httpClient.post(`/logic/templates/${templateId}/create`, { name });
    return response.data;
  }

  // Webhooks
  async createLogicWebhook(
    logicId: string,
    webhookUrl: string,
    events: string[] = ['execution.completed', 'execution.failed']
  ): Promise<{
    id: string;
    url: string;
    events: string[];
    secret: string;
  }> {
    const response = await this.httpClient.post(`/logic/${logicId}/webhooks`, {
      url: webhookUrl,
      events,
    });
    return response.data;
  }

  async listLogicWebhooks(logicId: string): Promise<Array<{
    id: string;
    url: string;
    events: string[];
    created_at: string;
    last_triggered?: string;
  }>> {
    const response = await this.httpClient.get(`/logic/${logicId}/webhooks`);
    return response.data;
  }

  async deleteLogicWebhook(logicId: string, webhookId: string): Promise<void> {
    await this.httpClient.delete(`/logic/${logicId}/webhooks/${webhookId}`);
  }

  // Backward compatibility methods
  async publishLogic(
    name: string,
    definition: LogicDefinition,
    options?: {
      version?: string;
      description?: string;
      environment?: string;
      permissions?: string[];
      rateLimit?: {
        requests: number;
        window: string;
      };
      tags?: string[];
    }
  ): Promise<{
    id: string;
    name: string;
    version: string;
    published: boolean;
    url: string;
  }> {
    // Convert old format to new format
    const logic = {
      name,
      description: options?.description || definition.description,
      nodes: definition.nodes,
      trigger: definition.trigger,
      variables: definition.variables,
      status: 'active' as const,
      tags: options?.tags || definition.tags,
    };

    const response = await this.createLogicFlow(logic);
    return {
      id: response.id,
      name: response.name,
      version: response.version.toString(),
      published: response.status === 'active',
      url: `/logic/${response.id}`,
    };
  }

  async executeLogicAsync(
    name: string,
    input: Record<string, any>,
    options: LogicExecutionOptions = {}
  ): Promise<{ executionId: string; status: string }> {
    const result = await this.executeLogicByName(name, { ...options, input, async: true });
    return {
      executionId: result.id,
      status: result.status,
    };
  }

  async getExecutionStatus(executionId: string): Promise<{
    id: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    result?: any;
    error?: string;
    duration?: number;
    created_at: string;
    completed_at?: string;
  }> {
    const execution = await this.getExecution(executionId);
    return {
      id: execution.id,
      status: execution.status === 'success' ? 'completed' : 
              execution.status === 'pending' ? 'queued' :
              execution.status as any,
      result: execution.output,
      error: execution.error,
      duration: execution.duration,
      created_at: execution.startedAt || '',
      completed_at: execution.completedAt,
    };
  }

  async listLogic(): Promise<Array<{
    id: string;
    name: string;
    version: string;
    description?: string;
    created_at: string;
    updated_at: string;
    executions_count: number;
    success_rate: number;
  }>> {
    const response = await this.listLogicFlows();
    return response.flows.map(flow => ({
      id: flow.id,
      name: flow.name,
      version: flow.version.toString(),
      description: flow.description,
      created_at: flow.created_at,
      updated_at: flow.created_at, // Use created_at as fallback
      executions_count: flow.execution_count,
      success_rate: flow.success_rate,
    }));
  }

  async getLogic(name: string): Promise<{
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
  }> {
    const flow = await this.getLogicFlow(name);
    return {
      id: flow.id,
      name: flow.name,
      version: flow.version.toString(),
      definition: {
        name: flow.name,
        description: flow.description,
        nodes: flow.nodes,
        trigger: flow.trigger,
        variables: flow.variables,
        status: flow.status,
        tags: flow.tags,
        version: flow.version,
      },
      created_at: flow.created_at,
      updated_at: flow.updated_at,
      stats: flow.stats,
    };
  }

  async deleteLogic(name: string): Promise<void> {
    await this.deleteLogicFlow(name);
  }
}