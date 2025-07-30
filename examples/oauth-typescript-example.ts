import { 
  AppAtOnceClient, 
  OAuthProvider, 
  OAuthInitiateResponse,
  OAuthCallbackData,
  ConnectedProvidersResponse,
  OAuthLinkResult,
  AuthSession 
} from '../src';

// TypeScript OAuth usage examples with full type safety

class OAuthService {
  private client: AppAtOnceClient;

  constructor(apiKey: string, baseUrl: string = 'http://localhost:3000') {
    this.client = new AppAtOnceClient({
      apiKey,
      baseUrl,
      debug: true
    });
  }

  /**
   * Initiate OAuth sign-in flow
   */
  async initiateSignIn(provider: OAuthProvider, redirectUrl?: string): Promise<OAuthInitiateResponse> {
    try {
      const response = await this.client.auth.initiateOAuth(provider, {
        redirectUrl: redirectUrl || `${window.location.origin}/auth/callback`
      });

      console.log(`Initiating ${provider} OAuth flow:`, response);
      return response;
    } catch (error: any) {
      console.error(`Failed to initiate ${provider} OAuth:`, error.message);
      throw error;
    }
  }

  /**
   * Complete OAuth sign-in after callback
   */
  async completeSignIn(callbackData: OAuthCallbackData): Promise<AuthSession> {
    try {
      const session = await this.client.auth.completeOAuthSignIn(callbackData);
      
      console.log('OAuth sign-in completed:', {
        userId: session.user.id,
        email: session.user.email,
        provider: callbackData.provider
      });

      return session;
    } catch (error: any) {
      console.error(`OAuth callback failed for ${callbackData.provider}:`, error.message);
      throw error;
    }
  }

  /**
   * Link additional OAuth provider to existing account
   */
  async linkProvider(provider: OAuthProvider, redirectUrl?: string): Promise<OAuthInitiateResponse> {
    try {
      // Check if already connected
      const isConnected = await this.client.auth.isProviderConnected(provider);
      if (isConnected) {
        throw new Error(`${provider} is already connected to this account`);
      }

      const response = await this.client.auth.initiateLinkProvider(provider, {
        redirectUrl: redirectUrl || `${window.location.origin}/settings/account`
      });

      console.log(`Initiating ${provider} provider linking:`, response);
      return response;
    } catch (error: any) {
      console.error(`Failed to link ${provider} provider:`, error.message);
      throw error;
    }
  }

