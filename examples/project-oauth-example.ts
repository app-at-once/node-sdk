import { AppAtOnceClient, ProjectOAuthProvider, ProjectUserSession } from '@appatonce/node-sdk';

// Initialize client
const client = new AppAtOnceClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.appatonce.com'
});

const PROJECT_ID = 'your-project-id';

// Example 1: Configure OAuth providers for your project
async function configureOAuthProviders() {
  try {
    // Configure Google OAuth
    await client.projectOAuth.configureProjectOAuthProvider(
      PROJECT_ID,
      'google',
      {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri: 'https://yourapp.com/auth/google/callback',
        scope: ['email', 'profile'],
        pkce: true // Enable PKCE for enhanced security
      }
    );

    // Configure GitHub OAuth
    await client.projectOAuth.configureProjectOAuthProvider(
      PROJECT_ID,
      'github',
      {
        provider: 'github',
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        redirectUri: 'https://yourapp.com/auth/github/callback',
        scope: ['user:email', 'read:user']
      }
    );

    // Configure multiple providers at once
    const bulkResults = await client.projectOAuth.configureMultipleProviders(
      PROJECT_ID,
      [
        {
          provider: 'facebook',
          config: {
            provider: 'facebook',
            clientId: process.env.FACEBOOK_APP_ID!,
            clientSecret: process.env.FACEBOOK_APP_SECRET!,
            redirectUri: 'https://yourapp.com/auth/facebook/callback',
            scope: ['email', 'public_profile']
          }
        },
        {
          provider: 'apple',
          config: {
            provider: 'apple',
            clientId: process.env.APPLE_CLIENT_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,
            redirectUri: 'https://yourapp.com/auth/apple/callback',
            scope: ['email', 'name']
          }
        }
      ]
    );

    console.log('Bulk configuration results:', bulkResults);

    // Test all configured providers
    const providers = await client.projectOAuth.getProjectOAuthProviders(PROJECT_ID);
    for (const provider of providers) {
      if (provider.configured) {
        const testResult = await client.projectOAuth.testProjectOAuthProvider(
          PROJECT_ID,
          provider.provider
        );
        console.log(`${provider.provider} test:`, testResult);
      }
    }
  } catch (error) {
    console.error('Configuration error:', error);
  }
}

// Example 2: Implement OAuth login flow
async function initiateOAuthLogin(provider: string): Promise<string> {
  try {
    const { url, state, codeVerifier } = await client.projectOAuth.initiateProjectOAuth(
      PROJECT_ID,
      provider,
      {
        redirectUri: `https://yourapp.com/auth/${provider}/callback`,
        pkce: true,
        prompt: 'select_account', // Force account selection
        state: generateRandomState() // Custom state for extra security
      }
    );

    // Store state and codeVerifier for callback verification
    // In a real app, use secure session storage
    sessionStorage.setItem('oauth_state', state);
    if (codeVerifier) {
      sessionStorage.setItem('oauth_code_verifier', codeVerifier);
    }

    return url;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    throw error;
  }
}

