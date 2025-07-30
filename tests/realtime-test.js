#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

// Test configurations
const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testRealtime() {
  console.log('=== Real-time SDK Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `realtime_test_${Date.now()}`;
  
  try {
    // 1. Create table
    console.log(`1. Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'message', type: 'varchar', required: true },
        { name: 'timestamp', type: 'timestamp' }
      ],
      enableRealtime: true  // Enable real-time for this table
    });
    console.log('✓ Table created with real-time enabled');
    
    // 2. Connect to real-time
    console.log('\n2. Connecting to real-time...');
    await client.realtime.connect({ debug: true });
    console.log('✓ Connected to real-time');
    
    // 3. Subscribe to table changes
    console.log(`\n3. Subscribing to table: ${tableName}`);
    const events = [];
    const unsubscribe = await client.realtime.subscribeToTable(
      tableName,
      (event) => {
        console.log('📡 Received event:', event);
        events.push(event);
      }
    );
    console.log('✓ Subscribed to table changes');
    
    // 4. Wait a bit for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Insert data to trigger event
    console.log('\n4. Inserting data to trigger real-time event...');
    await client.table(tableName).insert({
      message: 'Hello real-time!',
      timestamp: new Date().toISOString()
    });
    console.log('✓ Data inserted');
    
    // 6. Wait for event
    console.log('\n5. Waiting for real-time event...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 7. Check results
    console.log(`\n6. Results: Received ${events.length} events`);
    if (events.length > 0) {
      console.log('✅ Real-time working!');
    } else {
      console.log('❌ No real-time events received');
    }
    
    // 8. Cleanup
    console.log('\n7. Cleaning up...');
    unsubscribe();
    client.realtime.disconnect();
    await client.schema.dropTable(tableName);
    console.log('✓ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
    
    // Cleanup on error
    try {
      client.realtime.disconnect();
      await client.schema.dropTable(tableName);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

// Run test
testRealtime().catch(console.error);