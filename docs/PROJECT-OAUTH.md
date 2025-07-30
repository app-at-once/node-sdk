# Project OAuth Documentation

This guide explains how to implement OAuth authentication for end-users in your AppAtOnce projects. Project OAuth allows your application's users to authenticate using their social accounts (Google, Facebook, etc.).

## Overview

Project OAuth is different from platform OAuth:
- **Platform OAuth**: Used by developers to authenticate with AppAtOnce platform
- **Project OAuth**: Used by end-users to authenticate with your application

## Quick Start

### 1. Configure OAuth Provider (Project Owner)

First, configure OAuth providers for your project:

```typescript
import { AppAtOnceClient } from '@appatonce/node-sdk';

const client = new AppAtOnceClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.appatonce.com'
});

// Configure Google OAuth for your project
await client.projectOAuth.configureProjectOAuthProvider(
  'your-project-id',
  'google',
  {
    provider: 'google',
    clientId: 'your-google-client-id',
    clientSecret: 'your-google-client-secret',
    redirectUri: 'https://yourapp.com/auth/google/callback',
    scope: ['email', 'profile']
  }
);

// Test the configuration
const testResult = await client.projectOAuth.testProjectOAuthProvider(
  'your-project-id',
  'google'
);
console.log('Test result:', testResult);
```

### 2. Implement OAuth Login (End-User Flow)

In your application, implement the OAuth login flow:

```typescript
// Initiate OAuth flow
const { url, state } = await client.projectOAuth.initiateProjectOAuth(
  'your-project-id',
  'google',
  {
    redirectUri: 'https://yourapp.com/auth/google/callback',
    scope: ['email', 'profile']
  }
);

// Redirect user to OAuth provider
window.location.href = url;

// Handle callback (in your callback route)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// Exchange code for user session
const session = await client.projectOAuth.handleProjectOAuthCallback(
  'your-project-id',
  'google',
  { code, state }
);

console.log('User authenticated:', session);
```

## API Reference

### Project Configuration Methods

#### `configureProjectOAuthProvider(projectId, provider, config)`

Configure an OAuth provider for your project.

```typescript
await client.projectOAuth.configureProjectOAuthProvider(
  'project-123',
  'github',
  {
    provider: 'github',
    clientId: 'github-client-id',
    clientSecret: 'github-client-secret',
    redirectUri: 'https://yourapp.com/auth/github/callback',
    scope: ['user:email', 'read:user']
  }
);
```

#### `getProjectOAuthProviders(projectId)`

Get all configured OAuth providers for a project.

```typescript
const providers = await client.projectOAuth.getProjectOAuthProviders('project-123');
// Returns: Array of configured providers with their status
```

#### `testProjectOAuthProvider(projectId, provider)`

Test OAuth provider configuration.

```typescript
const result = await client.projectOAuth.testProjectOAuthProvider('project-123', 'google');
if (result.success) {
  console.log('Provider configured correctly');
} else {
  console.error('Configuration issues:', result.details.errors);
}
```

### End-User Authentication Methods

#### `initiateProjectOAuth(projectId, provider, options?)`

Start OAuth flow for end-users.

```typescript
const { url, state, codeVerifier } = await client.projectOAuth.initiateProjectOAuth(
  'project-123',
  'google',
  {
    redirectUri: 'https://yourapp.com/auth/callback',
    scope: ['email', 'profile'],
    pkce: true // Enable PKCE for security
  }
);

// Store codeVerifier for PKCE flow
sessionStorage.setItem('codeVerifier', codeVerifier);

// Redirect to OAuth provider
window.location.href = url;
```

#### `handleProjectOAuthCallback(projectId, provider, params)`

Handle OAuth callback and create user session.

```typescript
const session = await client.projectOAuth.handleProjectOAuthCallback(
  'project-123',
  'google',
  {
    code: 'auth-code-from-provider',
    state: 'state-from-provider'
  }
);

// Session contains:
// - userId: Unique user ID in your project
// - accessToken: Token for API calls
// - email, name, avatarUrl: User profile info
```

#### `refreshProjectOAuthToken(projectId, provider, options)`

Refresh expired OAuth tokens.

```typescript
const refreshed = await client.projectOAuth.refreshProjectOAuthToken(
  'project-123',
  'google',
  {
    refreshToken: 'stored-refresh-token'
  }
);

// Update stored tokens
localStorage.setItem('accessToken', refreshed.accessToken);
```

### Provider Management Methods

#### `enableProjectOAuthProvider(projectId, provider)`
#### `disableProjectOAuthProvider(projectId, provider)`
#### `deleteProjectOAuthProvider(projectId, provider)`

Manage OAuth provider status.

