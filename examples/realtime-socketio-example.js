const { AppAtOnceClient } = require('../dist');

// Initialize the client
const client = AppAtOnceClient.createWithApiKey(
  'your-api-key-here',
  'http://localhost:3000'
);

async function realtimeSocketIOExample() {
  try {
    console.log('🚀 Starting Socket.io Realtime Example\n');

    // Connect to realtime server with options
    await client.realtime.connect({
      autoReconnect: true,
      maxReconnectAttempts: 10,
      reconnectDelay: 2000,
      timeout: 15000,
      debug: true, // Enable debug logging
    });
    
    console.log('✅ Connected to Socket.io realtime server');

    // Connection state monitoring
    const unsubscribeConnectionState = client.realtime.onConnectionStateChange((connected) => {
      if (connected) {
        console.log('🟢 Socket.io connection established');
      } else {
        console.log('🔴 Socket.io connection lost - attempting to reconnect...');
      }
    });

    // Error handling
    const unsubscribeError = client.realtime.onError((error) => {
      console.error('❌ Socket.io error:', error.message);
    });

    // Database change subscriptions with advanced options
    console.log('\n📊 Setting up database subscriptions...');
    
    const unsubscribeUsers = await client.realtime.subscribeToTable(
      'users',
      (event) => {
        console.log(`👤 User ${event.type}:`, {
          id: event.record.id,
          email: event.record.email,
          timestamp: event.timestamp,
        });

        // Handle specific events
        switch (event.type) {
          case 'INSERT':
            console.log('  📝 New user registered:', event.record.email);
            break;
          case 'UPDATE':
            console.log('  ✏️  User updated:', event.record.email);
            if (event.old_record) {
              console.log('    Previous data:', event.old_record);
            }
            break;
          case 'DELETE':
            console.log('  🗑️  User deleted:', event.old_record.email);
            break;
        }
      },
      {
        events: ['INSERT', 'UPDATE', 'DELETE'],
        filter: { active: true }, // Only active users
        realtime: true,
      }
    );

    // Orders table with specific event filtering
    const unsubscribeOrders = await client.realtime.subscribeToTable(
      'orders',
      (event) => {
        console.log(`🛒 Order ${event.type}:`, {
          id: event.record.id,
          total: event.record.total,
          status: event.record.status,
        });

        // Alert for high-value orders
        if (event.record.total > 1000) {
          console.log('  🚨 HIGH VALUE ORDER ALERT!');
        }
      },
      {
        events: ['INSERT', 'UPDATE'],
        filter: { status: ['pending', 'processing'] },
      }
    );

    // Channel subscriptions for real-time messaging
    console.log('\n💬 Setting up channel subscriptions...');
    
    const unsubscribeNotifications = await client.realtime.subscribeToChannel(
      'notifications',
      (message) => {
        console.log('🔔 Notification:', message);
        
        if (message.type === 'urgent') {
          console.log('  ⚠️  URGENT NOTIFICATION:', message.content);
        }
      }
    );

    // Support chat channel
    const unsubscribeSupport = await client.realtime.subscribeToChannel(
      'support-chat',
      (message) => {
        console.log('💬 Support Chat:', message);
        
        if (message.type === 'new_ticket') {
          console.log('  🎫 New support ticket created');
        }
      }
    );

    // Publish messages to channels
    console.log('\n📤 Publishing messages to channels...');
    
    await client.realtime.publishToChannel('notifications', {
      type: 'info',
      content: 'Socket.io realtime example is running',
      timestamp: new Date().toISOString(),
    });

    await client.realtime.publishToChannel('support-chat', {
      type: 'message',
      user: 'system',
      content: 'Welcome to Socket.io powered support chat!',
      timestamp: new Date().toISOString(),
    });

    // Presence tracking for collaborative features
    console.log('\n👥 Setting up presence tracking...');
    
    const leavePresence = await client.realtime.joinPresence(
      'document-editor-123',
      {
        id: 'user-456',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        metadata: {
          cursor_position: { x: 100, y: 200 },
          current_tool: 'text',
          online_since: new Date().toISOString(),
        },
      },
      (presenceUpdate) => {
        console.log('👥 Presence Update:', presenceUpdate);
        
        if (presenceUpdate.joined.length > 0) {
          presenceUpdate.joined.forEach(user => {
            console.log(`  ➕ ${user.name} joined the document`);
          });
        }
        
        if (presenceUpdate.left.length > 0) {
          presenceUpdate.left.forEach(user => {
            console.log(`  ➖ User ${user.id} left the document`);
          });
        }
        
        if (presenceUpdate.updated.length > 0) {
          presenceUpdate.updated.forEach(user => {
            console.log(`  🔄 ${user.name} updated their presence`);
          });
        }
      }
    );

    // Update presence periodically
    setTimeout(async () => {
      await client.realtime.updatePresence('document-editor-123', {
        metadata: {
          cursor_position: { x: 250, y: 300 },
          current_tool: 'brush',
          last_action: 'drawing',
        },
      });
      console.log('🔄 Updated presence information');
    }, 5000);

    // Get current presence
    setTimeout(async () => {
      try {
        const currentPresence = await client.realtime.getPresence('document-editor-123');
        console.log('📊 Current presence:', currentPresence);
      } catch (error) {
        console.log('ℹ️  Could not get presence (server may not be running)');
      }
    }, 7000);

    // Workflow event subscriptions
    console.log('\n⚙️ Setting up workflow subscriptions...');
    
    const unsubscribeWorkflow = await client.realtime.subscribeToWorkflow(
      'user-onboarding',
      (event) => {
        console.log('⚙️ Workflow Event:', event);
        
        switch (event.type) {
          case 'started':
            console.log(`  ▶️  Workflow started: ${event.execution_id}`);
            break;
          case 'step_completed':
            console.log(`  ✅ Step completed: ${event.step_name}`);
            break;
          case 'completed':
            console.log(`  🎉 Workflow completed successfully`);
            break;
          case 'failed':
            console.log(`  ❌ Workflow failed: ${event.error}`);
            break;
        }
      }
    );

    // Real-time analytics subscription
    console.log('\n📈 Setting up analytics subscriptions...');
    
    const unsubscribeAnalytics = await client.realtime.subscribeToAnalytics(
      'system',
      'global',
      (metrics) => {
        console.log('📊 System Metrics:', {
          timestamp: new Date(metrics.timestamp).toLocaleTimeString(),
          activeUsers: metrics.metrics.active_users,
          requestsPerSecond: metrics.metrics.requests_per_second,
          avgResponseTime: `${metrics.metrics.avg_response_time}ms`,
          memoryUsage: `${metrics.metrics.memory_usage}%`,
        });
      },
      {
        interval: 30, // Update every 30 seconds
        metrics: ['active_users', 'requests_per_second', 'avg_response_time', 'memory_usage'],
      }
    );

    // Table-specific analytics
    const unsubscribeTableAnalytics = await client.realtime.subscribeToAnalytics(
      'table',
      'users',
      (metrics) => {
        console.log('📊 Users Table Metrics:', {
          timestamp: new Date(metrics.timestamp).toLocaleTimeString(),
          totalRecords: metrics.metrics.total_records,
          insertsPerMinute: metrics.metrics.inserts_per_minute,
          updatesPerMinute: metrics.metrics.updates_per_minute,
          queryPerformance: `${metrics.metrics.avg_query_time}ms`,
        });
      },
      {
        interval: 60, // Update every minute
        metrics: ['total_records', 'inserts_per_minute', 'updates_per_minute', 'avg_query_time'],
      }
    );

    // Simulate some database operations after a delay
    setTimeout(async () => {
      console.log('\n🔄 Simulating database operations...');
      
      try {
        // Create a new user (will trigger realtime event)
        const newUser = await client.table('users').insert({
          email: 'socketio.test@example.com',
          name: 'Socket.io Test User',
          active: true,
          created_at: new Date().toISOString(),
        });
        console.log('✅ Created test user:', newUser.id);

        // Update the user after 3 seconds
        setTimeout(async () => {
          await client.table('users')
            .eq('id', newUser.id)
            .update({
              name: 'Socket.io Updated User',
              last_login: new Date().toISOString(),
            });
          console.log('✅ Updated test user');
        }, 3000);

        // Delete the user after 6 seconds
        setTimeout(async () => {
          await client.table('users')
            .eq('id', newUser.id)
            .delete();
          console.log('✅ Deleted test user');
        }, 6000);

      } catch (error) {
        console.log('ℹ️  Database operations failed (server may not be running)');
      }
    }, 10000);

    // Connection status monitoring
    setInterval(() => {
      const status = client.realtime.getConnectionStatus();
      console.log('\n📊 Connection Status:', {
        connected: status.connected ? '🟢 Connected' : '🔴 Disconnected',
        state: status.state,
        reconnectAttempts: status.reconnectAttempts,
        subscriptions: status.subscriptionCount,
        channels: status.channelCount,
        presenceChannels: status.presenceChannelCount,
      });
    }, 30000);

    // Cleanup after 60 seconds
    setTimeout(async () => {
      console.log('\n🧹 Cleaning up subscriptions...');
      
      // Unsubscribe from everything
      unsubscribeUsers();
      unsubscribeOrders();
      unsubscribeNotifications();
      unsubscribeSupport();
      leavePresence();
      unsubscribeWorkflow();
      unsubscribeAnalytics();
      unsubscribeTableAnalytics();
      unsubscribeConnectionState();
      unsubscribeError();
      
      // Or use the convenience method
      // client.realtime.unsubscribeAll();
      
      console.log('✅ All subscriptions cleaned up');
      
      // Show final status
      const finalStatus = client.realtime.getConnectionStatus();
      console.log('📊 Final Status:', finalStatus);
      
      // Disconnect
      client.realtime.disconnect();
      console.log('👋 Disconnected from Socket.io realtime server');
      
    }, 60000);

    console.log('\n🎯 Socket.io realtime example is running...');
    console.log('   - Database change subscriptions active');
    console.log('   - Channel messaging active');
    console.log('   - Presence tracking active');
    console.log('   - Workflow event monitoring active');
    console.log('   - Real-time analytics active');
    console.log('   - Auto-reconnection enabled');
    console.log('   - Will cleanup and exit in 60 seconds\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('💡 Make sure the AppAtOnce server is running with Socket.io support');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  client.realtime.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  client.realtime.disconnect();
  process.exit(0);
});

// Run the example
realtimeSocketIOExample();