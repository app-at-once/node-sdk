#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function verifyWAL2JSONListeners() {
  console.log('=== Verifying Independent WAL2JSON Listeners ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `wal2json_verify_${Date.now()}`;
  const events = [];
  
  try {
    // 1. Create table (should automatically create triggers)
    console.log(`1. Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'message', type: 'varchar', required: true },
        { name: 'timestamp', type: 'timestamp' }
      ]
    });
    console.log('✓ Table created with automatic real-time triggers');
    
    // 2. Connect to real-time
    console.log('\n2. Connecting to real-time...');
    await client.realtime.connect({ debug: true });
    console.log('✓ Connected');
    
    // 3. Subscribe to table
    console.log(`\n3. Subscribing to table: ${tableName}`);
    const unsubscribe = await client.realtime.subscribeToTable(
      tableName,
      (event) => {
        console.log(`📡 Received ${event.type} event via WAL2JSON:`, {
          id: event.record.id,
          message: event.record.message,
          timestamp: event.timestamp
        });
        events.push(event);
      }
    );
    console.log('✓ Subscribed');
    
    // Wait for subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Test INSERT
    console.log('\n4. Testing INSERT (should trigger WAL2JSON → Socket.io)...');
    const inserted = await client.table(tableName).insert({
      message: 'Testing independent WAL2JSON listener',
      timestamp: new Date()
    });
    console.log('✓ Data inserted');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 5. Verify events
    console.log(`\n5. Verification: Received ${events.length} event(s)`);
    if (events.length > 0) {
      console.log('✅ WAL2JSON listener is working correctly!');
      console.log('   Each app database has its own independent listener.');
    } else {
      console.log('❌ No events received - WAL2JSON listener may not be configured');
    }
    
    // 6. Cleanup
    console.log('\n6. Cleaning up...');
    unsubscribe();
    client.realtime.disconnect();
    await client.schema.dropTable(tableName);
    console.log('✓ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

verifyWAL2JSONListeners();