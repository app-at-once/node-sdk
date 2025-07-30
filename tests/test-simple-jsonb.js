#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSimpleJsonb() {
  console.log('=== Simple JSONB Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `simple_jsonb_${Date.now()}`;
  
  try {
    // Create simple table
    console.log('Creating table...');
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar' },
        { name: 'tags', type: 'jsonb' }
      ]
    });
    console.log('✓ Table created');
    
    // Insert without tags first
    console.log('\n1. Inserting without tags...');
    try {
      const result = await client.table(tableName).insert({
        title: 'No tags'
      });
      console.log('✓ Success:', result.id);
    } catch (e) {
      console.error('❌ Failed:', e.message);
    }
    
    // Insert with empty array
    console.log('\n2. Inserting with empty array...');
    try {
      const result = await client.table(tableName).insert({
        title: 'Empty array',
        tags: []
      });
      console.log('✓ Success:', result.id);
    } catch (e) {
      console.error('❌ Failed:', e.message);
    }
    
    // Insert with simple array
    console.log('\n3. Inserting with simple array...');
    try {
      const result = await client.table(tableName).insert({
        title: 'Simple array',
        tags: ['tag1']
      });
      console.log('✓ Success:', result.id);
    } catch (e) {
      console.error('❌ Failed:', e.message);
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testSimpleJsonb().catch(console.error);