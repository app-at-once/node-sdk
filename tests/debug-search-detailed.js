#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function debugDetailedTest() {
  console.log('=== Debug Detailed Search Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `search_detailed_${Date.now()}`;
  
  try {
    // First, test without search enabled
    console.log('1. Testing table without search enabled...');
    const basicTableName = `basic_${Date.now()}`;
    await client.schema.createTable({
      name: basicTableName,
      columns: [
        { name: 'title', type: 'varchar', required: true },
        { name: 'tags', type: 'jsonb' }
      ]
    });
    console.log('✓ Basic table created');
    
    // Insert with JSONB in basic table
    try {
      await client.table(basicTableName).insert({
        title: 'Test',
        tags: ['tag1', 'tag2']
      });
      console.log('✓ Insert with JSONB succeeded in basic table');
    } catch (e) {
      console.error('❌ Insert with JSONB failed in basic table:', e.message);
    }
    
    // Clean up basic table
    await client.schema.dropTable(basicTableName);
    
    // Now test with search enabled
    console.log('\n2. Testing table with search enabled...');
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'title', type: 'varchar', required: true, searchable: true },
        { name: 'tags', type: 'jsonb' }
      ],
      enableSearch: true
    });
    console.log('✓ Table with search created');
    
    // Test simple insert without JSONB
    console.log('\n3. Testing insert without JSONB...');
    try {
      await client.table(tableName).insert({
        title: 'Simple Test'
      });
      console.log('✓ Simple insert succeeded');
    } catch (e) {
      console.error('❌ Simple insert failed:', e.message);
    }
    
    // Test insert with JSONB
    console.log('\n4. Testing insert with JSONB...');
    try {
      await client.table(tableName).insert({
        title: 'Test with tags',
        tags: ['tag1', 'tag2']
      });
      console.log('✓ Insert with JSONB succeeded');
    } catch (e) {
      console.error('❌ Insert with JSONB failed:', e.message);
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

debugDetailedTest().catch(console.error);