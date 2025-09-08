"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowModule = void 0;
class WorkflowModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async createWorkflow(workflow) {
        const response = await this.httpClient.post('/workflows', workflow);
        return response.data;
    }
    async updateWorkflow(workflowId, updates) {
        const response = await this.httpClient.patch(`/workflows/${workflowId}`, updates);
        return response.data;
    }
    async getWorkflow(workflowId) {
        const response = await this.httpClient.get(`/workflows/${workflowId}`);
        return response.data;
    }
    async listWorkflows(options) {
        const response = await this.httpClient.get('/workflows', {
            params: options,
        });
        return response.data;
    }
    async deleteWorkflow(workflowId) {
        await this.httpClient.delete(`/workflows/${workflowId}`);
    }
    async cloneWorkflow(workflowId, name) {
        const response = await this.httpClient.post(`/workflows/${workflowId}/clone`, { name });
        return response.data;
    }
    async executeWorkflow(workflowId, input, options) {
        const response = await this.httpClient.post(`/workflows/${workflowId}/execute`, {
            input,
            ...options,
        });
        return response.data;
    }
    async executeWorkflowByName(workflowName, input, options) {
        const response = await this.httpClient.post(`/workflows/execute/${workflowName}`, {
            input,
            ...options,
        });
        return response.data;
    }
    async getExecution(executionId) {
        const response = await this.httpClient.get(`/workflows/executions/${executionId}`);
        return response.data;
    }
    async listExecutions(workflowId, options) {
        const params = { ...options };
        if (options?.timeRange) {
            params.start_date = options.timeRange.start.toISOString();
            params.end_date = options.timeRange.end.toISOString();
            delete params.timeRange;
        }
        const url = workflowId ? `/workflows/${workflowId}/executions` : '/workflows/executions';
        const response = await this.httpClient.get(url, { params });
        return response.data;
    }
    async cancelExecution(executionId) {
        await this.httpClient.post(`/workflows/executions/${executionId}/cancel`);
    }
    async retryExecution(executionId, options) {
        const response = await this.httpClient.post(`/workflows/executions/${executionId}/retry`, options);
        return response.data;
    }
    async validateWorkflow(workflow) {
        const response = await this.httpClient.post('/workflows/validate', workflow);
        return response.data;
    }
    async getWorkflowStats(workflowId, timeRange) {
        const params = {};
        if (timeRange) {
            params.start_date = timeRange.start.toISOString();
            params.end_date = timeRange.end.toISOString();
        }
        const response = await this.httpClient.get(`/workflows/${workflowId}/stats`, { params });
        return response.data;
    }
    async getWorkflowLogs(workflowId, options) {
        const params = { ...options };
        if (options?.timeRange) {
            params.start_date = options.timeRange.start.toISOString();
            params.end_date = options.timeRange.end.toISOString();
            delete params.timeRange;
        }
        const response = await this.httpClient.get(`/workflows/${workflowId}/logs`, { params });
        return response.data;
    }
    async createTemplate(workflowId, template) {
        const response = await this.httpClient.post(`/workflows/${workflowId}/template`, template);
        return response.data;
    }
    async listTemplates(options) {
        const response = await this.httpClient.get('/workflows/templates', {
            params: options,
        });
        return response.data;
    }
    async createFromTemplate(templateId, name) {
        const response = await this.httpClient.post(`/workflows/templates/${templateId}/create`, { name });
        return response.data;
    }
}
exports.WorkflowModule = WorkflowModule;
//# sourceMappingURL=workflow.js.map