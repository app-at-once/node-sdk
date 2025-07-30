#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testNullableJsonb() {
  console.log('=== Nullable JSONB Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `nullable_jsonb_${Date.now()}`;
  
  try {
    // Create table with nullable JSONB
    console.log('Creating table with nullable JSONB...');
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'title', type: 'varchar', required: true, searchable: true },
        { name: 'content', type: 'text', searchable: true },
        { name: 'tags', type: 'jsonb', nullable: true }
      ],
      enableSearch: { elasticsearch: { fields: ['title', 'content'] } }
    });
    console.log('✓ Table created');
    
    // Test insert with array
    console.log('\nInserting with array...');
    try {
      const result = await client.table(tableName).insert({
        title: 'Test with array',
        content: 'Test content',
        tags: ['tag1', 'tag2']
      });
      console.log('✓ Insert successful:', result);
    } catch (e) {
      console.error('❌ Insert failed:', e.message);
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testNullableJsonb().catch(console.error);