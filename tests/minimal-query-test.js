#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function minimalTest() {
  console.log('=== Minimal Query Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `minimal_${Date.now()}`;
  
  try {
    // Create table
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'title', type: 'varchar' }
      ]
    });
    console.log('Table created');
    
    // Insert
    await client.table(tableName).insert({ title: 'Hello' });
    console.log('Data inserted');
    
    // Simple query - this works
    const all = await client.table(tableName).execute();
    console.log('All records:', all.data.length);
    
    // Query with where - this fails
    console.log('\nTrying where clause...');
    const filtered = await client.table(tableName)
      .where('title', 'eq', 'Hello')
      .execute();
    console.log('Filtered records:', filtered.data.length);
    
    // Cleanup
    await client.schema.dropTable(tableName);
    console.log('\nCleanup complete');
    
  } catch (error) {
    console.error('\nError:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.statusCode);
  }
}

minimalTest();