// Example 3: Handle OAuth callback
async function handleOAuthCallback(
  provider: string,
  code: string,
  state: string
): Promise<ProjectUserSession> {
  try {
    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Get code verifier for PKCE
    const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

    // Exchange code for user session
    const session = await client.projectOAuth.handleProjectOAuthCallback(
      PROJECT_ID,
      provider,
      {
        code,
        state
      }
    );

    // Alternative: Use token exchange method for more control
    // const token = await client.projectOAuth.exchangeProjectOAuthToken(
    //   PROJECT_ID,
    //   code,
    //   state,
    //   { codeVerifier }
    // );

    // Clean up stored values
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_code_verifier');

    // Store session securely
    storeUserSession(session);

    return session;
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

// Example 4: Refresh OAuth tokens
async function refreshUserTokens(
  provider: string,
  refreshToken: string
): Promise<void> {
  try {
    const refreshed = await client.projectOAuth.refreshProjectOAuthToken(
      PROJECT_ID,
      provider,
      { refreshToken }
    );

    // Update stored tokens
    updateStoredTokens({
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresIn: refreshed.expiresIn
    });

    console.log('Tokens refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    // Handle refresh failure - maybe redirect to login
  }
}

// Example 5: Get user info from OAuth provider
async function getUserInfoFromProvider(
  provider: string,
  accessToken: string
): Promise<void> {
  try {
    const userInfo = await client.projectOAuth.getProjectOAuthUserInfo(
      PROJECT_ID,
      provider,
      accessToken
    );

    console.log('User info:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      emailVerified: userInfo.emailVerified
    });

    // Update user profile in your database
    await updateUserProfile(userInfo);
  } catch (error) {
    console.error('Error fetching user info:', error);
  }
}

// Example 6: Manage OAuth providers
async function manageOAuthProviders(): Promise<void> {
  try {
    // Get all providers
    const providers = await client.projectOAuth.getProjectOAuthProviders(PROJECT_ID);
    console.log('Available providers:', providers);

    // Check provider status
    const googleStatus = await client.projectOAuth.getProjectOAuthProviderStatus(
      PROJECT_ID,
      'google'
    );
    console.log('Google OAuth status:', googleStatus);

    // Temporarily disable a provider
    await client.projectOAuth.disableProjectOAuthProvider(PROJECT_ID, 'facebook');
    console.log('Facebook OAuth disabled');

    // Re-enable the provider
    await client.projectOAuth.enableProjectOAuthProvider(PROJECT_ID, 'facebook');
    console.log('Facebook OAuth enabled');

    // Get OAuth analytics
    const analytics = await client.projectOAuth.getProjectOAuthAnalytics(PROJECT_ID);
    console.log('OAuth Analytics:', {
      totalUsers: analytics.totalUsers,
      byProvider: analytics.byProvider
    });
  } catch (error) {
    console.error('Provider management error:', error);
  }
}

// Example 7: Custom OAuth provider configuration
async function configureCustomOAuthProvider(): Promise<void> {
  try {
    await client.projectOAuth.configureProjectOAuthProvider(
      PROJECT_ID,
      'custom-sso',
      {
        provider: 'custom-sso',
        clientId: 'custom-client-id',
        clientSecret: 'custom-client-secret',
        authorizationUrl: 'https://sso.company.com/oauth/authorize',
        tokenUrl: 'https://sso.company.com/oauth/token',
        userInfoUrl: 'https://sso.company.com/oauth/userinfo',
        redirectUri: 'https://yourapp.com/auth/custom-sso/callback',
        scope: ['openid', 'profile', 'email'],
        customHeaders: {
          'X-Company-Tenant': 'your-tenant-id'
        }
      }
    );

    console.log('Custom OAuth provider configured');
  } catch (error) {
    console.error('Custom provider configuration error:', error);
  }
}

// Example 8: Express.js middleware for OAuth
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: ProjectUserSession;
}

// Middleware to protect routes
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify token and get user session
  // In a real app, you would validate the token
  const session = getStoredSession(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Check if token is expired
  if (Date.now() > session.expiresAt) {
    return res.status(401).json({ error: 'Token expired' });
  }

  req.user = session;
  next();
}

// Express routes
import express from 'express';

const app = express();

// Initiate OAuth login
app.get('/auth/:provider', async (req, res) => {
  try {
    const url = await initiateOAuthLogin(req.params.provider);
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: 'OAuth initiation failed' });
  }
});

// Handle OAuth callback
app.get('/auth/:provider/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    const session = await handleOAuthCallback(
      req.params.provider,
      code as string,
      state as string
    );

    // Create JWT or session token
    const token = createSessionToken(session);

    // Redirect with token
    res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});

// Protected route example
app.get('/api/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  res.json({
    user: req.user
  });
});

// Utility functions (implement these based on your needs)
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

function storeUserSession(session: ProjectUserSession): void {
  // Store in your preferred storage (database, redis, etc.)
  localStorage.setItem('user_session', JSON.stringify(session));
}

function updateStoredTokens(tokens: any): void {
  // Update stored tokens
  const session = JSON.parse(localStorage.getItem('user_session') || '{}');
  Object.assign(session, tokens);
  localStorage.setItem('user_session', JSON.stringify(session));
}

async function updateUserProfile(userInfo: any): Promise<void> {
  // Update user profile in your database
  console.log('Updating user profile:', userInfo);
}

function getStoredSession(token: string): ProjectUserSession | null {
  // Retrieve session from storage
  const stored = localStorage.getItem('user_session');
  return stored ? JSON.parse(stored) : null;
}

function createSessionToken(session: ProjectUserSession): string {
  // Create JWT or session token
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

// Run examples
async function main() {
  console.log('=== Project OAuth Examples ===');
  
  // Configure providers (run once)
  await configureOAuthProviders();
  
  // Manage providers
  await manageOAuthProviders();
  
  // Configure custom provider
  await configureCustomOAuthProvider();
}

// Export for use in other modules
export {
  configureOAuthProviders,
  initiateOAuthLogin,
  handleOAuthCallback,
  refreshUserTokens,
  getUserInfoFromProvider,
  requireAuth
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}