#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

// Test configurations
const PROJECT_API_KEY = 'appatonce_MC44NzQzNTk4MjUzNTg2MzY0';
const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testMinimal() {
  console.log('=== Minimal SDK Test ===\n');
  
  // Test with APP API Key (should work without table metadata)
  console.log('Testing with APP API Key...');
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  
  const tableName = `test_app_${Date.now()}`;
  
  try {
    // 1. Create table
    console.log(`\n1. Creating table: ${tableName}`);
    const createResult = await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'value', type: 'integer' }
      ]
    });
    console.log('✓ Table created:', createResult);
    
    // 2. List tables
    console.log('\n2. Listing tables...');
    const tables = await client.schema.listTables();
    console.log(`✓ Found ${tables.tables?.length || tables.length} tables`);
    
    // 3. Insert data
    console.log('\n3. Inserting data...');
    const insertResult = await client.table(tableName).insert({
      name: 'Test Record',
      value: 100
    });
    console.log('✓ Data inserted:', insertResult);
    
    // 4. Query data
    console.log('\n4. Querying data...');
    const queryResult = await client.table(tableName)
      .select('*')
      .execute();
    console.log('✓ Query result:', queryResult.data);
    
    // 5. Clean up
    console.log('\n5. Dropping table...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

testMinimal();