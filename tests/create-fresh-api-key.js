const axios = require('axios');
const crypto = require('crypto');

async function createFreshApiKey() {
  try {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = process.env.TEST_USER_PASSWORD || 'test-password';
    
    console.log('1. Registering new user...');
    const registerResponse = await axios.post('http://localhost:8080/api/v1/auth/register', {
      email: testEmail,
      password: testPassword,
      name: 'SDK Test User'
    });
    
    const accessToken = registerResponse.data.access_token || registerResponse.data.accessToken;
    console.log('✅ User registered');
    console.log('Access token:', accessToken ? 'Found' : 'Not found');
    console.log('Response data:', registerResponse.data);
    
    console.log('\n2. Creating organization...');
    const orgResponse = await axios.post('http://localhost:8080/api/v1/organizations', {
      name: `SDK Test Org ${Date.now()}`
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const orgId = orgResponse.data.id;
    console.log('✅ Organization created:', orgId);
    
    console.log('\n3. Creating project...');
    const projectResponse = await axios.post(`http://localhost:8080/api/v1/projects`, {
      name: `SDK Test Project ${Date.now()}`,
      organizationId: orgId
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const projectId = projectResponse.data.id;
    console.log('✅ Project created:', projectId);
    
    console.log('\n4. Getting API keys...');
    const apiKeyResponse = await axios.get(`http://localhost:8080/api/v1/projects/${projectId}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const apiKey = apiKeyResponse.data[0];
    console.log('✅ API Key found:', apiKey.key);
    
    // Write to file
    const fs = require('fs');
    const testConfig = {
      apiKey: apiKey.key,
      projectId: projectId,
      organizationId: orgId,
      accessToken: accessToken,
      email: testEmail,
      password: testPassword
    };
    
    fs.writeFileSync('test-config.json', JSON.stringify(testConfig, null, 2));
    console.log('\n✅ Test configuration saved to test-config.json');
    
    // Test the API key
    console.log('\n5. Testing API key...');
    const testResponse = await axios.get('http://localhost:8080/api/v1/schema/tables', {
      headers: {
        'x-api-key': apiKey.key
      }
    });
    
    console.log('✅ API key is working! Tables:', testResponse.data);
    
    return testConfig;
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    throw error;
  }
}

createFreshApiKey().catch(console.error);