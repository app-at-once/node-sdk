#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function debugSearchTest() {
  console.log('=== Debug Search Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `debug_search_${Date.now()}`;
  
  try {
    // Create table with search enabled but no UUID primary key initially
    console.log(`Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'title', type: 'varchar', required: true, searchable: true },
        { name: 'content', type: 'text', searchable: true }
      ],
      enableSearch: { elasticsearch: { fields: ['title', 'content'] } }
    });
    console.log('✓ Table created with searchable columns');
    
    // Try simple insert
    console.log('\nInserting simple test data...');
    try {
      const result = await client.table(tableName).insert({
        title: 'Test Title',
        content: 'Test content'
      });
      console.log('✓ Insert successful:', result);
    } catch (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Full error:', JSON.stringify(insertError, null, 2));
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  }
}

debugSearchTest().catch(console.error);