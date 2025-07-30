const { AppAtOnceClient } = require('../dist');

const client = AppAtOnceClient.createWithApiKey(
  'your-api-key-here',
  'http://localhost:3000'
);

async function realtimeExample() {
  try {
    // Connect to realtime server
    await client.realtime.connect({
      autoReconnect: true,
      maxReconnectAttempts: 5,
    });
    console.log('Connected to realtime server');

    // Subscribe to database changes
    const unsubscribeUsers = await client.realtime.subscribeToTable(
      'users',
      (event) => {
        console.log('User table change:', {
          type: event.type,
          table: event.table,
          recordId: event.record.id,
          timestamp: event.timestamp,
        });

        if (event.type === 'INSERT') {
          console.log('New user created:', event.record);
        } else if (event.type === 'UPDATE') {
          console.log('User updated:', {
            id: event.record.id,
            changes: event.record,
            oldData: event.old_record,
          });
        } else if (event.type === 'DELETE') {
          console.log('User deleted:', event.old_record);
        }
      },
      {
        events: ['INSERT', 'UPDATE', 'DELETE'],
        filter: { active: true }, // Only listen to active users
      }
    );

    // Subscribe to orders table with specific conditions
    const unsubscribeOrders = await client.realtime.subscribeToTable(
      'orders',
      (event) => {
        console.log('Order event:', event);
        
        // Handle high-value orders
        if (event.record.total > 1000) {
          console.log('🚨 High-value order alert:', event.record);
          // Could trigger notifications, workflows, etc.
        }
      },
      {
        events: ['INSERT', 'UPDATE'],
        filter: { status: ['pending', 'processing'] },
      }
    );

    // Subscribe to channel for real-time messaging
    const unsubscribeChat = await client.realtime.subscribeToChannel(
      'support-chat',
      (message) => {
        console.log('Chat message received:', message);
        
        if (message.type === 'new_ticket') {
          console.log('New support ticket:', message.data);
        } else if (message.type === 'message') {
          console.log(`${message.data.user}: ${message.data.content}`);
        }
      }
    );

    // Publish a message to the channel
    await client.realtime.publishToChannel('support-chat', {
      type: 'message',
      data: {
        user: 'system',
        content: 'Welcome to support chat!',
        timestamp: new Date().toISOString(),
      },
    });

    // Join a presence channel for collaborative features
    const leavePresence = await client.realtime.joinPresence(
      'document-editor-123',
      {
        id: 'user-456',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        metadata: {
          cursor_position: { x: 100, y: 200 },
          current_tool: 'text',
        },
      },
      (presence) => {
        console.log('Presence update:', presence);
        
        if (presence.joined.length > 0) {
          console.log('Users joined:', presence.joined);
        }
        
        if (presence.left.length > 0) {
          console.log('Users left:', presence.left);
        }
        
        if (presence.updated.length > 0) {
          console.log('Users updated:', presence.updated);
        }
      }
    );

    // Update presence information
    setTimeout(async () => {
      await client.realtime.updatePresence('document-editor-123', {
        metadata: {
          cursor_position: { x: 150, y: 250 },
          current_tool: 'brush',
        },
      });
      console.log('Presence updated');
    }, 5000);

    // Subscribe to workflow events
    const unsubscribeWorkflow = await client.realtime.subscribeToWorkflow(
      'user-onboarding',
      (event) => {
        console.log('Workflow event:', event);
        
        switch (event.type) {
          case 'started':
            console.log(`Workflow ${event.workflow_id} started for execution ${event.execution_id}`);
            break;
          case 'step_completed':
            console.log(`Step "${event.step_name}" completed in workflow ${event.workflow_id}`);
            break;
          case 'completed':
            console.log(`Workflow ${event.workflow_id} completed successfully`);
            break;
          case 'failed':
            console.log(`Workflow ${event.workflow_id} failed:`, event.error);
            break;
        }
      }
    );

    // Subscribe to real-time analytics
    const unsubscribeAnalytics = await client.realtime.subscribeToAnalytics(
      'system',
      'global',
      (metrics) => {
        console.log('System metrics update:', {
          timestamp: metrics.timestamp,
          activeUsers: metrics.metrics.active_users,
          requestsPerSecond: metrics.metrics.requests_per_second,
          avgResponseTime: metrics.metrics.avg_response_time,
        });
      },
      {
        interval: 30, // Update every 30 seconds
        metrics: ['active_users', 'requests_per_second', 'avg_response_time'],
      }
    );

    // Handle connection state changes
    const unsubscribeConnectionState = client.realtime.onConnectionStateChange((connected) => {
      if (connected) {
        console.log('✅ Realtime connection established');
      } else {
        console.log('❌ Realtime connection lost');
      }
    });

    // Handle errors
    const unsubscribeError = client.realtime.onError((error) => {
      console.error('Realtime error:', error);
    });

    // Simulate some database operations to trigger events
    setTimeout(async () => {
      console.log('\n--- Simulating database operations ---');
      
      // Insert a new user (should trigger realtime event)
      const newUser = await client.table('users').insert({
        email: 'realtime.test@example.com',
        name: 'Realtime Test User',
        active: true,
      });
      console.log('Created user:', newUser.id);

      // Update the user (should trigger realtime event)
      setTimeout(async () => {
        await client.table('users')
          .eq('id', newUser.id)
          .update({ name: 'Updated Test User' });
        console.log('Updated user:', newUser.id);
      }, 2000);

      // Delete the user (should trigger realtime event)
      setTimeout(async () => {
        await client.table('users')
          .eq('id', newUser.id)
          .delete();
        console.log('Deleted user:', newUser.id);
      }, 4000);

    }, 3000);

    // Show connection status
    const status = client.realtime.getConnectionStatus();
    console.log('Connection status:', status);

    // Show active subscriptions
    const subscriptions = client.realtime.getActiveSubscriptions();
    console.log('Active subscriptions:', subscriptions.length);

    const channels = client.realtime.getActiveChannels();
    console.log('Active channels:', channels.length);

    // Clean up after 30 seconds
    setTimeout(async () => {
      console.log('\n--- Cleaning up subscriptions ---');
      
      // Unsubscribe from everything
      unsubscribeUsers();
      unsubscribeOrders();
      unsubscribeChat();
      leavePresence();
      unsubscribeWorkflow();
      unsubscribeAnalytics();
      unsubscribeConnectionState();
      unsubscribeError();
      
      // Or use the convenience method
      // client.realtime.unsubscribeAll();
      
      // Disconnect
      client.realtime.disconnect();
      console.log('Disconnected from realtime server');
      
    }, 30000);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
realtimeExample();