#!/usr/bin/env node

/**
 * AppAtOnce Analytics - Getting Started Example
 * 
 * This example demonstrates the core analytics capabilities:
 * - Real-time analytics queries
 * - Aggregations (SUM, COUNT, AVG, etc.)
 * - Time-series data
 * - Business metrics
 * 
 * All examples work dynamically based on each project/app database configuration.
 * 
 * Usage:
 *   export APPATONCE_API_KEY="your-api-key"
 *   node examples/analytics-getting-started.js
 */

const { AppAtOnceClient } = require('@appatonce/node-sdk');

async function main() {
  // Initialize client with your API key (project-level or app-level)
  if (!process.env.APPATONCE_API_KEY) {
    console.error('❌ Please set APPATONCE_API_KEY environment variable');
    console.error('   Example: export APPATONCE_API_KEY="your-key-here"');
    process.exit(1);
  }

  const client = AppAtOnceClient.create(process.env.APPATONCE_API_KEY);
  
  console.log('🚀 AppAtOnce Analytics - Getting Started');
  console.log('=' .repeat(50));

  try {
    // Test connection
    const health = await client.ping();
    console.log('✅ Connected to AppAtOnce:', health.version);
    console.log();

    // Example 1: Basic Analytics
    await basicAnalyticsExample(client);

    // Example 2: Real-time Analytics
    await realtimeExample(client);

    // Example 3: Time-series Analysis
    await timeSeriesExample(client);

    // Example 4: Business Metrics
    await businessMetricsExample(client);

    console.log('🎉 Analytics examples completed successfully!');
    console.log('\n📖 For more examples, see:');
    console.log('   - examples/analytics-examples.js (comprehensive examples)');
    console.log('   - docs/analytics.md (full documentation)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('   Check your API key is correct and has proper permissions');
    } else if (error.message.includes('404')) {
      console.error('   Table not found. Make sure you have tables in your database');
    } else {
      console.error('   Full error:', error);
    }
  }
}

/**
 * Example 1: Basic Analytics Operations
 * Demonstrates COUNT, SUM, AVG, MIN, MAX, DISTINCT
 */
async function basicAnalyticsExample(client) {
  console.log('📊 Basic Analytics Example');
  console.log('-' .repeat(30));

  // Work with any table - replace 'users' with your table name
  const table = client.table('users');

  try {
    // Basic count
    const totalRecords = await table.analytics.count();
    console.log(`Total records: ${totalRecords.toLocaleString()}`);

    // Conditional count
    const activeUsers = await table.analytics.count({ 
      status: 'active' 
    });
    console.log(`Active users: ${activeUsers.toLocaleString()}`);

    // If your table has numeric columns, try these:
    // const totalRevenue = await table.analytics.sum('amount');
    // const avgValue = await table.analytics.avg('score');
    // const maxValue = await table.analytics.max('price');
    // const uniqueValues = await table.analytics.countDistinct('category');

  } catch (error) {
    console.log('ℹ️  Basic analytics:', error.message);
    console.log('   (This is normal if the table doesn\'t exist or has different columns)');
  }

  console.log();
}

/**
 * Example 2: Real-time Analytics
 * Shows live updates with WebSocket integration
 */
async function realtimeExample(client) {
  console.log('⚡ Real-time Analytics Example');
  console.log('-' .repeat(30));

  const table = client.table('users');

  try {
    console.log('📡 Starting real-time monitoring for 10 seconds...');

    // Set up real-time monitoring
    const unsubscribe = table.analytics.realtime(
      {
        metric: 'count',
        timeRange: '1h' // Count records from last hour
      },
      (result) => {
        const count = result.data?.[0]?.value || 0;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`   [${timestamp}] Live count (1h): ${count.toLocaleString()}`);
      }
    );

    // Run for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Stop monitoring
    unsubscribe();
    console.log('🔕 Real-time monitoring stopped');

  } catch (error) {
    console.log('ℹ️  Real-time analytics:', error.message);
  }

  console.log();
}

/**
 * Example 3: Time-series Analysis
 * Demonstrates hourly, daily, and weekly trends
 */
