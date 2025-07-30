const AppAtOnce = require('../dist').default;

const BASE_URL = 'http://localhost:8080';
const API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';

async function testMinMax() {
  console.log('=== Testing MIN/MAX Functions ===\n');
  
  const client = new AppAtOnce({
    apiKey: API_KEY,
    baseUrl: BASE_URL
  });
  
  const tableName = `test_minmax_${Date.now()}`;
  
  try {
    // Create test table using axios directly
    const axios = require('axios');
    await axios.post(`${BASE_URL}/api/v1/schema/tables`, {
      name: tableName,
      columns: [
        { name: 'id', type: 'serial', primaryKey: true },
        { name: 'name', type: 'text', notNull: true },
        { name: 'score', type: 'integer', notNull: true },
        { name: 'created_date', type: 'date', notNull: true }
      ]
    }, {
      headers: { 'x-api-key': API_KEY }
    });
    
    // Insert test data
    const testData = [
      { name: 'Test1', score: 10, created_date: '2024-01-01' },
      { name: 'Test2', score: 25, created_date: '2024-01-15' },
      { name: 'Test3', score: 5, created_date: '2024-02-01' },
      { name: 'Test4', score: 30, created_date: '2024-01-20' }
    ];
    
    for (const record of testData) {
      await client.table(tableName).insert(record);
    }
    
    console.log('✓ Table created with 4 test records\n');
    
    // Test MIN
    console.log('1. Testing MIN function:');
    const minScore = await client.table(tableName).min('score');
    console.log('   Min score:', minScore);
    console.log('   Expected: 5');
    console.log('   ✓ Result:', minScore === 5 ? 'PASS' : 'FAIL');
    
    const minDate = await client.table(tableName).min('created_date');
    console.log('   Min date:', minDate);
    console.log('   Expected: 2024-01-01');
    
    // Test MAX
    console.log('\n2. Testing MAX function:');
    const maxScore = await client.table(tableName).max('score');
    console.log('   Max score:', maxScore);
    console.log('   Expected: 30');
    console.log('   ✓ Result:', maxScore === 30 ? 'PASS' : 'FAIL');
    
    const maxDate = await client.table(tableName).max('created_date');
    console.log('   Max date:', maxDate);
    console.log('   Expected: 2024-02-01');
    
    // Test MIN/MAX with filters
    console.log('\n3. Testing MIN/MAX with WHERE filters:');
    const minFilteredScore = await client.table(tableName)
      .where('score', 'gt', 10)
      .min('score');
    console.log('   Min score where score > 10:', minFilteredScore);
    console.log('   Expected: 25');
    console.log('   ✓ Result:', minFilteredScore === 25 ? 'PASS' : 'FAIL');
    
    const maxFilteredScore = await client.table(tableName)
      .where('score', 'lt', 30)
      .max('score');
    console.log('   Max score where score < 30:', maxFilteredScore);
    console.log('   Expected: 25');
    console.log('   ✓ Result:', maxFilteredScore === 25 ? 'PASS' : 'FAIL');
    
    // Clean up
    await axios.delete(`${BASE_URL}/api/v1/schema/tables/${tableName}`, {
      headers: { 'x-api-key': API_KEY }
    });
    console.log(`\n✓ Deleted test table: ${tableName}`);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testMinMax();