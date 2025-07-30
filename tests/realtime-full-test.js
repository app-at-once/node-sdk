#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testFullRealtime() {
  console.log('=== Full Real-time Test (INSERT, UPDATE, DELETE) ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `realtime_full_test_${Date.now()}`;
  const events = [];
  
  try {
    // 1. Create table
    console.log(`1. Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'status', type: 'varchar' },
        { name: 'count', type: 'integer' }
      ]
    });
    console.log('✓ Table created');
    
    // 2. Connect to real-time
    console.log('\n2. Connecting to real-time...');
    await client.realtime.connect({ debug: true });
    console.log('✓ Connected to real-time');
    
    // 3. Subscribe to table
    console.log(`\n3. Subscribing to table: ${tableName}`);
    const unsubscribe = await client.realtime.subscribeToTable(
      tableName,
      (event) => {
        console.log(`📡 Received ${event.type} event:`, {
          id: event.record.id,
          name: event.record.name,
          status: event.record.status
        });
        events.push(event);
      }
    );
    console.log('✓ Subscribed to table changes');
    
    // Wait for subscription to be established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Test INSERT
    console.log('\n4. Testing INSERT...');
    const inserted = await client.table(tableName).insert({
      name: 'Test Item',
      status: 'active',
      count: 1
    });
    console.log('✓ Data inserted:', inserted.id);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Test UPDATE
    console.log('\n5. Testing UPDATE...');
    const updated = await client.table(tableName)
      .where('id', 'eq', inserted.id)
      .update({
        status: 'updated',
        count: 2
      });
    console.log('✓ Data updated');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 6. Test DELETE
    console.log('\n6. Testing DELETE...');
    await client.table(tableName)
      .where('id', 'eq', inserted.id)
      .delete();
    console.log('✓ Data deleted');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 7. Check results
    console.log(`\n7. Results: Received ${events.length} events`);
    const insertEvents = events.filter(e => e.type === 'INSERT').length;
    const updateEvents = events.filter(e => e.type === 'UPDATE').length;
    const deleteEvents = events.filter(e => e.type === 'DELETE').length;
    
    console.log(`   - INSERT events: ${insertEvents}`);
    console.log(`   - UPDATE events: ${updateEvents}`);
    console.log(`   - DELETE events: ${deleteEvents}`);
    
    if (insertEvents === 1 && updateEvents === 1 && deleteEvents === 1) {
      console.log('\n✅ All real-time events working correctly!');
    } else {
      console.log('\n❌ Some events were missed');
    }
    
    // 8. Cleanup
    console.log('\n8. Cleaning up...');
    unsubscribe();
    client.realtime.disconnect();
    await client.schema.dropTable(tableName);
    console.log('✓ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

testFullRealtime();