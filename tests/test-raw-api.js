#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testRawAPI() {
  console.log('=== Testing Raw API ===\n');
  
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  const tableName = 'simple_test';
  
  // Test different ways of sending where clause
  const tests = [
    {
      name: 'JSON string in URL',
      url: `${BASE_URL}/api/v1/data/${tableName}?where=[{"field":"name","operator":"eq","value":"Test1"}]`
    },
    {
      name: 'JSON string encoded',
      url: `${BASE_URL}/api/v1/data/${tableName}?where=${encodeURIComponent('[{"field":"name","operator":"eq","value":"Test1"}]')}`
    },
    {
      name: 'Object in params',
      params: { where: { name: 'Test1' } }
    },
    {
      name: 'Array in params',
      params: { where: [{ field: 'name', operator: 'eq', value: 'Test1' }] }
    },
    {
      name: 'JSON string in params',
      params: { where: '[{"field":"name","operator":"eq","value":"Test1"}]' }
    }
  ];
  
  for (const test of tests) {
    console.log(`\nTest: ${test.name}`);
    try {
      const config = { headers };
      if (test.params) {
        config.params = test.params;
      }
      
      const response = await axios.get(test.url || `${BASE_URL}/api/v1/data/${tableName}`, config);
      console.log(`✓ Success: ${response.data.length} records`);
    } catch (error) {
      console.log(`✗ Failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.error) {
        console.log(`  Details: ${error.response.data.error}`);
      }
    }
  }
}

testRawAPI();