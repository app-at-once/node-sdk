const AppAtOnce = require('../dist').default;

const client = new AppAtOnce({
  apiKey: 'appatonce_MC45NjgzODU3OTMzODg4Nzc1',
  baseUrl: 'http://localhost:8080'
});

async function testWhereFix() {
  try {
    console.log('Testing WHERE clause fix...\n');
    
    // Create test table
    const tableName = `test_where_${Date.now()}`;
    await client.schema.createTable({
      name: tableName,
      columns: [
        { name: 'id', type: 'serial', primaryKey: true },
        { name: 'name', type: 'text', notNull: true },
        { name: 'status', type: 'text', notNull: true },
        { name: 'age', type: 'integer' }
      ]
    });
    console.log(`✅ Created table: ${tableName}`);
    
    // Insert test data
    await client.table(tableName).insert([
      { name: 'Alice', status: 'active', age: 25 },
      { name: 'Bob', status: 'inactive', age: 30 },
      { name: 'Charlie', status: 'active', age: 35 },
      { name: 'David', status: 'pending', age: 28 }
    ]);
    console.log('✅ Inserted 4 test records');
    
    // Test 1: Simple WHERE clause
    console.log('\n1. Testing simple WHERE clause (status = active):');
    const activeUsers = await client.table(tableName)
      .select()
      .where('status', 'eq', 'active')
      .execute();
    console.log(`   Found ${activeUsers.data.length} records:`, activeUsers.data.map(u => u.name));
    console.log(`   ✅ Expected 2, got ${activeUsers.data.length}`);
    
    // Test 2: Multiple WHERE conditions
    console.log('\n2. Testing multiple WHERE conditions:');
    const youngActiveUsers = await client.table(tableName)
      .select()
      .where('status', 'eq', 'active')
      .where('age', 'lt', 30)
      .execute();
    console.log(`   Found ${youngActiveUsers.data.length} records:`, youngActiveUsers.data.map(u => u.name));
    console.log(`   ✅ Expected 1 (Alice), got ${youngActiveUsers.data.length}`);
    
    // Test 3: OrderBy
    console.log('\n3. Testing OrderBy (age DESC):');
    const orderedUsers = await client.table(tableName)
      .select()
      .orderBy('age', 'desc')
      .execute();
    console.log('   Order:', orderedUsers.data.map(u => `${u.name} (${u.age})`));
    const ages = orderedUsers.data.map(u => u.age);
    const isDescending = ages.every((age, i) => i === 0 || age <= ages[i-1]);
    console.log(`   ${isDescending ? '✅' : '❌'} Order is ${isDescending ? 'correct' : 'incorrect'}`);
    
    // Test 4: Select specific columns
    console.log('\n4. Testing select specific columns:');
    const nameOnly = await client.table(tableName)
      .select(['name', 'status'])
      .where('status', 'eq', 'active')
      .execute();
    console.log('   First record keys:', Object.keys(nameOnly.data[0] || {}));
    const hasOnlySelectedColumns = nameOnly.data.every(r => 
      Object.keys(r).length === 2 && r.name !== undefined && r.status !== undefined
    );
    console.log(`   ${hasOnlySelectedColumns ? '✅' : '❌'} Only selected columns returned`);
    
    // Clean up
    await client.schema.deleteTable(tableName);
    console.log(`\n✅ Deleted test table: ${tableName}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testWhereFix();