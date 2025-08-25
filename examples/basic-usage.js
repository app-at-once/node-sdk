#!/usr/bin/env node

const { AppAtOnceClient } = require('@appatonce/node-sdk');

async function testBasicFunctionality() {
  try {
    console.log('🚀 Testing basic SDK functionality...');
    
    const client = new AppAtOnceClient(process.env.APPATONCE_API_KEY);
    
    // Test health check
    console.log('\n📊 Testing server connection...');
    const health = await client.ping();
    console.log('✅ Health check passed:', health.status);
    console.log('   Server time:', health.timestamp);
    
    // Test auth functionality  
    console.log('\n🔐 Testing auth endpoints...');
    try {
      const authResult = await client.auth.signUp({
        email: 'test' + Date.now() + '@example.com',
        password: 'testpass123'
      });
      console.log('✅ Auth signup works');
    } catch (authError) {
      console.log('⚠️ Auth signup result:', authError.message);
    }
    
    // Test common table names that might exist
    const commonTables = ['users', 'profiles', 'data', 'items', 'records', 'projects', 'workspaces'];
    
    console.log('\n🔍 Testing database access...');
    let foundTable = null;
    
    for (const tableName of commonTables) {
      try {
        console.log(`   Testing table: ${tableName}`);
        const result = await client.table(tableName).select('*').limit(1).execute();
        console.log(`✅ Table ${tableName} exists with ${result.data.length} records`);
        if (result.data.length > 0) {
          console.log('   Sample columns:', Object.keys(result.data[0]).slice(0, 5).join(', '));
        }
        foundTable = tableName;
        break; // Found a working table
      } catch (error) {
        console.log(`   ❌ Table ${tableName}: ${error.message}`);
      }
    }
    
    // If we found a working table, test more operations
    if (foundTable) {
      console.log(`\n🧪 Testing operations on ${foundTable}...`);
      
      try {
        // Test count
        const count = await client.table(foundTable).count();
        console.log(`✅ Count query: ${count} total records`);
        
        // Test select with limit
        const limited = await client.table(foundTable).select('*').limit(3).execute();
        console.log(`✅ Limited query: ${limited.data.length} records returned`);
        
      } catch (opError) {
        console.log('⚠️ Operation test failed:', opError.message);
      }
    }
    
    // Test email functionality (basic)
    console.log('\n📧 Testing email functionality...');
    try {
      const emailTest = await client.email.sendEmail({
        to: [{ email: 'test@example.com', name: 'Test User' }],
        subject: 'SDK Test Email',
        html: '<p>Test email from AppAtOnce SDK</p>',
        text: 'Test email from AppAtOnce SDK'
      });
      console.log('✅ Email send works:', emailTest.status);
    } catch (emailError) {
      console.log('⚠️ Email test result:', emailError.message);
    }
    
    console.log('\n🎉 Basic SDK test completed!');
    
  } catch (error) {
    console.error('\n❌ Main error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Check API key
if (!process.env.APPATONCE_API_KEY) {
  console.error('❌ APPATONCE_API_KEY environment variable is required');
  process.exit(1);
}

testBasicFunctionality().catch(console.error);