const { AppAtOnceClient } = require('./dist/index.js');

async function testListTables() {
  console.log('Testing table listing...');
  
  const client = new AppAtOnceClient({
    baseUrl: 'http://localhost:8091',
    apiKey: 'process.env.APPATONCE_TEST_API_KEY || 'test-api-key''
  });

  try {
    // List all tables
    console.log('\n1. Listing all tables...');
    const tables = await client.schema.listTables();
    console.log('✅ Tables found:', JSON.stringify(tables, null, 2));
    
    // Check specific table details
    if (tables.tables && tables.tables.length > 0) {
      const tableToCheck = tables.tables.find(t => t.name === 'async_test_table' || t.name === 'async_test_table_ts');
      if (tableToCheck) {
        console.log('\n2. Getting table details for:', tableToCheck.name);
        const tableDetails = await client.schema.getTable(tableToCheck.name);
        console.log('✅ Table details:', JSON.stringify(tableDetails, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📄 Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testListTables();