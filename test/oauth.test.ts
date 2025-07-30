import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import { AppAtOnceClient } from '../src/index';
import type { OAuthProvider } from '../src/types/oauth';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('OAuth SDK Tests', () => {
  let client: AppAtOnceClient;
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'http://localhost:8091';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AppAtOnceClient({
      apiKey: mockApiKey,
      baseUrl: mockBaseUrl,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('OAuth Provider Management', () => {
    describe('getConnectedProviders', () => {
      it('should fetch connected OAuth providers', async () => {
        const mockResponse = {
          data: {
            providers: [
              {
                provider: 'GOOGLE' as OAuthProvider,
                email: 'test@example.com',
                name: 'Test User',
                avatarUrl: 'https://example.com/avatar.jpg',
                connectedAt: new Date().toISOString(),
              },
            ],
            availableProviders: ['FACEBOOK', 'APPLE', 'GITHUB'] as OAuthProvider[],
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await client.auth.oauth.getConnectedProviders();

        expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/oauth/providers', {
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        expect(result).toEqual(mockResponse.data);
        expect(result.providers).toHaveLength(1);
        expect(result.providers[0].provider).toBe('GOOGLE');
        expect(result.availableProviders).toContain('FACEBOOK');
      });

      it('should handle empty providers list', async () => {
        const mockResponse = {
          data: {
            providers: [],
            availableProviders: ['GOOGLE', 'FACEBOOK', 'APPLE', 'GITHUB'] as OAuthProvider[],
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await client.auth.oauth.getConnectedProviders();

        expect(result.providers).toHaveLength(0);
        expect(result.availableProviders).toHaveLength(4);
      });

      it('should handle API errors', async () => {
        const errorResponse = {
          response: {
            status: 401,
            data: {
              statusCode: 401,
              message: 'Unauthorized',
            },
          },
        };

        mockedAxios.get.mockRejectedValueOnce(errorResponse);

        await expect(client.auth.oauth.getConnectedProviders()).rejects.toThrow();
      });
    });

    describe('unlinkProvider', () => {
      it('should unlink OAuth provider successfully', async () => {
        const mockResponse = {
          data: {
            success: true,
            message: 'Google account unlinked successfully',
          },
        };

        mockedAxios.delete.mockResolvedValueOnce(mockResponse);

        const result = await client.auth.oauth.unlinkProvider('GOOGLE');

        expect(mockedAxios.delete).toHaveBeenCalledWith('/api/auth/oauth/google/unlink', {
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        expect(result.success).toBe(true);
        expect(result.message).toContain('unlinked successfully');
      });

      it('should handle provider not found error', async () => {
        const errorResponse = {
          response: {
            status: 404,
            data: {
              statusCode: 404,
              message: 'Google provider not linked to this account',
            },
          },
        };

        mockedAxios.delete.mockRejectedValueOnce(errorResponse);

        await expect(client.auth.oauth.unlinkProvider('GOOGLE')).rejects.toThrow();
      });

      it('should handle last authentication method error', async () => {
        const errorResponse = {
          response: {
            status: 400,
            data: {
              statusCode: 400,
              message: 'Cannot unlink the last authentication method. Please set a password first.',
            },
          },
        };

        mockedAxios.delete.mockRejectedValueOnce(errorResponse);

        await expect(client.auth.oauth.unlinkProvider('GOOGLE')).rejects.toThrow();
      });

      it('should handle all supported providers', async () => {
        const providers: OAuthProvider[] = ['GOOGLE', 'FACEBOOK', 'APPLE', 'GITHUB'];
        const expectedUrls = [
          '/api/auth/oauth/google/unlink',
          '/api/auth/oauth/facebook/unlink',
          '/api/auth/oauth/apple/unlink',
          '/api/auth/oauth/github/unlink',
        ];

        mockedAxios.delete.mockResolvedValue({
          data: { success: true, message: 'Provider unlinked successfully' },
        });

        for (let i = 0; i < providers.length; i++) {
          await client.auth.oauth.unlinkProvider(providers[i]);
          expect(mockedAxios.delete).toHaveBeenCalledWith(expectedUrls[i], expect.any(Object));
        }
      });
    });

    describe('initiateOAuth', () => {
      it('should generate OAuth URL for sign-in', () => {
        const url = client.auth.oauth.initiateOAuth('GOOGLE', {
          action: 'signin',
          redirectUrl: '/dashboard',
        });

        expect(url).toBe(
          'http://localhost:8091/api/auth/oauth/google?action=signin&redirectUrl=%2Fdashboard'
        );
      });

      it('should generate OAuth URL for provider linking', () => {
        const url = client.auth.oauth.initiateOAuth('FACEBOOK', {
          action: 'link',
        });

        expect(url).toBe('http://localhost:8091/api/auth/oauth/facebook?action=link');
      });

      it('should handle URL encoding for redirect URLs', () => {
        const url = client.auth.oauth.initiateOAuth('APPLE', {
          action: 'signin',
          redirectUrl: '/dashboard?tab=oauth&provider=apple',
        });

        expect(url).toBe(
          'http://localhost:8091/api/auth/oauth/apple?action=signin&redirectUrl=%2Fdashboard%3Ftab%3Doauth%26provider%3Dapple'
        );
      });

      it('should default to signin action when not specified', () => {
        const url = client.auth.oauth.initiateOAuth('GITHUB');

        expect(url).toBe('http://localhost:8091/api/auth/oauth/github?action=signin');
      });

      it('should handle all supported providers', () => {
        const providers: OAuthProvider[] = ['GOOGLE', 'FACEBOOK', 'APPLE', 'GITHUB'];
        const expectedUrls = [
          'http://localhost:8091/api/auth/oauth/google?action=signin',
          'http://localhost:8091/api/auth/oauth/facebook?action=signin',
          'http://localhost:8091/api/auth/oauth/apple?action=signin',
          'http://localhost:8091/api/auth/oauth/github?action=signin',
        ];

        providers.forEach((provider, index) => {
          const url = client.auth.oauth.initiateOAuth(provider);
          expect(url).toBe(expectedUrls[index]);
        });
      });
    });

    describe('linkProvider', () => {
      it('should generate link URL for provider', () => {
        const url = client.auth.oauth.linkProvider('GOOGLE');

        expect(url).toBe('http://localhost:8091/api/auth/oauth/google/link');
      });

      it('should handle all supported providers', () => {
        const providers: OAuthProvider[] = ['GOOGLE', 'FACEBOOK', 'APPLE', 'GITHUB'];
        const expectedUrls = [
          'http://localhost:8091/api/auth/oauth/google/link',
          'http://localhost:8091/api/auth/oauth/facebook/link',
          'http://localhost:8091/api/auth/oauth/apple/link',
          'http://localhost:8091/api/auth/oauth/github/link',
        ];

        providers.forEach((provider, index) => {
          const url = client.auth.oauth.linkProvider(provider);
          expect(url).toBe(expectedUrls[index]);
        });
      });
    });
  });

  describe('OAuth Authentication Flow', () => {
    describe('handleCallback', () => {
      it('should parse OAuth callback parameters', () => {
        const callbackUrl = 'http://localhost:3000/dashboard?token=jwt-token&state=oauth-state';
        const params = client.auth.oauth.handleCallback(callbackUrl);

        expect(params).toEqual({
          token: 'jwt-token',
          state: 'oauth-state',
        });
      });

      it('should handle error parameters', () => {
        const callbackUrl = 'http://localhost:3000/?error=oauth_failed&error_description=User+denied+access';
        const params = client.auth.oauth.handleCallback(callbackUrl);

        expect(params).toEqual({
          error: 'oauth_failed',
          error_description: 'User denied access',
        });
      });

      it('should handle linking success parameters', () => {
        const callbackUrl = 'http://localhost:3000/settings?linked=true&provider=google';
        const params = client.auth.oauth.handleCallback(callbackUrl);

        expect(params).toEqual({
          linked: 'true',
          provider: 'google',
        });
      });

      it('should handle empty callback URL', () => {
        const params = client.auth.oauth.handleCallback('http://localhost:3000/');
        expect(params).toEqual({});
      });

      it('should handle malformed URLs gracefully', () => {
        const params = client.auth.oauth.handleCallback('invalid-url');
        expect(params).toEqual({});
      });
    });

    describe('isOAuthCallback', () => {
      it('should detect OAuth success callback', () => {
        const url = 'http://localhost:3000/dashboard?token=jwt-token';
        expect(client.auth.oauth.isOAuthCallback(url)).toBe(true);
      });

      it('should detect OAuth error callback', () => {
        const url = 'http://localhost:3000/?error=oauth_failed';
        expect(client.auth.oauth.isOAuthCallback(url)).toBe(true);
      });

      it('should detect OAuth linking callback', () => {
        const url = 'http://localhost:3000/settings?linked=true';
        expect(client.auth.oauth.isOAuthCallback(url)).toBe(true);
      });

      it('should not detect non-OAuth URLs', () => {
        const url = 'http://localhost:3000/dashboard';
        expect(client.auth.oauth.isOAuthCallback(url)).toBe(false);
      });

      it('should handle edge cases', () => {
        expect(client.auth.oauth.isOAuthCallback('')).toBe(false);
        expect(client.auth.oauth.isOAuthCallback('invalid-url')).toBe(false);
        expect(client.auth.oauth.isOAuthCallback('http://localhost:3000/?unrelated=param')).toBe(false);
      });
    });
  });

  describe('OAuth Utilities', () => {
    describe('getProviderDisplayName', () => {
      it('should return correct display names', () => {
        expect(client.auth.oauth.getProviderDisplayName('GOOGLE')).toBe('Google');
        expect(client.auth.oauth.getProviderDisplayName('FACEBOOK')).toBe('Facebook');
        expect(client.auth.oauth.getProviderDisplayName('APPLE')).toBe('Apple');
        expect(client.auth.oauth.getProviderDisplayName('GITHUB')).toBe('GitHub');
      });
    });

    describe('getProviderIcon', () => {
      it('should return provider icons', () => {
        expect(client.auth.oauth.getProviderIcon('GOOGLE')).toBe('🔍');
        expect(client.auth.oauth.getProviderIcon('FACEBOOK')).toBe('📘');
        expect(client.auth.oauth.getProviderIcon('APPLE')).toBe('🍎');
        expect(client.auth.oauth.getProviderIcon('GITHUB')).toBe('🐱');
      });
    });

    describe('getProviderScopes', () => {
      it('should return default scopes for providers', () => {
        expect(client.auth.oauth.getProviderScopes('GOOGLE')).toEqual(['email', 'profile']);
        expect(client.auth.oauth.getProviderScopes('FACEBOOK')).toEqual(['email', 'public_profile']);
        expect(client.auth.oauth.getProviderScopes('APPLE')).toEqual(['email', 'name']);
        expect(client.auth.oauth.getProviderScopes('GITHUB')).toEqual(['user:email', 'read:user']);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(client.auth.oauth.getConnectedProviders()).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({ code: 'ECONNABORTED' });

      await expect(client.auth.oauth.getConnectedProviders()).rejects.toMatchObject({
        code: 'ECONNABORTED',
      });
    });

    it('should handle server errors', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            statusCode: 500,
            message: 'Internal Server Error',
          },
        },
      };

      mockedAxios.delete.mockRejectedValueOnce(errorResponse);

      await expect(client.auth.oauth.unlinkProvider('GOOGLE')).rejects.toThrow();
    });
  });

  describe('SDK Configuration', () => {
    it('should use custom base URL', () => {
      const customClient = new AppAtOnceClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.custom.com',
      });

      const url = customClient.auth.oauth.initiateOAuth('GOOGLE');
      expect(url).toBe('https://api.custom.com/api/auth/oauth/google?action=signin');
    });

    it('should handle base URL without trailing slash', () => {
      const customClient = new AppAtOnceClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.custom.com/',
      });

      const url = customClient.auth.oauth.initiateOAuth('GOOGLE');
      expect(url).toBe('https://api.custom.com/api/auth/oauth/google?action=signin');
    });

    it('should include API key in requests', async () => {
      const customApiKey = 'custom-api-key';
      const customClient = new AppAtOnceClient({
        apiKey: customApiKey,
        baseUrl: mockBaseUrl,
      });

      mockedAxios.get.mockResolvedValueOnce({
        data: { providers: [], availableProviders: [] },
      });

      await customClient.auth.oauth.getConnectedProviders();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/oauth/providers', {
        headers: {
          'Authorization': `Bearer ${customApiKey}`,
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('TypeScript Support', () => {
    it('should provide correct types for OAuth responses', async () => {
      const mockResponse = {
        data: {
          providers: [
            {
              provider: 'GOOGLE' as OAuthProvider,
              email: 'test@example.com',
              name: 'Test User',
              avatarUrl: 'https://example.com/avatar.jpg',
              connectedAt: new Date().toISOString(),
            },
          ],
          availableProviders: ['FACEBOOK'] as OAuthProvider[],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await client.auth.oauth.getConnectedProviders();

      // TypeScript should infer correct types
      expect(typeof result.providers[0].provider).toBe('string');
      expect(typeof result.providers[0].email).toBe('string');
      expect(typeof result.providers[0].connectedAt).toBe('string');
      expect(Array.isArray(result.availableProviders)).toBe(true);
    });

    it('should enforce correct provider types', () => {
      // These should work
      client.auth.oauth.initiateOAuth('GOOGLE');
      client.auth.oauth.initiateOAuth('FACEBOOK');
      client.auth.oauth.initiateOAuth('APPLE');
      client.auth.oauth.initiateOAuth('GITHUB');

      // TypeScript should catch invalid providers at compile time
      // @ts-expect-error - Invalid provider should cause TypeScript error
      // client.auth.oauth.initiateOAuth('INVALID_PROVIDER');
    });
  });
});