#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

// Test configurations
const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSearchMinimal() {
  console.log('=== Minimal Search Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `search_min_${Date.now()}`;
  
  try {
    // 1. Create simple table
    console.log(`1. Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar', required: true },
        { name: 'content', type: 'text' }
      ]
    });
    console.log('✓ Table created');
    
    // 2. Insert one record
    console.log('\n2. Inserting test record...');
    await client.table(tableName).insert({
      title: 'Test Title',
      content: 'This is test content for search'
    });
    console.log('✓ Record inserted');
    
    // 3. Try search endpoint
    console.log('\n3. Testing search endpoint...');
    try {
      const searchResults = await client.table(tableName).search('test');
      console.log('✓ Search endpoint responded');
      console.log('Results:', searchResults);
    } catch (error) {
      console.log('❌ Search failed:', error.message);
      console.log('Status:', error.statusCode);
      console.log('Code:', error.code);
    }
    
    // 4. Cleanup
    console.log('\n4. Cleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
  }
}

// Run test
testSearchMinimal().catch(console.error);