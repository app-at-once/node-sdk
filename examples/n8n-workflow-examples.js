const AppAtOnceClient = require('../dist/index').default;

// Initialize the client
const client = AppAtOnceClient.createWithApiKey(
  'your-api-key-here',
  'https://api.appatonce.com'
);

// Example 1: List all workflows
async function listWorkflows() {
  console.log('🔍 Listing n8n workflows...');
  
  try {
    const result = await client.n8nWorkflow.listWorkflows({
      limit: 10,
      active: true
    });
    
    console.log(`Found ${result.total} workflows:`);
    result.workflows.forEach(workflow => {
      console.log(`  - ${workflow.name} (${workflow.id}) - Active: ${workflow.active}`);
    });
    
    return result.workflows;
  } catch (error) {
    console.error('❌ Error listing workflows:', error.message);
  }
}

// Example 2: Execute a workflow by name
async function executeWorkflowByName(workflowName, inputData = {}) {
  console.log(`🚀 Executing workflow: ${workflowName}`);
  
  try {
    const execution = await client.n8nWorkflow.executeWorkflowByName(
      workflowName,
      {
        ...inputData,
        timestamp: new Date().toISOString(),
        source: 'nodejs-sdk'
      },
      { waitTill: 'completed' }
    );
    
    console.log(`✅ Workflow executed successfully:`);
    console.log(`  Execution ID: ${execution.id}`);
    console.log(`  Status: ${execution.finished ? 'Completed' : 'Running'}`);
    console.log(`  Started: ${execution.startedAt}`);
    
    if (execution.finished && execution.data?.resultData?.error) {
      console.log(`  Error: ${execution.data.resultData.error.message}`);
    }
    
    return execution;
  } catch (error) {
    console.error('❌ Error executing workflow:', error.message);
  }
}

// Example 3: Chain multiple workflows
async function chainWorkflows() {
  console.log('🔗 Chaining multiple workflows...');
  
  try {
    // First, get some workflows to chain
    const { workflows } = await client.n8nWorkflow.listWorkflows({ limit: 3 });
    
    if (workflows.length < 2) {
      console.log('⚠️ Need at least 2 workflows to demonstrate chaining');
      return;
    }
    
    const workflowChain = [
      {
        workflowId: workflows[0].id,
        inputData: { step: 1, message: 'Starting workflow chain' },
        waitForCompletion: true
      },
      {
        workflowId: workflows[1].id,
        inputData: { step: 2, message: 'Second workflow in chain' },
        waitForCompletion: true
      }
    ];
    
    const executions = await client.n8nWorkflow.chainWorkflows(workflowChain);
    
    console.log(`✅ Successfully chained ${executions.length} workflows:`);
    executions.forEach((execution, index) => {
      console.log(`  Step ${index + 1}: ${execution.id} - ${execution.finished ? 'Completed' : 'Running'}`);
    });
    
    return executions;
  } catch (error) {
    console.error('❌ Error chaining workflows:', error.message);
  }
}

