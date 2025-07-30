const { AppAtOnceClient } = require('../dist');

// Initialize the client
const client = AppAtOnceClient.createWithApiKey(
  'your-api-key-here',
  'http://localhost:3000'
);

async function basicUsageExample() {
  try {
    // Check server status
    const serverInfo = await client.ping();
    console.log('Server status:', serverInfo);

    // Create a table schema
    const tableSchema = await client.schema.createTable({
      name: 'users',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          primaryKey: true,
          defaultValue: 'uuid_generate_v4()',
        },
        {
          name: 'email',
          type: 'varchar',
          length: 255,
          unique: true,
          required: true,
        },
        {
          name: 'name',
          type: 'varchar',
          length: 100,
        },
        {
          name: 'age',
          type: 'integer',
          min: 0,
          max: 150,
        },
        {
          name: 'created_at',
          type: 'timestamp',
          defaultValue: 'now()',
        },
      ],
      indexes: [
        {
          name: 'idx_users_email',
          columns: ['email'],
          unique: true,
        },
      ],
      triggers: [
        {
          name: 'auto_email_validation',
          type: 'auto_email',
          config: { field: 'email' },
        },
      ],
    });
    console.log('Table created:', tableSchema);

    // Insert data
    const newUser = await client.table('users').insert({
      email: 'john.doe@example.com',
      name: 'John Doe',
      age: 30,
    });
    console.log('User created:', newUser);

    // Query data with fluent API
    const users = await client.table('users')
      .select('id', 'email', 'name', 'age')
      .where('age', '>=', 18)
      .orderBy('created_at', 'desc')
      .limit(10)
      .execute();
    console.log('Adult users:', users.data);

    // Update data
    const updatedUsers = await client.table('users')
      .eq('email', 'john.doe@example.com')
      .update({ age: 31 });
    console.log('Updated user:', updatedUsers[0]);

    // Aggregate queries
    const averageAge = await client.table('users').avg('age');
    const userCount = await client.table('users').count();
    console.log(`Average age: ${averageAge}, Total users: ${userCount}`);

    // Search functionality
    const searchResults = await client.table('users')
      .search('John', {
        fields: ['name', 'email'],
        highlight: true,
      });
    console.log('Search results:', searchResults);

    // Batch operations
    const batchResults = await client.batch([
      {
        type: 'insert',
        table: 'users',
        data: { email: 'jane@example.com', name: 'Jane Smith', age: 25 },
      },
      {
        type: 'insert',
        table: 'users',
        data: { email: 'bob@example.com', name: 'Bob Johnson', age: 35 },
      },
      {
        type: 'select',
        table: 'users',
        where: { age: 25 },
      },
    ]);
    console.log('Batch results:', batchResults);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
basicUsageExample();