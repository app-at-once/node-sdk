const { AppAtOnceClient } = require('@appatonce/node-sdk');

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
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: 'https://yourapp.com/auth/google/callback',
        scope: ['email', 'profile']
      }
    );
    console.log('Google OAuth configured');

    // Test the configuration
    const testResult = await client.projectOAuth.testProjectOAuthProvider(
      PROJECT_ID,
      'google'
    );
    console.log('Google OAuth test:', testResult);

    // Get all configured providers
    const providers = await client.projectOAuth.getProjectOAuthProviders(PROJECT_ID);
    console.log('Configured providers:', providers);
  } catch (error) {
    console.error('Configuration error:', error);
  }
}

// Example 2: Simple OAuth login implementation
async function startOAuthLogin(provider) {
  try {
    const { url, state } = await client.projectOAuth.initiateProjectOAuth(
      PROJECT_ID,
      provider,
      {
        redirectUri: `https://yourapp.com/auth/${provider}/callback`
      }
    );

    // Store state for security (use session in production)
    global.oauthState = state;

    console.log(`Redirect user to: ${url}`);
    return url;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    throw error;
  }
}

// Example 3: Handle OAuth callback
async function handleOAuthCallback(provider, code, state) {
  try {
    // Verify state
    if (state !== global.oauthState) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for user session
    const session = await client.projectOAuth.handleProjectOAuthCallback(
      PROJECT_ID,
      provider,
      { code, state }
    );

    console.log('User authenticated:', {
      userId: session.userId,
      email: session.email,
      provider: session.provider
    });

    return session;
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

// Example 4: Express.js implementation
const express = require('express');
const session = require('express-session');

const app = express();

// Configure session
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));

// Route to start OAuth login
app.get('/auth/:provider', async (req, res) => {
  try {
    const { url, state } = await client.projectOAuth.initiateProjectOAuth(
      PROJECT_ID,
      req.params.provider,
      {
        redirectUri: `${process.env.APP_URL}/auth/${req.params.provider}/callback`
      }
    );

    // Store state in session
    req.session.oauthState = state;

    res.redirect(url);
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('OAuth initiation failed');
  }
});

// Route to handle OAuth callback
app.get('/auth/:provider/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    // Handle OAuth errors
    if (error) {
      console.error('OAuth provider error:', error);
      return res.redirect('/login?error=oauth_failed');
    }

    // Verify state
    if (state !== req.session.oauthState) {
      return res.status(400).send('Invalid state');
    }

    // Exchange code for session
    const session = await client.projectOAuth.handleProjectOAuthCallback(
      PROJECT_ID,
      req.params.provider,
      { code, state }
    );

    // Store user session
    req.session.user = {
      id: session.userId,
      email: session.email,
      name: session.name,
      provider: session.provider,
      accessToken: session.accessToken
    };

    // Clean up OAuth state
    delete req.session.oauthState;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Callback error:', error);
    res.redirect('/login?error=auth_failed');
  }
});

// Protected route middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

// Example protected route
app.get('/dashboard', requireAuth, (req, res) => {
  res.send(`
    <h1>Welcome ${req.session.user.name || req.session.user.email}!</h1>
    <p>Logged in with: ${req.session.user.provider}</p>
    <a href="/logout">Logout</a>
  `);
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Example 5: React component (as plain JS)
function LoginButton({ projectId, provider }) {
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { url } = await client.projectOAuth.initiateProjectOAuth(
        projectId,
        provider
      );
      window.location.href = url;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return React.createElement('button', {
    onClick: handleLogin,
    disabled: loading
  }, loading ? 'Redirecting...' : `Login with ${provider}`);
}

// Example 6: Refresh tokens
async function refreshTokens() {
  try {
    const storedRefreshToken = getStoredRefreshToken(); // Implement this

    const refreshed = await client.projectOAuth.refreshProjectOAuthToken(
      PROJECT_ID,
      'google',
      { refreshToken: storedRefreshToken }
    );

    console.log('New access token:', refreshed.accessToken);
    
    // Update stored tokens
    updateStoredTokens({
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken || storedRefreshToken
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login
  }
}

// Example 7: Get provider analytics
async function getOAuthAnalytics() {
  try {
    const analytics = await client.projectOAuth.getProjectOAuthAnalytics(PROJECT_ID);
    
    console.log('OAuth Analytics:');
    console.log(`Total users: ${analytics.totalUsers}`);
    
    Object.entries(analytics.byProvider).forEach(([provider, data]) => {
      console.log(`${provider}: ${data.userCount} users`);
    });

    console.log('\nRecent sign-ins:');
    analytics.recentSignIns.forEach(signin => {
      console.log(`- User ${signin.userId} via ${signin.provider} at ${signin.timestamp}`);
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

// Example 8: Multiple providers setup
async function setupMultipleProviders() {
  const providers = [
    {
      name: 'google',
      config: {
        provider: 'google',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: 'https://yourapp.com/auth/google/callback',
        scope: ['email', 'profile']
      }
    },
    {
      name: 'github',
      config: {
        provider: 'github',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: 'https://yourapp.com/auth/github/callback',
        scope: ['user:email', 'read:user']
      }
    },
    {
      name: 'facebook',
      config: {
        provider: 'facebook',
        clientId: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        redirectUri: 'https://yourapp.com/auth/facebook/callback',
        scope: ['email', 'public_profile']
      }
    }
  ];

  for (const provider of providers) {
    try {
      await client.projectOAuth.configureProjectOAuthProvider(
        PROJECT_ID,
        provider.name,
        provider.config
      );
      console.log(`${provider.name} configured successfully`);
    } catch (error) {
      console.error(`Failed to configure ${provider.name}:`, error);
    }
  }
}

// Example 9: Custom provider configuration
async function setupCustomProvider() {
  try {
    await client.projectOAuth.configureProjectOAuthProvider(
      PROJECT_ID,
      'company-sso',
      {
        provider: 'company-sso',
        clientId: 'your-sso-client-id',
        clientSecret: 'your-sso-client-secret',
        authorizationUrl: 'https://sso.yourcompany.com/oauth/authorize',
        tokenUrl: 'https://sso.yourcompany.com/oauth/token',
        userInfoUrl: 'https://sso.yourcompany.com/oauth/userinfo',
        redirectUri: 'https://yourapp.com/auth/company-sso/callback',
        scope: ['openid', 'profile', 'email']
      }
    );

    console.log('Custom SSO provider configured');
  } catch (error) {
    console.error('Custom provider error:', error);
  }
}

// Helper functions
function getStoredRefreshToken() {
  // In production, get from secure storage
  return global.refreshToken || '';
}

function updateStoredTokens(tokens) {
  // In production, store securely
  global.accessToken = tokens.accessToken;
  global.refreshToken = tokens.refreshToken;
}

// Main function to run examples
async function main() {
  console.log('=== Project OAuth Examples ===\n');

  // Configure providers
  console.log('1. Configuring OAuth providers...');
  await configureOAuthProviders();

  // Setup multiple providers
  console.log('\n2. Setting up multiple providers...');
  await setupMultipleProviders();

  // Get analytics
  console.log('\n3. Getting OAuth analytics...');
  await getOAuthAnalytics();

  // Start Express server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n4. Server running on http://localhost:${PORT}`);
    console.log('   - Login at: /auth/google');
    console.log('   - Login at: /auth/github');
    console.log('   - Login at: /auth/facebook');
  });
}

// Export functions for use in other modules
module.exports = {
  configureOAuthProviders,
  startOAuthLogin,
  handleOAuthCallback,
  refreshTokens,
  setupMultipleProviders,
  requireAuth
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}