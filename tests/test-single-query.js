#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testSingleQuery() {
  console.log('=== Test Single Query ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  
  try {
    // Query with where clause using SDK
    console.log('Testing SDK query with where clause...');
    const result = await client.table('simple_test')
      .where('name', 'eq', 'Test1')
      .execute();
    
    console.log('Result:', {
      count: result.data?.length,
      data: result.data
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Details:', error.details);
  }
}

testSingleQuery();