```typescript
// Temporarily disable a provider
await client.projectOAuth.disableProjectOAuthProvider('project-123', 'facebook');

// Re-enable it
await client.projectOAuth.enableProjectOAuthProvider('project-123', 'facebook');

// Permanently remove configuration
await client.projectOAuth.deleteProjectOAuthProvider('project-123', 'facebook');
```

## Advanced Features

### PKCE (Proof Key for Code Exchange)

For enhanced security, especially in SPAs and mobile apps:

```typescript
// Initiate with PKCE
const { url, state, codeVerifier } = await client.projectOAuth.initiateProjectOAuth(
  'project-123',
  'google',
  { pkce: true }
);

// Store codeVerifier securely
sessionStorage.setItem('codeVerifier', codeVerifier);

// In callback, exchange with codeVerifier
const session = await client.projectOAuth.exchangeProjectOAuthToken(
  'project-123',
  code,
  state,
  { codeVerifier: sessionStorage.getItem('codeVerifier') }
);
```

### Custom OAuth Providers

Configure custom OAuth providers:

```typescript
await client.projectOAuth.configureProjectOAuthProvider(
  'project-123',
  'custom-provider',
  {
    provider: 'custom-provider',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    authorizationUrl: 'https://provider.com/oauth/authorize',
    tokenUrl: 'https://provider.com/oauth/token',
    userInfoUrl: 'https://provider.com/oauth/userinfo',
    scope: ['read:user']
  }
);
```

### Analytics

Get OAuth usage analytics:

```typescript
const analytics = await client.projectOAuth.getProjectOAuthAnalytics('project-123');
console.log('Total OAuth users:', analytics.totalUsers);
console.log('By provider:', analytics.byProvider);
```

## Framework Examples

### React Example

```tsx
import { useState } from 'react';
import { client } from './appatonce-client';

function LoginButton({ projectId, provider }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { url } = await client.projectOAuth.initiateProjectOAuth(
        projectId,
        provider
      );
      window.location.href = url;
    } catch (error) {
      console.error('OAuth error:', error);
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Redirecting...' : `Login with ${provider}`}
    </button>
  );
}

// Callback component
function OAuthCallback({ projectId }) {
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const provider = params.get('provider');

      if (code && state) {
        try {
          const session = await client.projectOAuth.handleProjectOAuthCallback(
            projectId,
            provider,
            { code, state }
          );
          
          // Store session
          localStorage.setItem('session', JSON.stringify(session));
          
          // Redirect to app
          window.location.href = '/dashboard';
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      }
    };

    handleCallback();
  }, [projectId]);

  return <div>Authenticating...</div>;
}
```

### Express.js Example

```javascript
const express = require('express');
const { AppAtOnceClient } = require('@appatonce/node-sdk');

const app = express();
const client = new AppAtOnceClient({ apiKey: process.env.APPATONCE_API_KEY });

// Initiate OAuth
app.get('/auth/:provider', async (req, res) => {
  try {
    const { url, state } = await client.projectOAuth.initiateProjectOAuth(
      process.env.PROJECT_ID,
      req.params.provider,
      {
        redirectUri: `${process.env.APP_URL}/auth/${req.params.provider}/callback`
      }
    );
    
    // Store state in session for verification
    req.session.oauthState = state;
    
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: 'OAuth initiation failed' });
  }
});

// Handle callback
app.get('/auth/:provider/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Verify state
    if (state !== req.session.oauthState) {
      return res.status(400).json({ error: 'Invalid state' });
    }
    
    const session = await client.projectOAuth.handleProjectOAuthCallback(
      process.env.PROJECT_ID,
      req.params.provider,
      { code, state }
    );
    
    // Store user session
    req.session.user = session;
    
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).json({ error: 'OAuth callback failed' });
  }
});
```

## Security Best Practices

1. **Always use HTTPS** for redirect URIs
2. **Implement PKCE** for public clients (SPAs, mobile apps)
3. **Validate state parameter** to prevent CSRF attacks
4. **Store tokens securely** (use httpOnly cookies for web apps)
5. **Implement token refresh** before expiration
6. **Limit OAuth scopes** to minimum required permissions

## Troubleshooting

### Common Issues

1. **Invalid redirect URI**: Ensure the redirect URI exactly matches the configured value
2. **State mismatch**: Check that you're properly storing and comparing state values
3. **Token expiration**: Implement automatic token refresh
4. **CORS errors**: Configure proper CORS settings for your domain

### Debug Mode

Enable debug logging:

```typescript
const client = new AppAtOnceClient({
  apiKey: 'your-api-key',
  debug: true // Enable debug logs
});
```

## Migration Guide

If you're migrating from another authentication system:

1. Configure OAuth providers in AppAtOnce
2. Implement dual authentication during transition
3. Migrate user accounts progressively
4. Update your application to use AppAtOnce sessions
5. Remove old authentication code

For detailed migration assistance, contact AppAtOnce support.