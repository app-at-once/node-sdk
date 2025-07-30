#!/usr/bin/env node

const { Pool } = require('pg');

async function testDirectDb() {
  console.log('=== Direct Database Test ===\n');
  
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'appatonce_test',
    user: 'appatonce',
    password: process.env.DB_PASSWORD || 'test-db-password'
  });
  
  const tableName = `direct_test_${Date.now()}`;
  
  try {
    // Create table
    console.log('Creating table...');
    await pool.query(`
      CREATE TABLE "${tableName}" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255),
        tags JSONB
      )
    `);
    console.log('✓ Table created');
    
    // Test different insert methods
    console.log('\n1. Testing direct JSON string...');
    try {
      await pool.query(
        `INSERT INTO "${tableName}" (title, tags) VALUES ($1, $2)`,
        ['Test 1', '["tag1", "tag2"]']
      );
      console.log('✓ Success with JSON string');
    } catch (e) {
      console.error('❌ Failed:', e.message);
    }
    
    console.log('\n2. Testing array directly...');
    try {
      await pool.query(
        `INSERT INTO "${tableName}" (title, tags) VALUES ($1, $2)`,
        ['Test 2', ['tag1', 'tag2']]
      );
      console.log('✓ Success with array');
    } catch (e) {
      console.error('❌ Failed:', e.message);
    }
    
    console.log('\n3. Testing with ::jsonb cast...');
    try {
      await pool.query(
        `INSERT INTO "${tableName}" (title, tags) VALUES ($1, $2::jsonb)`,
        ['Test 3', '["tag1", "tag2"]']
      );
      console.log('✓ Success with ::jsonb cast');
    } catch (e) {
      console.error('❌ Failed:', e.message);
    }
    
    console.log('\n4. Testing object...');
    try {
      await pool.query(
        `INSERT INTO "${tableName}" (title, tags) VALUES ($1, $2)`,
        ['Test 4', JSON.stringify({key: 'value'})]
      );
      console.log('✓ Success with object');
    } catch (e) {
      console.error('❌ Failed:', e.message);
    }
    
    // Clean up
    console.log('\nCleaning up...');
    await pool.query(`DROP TABLE "${tableName}"`);
    console.log('✓ Table dropped');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    pool.end();
  }
}

testDirectDb().catch(console.error);