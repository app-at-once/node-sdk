#!/usr/bin/env node

const axios = require('axios');

const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

// Add request interceptor to log
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    method: request.method,
    url: request.url,
    params: request.params,
    data: request.data,
    headers: request.headers
  });
  return request;
});

axios.interceptors.response.use(
  response => response,
  error => {
    console.log('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

async function testWithLogging() {
  const tableName = `log_test_${Date.now()}`;
  const headers = {
    'x-api-key': APP_API_KEY,
    'Content-Type': 'application/json'
  };
  
  try {
    // Create table
    console.log('\n=== Creating table ===');
    await axios.post(`${BASE_URL}/api/v1/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'name', type: 'varchar' }
      ]
    }, { headers });
    
    // Insert
    console.log('\n=== Inserting data ===');
    await axios.post(`${BASE_URL}/api/v1/data/${tableName}`, {
      name: 'Test'
    }, { headers });
    
    // Query with filter
    console.log('\n=== Query with filter ===');
    const whereFilter = [{ field: 'name', operator: 'eq', value: 'Test' }];
    await axios.get(`${BASE_URL}/api/v1/data/${tableName}`, {
      headers,
      params: {
        where: JSON.stringify(whereFilter)
      }
    });
    
    console.log('\n✓ Success!');
    
  } catch (error) {
    console.error('\n✗ Failed');
  }
}

testWithLogging();