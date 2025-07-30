const { AppAtOnceClient } = require('../dist');

const client = AppAtOnceClient.createWithApiKey(
  'your-api-key-here',
  'http://localhost:3000'
);

async function workflowExample() {
  try {
    // Create a workflow for processing new user signups
    const workflow = await client.workflow.createWorkflow({
      name: 'user-onboarding',
      description: 'Automated user onboarding process',
      definition: {
        version: '1.0',
        nodes: [
          {
            name: 'validate_email',
            type: 'validation',
            params: {
              field: 'email',
              rules: ['required', 'email'],
            },
          },
          {
            name: 'check_existing_user',
            type: 'database',
            params: {
              operation: 'count',
              table: 'users',
              where: { email: '{{input.email}}' },
            },
          },
          {
            name: 'send_welcome_email',
            type: 'email',
            params: {
              template: 'welcome-template',
              to: '{{input.email}}',
              variables: {
                name: '{{input.name}}',
                welcome_link: '{{env.FRONTEND_URL}}/welcome',
              },
            },
            condition: '{{check_existing_user.result}} == 0',
          },
          {
            name: 'create_user_profile',
            type: 'database',
            params: {
              operation: 'insert',
              table: 'user_profiles',
              data: {
                user_id: '{{input.user_id}}',
                onboarding_status: 'email_sent',
                created_at: '{{now()}}',
              },
            },
          },
          {
            name: 'schedule_followup',
            type: 'schedule',
            params: {
              delay: '24h',
              workflow: 'followup-email',
              input: {
                user_id: '{{input.user_id}}',
                email: '{{input.email}}',
              },
            },
          },
        ],
        connections: [
          { from: 'validate_email', to: 'check_existing_user' },
          { from: 'check_existing_user', to: 'send_welcome_email' },
          { from: 'send_welcome_email', to: 'create_user_profile' },
          { from: 'create_user_profile', to: 'schedule_followup' },
        ],
      },
      triggers: [
        {
          type: 'webhook',
          config: {
            path: '/webhooks/user-signup',
            method: 'POST',
          },
        },
        {
          type: 'database',
          config: {
            table: 'users',
            event: 'INSERT',
          },
        },
      ],
      enabled: true,
      tags: ['onboarding', 'email', 'automation'],
    });
    console.log('Workflow created:', workflow);

    // Execute the workflow manually
    const execution = await client.workflow.executeWorkflow(
      workflow.id,
      {
        user_id: 'user-123',
        email: 'newuser@example.com',
        name: 'New User',
      },
      {
        async: false,
        priority: 'normal',
      }
    );
    console.log('Workflow execution:', execution);

    // Get execution details
    const executionDetails = await client.workflow.getExecution(execution.id);
    console.log('Execution steps:', executionDetails.steps);

    // Create a trigger for automatic execution
    const trigger = await client.workflow.createTrigger(workflow.id, {
      type: 'webhook',
      config: {
        path: '/webhooks/user-signup',
        method: 'POST',
        headers: {
          'X-Webhook-Secret': 'your-secret-here',
        },
      },
      enabled: true,
      name: 'User Signup Webhook',
    });
    console.log('Trigger created:', trigger);

    // Schedule the workflow to run daily
    const schedule = await client.workflow.scheduleWorkflow(workflow.id, {
      cron: '0 9 * * *', // 9 AM daily
      timezone: 'America/New_York',
      enabled: true,
      input: {
        batch_size: 100,
        send_summary: true,
      },
    });
    console.log('Schedule created:', schedule);

    // Create an advanced workflow with parallel processing
    const advancedWorkflow = await client.workflow.createWorkflow({
      name: 'order-processing',
      description: 'Advanced order processing with parallel tasks',
      definition: {
        version: '1.0',
        nodes: [
          {
            name: 'validate_order',
            type: 'validation',
            params: {
              schema: {
                items: 'required|array',
                customer_id: 'required|uuid',
                payment_method: 'required|string',
              },
            },
          },
          {
            name: 'check_inventory',
            type: 'parallel',
            params: {
              tasks: [
                {
                  name: 'check_stock',
                  type: 'database',
                  params: {
                    operation: 'select',
                    table: 'inventory',
                    where: { product_id: '{{input.items[*].product_id}}' },
                  },
                },
                {
                  name: 'reserve_items',
                  type: 'api',
                  params: {
                    url: '{{env.INVENTORY_API}}/reserve',
                    method: 'POST',
                    body: { items: '{{input.items}}' },
                  },
                },
              ],
            },
          },
          {
            name: 'process_payment',
            type: 'api',
            params: {
              url: '{{env.PAYMENT_API}}/charge',
              method: 'POST',
              body: {
                amount: '{{input.total}}',
                payment_method: '{{input.payment_method}}',
                customer_id: '{{input.customer_id}}',
              },
            },
            condition: '{{check_inventory.success}} == true',
          },
          {
            name: 'send_notifications',
            type: 'parallel',
            params: {
              tasks: [
                {
                  name: 'email_customer',
                  type: 'email',
                  params: {
                    template: 'order-confirmation',
                    to: '{{input.customer_email}}',
                  },
                },
                {
                  name: 'notify_fulfillment',
                  type: 'webhook',
                  params: {
                    url: '{{env.FULFILLMENT_WEBHOOK}}',
                    body: { order_id: '{{input.order_id}}' },
                  },
                },
                {
                  name: 'update_analytics',
                  type: 'database',
                  params: {
                    operation: 'insert',
                    table: 'order_events',
                    data: {
                      order_id: '{{input.order_id}}',
                      event: 'confirmed',
                      timestamp: '{{now()}}',
                    },
                  },
                },
              ],
            },
            condition: '{{process_payment.success}} == true',
          },
        ],
        error_handling: {
          retry_failed_steps: true,
          max_retries: 3,
          retry_delay: '30s',
          on_failure: {
            rollback: true,
            notify: ['admin@company.com'],
          },
        },
      },
      enabled: true,
    });
    console.log('Advanced workflow created:', advancedWorkflow);

    // Test the workflow
    const testResult = await client.workflow.testWorkflow(
      advancedWorkflow.id,
      {
        order_id: 'order-456',
        customer_id: 'cust-123',
        customer_email: 'customer@example.com',
        items: [
          { product_id: 'prod-1', quantity: 2, price: 29.99 },
          { product_id: 'prod-2', quantity: 1, price: 49.99 },
        ],
        total: 109.97,
        payment_method: 'card_123',
      },
      {
        timeout: 30000,
      }
    );
    console.log('Test result:', testResult);

    // Get workflow statistics
    const stats = await client.workflow.getWorkflowStats(
      workflow.id,
      {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date(),
      }
    );
    console.log('Workflow stats:', {
      totalExecutions: stats.total_executions,
      successRate: stats.success_rate,
      averageDuration: `${stats.average_duration}ms`,
    });

    // Create an alert for workflow failures
    const alert = await client.workflow.createAlert(workflow.id, {
      name: 'High Failure Rate Alert',
      condition: {
        metric: 'failure_rate',
        operator: 'gt',
        value: 0.1, // 10% failure rate
        timeWindow: 3600, // 1 hour
      },
      actions: [
        {
          type: 'email',
          config: {
            to: ['admin@company.com'],
            subject: 'Workflow Alert: High Failure Rate',
            template: 'workflow-alert',
          },
        },
        {
          type: 'webhook',
          config: {
            url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
            body: {
              text: 'Workflow {{workflow.name}} has high failure rate: {{alert.value}}%',
            },
          },
        },
      ],
      enabled: true,
    });
    console.log('Alert created:', alert);

    // List all workflows
    const workflows = await client.workflow.listWorkflows({
      status: 'active',
      limit: 10,
      sortBy: 'executions',
      sortOrder: 'desc',
    });
    console.log('Active workflows:', workflows.workflows.length);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
workflowExample();