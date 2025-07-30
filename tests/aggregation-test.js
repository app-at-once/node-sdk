#!/usr/bin/env node

const { AppAtOnceClient } = require('../dist');

// Test configurations
const APP_API_KEY = process.env.APPATONCE_TEST_API_KEY || 'test-api-key';
const BASE_URL = 'http://localhost:8080';

async function testAggregation() {
  console.log('=== Aggregation SDK Test ===\n');
  
  const client = AppAtOnceClient.createWithApiKey(APP_API_KEY, BASE_URL);
  const tableName = `agg_test_${Date.now()}`;
  
  try {
    // 1. Create table
    console.log(`1. Creating table: ${tableName}`);
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true },
        { name: 'category', type: 'varchar', required: true },
        { name: 'value', type: 'integer', required: true },
        { name: 'price', type: 'decimal' }
      ]
    });
    console.log('✓ Table created');
    
    // 2. Insert test data
    console.log('\n2. Inserting test data...');
    const testData = [
      { category: 'electronics', value: 10, price: 99.99 },
      { category: 'electronics', value: 20, price: 199.99 },
      { category: 'books', value: 5, price: 19.99 },
      { category: 'books', value: 15, price: 29.99 },
      { category: 'clothing', value: 30, price: 49.99 }
    ];
    
    for (const data of testData) {
      await client.table(tableName).insert(data);
    }
    console.log(`✓ Inserted ${testData.length} records`);
    
    // 3. Test COUNT
    console.log('\n3. Testing COUNT...');
    try {
      const count = await client.table(tableName).count();
      console.log(`✓ Total count: ${count}`);
    } catch (error) {
      console.log('❌ Count failed:', error.message);
    }
    
    // 4. Test SUM
    console.log('\n4. Testing SUM...');
    try {
      const sumResult = await client.table(tableName).sum('value');
      console.log(`✓ Sum of values: ${sumResult}`);
    } catch (error) {
      console.log('❌ Sum failed:', error.message);
    }
    
    // 5. Test AVG
    console.log('\n5. Testing AVG...');
    try {
      const avgResult = await client.table(tableName).avg('price');
      console.log(`✓ Average price: ${avgResult}`);
    } catch (error) {
      console.log('❌ Avg failed:', error.message);
    }
    
    // 6. Test MIN/MAX
    console.log('\n6. Testing MIN/MAX...');
    try {
      const minResult = await client.table(tableName).min('value');
      const maxResult = await client.table(tableName).max('value');
      console.log(`✓ Min value: ${minResult}, Max value: ${maxResult}`);
    } catch (error) {
      console.log('❌ Min/Max failed:', error.message);
    }
    
    // 7. Test GROUP BY (if supported)
    console.log('\n7. Testing GROUP BY...');
    try {
      const groupResult = await client.table(tableName)
        .select('category')
        .sum('value')
        .groupBy('category')
        .execute();
      console.log('✓ Group by results:', groupResult);
    } catch (error) {
      console.log('❌ Group by failed:', error.message);
    }
    
    // 8. Cleanup
    console.log('\n8. Cleaning up...');
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
testAggregation().catch(console.error);