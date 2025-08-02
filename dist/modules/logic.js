"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicModule = void 0;
class LogicModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async createLogicFlow(logic) {
        const response = await this.httpClient.post('/logic', logic);
        return response.data;
    }
    async updateLogicFlow(logicId, updates) {
        const response = await this.httpClient.patch(`/logic/${logicId}`, updates);
        return response.data;
    }
    async getLogicFlow(logicId) {
        const response = await this.httpClient.get(`/logic/${logicId}`);
        return response.data;
    }
    async listLogicFlows(options) {
        const response = await this.httpClient.get('/logic', { params: options });
        return response.data;
    }
    async deleteLogicFlow(logicId) {
        await this.httpClient.delete(`/logic/${logicId}`);
    }
    async cloneLogicFlow(logicId, name) {
        const response = await this.httpClient.post(`/logic/${logicId}/clone`, { name });
        return response.data;
    }
    async executeLogic(logicId, options) {
        const response = await this.httpClient.post(`/logic/${logicId}/execute`, options);
        return response.data;
    }
    async executeLogicByName(logicName, options) {
        const response = await this.httpClient.post(`/logic/execute/${logicName}`, options);
        return response.data;
    }
    async getExecution(executionId) {
        const response = await this.httpClient.get(`/logic/executions/${executionId}`);
        return response.data;
    }
    async listExecutions(logicId, options) {
        const params = { ...options };
        if (options?.timeRange) {
            params.start_date = options.timeRange.start.toISOString();
            params.end_date = options.timeRange.end.toISOString();
            delete params.timeRange;
        }
        const url = logicId ? `/logic/${logicId}/executions` : '/logic/executions';
        const response = await this.httpClient.get(url, { params });
        return response.data;
    }
    async cancelExecution(executionId) {
        await this.httpClient.post(`/logic/executions/${executionId}/cancel`);
    }
    async getLogicVersions(logicId) {
        const response = await this.httpClient.get(`/logic/${logicId}/versions`);
        return response.data;
    }
    async activateLogicVersion(logicId, version) {
        await this.httpClient.post(`/logic/${logicId}/versions/${version}/activate`);
    }
    async rollbackLogic(logicId, version) {
        await this.httpClient.post(`/logic/${logicId}/rollback`, { version });
    }
    async validateLogic(logic) {
        const response = await this.httpClient.post('/logic/validate', logic);
        return response.data;
    }
    async testLogic(logicId, input, options) {
        const response = await this.httpClient.post(`/logic/${logicId}/test`, {
            input,
            ...options,
        });
        return response.data;
    }
    async getLogicStats(logicId, timeRange) {
        const params = {};
        if (timeRange) {
            params.start_date = timeRange.start.toISOString();
            params.end_date = timeRange.end.toISOString();
        }
        const response = await this.httpClient.get(`/logic/${logicId}/stats`, { params });
        return response.data;
    }
    async getExecutionLogs(logicId, options) {
        const params = {};
        if (options?.limit)
            params.limit = options.limit;
        if (options?.offset)
            params.offset = options.offset;
        if (options?.status)
            params.status = options.status;
        if (options?.executionId)
            params.execution_id = options.executionId;
        if (options?.timeRange) {
            params.start_date = options.timeRange.start.toISOString();
            params.end_date = options.timeRange.end.toISOString();
        }
        const response = await this.httpClient.get(`/logic/${logicId}/logs`, { params });
        return response.data;
    }
    async createTemplate(logicId, template) {
        const response = await this.httpClient.post(`/logic/${logicId}/template`, template);
        return response.data;
    }
    async listTemplates(options) {
        const response = await this.httpClient.get('/logic/templates', { params: options });
        return response.data;
    }
    async createFromTemplate(templateId, name) {
        const response = await this.httpClient.post(`/logic/templates/${templateId}/create`, { name });
        return response.data;
    }
    async createLogicWebhook(logicId, webhookUrl, events = ['execution.completed', 'execution.failed']) {
        const response = await this.httpClient.post(`/logic/${logicId}/webhooks`, {
            url: webhookUrl,
            events,
        });
        return response.data;
    }
    async listLogicWebhooks(logicId) {
        const response = await this.httpClient.get(`/logic/${logicId}/webhooks`);
        return response.data;
    }
    async deleteLogicWebhook(logicId, webhookId) {
        await this.httpClient.delete(`/logic/${logicId}/webhooks/${webhookId}`);
    }
    async publishLogic(name, definition, options) {
        const logic = {
            name,
            description: options?.description || definition.description,
            nodes: definition.nodes,
            trigger: definition.trigger,
            variables: definition.variables,
            status: 'active',
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
    async executeLogicAsync(name, input, options = {}) {
        const result = await this.executeLogicByName(name, { ...options, input, async: true });
        return {
            executionId: result.id,
            status: result.status,
        };
    }
    async getExecutionStatus(executionId) {
        const execution = await this.getExecution(executionId);
        return {
            id: execution.id,
            status: execution.status === 'success' ? 'completed' :
                execution.status === 'pending' ? 'queued' :
                    execution.status,
            result: execution.output,
            error: execution.error,
            duration: execution.duration,
            created_at: execution.startedAt || '',
            completed_at: execution.completedAt,
        };
    }
    async listLogic() {
        const response = await this.listLogicFlows();
        return response.flows.map(flow => ({
            id: flow.id,
            name: flow.name,
            version: flow.version.toString(),
            description: flow.description,
            created_at: flow.created_at,
            updated_at: flow.created_at,
            executions_count: flow.execution_count,
            success_rate: flow.success_rate,
        }));
    }
    async getLogic(name) {
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
    async deleteLogic(name) {
        await this.deleteLogicFlow(name);
    }
}
exports.LogicModule = LogicModule;
//# sourceMappingURL=logic.js.map