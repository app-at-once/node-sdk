const { AppAtOnceClient } = require('./dist/index.js');

async function testDataOperations() {
  console.log('Testing data operations on async-created table...');
  
  const client = new AppAtOnceClient({
    baseUrl: 'http://localhost:8091',
    apiKey: 'process.env.APPATONCE_TEST_API_KEY || 'test-api-key''
  });

  try {
    // 1. Test data insertion
    console.log('\n1. Testing data insertion...');
    const insertResponse = await client.table('async_test_table').insert({
      id: 1,
      name: 'Test Record 1'
    });
    console.log('✅ Data insertion response:', JSON.stringify(insertResponse, null, 2));

    // 2. Insert more data
    console.log('\n2. Inserting more test data...');
    await client.table('async_test_table').insert({
      id: 2,
      name: 'Test Record 2'
    });
    
    await client.table('async_test_table').insert({
      id: 3,
      name: 'Another Test Record'
    });

    // 3. Test data retrieval
    console.log('\n3. Testing data retrieval...');
    const allData = await client.table('async_test_table').execute();
    console.log('✅ All data:', JSON.stringify(allData, null, 2));

    // 4. Test filtered query
    console.log('\n4. Testing filtered query...');
    const filteredData = await client.table('async_test_table')
      .eq('name', 'Test Record 1')
      .execute();
    console.log('✅ Filtered data:', JSON.stringify(filteredData, null, 2));

    // 5. Test count
    console.log('\n5. Testing count...');
    const count = await client.table('async_test_table').count();
    console.log('✅ Total count:', count);

    // 6. Test update
    console.log('\n6. Testing update...');
    const updateResponse = await client.table('async_test_table')
      .eq('id', 1)
      .update({ name: 'Updated Test Record 1' });
    console.log('✅ Update response:', JSON.stringify(updateResponse, null, 2));

    // 7. Verify update
    console.log('\n7. Verifying update...');
    const updatedData = await client.table('async_test_table')
      .eq('id', 1)
      .execute();
    console.log('✅ Updated data:', JSON.stringify(updatedData, null, 2));

    console.log('\n🎉 All data operations completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📄 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testDataOperations();