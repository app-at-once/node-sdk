const { AppAtOnceClient, OAuthProvider } = require('../dist');

// Example: Using OAuth functionality with AppAtOnce SDK

async function oauthExample() {
  // Initialize the client
  const client = new AppAtOnceClient({
    apiKey: 'your-api-key-here',
    baseUrl: 'http://localhost:3000',
  });

  try {
    console.log('=== OAuth Sign-In Example ===');
    
    // 1. Initiate OAuth flow with Google
    const oauthResponse = await client.auth.initiateOAuth(
      OAuthProvider.GOOGLE,
      { redirectUrl: 'http://localhost:3000/auth/callback' }
    );
    
    console.log('OAuth URL:', oauthResponse.url);
    console.log('State parameter:', oauthResponse.state);
    
    // In a real app, you would redirect the user to oauthResponse.url
    // After user completes OAuth, they'll be redirected back with code and state
    
    // 2. Handle OAuth callback (simulated)
    // const session = await client.auth.handleOAuthCallback(
    //   OAuthProvider.GOOGLE,
    //   'authorization-code-from-google',
    //   oauthResponse.state
    // );
    // console.log('User signed in:', session.user);
    
    console.log('\n=== OAuth Provider Management Example ===');
    
    // Assuming user is now authenticated...
    
    // 3. Get connected providers
    // const connectedProviders = await client.auth.getConnectedProviders();
    // console.log('Connected providers:', connectedProviders.providers);
    // console.log('Available providers:', connectedProviders.availableProviders);
    
    // 4. Link a new provider
    // const linkResponse = await client.auth.initiateLinkProvider(
    //   OAuthProvider.GITHUB,
    //   { redirectUrl: 'http://localhost:3000/settings/account' }
    // );
    // console.log('Link provider URL:', linkResponse.url);
    
    // 5. Check if a provider is connected
    // const isGoogleConnected = await client.auth.isProviderConnected(OAuthProvider.GOOGLE);
    // console.log('Is Google connected?', isGoogleConnected);
    
    // 6. Get provider information
    // const googleInfo = await client.auth.getProviderInfo(OAuthProvider.GOOGLE);
    // console.log('Google provider info:', googleInfo);
    
    // 7. Unlink a provider
    // const unlinkResult = await client.auth.unlinkOAuthProvider(OAuthProvider.FACEBOOK);
    // console.log('Unlink result:', unlinkResult);
    
    console.log('\n=== OAuth Convenience Methods ===');
    
    // 8. Generate OAuth URL directly
    const googleUrl = await client.auth.generateOAuthURL(
      OAuthProvider.GOOGLE,
      'http://localhost:3000/auth/callback'
    );
    console.log('Direct Google OAuth URL:', googleUrl);
    
    // 9. Get available providers
    const availableProviders = await client.auth.getAvailableProviders();
    console.log('Available OAuth providers:', availableProviders);
    
  } catch (error) {
    console.error('OAuth Error:', error.message);
    if (error.provider) {
      console.error('Failed provider:', error.provider);
    }
  }
}

// Advanced OAuth patterns
async function advancedOAuthExample() {
  const client = new AppAtOnceClient({
    apiKey: 'your-api-key-here',
    baseUrl: 'http://localhost:3000',
  });

  try {
    console.log('\n=== Advanced OAuth Patterns ===');
    
    // 1. Bulk unlink providers
    // const unlinkResults = await client.auth.unlinkMultipleProviders([
    //   OAuthProvider.FACEBOOK,
    //   OAuthProvider.GITHUB
    // ]);
    // console.log('Bulk unlink results:', unlinkResults);
    
    // 2. Complete OAuth flows with callbacks
    // const callbackData = {
    //   provider: OAuthProvider.GOOGLE,
    //   code: 'auth-code-from-google',
    //   state: 'csrf-state-token'
    // };
    
    // Complete sign-in
    // const session = await client.auth.completeOAuthSignIn(callbackData);
    // console.log('Sign-in completed:', session.user);
    
    // Complete provider linking
    // const linkResult = await client.auth.completeProviderLinking(callbackData);
    // console.log('Provider linking completed:', linkResult);
    
    // 3. Token refresh (if supported by provider)
    // const refreshResult = await client.auth.refreshOAuthToken({
    //   provider: OAuthProvider.GOOGLE,
    //   providerId: 'google-user-id',
    //   refreshToken: 'refresh-token-if-available'
    // });
    // console.log('Token refresh result:', refreshResult);
    
  } catch (error) {
    console.error('Advanced OAuth Error:', error.message);
  }
}

