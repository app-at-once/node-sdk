#!/usr/bin/env node

/**
 * Simple test script to verify AppAtOnce SDK authentication
 * 
 * Usage:
 *   node examples/test-auth.js
 * 
 * This script tests basic auth functionality:
 * - User signup
 * - User signin
 * - Get current user
 * - List tenant users
 * - Sign out
 */

const { AppAtOnceClient } = require('../dist');

// Initialize client with your API key
const apiKey = process.env.APPATONCE_API_KEY || 'your-api-key-here';

if (apiKey === 'your-api-key-here') {
  console.error('❌ Please set your API key:');
  console.error('   export APPATONCE_API_KEY=your_actual_key');
  console.error('   or edit this file with your API key');
  process.exit(1);
}

const client = AppAtOnceClient.create(apiKey);

// Test user credentials
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

async function runTests() {
  console.log('🚀 AppAtOnce SDK Auth Test\n');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Sign up
    console.log('\n📝 Test 1: User Signup');
    console.log('-'.repeat(30));
    
    try {
      const signupResult = await client.auth.signUp({
        email: testEmail,
        password: testPassword,
        metadata: {
          name: 'Test User',
          source: 'sdk-test'
        }
      });
      
      console.log('✅ Signup successful');
      console.log(`   User ID: ${signupResult.user?.id}`);
      console.log(`   Email: ${signupResult.user?.email}`);
    } catch (error) {
      console.log('⚠️  Signup failed (user may exist):', error.message);
    }
    
    // Test 2: Sign in
    console.log('\n🔐 Test 2: User Signin');
    console.log('-'.repeat(30));
    
    const signinResult = await client.auth.signIn({
      email: testEmail,
      password: testPassword
    });
    
    console.log('✅ Signin successful');
    console.log(`   Access token: ${signinResult.access_token ? '✓' : '✗'}`);
    console.log(`   Refresh token: ${signinResult.refresh_token ? '✓' : '✗'}`);
    
    // Test 3: Get current user
    console.log('\n👤 Test 3: Get Current User');
    console.log('-'.repeat(30));
    
    const currentUser = await client.auth.getCurrentUser();
    
    console.log('✅ Current user retrieved');
    console.log(`   ID: ${currentUser.id}`);
    console.log(`   Email: ${currentUser.email}`);
    console.log(`   Name: ${currentUser.name || 'Not set'}`);
    
    // Test 4: List tenant users
    console.log('\n👥 Test 4: List Tenant Users');
    console.log('-'.repeat(30));
    
    const users = await client.auth.listUsers({ limit: 5 });
    
    console.log(`✅ Found ${users.total} users in tenant`);
    users.users.slice(0, 3).forEach(user => {
      console.log(`   - ${user.email}`);
    });
    
    // Test 5: Sign out
    console.log('\n👋 Test 5: Sign Out');
    console.log('-'.repeat(30));
    
    await client.auth.signOut();
    
    console.log('✅ Signed out successfully');
    
    // Verify signed out
    try {
      await client.auth.getCurrentUser();
      console.log('❌ Still authenticated after signout');
    } catch (error) {
      console.log('✅ Correctly signed out (no auth)');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);