// Example 4: Execute workflows in parallel
async function executeWorkflowsInParallel() {
  console.log('⚡ Executing workflows in parallel...');
  
  try {
    // Get some workflows for parallel execution
    const { workflows } = await client.n8nWorkflow.listWorkflows({ limit: 3 });
    
    if (workflows.length < 2) {
      console.log('⚠️ Need at least 2 workflows to demonstrate parallel execution');
      return;
    }
    
    const parallelWorkflows = workflows.slice(0, 2).map((workflow, index) => ({
      workflowId: workflow.id,
      inputData: {
        parallelIndex: index,
        message: `Parallel execution ${index + 1}`,
        timestamp: new Date().toISOString()
      }
    }));
    
    const results = await client.n8nWorkflow.executeWorkflowsInParallel(parallelWorkflows);
    
    console.log('✅ Parallel execution results:');
    results.forEach((result, index) => {
      if (result.execution) {
        console.log(`  Workflow ${index + 1}: ${result.execution.id} - Success`);
      } else {
        console.log(`  Workflow ${index + 1}: Failed - ${result.error}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error executing workflows in parallel:', error.message);
  }
}

// Example 5: Activate/Deactivate workflow
async function toggleWorkflowStatus(workflowId) {
  console.log(`🔄 Toggling workflow status: ${workflowId}`);
  
  try {
    // Get current status
    const workflow = await client.n8nWorkflow.getWorkflow(workflowId);
    const currentStatus = workflow.active;
    
    console.log(`Current status: ${currentStatus ? 'Active' : 'Inactive'}`);
    
    // Toggle status
    let updatedWorkflow;
    if (currentStatus) {
      updatedWorkflow = await client.n8nWorkflow.deactivateWorkflow(workflowId);
      console.log('✅ Workflow deactivated');
    } else {
      updatedWorkflow = await client.n8nWorkflow.activateWorkflow(workflowId);
      console.log('✅ Workflow activated');
    }
    
    console.log(`New status: ${updatedWorkflow.active ? 'Active' : 'Inactive'}`);
    return updatedWorkflow;
  } catch (error) {
    console.error('❌ Error toggling workflow status:', error.message);
  }
}

// Example 6: Search workflows by name or tag
async function searchWorkflows(searchTerm) {
  console.log(`🔎 Searching workflows for: "${searchTerm}"`);
  
  try {
    const workflows = await client.n8nWorkflow.searchWorkflows(searchTerm);
    
    console.log(`Found ${workflows.length} matching workflows:`);
    workflows.forEach(workflow => {
      console.log(`  - ${workflow.name} (${workflow.id})`);
      if (workflow.tags && workflow.tags.length > 0) {
        console.log(`    Tags: ${workflow.tags.join(', ')}`);
      }
    });
    
    return workflows;
  } catch (error) {
    console.error('❌ Error searching workflows:', error.message);
  }
}

// Example 7: Monitor workflow executions
async function monitorWorkflowExecutions(workflowId, limit = 10) {
  console.log(`📊 Monitoring executions for workflow: ${workflowId}`);
  
  try {
    const { executions } = await client.n8nWorkflow.listExecutions({
      workflowId,
      limit
    });
    
    console.log(`Found ${executions.length} recent executions:`);
    executions.forEach(execution => {
      const status = execution.finished ? 
        (execution.data?.resultData?.error ? 'Failed' : 'Success') : 
        'Running';
      
      console.log(`  - ${execution.id}: ${status} (${execution.startedAt})`);
      
      if (execution.data?.resultData?.error) {
        console.log(`    Error: ${execution.data.resultData.error.message}`);
      }
    });
    
    return executions;
  } catch (error) {
    console.error('❌ Error monitoring executions:', error.message);
  }
}

// Example 8: Create a simple webhook workflow
async function createWebhookWorkflow(workflowName) {
  console.log(`🔨 Creating webhook workflow: ${workflowName}`);
  
  try {
    const workflow = await client.n8nWorkflow.createWorkflow({
      name: workflowName,
      nodes: [
        {
          id: 'webhook-node',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          position: [250, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'test-webhook',
            responseMode: 'onReceived',
            responseData: 'firstEntryJson'
          }
        },
        {
          id: 'set-node',
          name: 'Set',
          type: 'n8n-nodes-base.set',
          position: [450, 300],
          parameters: {
            values: {
              string: [
                {
                  name: 'message',
                  value: 'Webhook received successfully!'
                },
                {
                  name: 'timestamp',
                  value: '{{ new Date().toISOString() }}'
                }
              ]
            }
          }
        }
      ],
      connections: {
        'Webhook': {
          main: [[{ node: 'Set', type: 'main', index: 0 }]]
        }
      },
      active: false,
      tags: ['sdk-example', 'webhook']
    });
    
    console.log('✅ Webhook workflow created successfully:');
    console.log(`  ID: ${workflow.id}`);
    console.log(`  Name: ${workflow.name}`);
    console.log(`  Status: ${workflow.active ? 'Active' : 'Inactive'}`);
    
    return workflow;
  } catch (error) {
    console.error('❌ Error creating webhook workflow:', error.message);
  }
}

// Example 9: Health check
async function healthCheck() {
  console.log('💚 Performing n8n health check...');
  
  try {
    const health = await client.n8nWorkflow.healthCheck();
    
    console.log(`Status: ${health.status}`);
    console.log(`Workflow count: ${health.workflowCount}`);
    
    if (health.error) {
      console.log(`Error: ${health.error}`);
    }
    
    return health;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

// Example 10: Complete workflow management example
async function completeWorkflowExample() {
  console.log('🎯 Complete n8n workflow management example');
  console.log('='.repeat(50));
  
  try {
    // 1. Health check
    await healthCheck();
    console.log('');
    
    // 2. List workflows
    const workflows = await listWorkflows();
    console.log('');
    
    if (!workflows || workflows.length === 0) {
      console.log('⚠️ No workflows found. Creating a test workflow...');
      await createWebhookWorkflow('SDK Test Workflow');
      console.log('');
    }
    
    // 3. Search workflows
    await searchWorkflows('test');
    console.log('');
    
    // 4. Execute workflows in parallel (if we have enough)
    await executeWorkflowsInParallel();
    console.log('');
    
    // 5. Monitor executions
    if (workflows && workflows.length > 0) {
      await monitorWorkflowExecutions(workflows[0].id, 5);
    }
    
    console.log('✅ Complete example finished successfully!');
  } catch (error) {
    console.error('❌ Complete example failed:', error.message);
  }
}

// Export functions for use in other modules
module.exports = {
  listWorkflows,
  executeWorkflowByName,
  chainWorkflows,
  executeWorkflowsInParallel,
  toggleWorkflowStatus,
  searchWorkflows,
  monitorWorkflowExecutions,
  createWebhookWorkflow,
  healthCheck,
  completeWorkflowExample
};

// Run complete example if this file is executed directly
if (require.main === module) {
  completeWorkflowExample().catch(console.error);
}