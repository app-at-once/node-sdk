const axios = require('axios');

async function getTestApiKey() {
  try {
    // Try to login first
    let loginResponse;
    try {
      loginResponse = await axios.post('http://localhost:8080/api/v1/auth/login', {
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'test-password'
      });
      console.log('Login successful');
    } catch (loginError) {
      // If login fails, try to register
      console.log('Login failed, trying to register...');
      const registerResponse = await axios.post('http://localhost:8080/api/v1/auth/register', {
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'test-password',
        name: 'Test User'
      });
      loginResponse = registerResponse;
      console.log('Registration successful');
    }
    
    const accessToken = loginResponse.data.accessToken;
    
    // Get list of organizations
    const orgsResponse = await axios.get('http://localhost:8080/api/v1/organizations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    let orgId, projectId;
    
    if (orgsResponse.data.length > 0) {
      // Use existing organization
      orgId = orgsResponse.data[0].id;
      console.log('Using existing organization:', orgsResponse.data[0].name);
      
      // Get projects
      const projectsResponse = await axios.get(`http://localhost:8080/api/v1/organizations/${orgId}/projects`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (projectsResponse.data.length > 0) {
        // Use existing project
        projectId = projectsResponse.data[0].id;
        console.log('Using existing project:', projectsResponse.data[0].name);
      } else {
        // Create a new project
        const projectResponse = await axios.post(`http://localhost:8080/api/v1/organizations/${orgId}/projects`, {
          name: 'Test Project',
          description: 'Test project for SDK testing'
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        projectId = projectResponse.data.id;
        console.log('Created new project:', projectResponse.data.name);
      }
    } else {
      // Create new organization
      const orgResponse = await axios.post('http://localhost:8080/api/v1/organizations', {
        name: 'Test Organization'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      orgId = orgResponse.data.id;
      console.log('Created new organization:', orgResponse.data.name);
      
      // Create a project
      const projectResponse = await axios.post(`http://localhost:8080/api/v1/organizations/${orgId}/projects`, {
        name: 'Test Project',
        description: 'Test project for SDK testing'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      projectId = projectResponse.data.id;
      console.log('Created new project:', projectResponse.data.name);
    }
    
    // Get project API keys
    const apiKeyResponse = await axios.get(`http://localhost:8080/api/v1/organizations/${orgId}/projects/${projectId}/api-keys`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('API Key response:', apiKeyResponse.data);
    
    // Return the first API key
    const apiKey = apiKeyResponse.data[0];
    console.log('\n✅ Test API Key:', apiKey.key);
    console.log('Project ID:', projectId);
    
    // Write to .env file
    const fs = require('fs');
    const envContent = `APPATONCE_TEST_API_KEY=${apiKey.key}\nAPPATONCE_TEST_BASE_URL=http://localhost:8080\n`;
    fs.writeFileSync('.env.test', envContent);
    console.log('\n✅ Written to .env.test file');
    
    return {
      apiKey: apiKey.key,
      projectId: projectId,
      accessToken: accessToken
    };
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

getTestApiKey().catch(console.error);