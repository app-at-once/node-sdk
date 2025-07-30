import AppAtOnceClient from '../src/index';
import { N8nWorkflow, N8nExecution } from '../src/modules/n8n-workflow';

// Initialize the client with TypeScript types
const client = AppAtOnceClient.createWithApiKey(
  process.env.APPATONCE_API_KEY || 'your-api-key-here',
  'https://api.appatonce.com'
);

// Example 1: Typed workflow listing
async function listWorkflowsTyped(): Promise<N8nWorkflow[]> {
  console.log('🔍 Listing n8n workflows (TypeScript)...');
  
  try {
    const result = await client.n8nWorkflow.listWorkflows({
      limit: 10,
      active: true
    });
    
    console.log(`Found ${result.total} workflows:`);
    result.workflows.forEach((workflow: N8nWorkflow) => {
      console.log(`  - ${workflow.name} (${workflow.id}) - Active: ${workflow.active}`);
      console.log(`    Created: ${new Date(workflow.createdAt).toLocaleDateString()}`);
      console.log(`    Nodes: ${workflow.nodes?.length || 0}`);
    });
    
    return result.workflows;
  } catch (error) {
    console.error('❌ Error listing workflows:', (error as Error).message);
    return [];
  }
}

// Example 2: Typed workflow execution with custom data
interface WorkflowInputData {
  userId?: string;
  action: string;
  data: Record<string, any>;
  metadata?: {
    source: string;
    timestamp: string;
    version: string;
  };
}

async function executeTypedWorkflow(
  workflowName: string, 
  inputData: WorkflowInputData
): Promise<N8nExecution | null> {
  console.log(`🚀 Executing workflow: ${workflowName} (TypeScript)`);
  
  try {
    const execution = await client.n8nWorkflow.executeWorkflowByName(
      workflowName,
      {
        ...inputData,
        metadata: {
          source: 'typescript-sdk',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          ...inputData.metadata
        }
      },
      { waitTill: 'completed' }
    );
    
    console.log(`✅ Workflow executed successfully:`);
    console.log(`  Execution ID: ${execution.id}`);
    console.log(`  Status: ${execution.finished ? 'Completed' : 'Running'}`);
    console.log(`  Mode: ${execution.mode}`);
    console.log(`  Started: ${execution.startedAt}`);
    
    if (execution.stoppedAt) {
      const duration = new Date(execution.stoppedAt).getTime() - new Date(execution.startedAt).getTime();
      console.log(`  Duration: ${duration}ms`);
    }
    
    if (execution.finished && execution.data?.resultData?.error) {
      console.log(`  Error: ${execution.data.resultData.error.message}`);
    }
    
    return execution;
  } catch (error) {
    console.error('❌ Error executing workflow:', (error as Error).message);
    return null;
  }
}

// Example 3: Typed workflow chaining with error handling
interface WorkflowChainStep {
  workflowId: string;
  inputData: WorkflowInputData;
  waitForCompletion: boolean;
  continueOnError?: boolean;
}

