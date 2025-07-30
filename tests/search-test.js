#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

// Test configurations
const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSearch() {
  console.log('=== Search SDK Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `search_test_${Date.now()}`;
  
  try {
    // 1. Create table with searchable columns
    console.log(`1. Creating table: ${tableName}`);
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
    console.log('✓ Table created with searchable columns');
    
    // 2. Insert test data
    console.log('\n2. Inserting test data...');
    const testData = [
      { title: 'Introduction to AppAtOnce', content: 'AppAtOnce is a powerful platform for building applications', tags: ['intro', 'platform'] },
      { title: 'Advanced Features', content: 'Learn about advanced features like real-time updates and search', tags: ['advanced', 'features'] },
      { title: 'Getting Started Guide', content: 'This guide will help you get started with AppAtOnce SDK', tags: ['guide', 'sdk'] },
      { title: 'API Documentation', content: 'Complete API reference for developers building with AppAtOnce', tags: ['api', 'docs'] }
    ];
    
    for (const data of testData) {
      await client.table(tableName).insert(data);
    }
    console.log(`✓ Inserted ${testData.length} records`);
    
    // 3. Basic search
    console.log('\n3. Testing basic search...');
    try {
      const searchResults = await client.table(tableName).search('AppAtOnce', {
        fields: ['title', 'content'],
        limit: 10
      });
      console.log(`✓ Found ${searchResults.count || searchResults.data.length} results`);
      if (searchResults.data && searchResults.data.length > 0) {
        console.log('  First result:', searchResults.data[0].title);
      }
    } catch (error) {
      console.log('❌ Search failed:', error.message);
    }
    
    // 4. Search with specific field
    console.log('\n4. Testing field-specific search...');
    try {
      const titleSearch = await client.table(tableName).search('Guide', {
        fields: ['title'],
        limit: 5
      });
      console.log(`✓ Found ${titleSearch.count || titleSearch.data.length} results in title field`);
    } catch (error) {
      console.log('❌ Field search failed:', error.message);
    }
    
    // 5. Cleanup
    console.log('\n5. Cleaning up...');
    await client.schema.dropTable(tableName);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Details:', error);
    
    // Cleanup on error
    try {
      await client.schema.dropTable(tableName);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

// Run test
testSearch().catch(console.error);