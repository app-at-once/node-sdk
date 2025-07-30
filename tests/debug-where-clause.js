#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function debugWhereClause() {
  console.log('=== Debug Where Clause ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = 'debug_where_test';
  
  try {
    // Create table
    console.log('1. Creating table...');
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar', required: true },
        { name: 'status', type: 'varchar' },
        { name: 'score', type: 'integer' }
      ]
    });
    console.log('✓ Table created');
    
    // Insert test data
    console.log('\n2. Inserting test data...');
    await client.table(tableName).insert({ name: 'Alice', status: 'active', score: 85 });
    await client.table(tableName).insert({ name: 'Bob', status: 'active', score: 92 });
    await client.table(tableName).insert({ name: 'Charlie', status: 'inactive', score: 78 });
    console.log('✓ 3 records inserted');
    
    // Test 1: Get all records
    console.log('\n3. Getting all records...');
    const allResult = await client.table(tableName).execute();
    console.log(`✓ Found ${allResult.data.length} records`);
    allResult.data.forEach(r => console.log(`  - ${r.name}: ${r.status}, score: ${r.score}`));
    
    // Test 2: Filter by status
    console.log('\n4. Filtering by status = active...');
    const activeResult = await client.table(tableName)
      .where('status', 'eq', 'active')
      .execute();
    console.log(`Found ${activeResult.data.length} records (expected 2)`);
    activeResult.data.forEach(r => console.log(`  - ${r.name}: ${r.status}`));
    
    // Test 3: Filter by score
    console.log('\n5. Filtering by score >= 85...');
    const scoreResult = await client.table(tableName)
      .where('score', 'gte', 85)
      .execute();
    console.log(`Found ${scoreResult.data.length} records (expected 2)`);
    scoreResult.data.forEach(r => console.log(`  - ${r.name}: score ${r.score}`));
    
    // Test 4: Multiple filters
    console.log('\n6. Multiple filters (status = active AND score >= 90)...');
    const multiResult = await client.table(tableName)
      .where('status', 'eq', 'active')
      .where('score', 'gte', 90)
      .execute();
    console.log(`Found ${multiResult.data.length} records (expected 1)`);
    multiResult.data.forEach(r => console.log(`  - ${r.name}: ${r.status}, score: ${r.score}`));
    
    // Cleanup
    console.log('\n7. Cleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Details:', error);
  }
}

debugWhereClause();