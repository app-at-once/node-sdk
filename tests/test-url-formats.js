#!/usr/bin/env node

const axios = require('axios');
const qs = require('qs');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testUrlFormats() {
  console.log('=== Test URL Formats ===\n');
  
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  const tableName = 'simple_test';
  const whereFilter = [{ field: 'name', operator: 'eq', value: 'Test1' }];
  
  // Test different serialization formats
  const tests = [
    {
      name: 'qs.stringify with indices',
      url: `${BASE_URL}/api/v1/data/${tableName}?${qs.stringify({ where: whereFilter }, { indices: true })}`
    },
    {
      name: 'qs.stringify with brackets',
      url: `${BASE_URL}/api/v1/data/${tableName}?${qs.stringify({ where: whereFilter }, { arrayFormat: 'brackets' })}`
    },
    {
      name: 'qs.stringify with repeat',
      url: `${BASE_URL}/api/v1/data/${tableName}?${qs.stringify({ where: whereFilter }, { arrayFormat: 'repeat' })}`
    },
    {
      name: 'Manual construction',
      url: `${BASE_URL}/api/v1/data/${tableName}?where[0][field]=name&where[0][operator]=eq&where[0][value]=Test1`
    },
    {
      name: 'JSON stringified',
      url: `${BASE_URL}/api/v1/data/${tableName}?where=${encodeURIComponent(JSON.stringify(whereFilter))}`
    }
  ];
  
  for (const test of tests) {
    console.log(`\nTest: ${test.name}`);
    console.log(`URL: ${test.url}`);
    try {
      const response = await axios.get(test.url, { headers });
      console.log(`✓ Success: ${response.data.length} records`);
      response.data.forEach(r => console.log(`  - ${r.name}`));
    } catch (error) {
      console.log(`✗ Failed: ${error.response?.status} - ${error.message}`);
    }
  }
}

testUrlFormats();