  /**
   * Complete provider linking after callback
   */
  async completeLinking(callbackData: OAuthCallbackData): Promise<OAuthLinkResult> {
    try {
      const result = await this.client.auth.completeProviderLinking(callbackData);
      
      console.log('Provider linking completed:', result);
      return result;
    } catch (error: any) {
      console.error(`Provider linking failed for ${callbackData.provider}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all connected providers with full type safety
   */
  async getConnectedProviders(): Promise<ConnectedProvidersResponse> {
    try {
      const providers = await this.client.auth.getConnectedProviders();
      
      console.log('Connected providers:', providers.providers.map(p => ({
        provider: p.provider,
        email: p.email,
        connectedAt: p.connectedAt
      })));

      return providers;
    } catch (error: any) {
      console.error('Failed to get connected providers:', error.message);
      throw error;
    }
  }

  /**
   * Unlink OAuth provider with confirmation
   */
  async unlinkProvider(provider: OAuthProvider): Promise<OAuthLinkResult> {
    try {
      // Check if provider is connected
      const isConnected = await this.client.auth.isProviderConnected(provider);
      if (!isConnected) {
        throw new Error(`${provider} is not connected to this account`);
      }

      // Get connected providers to check if this is the last auth method
      const connectedProviders = await this.getConnectedProviders();
      const user = this.client.auth.getUser();
      
      // Assuming user has passwordHash if they can sign in with password
      const hasPassword = true; // This would come from user profile in real app
      const otherProviders = connectedProviders.providers.filter(p => p.provider !== provider);

      if (!hasPassword && otherProviders.length === 0) {
        throw new Error('Cannot unlink the last authentication method. Please set a password first.');
      }

      const result = await this.client.auth.unlinkOAuthProvider(provider);
      console.log(`${provider} provider unlinked:`, result);
      
      return result;
    } catch (error: any) {
      console.error(`Failed to unlink ${provider} provider:`, error.message);
      throw error;
    }
  }

  /**
   * Get provider-specific information
   */
  async getProviderInfo(provider: OAuthProvider) {
    try {
      const info = await this.client.auth.getProviderInfo(provider);
      
      if (info) {
        console.log(`${provider} provider info:`, {
          email: info.email,
          name: info.name,
          connectedAt: info.connectedAt
        });
      } else {
        console.log(`${provider} is not connected`);
      }

      return info;
    } catch (error: any) {
      console.error(`Failed to get ${provider} provider info:`, error.message);
      return null;
    }
  }

  /**
   * Bulk operations with type safety
   */
  async bulkUnlinkProviders(providers: OAuthProvider[]): Promise<void> {
    try {
      const results = await this.client.auth.unlinkMultipleProviders(providers);
      
      results.forEach(result => {
        if (result.success) {
          console.log(`✅ ${result.provider} unlinked successfully`);
        } else {
          console.error(`❌ Failed to unlink ${result.provider}: ${result.message}`);
        }
      });
    } catch (error: any) {
      console.error('Bulk unlink operation failed:', error.message);
      throw error;
    }
  }

  /**
   * Set up auth state listeners with proper typing
   */
  setupAuthListeners(): () => void {
    return this.client.auth.onAuthStateChange((event: string, session: AuthSession | null) => {
      console.log('Auth state changed:', event);
      
      switch (event) {
        case 'OAUTH_SIGNIN':
          console.log('User signed in via OAuth:', session?.user);
          break;
        case 'OAUTH_PROVIDER_LINKED':
          console.log('OAuth provider linked to account');
          break;
        case 'OAUTH_PROVIDER_UNLINKED':
          console.log('OAuth provider unlinked from account');
          break;
        case 'OAUTH_PROVIDERS_UNLINKED':
          console.log('Multiple OAuth providers unlinked');
          break;
        case 'TOKEN_REFRESHED':
          console.log('OAuth token refreshed');
          break;
        case 'TOKEN_REFRESH_FAILED':
          console.error('OAuth token refresh failed');
          break;
        default:
          console.log('Other auth event:', event);
      }
    });
  }
}

// Usage examples
async function runTypeScriptExamples() {
  console.log('=== TypeScript OAuth Examples ===\n');

  const oauthService = new OAuthService('your-api-key-here');
  
  // Set up auth listeners
  const unsubscribe = oauthService.setupAuthListeners();

  try {
    // Example 1: Sign in with Google
    console.log('1. Initiating Google OAuth sign-in...');
    const googleSignIn = await oauthService.initiateSignIn(
      OAuthProvider.GOOGLE,
      'http://localhost:3000/auth/callback'
    );
    console.log('Redirect user to:', googleSignIn.url);

    // Example 2: Get available providers
    console.log('\n2. Getting available providers...');
    const availableProviders = await oauthService.client.auth.getAvailableProviders();
    console.log('Available OAuth providers:', availableProviders);

    // Example 3: Generate OAuth URLs for all providers
    console.log('\n3. Generating OAuth URLs for all providers...');
    for (const provider of Object.values(OAuthProvider)) {
      try {
        const url = await oauthService.client.auth.generateOAuthURL(
          provider,
          'http://localhost:3000/auth/callback'
        );
        console.log(`${provider}: ${url}`);
      } catch (error: any) {
        console.log(`${provider}: Error - ${error.message}`);
      }
    }

    // Example 4: Simulate OAuth callback handling
    console.log('\n4. OAuth callback handling (simulated)...');
    const simulatedCallback: OAuthCallbackData = {
      provider: OAuthProvider.GOOGLE,
      code: 'simulated-auth-code',
      state: googleSignIn.state
    };

    // In real app, you would handle the actual callback:
    // const session = await oauthService.completeSignIn(simulatedCallback);

  } catch (error: any) {
    console.error('Example failed:', error.message);
    if (error.provider) {
      console.error('Provider:', error.provider);
    }
  } finally {
    // Clean up listeners
    unsubscribe();
  }
}

// Error handling with TypeScript
async function handleOAuthErrors() {
  const client = new AppAtOnceClient({
    apiKey: 'invalid-key',
    baseUrl: 'http://localhost:3000'
  });

  try {
    await client.auth.initiateOAuth(OAuthProvider.GOOGLE);
  } catch (error: any) {
    // Type-safe error handling
    console.error('OAuth Error Details:');
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Provider:', error.provider);
    console.error('- Details:', error.details);
    
    // Handle specific error types
    if (error.code === 'HTTP_401') {
      console.log('Authentication failed - check API key');
    } else if (error.code === 'NETWORK_ERROR') {
      console.log('Network issue - check connectivity');
    }
  }
}

// Advanced integration patterns
class AdvancedOAuthIntegration {
  private client: AppAtOnceClient;

  constructor(apiKey: string) {
    this.client = new AppAtOnceClient({ apiKey });
  }

  /**
   * Smart provider recommendation based on user's existing connections
   */
  async recommendProviders(): Promise<OAuthProvider[]> {
    try {
      const connected = await this.client.auth.getConnectedProviders();
      const available = connected.availableProviders;
      
      // Recommend based on business logic
      const recommendations: OAuthProvider[] = [];
      
      if (!connected.providers.some(p => p.provider === OAuthProvider.GOOGLE)) {
        recommendations.push(OAuthProvider.GOOGLE);
      }
      
      if (!connected.providers.some(p => p.provider === OAuthProvider.GITHUB)) {
        recommendations.push(OAuthProvider.GITHUB);
      }

      return recommendations.filter(p => available.includes(p));
    } catch (error: any) {
      console.error('Failed to get provider recommendations:', error.message);
      return [];
    }
  }

  /**
   * Secure provider linking with verification
   */
  async secureProviderLink(provider: OAuthProvider): Promise<boolean> {
    try {
      // Check current auth status
      if (!this.client.auth.isAuthenticated()) {
        throw new Error('User must be authenticated to link providers');
      }

      // Initiate linking
      const linkResponse = await this.client.auth.initiateLinkProvider(provider);
      
      // In real app, you would redirect user and handle callback
      console.log('Redirect user to link provider:', linkResponse.url);
      
      return true;
    } catch (error: any) {
      console.error('Secure provider linking failed:', error.message);
      return false;
    }
  }

  /**
   * Provider health check
   */
  async checkProviderHealth(): Promise<Record<OAuthProvider, boolean>> {
    const health: Record<OAuthProvider, boolean> = {} as any;

    for (const provider of Object.values(OAuthProvider)) {
      try {
        // Try to generate OAuth URL as a health check
        await this.client.auth.generateOAuthURL(provider);
        health[provider] = true;
      } catch (error) {
        health[provider] = false;
      }
    }

    return health;
  }
}

// Export for use in other modules
export {
  OAuthService,
  AdvancedOAuthIntegration,
  runTypeScriptExamples,
  handleOAuthErrors
};

// Run examples if this file is executed directly
if (require.main === module) {
  runTypeScriptExamples()
    .then(() => handleOAuthErrors())
    .then(() => console.log('\n✅ TypeScript OAuth examples completed!'))
    .catch(error => console.error('\n❌ Examples failed:', error.message));
}