async function executeWorkflowChain(steps: WorkflowChainStep[]): Promise<N8nExecution[]> {
  console.log('🔗 Executing workflow chain (TypeScript)...');
  
  const results: N8nExecution[] = [];
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`  Step ${i + 1}/${steps.length}: Executing ${step.workflowId}`);
    
    try {
      const execution = await client.n8nWorkflow.executeWorkflow(
        step.workflowId,
        step.inputData,
        { waitTill: step.waitForCompletion ? 'completed' : 'started' }
      );
      
      results.push(execution);
      
      // Check for errors if waiting for completion
      if (step.waitForCompletion && execution.data?.resultData?.error) {
        console.log(`  ⚠️ Step ${i + 1} completed with error: ${execution.data.resultData.error.message}`);
        
        if (!step.continueOnError) {
          console.log('  🛑 Stopping chain due to error');
          break;
        }
      } else {
        console.log(`  ✅ Step ${i + 1} completed successfully`);
      }
      
      // Add delay between steps
      if (i < steps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ❌ Step ${i + 1} failed:`, (error as Error).message);
      
      if (!step.continueOnError) {
        console.log('  🛑 Stopping chain due to error');
        break;
      }
    }
  }
  
  console.log(`🏁 Chain completed with ${results.length}/${steps.length} successful executions`);
  return results;
}

// Example 4: Typed workflow creation with validation
interface WebhookWorkflowConfig {
  name: string;
  webhookPath: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  responseData?: string;
  authentication?: boolean;
  tags?: string[];
}

async function createTypedWebhookWorkflow(config: WebhookWorkflowConfig): Promise<N8nWorkflow | null> {
  console.log(`🔨 Creating webhook workflow: ${config.name} (TypeScript)`);
  
  try {
    // Validate configuration
    if (!config.name || !config.webhookPath) {
      throw new Error('Name and webhook path are required');
    }
    
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(config.httpMethod)) {
      throw new Error('Invalid HTTP method');
    }
    
    const workflow = await client.n8nWorkflow.createWorkflow({
      name: config.name,
      nodes: [
        {
          id: `webhook-${Date.now()}`,
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          position: [250, 300],
          parameters: {
            httpMethod: config.httpMethod,
            path: config.webhookPath,
            responseMode: 'onReceived',
            responseData: config.responseData || 'firstEntryJson',
            authentication: config.authentication || false
          }
        },
        {
          id: `response-${Date.now()}`,
          name: 'Format Response',
          type: 'n8n-nodes-base.set',
          position: [450, 300],
          parameters: {
            values: {
              string: [
                {
                  name: 'status',
                  value: 'success'
                },
                {
                  name: 'message',
                  value: 'Webhook processed successfully'
                },
                {
                  name: 'timestamp',
                  value: '{{ new Date().toISOString() }}'
                },
                {
                  name: 'workflowName',
                  value: config.name
                }
              ]
            }
          }
        }
      ],
      connections: {
        'Webhook Trigger': {
          main: [[{ node: 'Format Response', type: 'main', index: 0 }]]
        }
      },
      active: false,
      tags: ['typescript-sdk', 'webhook', ...(config.tags || [])],
      settings: {
        timezone: 'UTC',
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all'
      }
    });
    
    console.log('✅ Webhook workflow created successfully:');
    console.log(`  ID: ${workflow.id}`);
    console.log(`  Name: ${workflow.name}`);
    console.log(`  Webhook URL: ${process.env.N8N_BASE_URL}/webhook/${config.webhookPath}`);
    console.log(`  HTTP Method: ${config.httpMethod}`);
    console.log(`  Tags: ${workflow.tags?.join(', ') || 'None'}`);
    
    return workflow;
  } catch (error) {
    console.error('❌ Error creating webhook workflow:', (error as Error).message);
    return null;
  }
}

// Example 5: Typed execution monitoring with metrics
interface ExecutionMetrics {
  total: number;
  successful: number;
  failed: number;
  running: number;
  averageDuration: number;
  successRate: number;
  lastExecution?: string;
}

async function getWorkflowMetrics(workflowId: string): Promise<ExecutionMetrics | null> {
  console.log(`📊 Analyzing metrics for workflow: ${workflowId} (TypeScript)`);
  
  try {
    const { executions } = await client.n8nWorkflow.listExecutions({
      workflowId,
      limit: 100
    });
    
    const metrics: ExecutionMetrics = {
      total: executions.length,
      successful: 0,
      failed: 0,
      running: 0,
      averageDuration: 0,
      successRate: 0,
      lastExecution: executions[0]?.startedAt
    };
    
    let totalDuration = 0;
    let completedExecutions = 0;
    
    executions.forEach((execution: N8nExecution) => {
      if (!execution.finished) {
        metrics.running++;
      } else if (execution.data?.resultData?.error) {
        metrics.failed++;
      } else {
        metrics.successful++;
      }
      
      // Calculate duration if execution is finished
      if (execution.finished && execution.startedAt && execution.stoppedAt) {
        const duration = new Date(execution.stoppedAt).getTime() - new Date(execution.startedAt).getTime();
        totalDuration += duration;
        completedExecutions++;
      }
    });
    
    if (completedExecutions > 0) {
      metrics.averageDuration = totalDuration / completedExecutions;
    }
    
    if (metrics.total > 0) {
      metrics.successRate = (metrics.successful / (metrics.total - metrics.running)) * 100;
    }
    
    console.log('📈 Workflow Metrics:');
    console.log(`  Total Executions: ${metrics.total}`);
    console.log(`  Successful: ${metrics.successful}`);
    console.log(`  Failed: ${metrics.failed}`);
    console.log(`  Currently Running: ${metrics.running}`);
    console.log(`  Success Rate: ${metrics.successRate.toFixed(1)}%`);
    console.log(`  Average Duration: ${metrics.averageDuration.toFixed(0)}ms`);
    
    if (metrics.lastExecution) {
      console.log(`  Last Execution: ${new Date(metrics.lastExecution).toLocaleString()}`);
    }
    
    return metrics;
  } catch (error) {
    console.error('❌ Error getting workflow metrics:', (error as Error).message);
    return null;
  }
}

// Example 6: Comprehensive TypeScript workflow management
async function comprehensiveWorkflowManagement(): Promise<void> {
  console.log('🎯 Comprehensive n8n Workflow Management (TypeScript)');
  console.log('='.repeat(60));
  
  try {
    // 1. Health check
    console.log('1. Health Check');
    const health = await client.n8nWorkflow.healthCheck();
    console.log(`   Status: ${health.status}`);
    console.log(`   Workflows Available: ${health.workflowCount}`);
    console.log('');
    
    // 2. List workflows with types
    console.log('2. Listing Workflows');
    const workflows = await listWorkflowsTyped();
    console.log('');
    
    // 3. Create a test workflow if needed
    if (workflows.length === 0) {
      console.log('3. Creating Test Workflow');
      const newWorkflow = await createTypedWebhookWorkflow({
        name: 'TypeScript SDK Test Webhook',
        webhookPath: 'typescript-test',
        httpMethod: 'POST',
        authentication: false,
        tags: ['test', 'typescript', 'sdk']
      });
      
      if (newWorkflow) {
        workflows.push(newWorkflow);
      }
      console.log('');
    }
    
    // 4. Execute a workflow with typed data
    if (workflows.length > 0) {
      console.log('4. Executing Workflow with Typed Data');
      const inputData: WorkflowInputData = {
        userId: 'user-123',
        action: 'test-execution',
        data: {
          message: 'Hello from TypeScript SDK',
          priority: 'high',
          tags: ['test', 'sdk']
        },
        metadata: {
          source: 'typescript-example',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      };
      
      await executeTypedWorkflow(workflows[0].name, inputData);
      console.log('');
    }
    
    // 5. Get workflow metrics
    if (workflows.length > 0) {
      console.log('5. Analyzing Workflow Metrics');
      await getWorkflowMetrics(workflows[0].id);
      console.log('');
    }
    
    // 6. Execute workflow chain if we have multiple workflows
    if (workflows.length >= 2) {
      console.log('6. Executing Workflow Chain');
      const chainSteps: WorkflowChainStep[] = workflows.slice(0, 2).map((workflow, index) => ({
        workflowId: workflow.id,
        inputData: {
          action: `chain-step-${index + 1}`,
          data: { stepIndex: index + 1, totalSteps: 2 }
        },
        waitForCompletion: true,
        continueOnError: true
      }));
      
      await executeWorkflowChain(chainSteps);
      console.log('');
    }
    
    console.log('✅ Comprehensive workflow management completed successfully!');
  } catch (error) {
    console.error('❌ Comprehensive example failed:', (error as Error).message);
  }
}

// Export functions and types
export {
  listWorkflowsTyped,
  executeTypedWorkflow,
  executeWorkflowChain,
  createTypedWebhookWorkflow,
  getWorkflowMetrics,
  comprehensiveWorkflowManagement
};

export type {
  WorkflowInputData,
  WorkflowChainStep,
  WebhookWorkflowConfig,
  ExecutionMetrics
};

// Run comprehensive example if this file is executed directly
if (require.main === module) {
  comprehensiveWorkflowManagement().catch(console.error);
}