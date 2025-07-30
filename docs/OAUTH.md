# OAuth Authentication Guide

The AppAtOnce Node SDK provides comprehensive OAuth authentication support for Google, Facebook, Apple, and GitHub providers. This guide covers all OAuth functionality and integration patterns.

## Table of Contents

- [Quick Start](#quick-start)
- [Supported Providers](#supported-providers)
- [OAuth Flow Types](#oauth-flow-types)
- [API Reference](#api-reference)
- [Integration Patterns](#integration-patterns)
- [Error Handling](#error-handling)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)

## Quick Start

```javascript
import { AppAtOnceClient, OAuthProvider } from '@appatonce/node-sdk';

const client = new AppAtOnceClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000'
});

// 1. Initiate OAuth sign-in
const oauthResponse = await client.auth.initiateOAuth(
  OAuthProvider.GOOGLE,
  { redirectUrl: 'http://localhost:3000/auth/callback' }
);

// Redirect user to: oauthResponse.url

// 2. Handle OAuth callback
const session = await client.auth.handleOAuthCallback(
  OAuthProvider.GOOGLE,
  authCode,
  oauthResponse.state
);

console.log('User signed in:', session.user);
```

## Supported Providers

The SDK supports the following OAuth providers:

```typescript
enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook', 
  APPLE = 'apple',
  GITHUB = 'github'
}
```

### Provider Features

| Provider | Sign In | Linking | Token Refresh | Profile Data |
|----------|---------|---------|---------------|--------------|
| Google   | ✅      | ✅      | ✅            | ✅           |
| Facebook | ✅      | ✅      | ✅            | ✅           |
| Apple    | ✅      | ✅      | ❌            | Limited      |
| GitHub   | ✅      | ✅      | ✅            | ✅           |

## OAuth Flow Types

### 1. Sign-In Flow

Use OAuth as the primary authentication method:

```javascript
// Initiate sign-in
const response = await client.auth.signInWithProvider(
  OAuthProvider.GOOGLE,
  'http://localhost:3000/auth/callback'
);

// Complete sign-in after callback
const session = await client.auth.completeOAuthSignIn({
  provider: OAuthProvider.GOOGLE,
  code: 'authorization-code',
  state: 'csrf-state-token'
});
```

### 2. Provider Linking Flow

Link OAuth providers to existing accounts:

```javascript
// Initiate provider linking (requires authentication)
const linkResponse = await client.auth.initiateLinkProvider(
  OAuthProvider.GITHUB,
  { redirectUrl: 'http://localhost:3000/settings/account' }
);

// Complete linking after callback
const result = await client.auth.completeProviderLinking({
  provider: OAuthProvider.GITHUB,
  code: 'authorization-code',
  state: 'csrf-state-token'
});
```

## API Reference

### Core OAuth Methods

#### `initiateOAuth(provider, options)`

Initiate OAuth flow with a provider.

**Parameters:**
- `provider` (OAuthProvider): The OAuth provider to use
- `options` (object, optional):
  - `redirectUrl` (string): Custom redirect URL after OAuth completion

**Returns:** `Promise<OAuthInitiateResponse>`

```javascript
const response = await client.auth.initiateOAuth(OAuthProvider.GOOGLE, {
  redirectUrl: 'http://localhost:3000/auth/callback'
});
// { url: 'https://accounts.google.com/oauth/...', state: 'csrf-token', provider: 'google', action: 'signin' }
```

#### `handleOAuthCallback(provider, code, state)`

Handle OAuth callback and complete authentication.

**Parameters:**
- `provider` (OAuthProvider): The OAuth provider
- `code` (string): Authorization code from OAuth provider
- `state` (string): CSRF state token

**Returns:** `Promise<AuthSession>`

```javascript
const session = await client.auth.handleOAuthCallback(
  OAuthProvider.GOOGLE,
  'auth-code-from-google',
  'csrf-state-token'
);
```

#### `linkOAuthProvider(provider, code, state)`

Link OAuth provider to current authenticated user.

**Parameters:**
- `provider` (OAuthProvider): The OAuth provider to link
- `code` (string): Authorization code from OAuth provider  
- `state` (string): CSRF state token

**Returns:** `Promise<OAuthLinkResult>`

#### `unlinkOAuthProvider(provider)`

Unlink OAuth provider from current user.

**Parameters:**
- `provider` (OAuthProvider): The OAuth provider to unlink

**Returns:** `Promise<OAuthUnlinkResult>`

```javascript
const result = await client.auth.unlinkOAuthProvider(OAuthProvider.FACEBOOK);
// { success: true, message: 'facebook account unlinked successfully', provider: 'facebook' }
```

### Provider Management Methods

#### `getConnectedProviders()`

Get all connected OAuth providers for current user.

**Returns:** `Promise<ConnectedProvidersResponse>`

```javascript
const providers = await client.auth.getConnectedProviders();
// {
//   providers: [
//     { provider: 'google', email: 'user@gmail.com', connectedAt: '2023-...' }
//   ],
//   availableProviders: ['facebook', 'github', 'apple']
// }
```

#### `isProviderConnected(provider)`

Check if specific OAuth provider is connected.

**Returns:** `Promise<boolean>`

```javascript
const isConnected = await client.auth.isProviderConnected(OAuthProvider.GOOGLE);
```

#### `getProviderInfo(provider)`

Get information about specific connected provider.

**Returns:** `Promise<ConnectedOAuthProvider | null>`

```javascript
const info = await client.auth.getProviderInfo(OAuthProvider.GOOGLE);
// { provider: 'google', email: 'user@gmail.com', name: 'John Doe', connectedAt: '...' }
```

### Convenience Methods

#### `signInWithProvider(provider, redirectUrl?)`

Convenience method for OAuth sign-in.

```javascript
const response = await client.auth.signInWithProvider(
  OAuthProvider.GOOGLE,
  'http://localhost:3000/auth/callback'
);
```

#### `generateOAuthURL(provider, redirectUrl?)`

Generate OAuth URL without initiating full flow.

```javascript
const url = await client.auth.generateOAuthURL(
  OAuthProvider.GOOGLE,
  'http://localhost:3000/auth/callback'
);
```

#### `getAvailableProviders()`

Get list of OAuth providers available for connection.

```javascript
const available = await client.auth.getAvailableProviders();
// ['facebook', 'github', 'apple']
```

### Advanced Methods

#### `unlinkMultipleProviders(providers)`

Unlink multiple OAuth providers at once.

```javascript
const results = await client.auth.unlinkMultipleProviders([
  OAuthProvider.FACEBOOK,
  OAuthProvider.GITHUB
]);
```

#### `refreshOAuthToken(options)`

Refresh OAuth tokens for a provider (if supported).

```javascript
const result = await client.auth.refreshOAuthToken({
  provider: OAuthProvider.GOOGLE,
  providerId: 'google-user-id',
  refreshToken: 'refresh-token'
});
```

## Integration Patterns

### 1. Complete OAuth Sign-In Flow

```javascript
class OAuthHandler {
  constructor(client) {
    this.client = client;
  }

  async initiateGoogleSignIn() {
    const response = await this.client.auth.initiateOAuth(
      OAuthProvider.GOOGLE,
      { redirectUrl: `${window.location.origin}/auth/callback` }
    );
    
    // Store state for verification
    localStorage.setItem('oauth_state', response.state);
    
    // Redirect user
    window.location.href = response.url;
  }

  async handleCallback(urlParams) {
    const { code, state } = urlParams;
    const storedState = localStorage.getItem('oauth_state');
    
    if (state !== storedState) {
      throw new Error('Invalid OAuth state - possible CSRF attack');
    }
    
    const session = await this.client.auth.handleOAuthCallback(
      OAuthProvider.GOOGLE,
      code,
      state
    );
    
    // Clean up
    localStorage.removeItem('oauth_state');
    
    return session;
  }
}
```

### 2. Provider Management Dashboard

```javascript
class ProviderManager {
  constructor(client) {
    this.client = client;
  }

  async getProviderStatus() {
    const connected = await this.client.auth.getConnectedProviders();
    const status = {};
    
    for (const provider of Object.values(OAuthProvider)) {
      const isConnected = connected.providers.some(p => p.provider === provider);
      status[provider] = {
        connected: isConnected,
        info: isConnected ? await this.client.auth.getProviderInfo(provider) : null
      };
    }
    
    return status;
  }

  async linkProvider(provider) {
    try {
      const response = await this.client.auth.initiateLinkProvider(provider, {
        redirectUrl: `${window.location.origin}/settings/account`
      });
      
      window.location.href = response.url;
    } catch (error) {
      console.error('Failed to link provider:', error.message);
      throw error;
    }
  }

  async unlinkProvider(provider) {
    // Safety check
    const connected = await this.client.auth.getConnectedProviders();
    const user = this.client.auth.getUser();
    
    // Prevent unlinking last auth method
    if (connected.providers.length === 1 && !user.passwordHash) {
      throw new Error('Cannot unlink last authentication method');
    }
    
    return this.client.auth.unlinkOAuthProvider(provider);
  }
}
```

### 3. Multi-Provider Authentication

```javascript
class MultiProviderAuth {
  constructor(client) {
    this.client = client;
    this.setupAuthListeners();
  }

  setupAuthListeners() {
    this.client.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'OAUTH_SIGNIN':
          this.handleOAuthSignIn(session);
          break;
        case 'OAUTH_PROVIDER_LINKED':
          this.handleProviderLinked();
          break;
        case 'OAUTH_PROVIDER_UNLINKED':
          this.handleProviderUnlinked();
          break;
      }
    });
  }

  async showSignInOptions() {
    const available = await this.client.auth.getAvailableProviders();
    
    return available.map(provider => ({
      provider,
      label: this.getProviderLabel(provider),
      icon: this.getProviderIcon(provider),
      action: () => this.signInWithProvider(provider)
    }));
  }

  async signInWithProvider(provider) {
    try {
      const response = await this.client.auth.signInWithProvider(provider);
      this.redirectToProvider(response.url);
    } catch (error) {
      this.handleAuthError(error, provider);
    }
  }

  getProviderLabel(provider) {
    const labels = {
      [OAuthProvider.GOOGLE]: 'Continue with Google',
      [OAuthProvider.FACEBOOK]: 'Continue with Facebook',
      [OAuthProvider.APPLE]: 'Continue with Apple',
      [OAuthProvider.GITHUB]: 'Continue with GitHub'
    };
    return labels[provider];
  }
}
```

## Error Handling

OAuth errors include provider context and specific error codes:

```javascript
try {
  await client.auth.initiateOAuth(OAuthProvider.GOOGLE);
} catch (error) {
  console.error('OAuth Error:', {
    message: error.message,
    provider: error.provider,
    code: error.code,
    details: error.details
  });

  // Handle specific error types
  switch (error.code) {
    case 'HTTP_401':
      // Invalid API key or expired session
      break;
    case 'HTTP_403':
      // Insufficient permissions
      break;
    case 'NETWORK_ERROR':
      // Connectivity issues
      break;
    case 'OAUTH_STATE_EXPIRED':
      // OAuth state token expired (>10 minutes)
      break;
    case 'OAUTH_PROVIDER_ERROR':
      // Provider-specific error
      break;
  }
}
```

### Common Error Scenarios

1. **Invalid OAuth State**: State token mismatch or expired
2. **Provider Account Already Linked**: Attempting to link already connected account
3. **Last Auth Method**: Trying to unlink the only authentication method
4. **Network Issues**: Connectivity problems during OAuth flow
5. **Provider Errors**: Issues from the OAuth provider side

## TypeScript Support

The SDK provides full TypeScript support with comprehensive type definitions:

```typescript
import { 
  AppAtOnceClient,
  OAuthProvider,
  OAuthInitiateResponse,
  OAuthCallbackData,
  ConnectedProvidersResponse,
  OAuthLinkResult,
  OAuthError
} from '@appatonce/node-sdk';

// Type-safe OAuth operations
const response: OAuthInitiateResponse = await client.auth.initiateOAuth(
  OAuthProvider.GOOGLE
);

const callbackData: OAuthCallbackData = {
  provider: OAuthProvider.GOOGLE,
  code: 'auth-code',
  state: 'csrf-token'
};

const session: AuthSession = await client.auth.completeOAuthSignIn(callbackData);
```

### Type Definitions

Key TypeScript interfaces:

```typescript
interface OAuthInitiateResponse {
  url: string;
  state: string;
  provider: OAuthProvider;
  action: OAuthAction;
}

interface ConnectedOAuthProvider {
  provider: OAuthProvider;
  email?: string;
  name?: string;
  avatarUrl?: string;
  connectedAt: string;
}

interface OAuthError extends Error {
  provider?: OAuthProvider;
  code?: string;
  details?: any;
}
```

## Examples

See the `/examples` directory for complete implementations:

- `oauth-example.js` - JavaScript usage examples
- `oauth-typescript-example.ts` - TypeScript examples with full type safety

### React Integration Example

```javascript
import { useEffect, useState } from 'react';
import { AppAtOnceClient, OAuthProvider } from '@appatonce/node-sdk';

function useOAuth(client) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = client.auth.onAuthStateChange((event, session) => {
      if (event === 'OAUTH_SIGNIN' && session) {
        setUser(session.user);
      }
    });

    return unsubscribe;
  }, [client]);

  const signInWithProvider = async (provider) => {
    try {
      setLoading(true);
      const response = await client.auth.signInWithProvider(provider);
      window.location.href = response.url;
    } catch (error) {
      console.error('OAuth sign-in failed:', error);
      setLoading(false);
    }
  };

  return { user, loading, signInWithProvider };
}

function LoginComponent() {
  const client = new AppAtOnceClient({ apiKey: 'your-api-key' });
  const { user, loading, signInWithProvider } = useOAuth(client);

  if (user) {
    return <div>Welcome, {user.name}!</div>;
  }

  return (
    <div>
      <button 
        onClick={() => signInWithProvider(OAuthProvider.GOOGLE)}
        disabled={loading}
      >
        Sign in with Google
      </button>
      <button 
        onClick={() => signInWithProvider(OAuthProvider.GITHUB)}
        disabled={loading}
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
```

### Next.js API Route Example

```javascript
// pages/api/auth/[...oauth].js
import { AppAtOnceClient, OAuthProvider } from '@appatonce/node-sdk';

const client = new AppAtOnceClient({
  apiKey: process.env.APPATONCE_API_KEY
});

export default async function handler(req, res) {
  const { oauth } = req.query;
  const [action, provider] = oauth;

  try {
    switch (action) {
      case 'signin':
        const response = await client.auth.initiateOAuth(
          provider as OAuthProvider,
          { redirectUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/${provider}` }
        );
        res.redirect(response.url);
        break;

      case 'callback':
        const { code, state } = req.query;
        const session = await client.auth.handleOAuthCallback(
          provider as OAuthProvider,
          code as string,
          state as string
        );
        
        // Set session cookie and redirect
        res.setHeader('Set-Cookie', `session=${session.access_token}; HttpOnly; Path=/`);
        res.redirect('/dashboard');
        break;

      default:
        res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

## Security Considerations

1. **CSRF Protection**: Always verify the `state` parameter matches your stored value
2. **HTTPS Only**: Use HTTPS in production for all OAuth redirects
3. **Token Storage**: Store access tokens securely (HttpOnly cookies recommended)
4. **State Management**: Use cryptographically secure random state tokens
5. **Redirect Validation**: Validate redirect URLs to prevent open redirects

## Best Practices

1. **Error Handling**: Always handle OAuth errors gracefully
2. **Loading States**: Show loading indicators during OAuth flows
3. **Fallback Options**: Provide alternative authentication methods
4. **User Education**: Explain why OAuth providers are being requested
5. **Progressive Enhancement**: Allow users to add providers after initial sign-up
6. **Token Refresh**: Implement automatic token refresh for long-lived sessions

For more examples and advanced usage patterns, see the complete examples in the `/examples` directory.