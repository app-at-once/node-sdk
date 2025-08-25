"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggersModule = void 0;
class TriggersModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async createTrigger(trigger) {
        const response = await this.httpClient.post('/triggers', trigger);
        return response.data;
    }
    async updateTrigger(triggerId, updates) {
        const response = await this.httpClient.patch(`/triggers/${triggerId}`, updates);
        return response.data;
    }
    async getTrigger(triggerId) {
        const response = await this.httpClient.get(`/triggers/${triggerId}`);
        return response.data;
    }
    async listTriggers(options) {
        const response = await this.httpClient.get('/triggers', { params: options });
        return response.data;
    }
    async deleteTrigger(triggerId) {
        await this.httpClient.delete(`/triggers/${triggerId}`);
    }
    async activateTrigger(triggerId) {
        const response = await this.httpClient.post(`/triggers/${triggerId}/activate`);
        return response.data;
    }
    async deactivateTrigger(triggerId) {
        const response = await this.httpClient.post(`/triggers/${triggerId}/deactivate`);
        return response.data;
    }
    async executeTrigger(triggerId, input) {
        const response = await this.httpClient.post(`/triggers/${triggerId}/execute`, { input });
        return response.data;
    }
    async getExecution(executionId) {
        const response = await this.httpClient.get(`/triggers/executions/${executionId}`);
        return response.data;
    }
    async listExecutions(triggerId, options) {
        const params = { ...options };
        if (options?.timeRange) {
            params.start_date = options.timeRange.start.toISOString();
            params.end_date = options.timeRange.end.toISOString();
            delete params.timeRange;
        }
        const url = triggerId ? `/triggers/${triggerId}/executions` : '/triggers/executions';
        const response = await this.httpClient.get(url, { params });
        return response.data;
    }
    async getWebhookURL(triggerId) {
        const response = await this.httpClient.get(`/triggers/${triggerId}/webhook`);
        return response.data;
    }
    async regenerateWebhookSecret(triggerId) {
        const response = await this.httpClient.post(`/triggers/${triggerId}/webhook/regenerate`);
        return response.data;
    }
    async verifyWebhookSignature(_payload, _signature, _secret) {
        return Promise.resolve(true);
    }
    async subscribeToEvent(event) {
        const trigger = {
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
    async unsubscribeFromEvent(triggerId) {
        await this.deleteTrigger(triggerId);
    }
    async createCronTrigger(cron) {
        const trigger = {
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
    async updateCronExpression(triggerId, cronExpression, timezone) {
        return this.updateTrigger(triggerId, {
            config: {
                cron: cronExpression,
                timezone,
            },
        });
    }
    async getNextRunTime(triggerId) {
        const response = await this.httpClient.get(`/triggers/${triggerId}/next-run`);
        return response.data;
    }
    async getTriggerStats(triggerId, timeRange) {
        const params = {};
        if (timeRange) {
            params.start_date = timeRange.start.toISOString();
            params.end_date = timeRange.end.toISOString();
        }
        const response = await this.httpClient.get(`/triggers/${triggerId}/stats`, { params });
        return response.data;
    }
    async getDefinitions() {
        return [];
    }
    async getPatterns() {
        return [];
    }
    async detectPatterns(_tableName, _fields) {
        return [];
    }
    async getTableTriggers(tableName) {
        const response = await this.listTriggers({
            targetType: 'tool',
        });
        const tableTriggers = response.triggers.filter(trigger => trigger.target.config?.table === tableName);
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
    async processTrigger(request) {
        const response = await this.listTriggers({
            targetType: 'tool',
        });
        const trigger = response.triggers.find(t => t.target.config?.table === request.tableName &&
            t.target.config?.field === request.fieldName &&
            t.type === request.triggerType);
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
    async getJobStatus(jobId) {
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
    async enableTableTriggers(tableName, triggers) {
        return {
            tableName,
            triggers,
            status: 'enabled',
        };
    }
    async disableTableTriggers(tableName, triggers) {
        return {
            tableName,
            triggers,
            status: 'disabled',
        };
    }
    async waitForJob(jobId, options) {
        const timeout = options?.timeout || 60000;
        const pollInterval = options?.pollInterval || 1000;
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
exports.TriggersModule = TriggersModule;
//# sourceMappingURL=triggers.js.map