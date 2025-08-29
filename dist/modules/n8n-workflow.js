"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.N8nWorkflowModule = void 0;
class N8nWorkflowModule {
    constructor(httpClient, n8nConfig) {
        this.httpClient = httpClient;
        this.n8nBaseUrl = n8nConfig?.baseUrl || process.env.N8N_BASE_URL || 'https://n8n.appatonce.com';
        this.n8nApiKey = n8nConfig?.apiKey || process.env.N8N_API_KEY || '';
    }
    async makeN8nRequest(method, endpoint, data) {
        if (!this.n8nApiKey) {
            throw new Error('N8N_API_KEY is required for n8n workflow operations. Please set the N8N_API_KEY environment variable or provide it in the constructor.');
        }
        const url = `${this.n8nBaseUrl}/api/v1${endpoint}`;
        const headers = {
            'X-N8N-API-KEY': this.n8nApiKey,
            'Content-Type': 'application/json'
        };
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`n8n API Error (${response.status}): ${errorText}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new Error(`n8n API Request Failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listWorkflows(options) {
        const params = new URLSearchParams();
        if (options?.active !== undefined)
            params.append('active', String(options.active));
        if (options?.tags && options.tags.length > 0)
            params.append('tags', options.tags.join(','));
        if (options?.limit)
            params.append('limit', String(options.limit));
        const queryString = params.toString();
        const endpoint = `/workflows${queryString ? '?' + queryString : ''}`;
        const response = await this.makeN8nRequest('GET', endpoint);
        return {
            workflows: response.data || [],
            total: response.data?.length || 0
        };
    }
    async getWorkflow(workflowId) {
        const response = await this.makeN8nRequest('GET', `/workflows/${workflowId}`);
        return response;
    }
    async createWorkflow(workflow) {
        const workflowData = {
            name: workflow.name,
            nodes: workflow.nodes,
            connections: workflow.connections,
            active: workflow.active || false,
            tags: workflow.tags || [],
            settings: workflow.settings || {},
            staticData: {},
            pinData: {}
        };
        const response = await this.makeN8nRequest('POST', '/workflows', workflowData);
        return response;
    }
    async updateWorkflow(workflowId, updates) {
        const response = await this.makeN8nRequest('PUT', `/workflows/${workflowId}`, updates);
        return response;
    }
    async deleteWorkflow(workflowId) {
        await this.makeN8nRequest('DELETE', `/workflows/${workflowId}`);
    }
    async duplicateWorkflow(workflowId, name) {
        const originalWorkflow = await this.getWorkflow(workflowId);
        const duplicatedWorkflow = {
            ...originalWorkflow,
            name: name || `${originalWorkflow.name} (Copy)`,
            active: false
        };
        delete duplicatedWorkflow.id;
        delete duplicatedWorkflow.createdAt;
        delete duplicatedWorkflow.updatedAt;
        delete duplicatedWorkflow.versionId;
        return this.createWorkflow(duplicatedWorkflow);
    }
    async activateWorkflow(workflowId) {
        const response = await this.makeN8nRequest('POST', `/workflows/${workflowId}/activate`);
        return response;
    }
    async deactivateWorkflow(workflowId) {
        const response = await this.makeN8nRequest('POST', `/workflows/${workflowId}/deactivate`);
        return response;
    }
    async executeWorkflow(workflowId, inputData, options) {
        const payload = {
            ...inputData,
            ...(options || {})
        };
        const response = await this.makeN8nRequest('POST', `/workflows/${workflowId}/execute`, payload);
        return response;
    }
    async executeWorkflowByName(workflowName, inputData, options) {
        const workflows = await this.listWorkflows();
        const workflow = workflows.workflows.find(w => w.name === workflowName);
        if (!workflow) {
            throw new Error(`Workflow with name '${workflowName}' not found`);
        }
        return this.executeWorkflow(workflow.id, inputData, options);
    }
    async getExecution(executionId) {
        const response = await this.makeN8nRequest('GET', `/executions/${executionId}`);
        return response;
    }
    async listExecutions(options) {
        const params = new URLSearchParams();
        if (options?.workflowId)
            params.append('workflowId', options.workflowId);
        if (options?.finished !== undefined)
            params.append('finished', String(options.finished));
        if (options?.limit)
            params.append('limit', String(options.limit));
        if (options?.firstId)
            params.append('firstId', options.firstId);
        if (options?.lastId)
            params.append('lastId', options.lastId);
        const queryString = params.toString();
        const endpoint = `/executions${queryString ? '?' + queryString : ''}`;
        const response = await this.makeN8nRequest('GET', endpoint);
        return {
            executions: response.data || [],
            total: response.data?.length || 0
        };
    }
    async deleteExecution(executionId) {
        await this.makeN8nRequest('DELETE', `/executions/${executionId}`);
    }
    async retryExecution(executionId, loadWorkflow) {
        const payload = loadWorkflow ? { loadWorkflow } : undefined;
        const response = await this.makeN8nRequest('POST', `/executions/${executionId}/retry`, payload);
        return response;
    }
    async testWebhook(workflowId, webhookData) {
        const workflow = await this.getWorkflow(workflowId);
        const webhookNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.webhook' ||
            node.name.toLowerCase().includes('webhook'));
        if (webhookNodes.length === 0) {
            throw new Error('No webhook nodes found in workflow');
        }
        const execution = await this.executeWorkflow(workflowId, {
            webhook: webhookData || { test: true, timestamp: new Date().toISOString() }
        });
        return {
            workflowId,
            executionId: execution.id,
            data: execution.data
        };
    }
    async chainWorkflows(workflows) {
        const results = [];
        for (const workflowConfig of workflows) {
            try {
                const execution = await this.executeWorkflow(workflowConfig.workflowId, workflowConfig.inputData, { waitTill: workflowConfig.waitForCompletion ? 'completed' : 'started' });
                results.push(execution);
                if (workflowConfig.waitForCompletion && execution.data?.resultData?.error) {
                    throw new Error(`Workflow ${workflowConfig.workflowId} failed: ${execution.data.resultData.error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                console.error(`Failed to execute workflow ${workflowConfig.workflowId}:`, error);
                throw error;
            }
        }
        return results;
    }
    async executeWorkflowsInParallel(workflows) {
        const promises = workflows.map(async (workflowConfig) => {
            try {
                const execution = await this.executeWorkflow(workflowConfig.workflowId, workflowConfig.inputData);
                return { workflowId: workflowConfig.workflowId, execution };
            }
            catch (error) {
                return {
                    workflowId: workflowConfig.workflowId,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        });
        return Promise.all(promises);
    }
    async isWorkflowActive(workflowId) {
        const workflow = await this.getWorkflow(workflowId);
        return workflow.active;
    }
    async getWorkflowsByTag(tag) {
        const { workflows } = await this.listWorkflows({ tags: [tag] });
        return workflows.filter(w => w.tags?.includes(tag) || false);
    }
    async searchWorkflows(searchTerm) {
        const { workflows } = await this.listWorkflows();
        return workflows.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    async healthCheck() {
        try {
            const { workflows } = await this.listWorkflows({ limit: 1 });
            return {
                status: 'healthy',
                workflowCount: workflows.length
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                workflowCount: 0,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
}
exports.N8nWorkflowModule = N8nWorkflowModule;
//# sourceMappingURL=n8n-workflow.js.map