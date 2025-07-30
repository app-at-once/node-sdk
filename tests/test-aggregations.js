const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/v1';
const API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';

async function testAggregations() {
  console.log('=== Testing Aggregation Functions ===\n');
  
  const tableName = `test_agg_${Date.now()}`;
  
  try {
    // Create test table
    await axios.post(`${BASE_URL}/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'serial', primaryKey: true },
        { name: 'product', type: 'text', notNull: true },
        { name: 'category', type: 'text', notNull: true },
        { name: 'price', type: 'decimal', notNull: true },
        { name: 'quantity', type: 'integer', notNull: true },
        { name: 'rating', type: 'decimal', nullable: true }
      ]
    }, {
      headers: { 'x-api-key': API_KEY }
    });
    
    // Insert test data
    const testData = [
      { product: 'Laptop', category: 'Electronics', price: 999.99, quantity: 10, rating: 4.5 },
      { product: 'Mouse', category: 'Electronics', price: 29.99, quantity: 50, rating: 4.2 },
      { product: 'Keyboard', category: 'Electronics', price: 79.99, quantity: 30, rating: 4.7 },
      { product: 'Desk', category: 'Furniture', price: 299.99, quantity: 5, rating: 4.0 },
      { product: 'Chair', category: 'Furniture', price: 199.99, quantity: 8, rating: 4.3 },
      { product: 'Notebook', category: 'Stationery', price: 4.99, quantity: 100, rating: 3.5 },
      { product: 'Pen', category: 'Stationery', price: 1.99, quantity: 200, rating: null }
    ];
    
    for (const record of testData) {
      await axios.post(`${BASE_URL}/data/${tableName}`, record, {
        headers: { 'x-api-key': API_KEY }
      });
    }
    
    console.log('✓ Table created with 7 test records\n');
    
    // Test 1: Count endpoint
    console.log('1. Testing COUNT endpoint:');
    try {
      // The controller expects /data/:table/count not /data/:table/count
      const countUrl = `${BASE_URL}/data/${tableName}/count`;
      console.log('   Count URL:', countUrl);
      const countResponse = await axios.get(countUrl, {
        headers: { 'x-api-key': API_KEY }
      });
      console.log('   ✓ Count endpoint exists');
      console.log('   Total records:', countResponse.data.count || countResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✗ Count endpoint not implemented (404)');
      } else {
        console.log('   ✗ Count endpoint error:', error.response?.data || error.message);
      }
    }
    
    // Test 2: Count with filter
    console.log('\n2. Testing COUNT with filter:');
    try {
      const countElectronics = await axios.get(`${BASE_URL}/data/${tableName}/count`, {
        params: {
          'where[0][field]': 'category',
          'where[0][operator]': 'eq',
          'where[0][value]': 'Electronics'
        },
        headers: { 'x-api-key': API_KEY }
      });
      console.log('   ✓ Filtered count works');
      console.log('   Electronics count:', countElectronics.data.count || countElectronics.data);
    } catch (error) {
      console.log('   ✗ Filtered count error:', error.response?.status);
    }
    
    // Test 3: Aggregate endpoint
    console.log('\n3. Testing AGGREGATE endpoint:');
    try {
      const aggregateResponse = await axios.post(`${BASE_URL}/data/${tableName}/aggregate`, {
        sum: ['price', 'quantity'],
        avg: ['price', 'rating'],
        min: ['price'],
        max: ['price'],
        count: ['*']
      }, {
        headers: { 'x-api-key': API_KEY }
      });
      console.log('   ✓ Aggregate endpoint exists');
      console.log('   Results:', JSON.stringify(aggregateResponse.data, null, 2));
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✗ Aggregate endpoint not implemented (404)');
      } else {
        console.log('   ✗ Aggregate endpoint error:', error.response?.data || error.message);
      }
    }
    
    // Test 4: Group by aggregation
    console.log('\n4. Testing GROUP BY aggregation:');
    try {
      const groupByResponse = await axios.post(`${BASE_URL}/data/${tableName}/aggregate`, {
        groupBy: ['category'],
        sum: ['price'],
        avg: ['rating'],
        count: ['*']
      }, {
        headers: { 'x-api-key': API_KEY }
      });
      console.log('   ✓ Group by aggregation works');
      console.log('   Results by category:', JSON.stringify(groupByResponse.data, null, 2));
    } catch (error) {
      console.log('   ✗ Group by error:', error.response?.status);
    }
    
    // Test 5: Test SDK aggregation methods if endpoints don't exist
    console.log('\n5. Testing SDK aggregation methods:');
    const AppAtOnce = require('../dist').default;
    const client = new AppAtOnce({
      apiKey: API_KEY,
      baseUrl: BASE_URL.replace('/api/v1', '')
    });
    
    try {
      // Test count
      const sdkCount = await client.table(tableName).count();
      console.log('   SDK count result:', sdkCount);
    } catch (error) {
      console.log('   ✗ SDK count error:', error.message);
    }
    
    try {
      // Test sum
      const sdkSum = await client.table(tableName).sum('price');
      console.log('   SDK sum result:', sdkSum);
    } catch (error) {
      console.log('   ✗ SDK sum error:', error.message);
    }
    
    try {
      // Test avg
      const sdkAvg = await client.table(tableName).avg('rating');
      console.log('   SDK avg result:', sdkAvg);
    } catch (error) {
      console.log('   ✗ SDK avg error:', error.message);
    }
    
    // Clean up
    await axios.delete(`${BASE_URL}/schema/tables/${tableName}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`\n✓ Deleted test table: ${tableName}`);
    
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testAggregations();