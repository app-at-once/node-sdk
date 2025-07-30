#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSimpleQuery() {
  console.log('=== Testing Simple Query ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `simple_query_${Date.now()}`;
  
  try {
    // 1. Create simple table
    console.log(`1. Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'value', type: 'integer' }
      ]
    });
    console.log('✓ Table created');
    
    // 2. Insert single record
    console.log('\n2. Inserting single record...');
    const inserted = await client.table(tableName).insert({
      name: 'Test',
      value: 42
    });
    console.log('✓ Record inserted:', inserted.id);
    
    // 3. Select all
    console.log('\n3. Selecting all records...');
    const result = await client.table(tableName).select().execute();
    const all = result.data;
    console.log('✓ Records found:', all.length);
    console.log('  Data:', all[0]);
    
    // 4. Test where
    console.log('\n4. Testing where clause...');
    const filteredResult = await client.table(tableName)
      .where('name', 'eq', 'Test')
      .select()
      .execute();
    const filtered = filteredResult.data;
    console.log('✓ Filtered records:', filtered.length);
    
    // 5. Test orderBy
    console.log('\n5. Testing orderBy...');
    const orderedResult = await client.table(tableName)
      .orderBy('value', 'desc')
      .select()
      .execute();
    const ordered = orderedResult.data;
    console.log('✓ Ordered records:', ordered.length);
    
    // 6. Test limit
    console.log('\n6. Testing limit...');
    const limitedResult = await client.table(tableName)
      .limit(1)
      .select()
      .execute();
    const limited = limitedResult.data;
    console.log('✓ Limited records:', limited.length);
    
    // 7. Test select columns
    console.log('\n7. Testing select columns...');
    const columnsResult = await client.table(tableName)
      .select('name')
      .execute();
    const columns = columnsResult.data;
    console.log('✓ Column selection result:', columns[0]);
    console.log('  Has name:', 'name' in columns[0]);
    console.log('  Has value:', 'value' in columns[0]);
    
    // Cleanup
    console.log('\n8. Cleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

testSimpleQuery();