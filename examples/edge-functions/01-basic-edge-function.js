const { AppAtOnceClient } = require('@appatonce/node-sdk');

// Initialize the client
const client = new AppAtOnceClient('your-api-key-here');

async function basicEdgeFunctionExample() {
  try {
    console.log('🚀 Basic Edge Function Example\n');

    // 1. Create a simple edge function
    console.log('1. Creating a simple edge function...');
    const helloFunction = await client.edgeFunctions.create({
      name: 'hello-world',
      description: 'A simple hello world edge function',
      runtime: 'javascript',
      code: `
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || 'World';
    
    return new Response(\`Hello, \${name}!\`, {
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};`,
      routes: ['/hello/*'],
      isActive: true,
    });
    console.log('✅ Created edge function:', helloFunction.id);

    // 2. Test the function locally
    console.log('\n2. Testing the function locally...');
    const testResult = await client.edgeFunctions.execute(helloFunction.id, {
      method: 'GET',
      path: '/hello',
      query: { name: 'Developer' },
    });
    console.log('✅ Test result:', testResult);

    // 3. Deploy to Cloudflare Workers
    console.log('\n3. Deploying to Cloudflare Workers...');
    const deployment = await client.edgeFunctions.deploy(helloFunction.id, {
      environment: 'production',
      message: 'Initial deployment',
    });
    console.log('✅ Deployed successfully:', deployment);

    // 4. Get the deployed URL
    const functionDetails = await client.edgeFunctions.get(helloFunction.id);
    console.log('✅ Function URL:', functionDetails.cloudflareUrl);

    // 5. List all edge functions
    console.log('\n4. Listing all edge functions...');
    const functions = await client.edgeFunctions.list({
      isActive: true,
    });
    console.log(`✅ Found ${functions.length} active edge functions`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the example
basicEdgeFunctionExample();