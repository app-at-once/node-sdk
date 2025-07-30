#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testQueryParsing() {
  console.log('=== Testing Query Parsing ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = 'simple_test';
  
  try {
    // First, let's check if a table already exists
    console.log('1. Checking existing tables...');
    const tables = await client.schema.listTables();
    console.log('Existing tables:', tables.map(t => t.name));
    
    // Create or use existing table
    if (!tables.find(t => t.name === tableName)) {
      console.log('\n2. Creating table...');
      await client.schema.createTable({
        name: tableName,
        columns: [
          { name: 'id', type: 'uuid', primaryKey: true },
          { name: 'name', type: 'varchar' }
        ]
      });
      console.log('✓ Table created');
      
      // Insert test data
      console.log('\n3. Inserting test data...');
      await client.table(tableName).insert({ name: 'Test1' });
      await client.table(tableName).insert({ name: 'Test2' });
      console.log('✓ Data inserted');
    }
    
    // Test different query methods
    console.log('\n4. Testing queries...');
    
    // Basic select
    console.log('\n  a) Basic select (no filter):');
    try {
      const all = await client.table(tableName).execute();
      console.log('     ✓ Success:', all.data.length, 'records');
    } catch (error) {
      console.log('     ✗ Failed:', error.message);
    }
    
    // Select with simple where
    console.log('\n  b) Select with where:');
    try {
      const queryBuilder = client.table(tableName).where('name', 'eq', 'Test1');
      console.log('     Query state:', JSON.stringify(queryBuilder.whereFilters));
      const filtered = await queryBuilder.execute();
      console.log('     ✓ Success:', filtered.data.length, 'records');
    } catch (error) {
      console.log('     ✗ Failed:', error.message);
      console.log('     Error code:', error.code);
      console.log('     Status:', error.statusCode);
    }
    
    // Try using first() instead of execute()
    console.log('\n  c) Using first():');
    try {
      const single = await client.table(tableName).where('name', 'eq', 'Test1').first();
      console.log('     ✓ Success:', single ? 'Found record' : 'No record');
    } catch (error) {
      console.log('     ✗ Failed:', error.message);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

testQueryParsing();