async function timeSeriesExample(client) {
  console.log('📈 Time-series Analysis Example');
  console.log('-' .repeat(30));

  const table = client.table('users');

  try {
    // Daily record creation for the last 7 days
    console.log('📅 Daily trends (last 7 days):');
    const dailyTrends = await table.analytics.timeSeries({
      metric: 'count',
      interval: 'day',
      timeRange: '7d'
    });

    dailyTrends.slice(-7).forEach(point => {
      const date = new Date(point.timestamp).toLocaleDateString();
      const dayName = new Date(point.timestamp).toLocaleDateString('en-US', { 
        weekday: 'short' 
      });
      console.log(`   ${dayName} ${date}: ${point.value.toLocaleString()} records`);
    });

    console.log('\n⏰ Hourly trends (last 24 hours):');
    const hourlyTrends = await table.analytics.timeSeries({
      metric: 'count',
      interval: 'hour',
      timeRange: '24h'
    });

    // Show last 6 hours
    hourlyTrends.slice(-6).forEach(point => {
      const time = new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`   ${time}: ${point.value.toLocaleString()} records`);
    });

  } catch (error) {
    console.log('ℹ️  Time-series analytics:', error.message);
  }

  console.log();
}

/**
 * Example 4: Business Metrics
 * Demonstrates grouped analytics and comparisons
 */
async function businessMetricsExample(client) {
  console.log('🎯 Business Metrics Example');
  console.log('-' .repeat(30));

  const table = client.table('users');

  try {
    // Grouped analysis
    console.log('👥 User distribution:');
    
    // Group by status (if column exists)
    const statusDistribution = await table.analytics.groupBy({
      metric: 'count',
      groupBy: ['status'],
      limit: 10
    });

    if (statusDistribution.length > 0) {
      statusDistribution.forEach(group => {
        console.log(`   ${group.status || 'Unknown'}: ${group.value.toLocaleString()} users`);
      });
    } else {
      console.log('   No grouping data available (column may not exist)');
    }

    // Month-over-month comparison
    console.log('\n📊 Growth Analysis:');
    
    const thisMonth = await table.analytics.count({
      created_at: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      }
    });

    const lastMonth = await table.analytics.count({
      created_at: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(),
        lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      }
    });

    const growth = lastMonth > 0 ? 
      ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 
      'N/A';

    console.log(`   This month: ${thisMonth.toLocaleString()} records`);
    console.log(`   Last month: ${lastMonth.toLocaleString()} records`);
    console.log(`   Growth: ${growth}%`);

    // Weekly patterns
    console.log('\n📈 Weekly Patterns:');
    const weeklyData = await table.analytics.timeSeries({
      metric: 'count',
      interval: 'week',
      timeRange: '4w'
    });

    weeklyData.forEach((week, index) => {
      const weekStart = new Date(week.timestamp).toLocaleDateString();
      console.log(`   Week ${index + 1} (${weekStart}): ${week.value.toLocaleString()} records`);
    });

  } catch (error) {
    console.log('ℹ️  Business metrics:', error.message);
  }

  console.log();
}

/**
 * Helper: Create demo data for testing
 * Uncomment and modify this if you want to create test data
 */
async function createDemoData(client) {
  console.log('🔧 Creating demo data...');
  
  try {
    // Example: Create a simple analytics table
    /*
    await client.schema.createTable({
      name: 'analytics_demo',
      columns: [
        { name: 'id', type: 'SERIAL', primaryKey: true },
        { name: 'event_type', type: 'VARCHAR(50)' },
        { name: 'user_id', type: 'INTEGER' },
        { name: 'value', type: 'DECIMAL(10,2)' },
        { name: 'created_at', type: 'TIMESTAMP', default: 'NOW()' }
      ]
    });

    // Insert sample data
    const sampleData = [
      { event_type: 'signup', user_id: 1, value: 0 },
      { event_type: 'purchase', user_id: 1, value: 29.99 },
      { event_type: 'signup', user_id: 2, value: 0 },
      { event_type: 'purchase', user_id: 2, value: 49.99 }
    ];

    for (const record of sampleData) {
      await client.table('analytics_demo').insert(record);
    }
    */

    console.log('✅ Demo data created');
  } catch (error) {
    console.log('⚠️  Demo data creation skipped:', error.message);
  }
}

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the examples
if (require.main === module) {
  main();
}

module.exports = { main };