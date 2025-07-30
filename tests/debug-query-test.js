#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function debugQuery() {
  console.log('=== Debug Query Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `debug_query_${Date.now()}`;
  
  try {
    // 1. Create table
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
    
    // 2. Insert data
    console.log('\n2. Inserting records...');
    await client.table(tableName).insert({ name: 'Test1', value: 10 });
    await client.table(tableName).insert({ name: 'Test2', value: 20 });
    await client.table(tableName).insert({ name: 'Test3', value: 30 });
    console.log('✓ 3 records inserted');
    
    // 3. Test basic select
    console.log('\n3. Basic select (no filters)...');
    const all = await client.table(tableName).execute();
    console.log(`✓ Found ${all.data.length} records`);
    
    // 4. Debug where clause building
    console.log('\n4. Testing where clause...');
    try {
      const queryBuilder = client.table(tableName).where('name', 'eq', 'Test1');
      console.log('  Query builder state:', {
        whereFilters: queryBuilder.whereFilters,
        selectFields: queryBuilder.selectFields
      });
      
      const result = await queryBuilder.execute();
      console.log(`✓ Where clause worked: found ${result.data.length} records`);
      if (result.data.length > 0) {
        console.log('  First record:', result.data[0]);
      }
    } catch (error) {
      console.error('✗ Where clause failed:', error.message);
      console.error('  Status:', error.statusCode);
      console.error('  Details:', error.details);
      
      // Try to see what the server is receiving
      console.log('\n  Trying raw HTTP request to debug...');
      const params = {
        where: JSON.stringify([{ field: 'name', operator: 'eq', value: 'Test1' }])
      };
      console.log('  Query params:', params);
    }
    
    // 5. Test different operators
    console.log('\n5. Testing different operators...');
    const operators = [
      { op: 'eq', value: 'Test2', desc: 'equals' },
      { op: 'ne', value: 'Test1', desc: 'not equals' },
      { op: 'gt', value: 15, desc: 'greater than', field: 'value' },
      { op: 'lt', value: 25, desc: 'less than', field: 'value' }
    ];
    
    for (const test of operators) {
      try {
        const field = test.field || 'name';
        const result = await client.table(tableName)
          .where(field, test.op, test.value)
          .execute();
        console.log(`  ✓ ${test.desc} (${test.op}): found ${result.data.length} records`);
      } catch (error) {
        console.log(`  ✗ ${test.desc} (${test.op}): ${error.message}`);
      }
    }
    
    // Cleanup
    console.log('\n6. Cleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Cleanup complete');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugQuery();