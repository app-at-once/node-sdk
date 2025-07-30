#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function debugSearchExactTest() {
  console.log('=== Debug Search Exact Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `search_exact_${Date.now()}`;
  
  try {
    // Create exact same table as failing test
    console.log(`Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar', required: true, searchable: true },
        { name: 'content', type: 'text', searchable: true },
        { name: 'tags', type: 'jsonb' }
      ],
      enableSearch: { elasticsearch: { fields: ['title', 'content'] } }
    });
    console.log('✓ Table created');
    
    // Try exact same insert
    console.log('\nInserting test data...');
    try {
      const result = await client.table(tableName).insert({
        title: 'Introduction to AppAtOnce', 
        content: 'AppAtOnce is a powerful platform for building applications', 
        tags: ['intro', 'platform']
      });
      console.log('✓ Insert successful:', result);
    } catch (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.error('Status:', insertError.statusCode);
      console.error('Code:', insertError.code);
      
      // Try to get more details
      if (insertError.response) {
        console.error('Response data:', insertError.response.data);
      }
    }
    
    // Cleanup
    console.log('\nCleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

debugSearchExactTest().catch(console.error);