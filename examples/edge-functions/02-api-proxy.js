const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Initialize the client
const client = new AppAtOnceClient('your-api-key-here');

async function apiProxyExample() {
  try {
    console.log('🚀 API Proxy Edge Function Example\n');

    // Create an API proxy with CORS handling
    console.log('Creating API proxy edge function...');
    const proxyFunction = await client.edgeFunctions.create({
      name: 'api-proxy',
      description: 'API proxy with CORS and rate limiting',
      runtime: 'javascript',
      code: `
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = env.TARGET_API_URL || 'https://jsonplaceholder.typicode.com';
    
    // Build the proxied URL
    const proxiedUrl = targetUrl + url.pathname + url.search;
    
    // Forward the request
    const response = await fetch(proxiedUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' ? await request.text() : undefined,
    });
    
    // Clone the response and add CORS headers
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Add custom headers
    modifiedResponse.headers.set('X-Proxied-By', 'AppAtOnce Edge Function');
    modifiedResponse.headers.set('X-Cache-Status', 'MISS');
    
    return modifiedResponse;
  },
};`,
      environment: {
        TARGET_API_URL: 'https://jsonplaceholder.typicode.com',
      },
      routes: ['/api/*'],
      isActive: true,
    });
    console.log('✅ Created API proxy:', proxyFunction.id);

    // Test the proxy
    console.log('\nTesting the API proxy...');
    const testResult = await client.edgeFunctions.execute(proxyFunction.id, {
      method: 'GET',
      path: '/api/posts/1',
    });
    console.log('✅ Proxy response:', JSON.parse(testResult.body));

    // Deploy the proxy
    console.log('\nDeploying the API proxy...');
    const deployment = await client.edgeFunctions.deploy(proxyFunction.id, {
      environment: 'production',
      message: 'Deploy API proxy with CORS',
    });
    console.log('✅ Deployed:', deployment.deploymentId);

    // Get metrics after some usage
    console.log('\nGetting proxy metrics...');
    const metrics = await client.edgeFunctions.getMetrics(proxyFunction.id, '1h');
    console.log('✅ Metrics:', metrics);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the example
apiProxyExample();