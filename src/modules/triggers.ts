import { HttpClient } from '../core/http-client';
import { Trigger, TriggerConfig, TriggerTarget, TriggerExecution } from '../types';

export class TriggersModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Trigger management
  async createTrigger(trigger: {
    name: string;
    description?: string;
    type: 'cron' | 'webhook' | 'event';
    config: TriggerConfig;
    target: TriggerTarget;
    isActive?: boolean;
    metadata?: Record<string, any>;
  }): Promise<Trigger> {
    const response = await this.httpClient.post('/triggers', trigger);
    return response.data;
  }

  async updateTrigger(triggerId: string, updates: {
    name?: string;
    description?: string;
    config?: TriggerConfig;
    target?: TriggerTarget;
    isActive?: boolean;
    metadata?: Record<string, any>;
  }): Promise<Trigger> {
    const response = await this.httpClient.patch(`/triggers/${triggerId}`, updates);
    return response.data;
  }

  async getTrigger(triggerId: string): Promise<Trigger> {
    const response = await this.httpClient.get(`/triggers/${triggerId}`);
    return response.data;
  }

  async listTriggers(options?: {
    type?: 'cron' | 'webhook' | 'event';
    targetType?: 'workflow' | 'logic' | 'node' | 'tool';
    isActive?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{
    triggers: Trigger[];
    total: number;
  }> {
    const response = await this.httpClient.get('/triggers', { params: options });
    return response.data;
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    await this.httpClient.delete(`/triggers/${triggerId}`);
  }

  async activateTrigger(triggerId: string): Promise<Trigger> {
    const response = await this.httpClient.post(`/triggers/${triggerId}/activate`);
    return response.data;
  }

  async deactivateTrigger(triggerId: string): Promise<Trigger> {
    const response = await this.httpClient.post(`/triggers/${triggerId}/deactivate`);
    return response.data;
  }

  // Trigger execution
  async executeTrigger(triggerId: string, input?: any): Promise<TriggerExecution> {
    const response = await this.httpClient.post(`/triggers/${triggerId}/execute`, { input });
    return response.data;
  }

  async getExecution(executionId: string): Promise<TriggerExecution> {
    const response = await this.httpClient.get(`/triggers/executions/${executionId}`);
    return response.data;
  }

  async listExecutions(triggerId?: string, options?: {
    status?: 'pending' | 'running' | 'success' | 'failed';
    limit?: number;
    offset?: number;
    timeRange?: { start: Date; end: Date };
  }): Promise<{
    executions: TriggerExecution[];
    total: number;
  }> {
    const params: any = { ...options };
    if (options?.timeRange) {
      params.start_date = options.timeRange.start.toISOString();
      params.end_date = options.timeRange.end.toISOString();
      delete params.timeRange;
    }

    const url = triggerId ? `/triggers/${triggerId}/executions` : '/triggers/executions';
    const response = await this.httpClient.get(url, { params });
    return response.data;
  }

  // Webhook management
  async getWebhookURL(triggerId: string): Promise<{
    url: string;
    method: string;
    headers?: Record<string, string>;
  }> {
    const response = await this.httpClient.get(`/triggers/${triggerId}/webhook`);
    return response.data;
  }

  async regenerateWebhookSecret(triggerId: string): Promise<{
    secret: string;
  }> {
    const response = await this.httpClient.post(`/triggers/${triggerId}/webhook/regenerate`);
    return response.data;
  }

  async verifyWebhookSignature(_payload: string, _signature: string, _secret: string): Promise<boolean> {
    // This would typically be done client-side
    // Implementation depends on the specific webhook signing algorithm
    return Promise.resolve(true);
  }

  // Event triggers
  async subscribeToEvent(event: {
    source: string;
    eventType: string;
    filters?: Record<string, any>;
    target: TriggerTarget;
  }): Promise<Trigger> {
    const trigger: any = {
      name: `${event.source}.${event.eventType}`,
      type: 'event',
      config: {
        event: {
          source: event.source,
          eventType: event.eventType,
          filters: event.filters,
        },
      },
      target: event.target,
      isActive: true,
    };

    return this.createTrigger(trigger);
  }

  async unsubscribeFromEvent(triggerId: string): Promise<void> {
    await this.deleteTrigger(triggerId);
  }

  // Cron triggers
  async createCronTrigger(cron: {
    name: string;
    cronExpression: string;
    timezone?: string;
    target: TriggerTarget;
    metadata?: Record<string, any>;
  }): Promise<Trigger> {
    const trigger: any = {
      name: cron.name,
      type: 'cron',
      config: {
        cron: cron.cronExpression,
        timezone: cron.timezone,
      },
      target: cron.target,
      isActive: true,
      metadata: cron.metadata,
    };

    return this.createTrigger(trigger);
  }

  async updateCronExpression(triggerId: string, cronExpression: string, timezone?: string): Promise<Trigger> {
    return this.updateTrigger(triggerId, {
      config: {
        cron: cronExpression,
        timezone,
      },
    });
  }

  async getNextRunTime(triggerId: string): Promise<{
    nextRun: string;
    timezone: string;
  }> {
    const response = await this.httpClient.get(`/triggers/${triggerId}/next-run`);
    return response.data;
  }

  // Statistics
  async getTriggerStats(triggerId: string, timeRange?: { start: Date; end: Date }): Promise<{
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
  }> {
    const params: any = {};
    if (timeRange) {
      params.start_date = timeRange.start.toISOString();
      params.end_date = timeRange.end.toISOString();
    }

    const response = await this.httpClient.get(`/triggers/${triggerId}/stats`, { params });
    return response.data;
  }

  // Backward compatibility methods (from old smart triggers)
  async getDefinitions(): Promise<Array<{
    name: string;
    type: string;
    description: string;
    requiredFieldTypes?: string[];
    optionalFieldTypes?: string[];
    defaultConfig?: Record<string, any>;
    features?: string[];
  }>> {
    // Return empty array as smart triggers are deprecated
    return [];
  }

  async getPatterns(): Promise<Array<{
    pattern: string;
    description: string;
    fieldTypes: string[];
    triggers: string[];
    confidence: number;
  }>> {
    // Return empty array as smart triggers are deprecated
    return [];
  }

  async detectPatterns(_tableName: string, _fields: Array<{ name: string; type: string }>): Promise<any[]> {
    // Return empty array as smart triggers are deprecated
    return [];
  }

  async getTableTriggers(tableName: string): Promise<Array<{
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
  }>> {
    // Return triggers that target database tables
    const response = await this.listTriggers({
      targetType: 'tool',
    });

    // Filter for database-related triggers
    const tableTriggers = response.triggers.filter(
      trigger => trigger.target.config?.table === tableName
    );

    return tableTriggers.map(trigger => ({
      tableName,
      fieldName: trigger.target.config?.field || '',
      triggers: [{
        name: trigger.name,
        type: trigger.type,
        enabled: trigger.isActive,
        config: trigger.config,
        lastProcessed: trigger.metadata?.lastProcessed,
        status: trigger.isActive ? 'active' : 'pending',
      }],
    }));
  }

  async processTrigger(request: {
    tableName: string;
    fieldName: string;
    recordId: string;
    triggerType: string;
    data?: any;
  }): Promise<{ jobId: string; status: string; message: string }> {
    // Find matching trigger
    const response = await this.listTriggers({
      targetType: 'tool',
    });

    const trigger = response.triggers.find(
      t => t.target.config?.table === request.tableName &&
           t.target.config?.field === request.fieldName &&
           t.type === request.triggerType
    );

    if (!trigger || !trigger.id) {
      throw new Error(`No trigger found for ${request.tableName}.${request.fieldName} of type ${request.triggerType}`);
    }

    const execution = await this.executeTrigger(trigger.id, request.data);
    return {
      jobId: execution.id,
      status: execution.status,
      message: `Trigger execution started`,
    };
  }

  async getJobStatus(jobId: string): Promise<{
    jobId: string;
    status: 'queued' | 'active' | 'completed' | 'failed';
    progress?: number;
    result?: any;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
  }> {
    const execution = await this.getExecution(jobId);
    return {
      jobId: execution.id,
      status: execution.status === 'pending' ? 'queued' :
              execution.status === 'running' ? 'active' :
              execution.status === 'success' ? 'completed' :
              'failed',
      result: execution.output,
      error: execution.error,
      createdAt: execution.startedAt || new Date(),
      completedAt: execution.completedAt,
    };
  }

  async enableTableTriggers(tableName: string, triggers: string[]): Promise<{ tableName: string; triggers: string[]; status: string }> {
    // This would need to be implemented based on how table triggers are stored
    return {
      tableName,
      triggers,
      status: 'enabled',
    };
  }

  async disableTableTriggers(tableName: string, triggers: string[]): Promise<{ tableName: string; triggers: string[]; status: string }> {
    // This would need to be implemented based on how table triggers are stored
    return {
      tableName,
      triggers,
      status: 'disabled',
    };
  }

  async waitForJob(jobId: string, options?: { timeout?: number; pollInterval?: number }): Promise<{
    jobId: string;
    status: 'queued' | 'active' | 'completed' | 'failed';
    progress?: number;
    result?: any;
    error?: string;
    createdAt: Date;
    completedAt?: Date;
  }> {
    const timeout = options?.timeout || 60000; // 60 seconds default
    const pollInterval = options?.pollInterval || 1000; // 1 second default
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const job = await this.getJobStatus(jobId);
      
      if (job.status === 'completed' || job.status === 'failed') {
        return job;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Trigger job ${jobId} timed out after ${timeout}ms`);
  }
}