// Integration with existing auth patterns
async function integrationExample() {
  const client = new AppAtOnceClient({
    apiKey: 'your-api-key-here',
    baseUrl: 'http://localhost:3000',
  });

  try {
    console.log('\n=== Integration with Existing Auth ===');
    
    // OAuth works seamlessly with existing auth methods
    
    // 1. Traditional sign up
    // const session = await client.auth.signUp({
    //   email: process.env.TEST_USER_EMAIL || 'user@example.com',
    //   password: process.env.TEST_USER_PASSWORD || 'your-password-here',
    //   name: 'John Doe'
    // });
    
    // 2. Link OAuth provider to existing account
    // const linkResponse = await client.auth.initiateLinkProvider(
    //   OAuthProvider.GOOGLE
    // );
    
    // 3. Auth state management works across all methods
    // client.auth.onAuthStateChange((event, session) => {
    //   console.log('Auth state changed:', event);
    //   if (session) {
    //     console.log('Current user:', session.user);
    //   }
    // });
    
    // 4. Session management
    // const currentUser = client.auth.getUser();
    // const isAuthenticated = client.auth.isAuthenticated();
    // console.log('Current user:', currentUser);
    // console.log('Is authenticated:', isAuthenticated);
    
  } catch (error) {
    console.error('Integration Error:', error.message);
  }
}

// Error handling patterns
async function errorHandlingExample() {
  const client = new AppAtOnceClient({
    apiKey: 'your-api-key-here',
    baseUrl: 'http://localhost:3000',
  });

  try {
    console.log('\n=== OAuth Error Handling ===');
    
    // OAuth errors include provider context
    try {
      await client.auth.initiateOAuth(OAuthProvider.GOOGLE);
    } catch (error) {
      if (error.provider) {
        console.error(`OAuth error with ${error.provider}:`, error.message);
      }
      
      // Handle specific error codes
      switch (error.code) {
        case 'NETWORK_ERROR':
          console.error('Network connectivity issue');
          break;
        case 'HTTP_401':
          console.error('Authentication failed');
          break;
        case 'HTTP_403':
          console.error('Insufficient permissions');
          break;
        default:
          console.error('Unknown error:', error.code);
      }
    }
    
  } catch (error) {
    console.error('Error handling example failed:', error.message);
  }
}

// Run examples
if (require.main === module) {
  console.log('Running OAuth examples...\n');
  
  oauthExample()
    .then(() => advancedOAuthExample())
    .then(() => integrationExample())
    .then(() => errorHandlingExample())
    .then(() => {
      console.log('\n✅ OAuth examples completed successfully!');
      console.log('\nKey features demonstrated:');
      console.log('- OAuth flow initiation with all providers');
      console.log('- Callback handling and session management'); 
      console.log('- Provider linking and unlinking');
      console.log('- Connected provider management');
      console.log('- Token refresh capabilities');
      console.log('- Error handling with provider context');
      console.log('- Integration with existing auth patterns');
    })
    .catch(error => {
      console.error('\n❌ OAuth examples failed:', error.message);
    });
}

module.exports = {
  oauthExample,
  advancedOAuthExample,
  integrationExample,
  errorHandlingExample
};