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

export class N8nWorkflowModule {
  private httpClient: HttpClient;
  private n8nBaseUrl: string;
  private n8nApiKey: string;

  constructor(httpClient: HttpClient, n8nConfig?: { baseUrl?: string; apiKey?: string }) {
    this.httpClient = httpClient;
    this.n8nBaseUrl = n8nConfig?.baseUrl || process.env.N8N_BASE_URL || 'https://n8n.appatonce.com';
    this.n8nApiKey = n8nConfig?.apiKey || process.env.N8N_API_KEY || '';
  }

  private async makeN8nRequest(method: string, endpoint: string, data?: any): Promise<any> {
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
    } catch (error) {
      throw new Error(`n8n API Request Failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Workflow Management
  async listWorkflows(options?: {
    active?: boolean;
    tags?: string[];
    limit?: number;
  }): Promise<{
    workflows: N8nWorkflow[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options?.active !== undefined) params.append('active', String(options.active));
    if (options?.tags && options.tags.length > 0) params.append('tags', options.tags.join(','));
    if (options?.limit) params.append('limit', String(options.limit));

    const queryString = params.toString();
    const endpoint = `/workflows${queryString ? '?' + queryString : ''}`;
    
    const response = await this.makeN8nRequest('GET', endpoint);
    
    return {
      workflows: response.data || [],
      total: response.data?.length || 0
    };
  }

  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.makeN8nRequest('GET', `/workflows/${workflowId}`);
    return response;
  }

  async createWorkflow(workflow: {
    name: string;
    nodes: N8nNode[];
    connections: Record<string, any>;
    active?: boolean;
    tags?: string[];
    settings?: Record<string, any>;
  }): Promise<N8nWorkflow> {
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

  async updateWorkflow(workflowId: string, updates: {
    name?: string;
    nodes?: N8nNode[];
    connections?: Record<string, any>;
    active?: boolean;
    tags?: string[];
    settings?: Record<string, any>;
  }): Promise<N8nWorkflow> {
    const response = await this.makeN8nRequest('PUT', `/workflows/${workflowId}`, updates);
    return response;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.makeN8nRequest('DELETE', `/workflows/${workflowId}`);
  }

  async duplicateWorkflow(workflowId: string, name?: string): Promise<N8nWorkflow> {
    const originalWorkflow = await this.getWorkflow(workflowId);
    
    const duplicatedWorkflow = {
      ...originalWorkflow,
      name: name || `${originalWorkflow.name} (Copy)`,
      active: false
    };
    
    // Remove ID and timestamps to create a new workflow
    delete duplicatedWorkflow.id;
    delete duplicatedWorkflow.createdAt;
    delete duplicatedWorkflow.updatedAt;
    delete duplicatedWorkflow.versionId;

    return this.createWorkflow(duplicatedWorkflow);
  }

  // Workflow Activation/Deactivation
  async activateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.makeN8nRequest('POST', `/workflows/${workflowId}/activate`);
    return response;
  }

  async deactivateWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.makeN8nRequest('POST', `/workflows/${workflowId}/deactivate`);
    return response;
  }

  // Workflow Execution
  async executeWorkflow(
    workflowId: string, 
    inputData?: Record<string, any>,
    options?: {
      waitTill?: 'completed' | 'started';
      loadStaticData?: boolean;
    }
  ): Promise<N8nExecution> {
    const payload = {
      ...inputData,
      ...(options || {})
    };

    const response = await this.makeN8nRequest('POST', `/workflows/${workflowId}/execute`, payload);
    return response;
  }

  async executeWorkflowByName(
    workflowName: string,
    inputData?: Record<string, any>,
    options?: {
      waitTill?: 'completed' | 'started';
      loadStaticData?: boolean;
    }
  ): Promise<N8nExecution> {
    // First find the workflow by name
    const workflows = await this.listWorkflows();
    const workflow = workflows.workflows.find(w => w.name === workflowName);
    
    if (!workflow) {
      throw new Error(`Workflow with name '${workflowName}' not found`);
    }

    return this.executeWorkflow(workflow.id!, inputData, options);
  }

  // Execution Management
  async getExecution(executionId: string): Promise<N8nExecution> {
    const response = await this.makeN8nRequest('GET', `/executions/${executionId}`);
    return response;
  }

  async listExecutions(options?: {
    workflowId?: string;
    finished?: boolean;
    limit?: number;
    firstId?: string;
    lastId?: string;
  }): Promise<{
    executions: N8nExecution[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options?.workflowId) params.append('workflowId', options.workflowId);
    if (options?.finished !== undefined) params.append('finished', String(options.finished));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.firstId) params.append('firstId', options.firstId);
    if (options?.lastId) params.append('lastId', options.lastId);

    const queryString = params.toString();
    const endpoint = `/executions${queryString ? '?' + queryString : ''}`;
    
    const response = await this.makeN8nRequest('GET', endpoint);
    
    return {
      executions: response.data || [],
      total: response.data?.length || 0
    };
  }

  async deleteExecution(executionId: string): Promise<void> {
    await this.makeN8nRequest('DELETE', `/executions/${executionId}`);
  }

  async retryExecution(executionId: string, loadWorkflow?: boolean): Promise<N8nExecution> {
    const payload = loadWorkflow ? { loadWorkflow } : undefined;
    const response = await this.makeN8nRequest('POST', `/executions/${executionId}/retry`, payload);
    return response;
  }

  // Webhook Testing
  async testWebhook(workflowId: string, webhookData?: Record<string, any>): Promise<N8nWebhookTestResponse> {
    // Get workflow details to find webhook nodes
    const workflow = await this.getWorkflow(workflowId);
    const webhookNodes = workflow.nodes.filter(node => 
      node.type === 'n8n-nodes-base.webhook' || 
      node.name.toLowerCase().includes('webhook')
    );

    if (webhookNodes.length === 0) {
      throw new Error('No webhook nodes found in workflow');
    }

    // For testing, we'll execute the workflow with the webhook data
    const execution = await this.executeWorkflow(workflowId, {
      webhook: webhookData || { test: true, timestamp: new Date().toISOString() }
    });

    return {
      workflowId,
      executionId: execution.id,
      data: execution.data
    };
  }

  // Workflow Chaining
  async chainWorkflows(workflows: Array<{
    workflowId: string;
    inputData?: Record<string, any>;
    waitForCompletion?: boolean;
  }>): Promise<N8nExecution[]> {
    const results: N8nExecution[] = [];

    for (const workflowConfig of workflows) {
      try {
        // Execute workflow
        const execution = await this.executeWorkflow(
          workflowConfig.workflowId,
          workflowConfig.inputData,
          { waitTill: workflowConfig.waitForCompletion ? 'completed' : 'started' }
        );

        results.push(execution);

        // If waiting for completion and it failed, stop the chain
        if (workflowConfig.waitForCompletion && execution.data?.resultData?.error) {
          throw new Error(`Workflow ${workflowConfig.workflowId} failed: ${execution.data.resultData.error.message}`);
        }

        // Add a small delay between executions
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to execute workflow ${workflowConfig.workflowId}:`, error);
        throw error;
      }
    }

    return results;
  }

  // Parallel Execution
  async executeWorkflowsInParallel(workflows: Array<{
    workflowId: string;
    inputData?: Record<string, any>;
  }>): Promise<Array<{
    workflowId: string;
    execution?: N8nExecution;
    error?: string;
  }>> {
    const promises = workflows.map(async (workflowConfig) => {
      try {
        const execution = await this.executeWorkflow(
          workflowConfig.workflowId,
          workflowConfig.inputData
        );
        return { workflowId: workflowConfig.workflowId, execution };
      } catch (error) {
        return {
          workflowId: workflowConfig.workflowId,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    return Promise.all(promises);
  }

  // Utility Methods
  async isWorkflowActive(workflowId: string): Promise<boolean> {
    const workflow = await this.getWorkflow(workflowId);
    return workflow.active;
  }

  async getWorkflowsByTag(tag: string): Promise<N8nWorkflow[]> {
    const { workflows } = await this.listWorkflows({ tags: [tag] });
    return workflows.filter(w => w.tags?.includes(tag) || false);
  }

  async searchWorkflows(searchTerm: string): Promise<N8nWorkflow[]> {
    const { workflows } = await this.listWorkflows();
    return workflows.filter(w => 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Health Check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    n8nVersion?: string;
    workflowCount: number;
    error?: string;
  }> {
    try {
      const { workflows } = await this.listWorkflows({ limit: 1 });
      return {
        status: 'healthy',
        workflowCount: workflows.length
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        workflowCount: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}