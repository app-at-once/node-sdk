#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function debugSearchUuidTest() {
  console.log('=== Debug Search UUID Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `debug_uuid_${Date.now()}`;
  
  try {
    // Create table with UUID primary key
    console.log(`Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar', required: true, searchable: true },
        { name: 'content', type: 'text', searchable: true }
      ],
      enableSearch: { elasticsearch: { fields: ['title', 'content'] } }
    });
    console.log('✓ Table created with UUID primary key');
    
    // Try insert without ID (should auto-generate)
    console.log('\nInserting without ID...');
    try {
      const result = await client.table(tableName).insert({
        title: 'Test Title',
        content: 'Test content'
      });
      console.log('✓ Insert without ID successful:', result);
    } catch (insertError) {
      console.error('❌ Insert without ID failed:', insertError.message);
    }
    
    // Try insert with ID
    console.log('\nInserting with ID...');
    try {
      const result = await client.table(tableName).insert({
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        title: 'Test Title 2',
        content: 'Test content 2'
      });
      console.log('✓ Insert with ID successful:', result);
    } catch (insertError) {
      console.error('❌ Insert with ID failed:', insertError.message);
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

debugSearchUuidTest().catch(console.error);