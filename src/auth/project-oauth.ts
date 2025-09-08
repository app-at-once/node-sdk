import { HttpClient } from '../core/http-client';
import { AuthSession } from '../types';
import { APPATONCE_BASE_URL } from '../constants';
import {
  OAuthProvider,
  OAuthAction,
  OAuthInitiateResponse,
  OAuthCallbackData,
  ConnectedProvidersResponse,
  OAuthLinkOptions,
  OAuthFlowOptions,
  OAuthInitiateOptions,
  OAuthLinkResult,
  OAuthUnlinkResult,
  OAuthTokenRefreshOptions,
  OAuthTokenRefreshResponse,
  OAuthError,
} from '../types/oauth';

/**
 * Project-specific OAuth module for handling OAuth authentication flows
 * Uses project/app-specific endpoints instead of platform endpoints
 */
export class ProjectOAuthModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Initiate OAuth flow with a provider
   * @param provider - OAuth provider to use
   * @param options - Additional options for the OAuth flow
   * @returns Promise resolving to OAuth initiation response
   */
  async initiateOAuth(
    provider: OAuthProvider,
    options: Omit<OAuthFlowOptions, 'action'> = {}
  ): Promise<OAuthInitiateResponse> {
    try {
      const queryParams = new URLSearchParams({
        action: OAuthAction.SIGNIN,
        ...(options.redirectUrl && { redirectUrl: options.redirectUrl }),
      });

      // Use project-specific OAuth endpoint
      const response = await this.httpClient.get(
        `/data/oauth/${provider}?${queryParams.toString()}`
      );

      // Extract state from the redirect URL if it's returned
      let state = '';
      if (response.data.url && response.data.url.includes('state=')) {
        const url = new URL(response.data.url, APPATONCE_BASE_URL);
        state = url.searchParams.get('state') || '';
      }

      return {
        url: response.data.url || response.data,
        state,
        provider,
        action: OAuthAction.SIGNIN,
      };
    } catch (error) {
      throw this.handleOAuthError(error, provider);
    }
  }

  /**
   * Handle OAuth callback after user returns from provider
   * @param provider - OAuth provider
   * @param code - Authorization code from provider
   * @param state - State parameter for CSRF protection
   * @returns Promise resolving to authentication session
   */
  async handleOAuthCallback(
    provider: OAuthProvider,
    code: string,
    state: string
  ): Promise<AuthSession> {
    try {
      const response = await this.httpClient.post(
        `/data/oauth/${provider}/callback`,
        {
          code,
          state,
        }
      );

      return response.data as AuthSession;
    } catch (error) {
      throw this.handleOAuthError(error, provider);
    }
  }

  /**
   * Link an OAuth provider to the current authenticated user
   * @param provider - OAuth provider to link
   * @param code - Authorization code from provider
   * @param state - State parameter for CSRF protection
   * @returns Promise resolving to link result
   */
  async linkOAuthProvider(
    provider: OAuthProvider,
    code: string,
    state: string
  ): Promise<OAuthLinkResult> {
    try {
      const response = await this.httpClient.post(
        `/data/oauth/${provider}/link`,
        {
          code,
          state,
        }
      );

      return response.data as OAuthLinkResult;
    } catch (error) {
      throw this.handleOAuthError(error, provider);
    }
  }

  /**
   * Initiate OAuth provider linking flow
   * @param provider - OAuth provider to link
   * @param options - Additional options for linking
   * @returns Promise resolving to OAuth initiation response
   */
  async initiateLinkProvider(
    provider: OAuthProvider,
    options: OAuthLinkOptions = {}
  ): Promise<OAuthInitiateResponse> {
    try {
      const queryParams = new URLSearchParams({
        action: OAuthAction.LINK,
        ...(options.redirectUrl && { redirectUrl: options.redirectUrl }),
      });

      const response = await this.httpClient.get(
        `/data/oauth/${provider}?${queryParams.toString()}`
      );

      // Extract state from the redirect URL if it's returned
      let state = '';
      if (response.data.url && response.data.url.includes('state=')) {
        const url = new URL(response.data.url, APPATONCE_BASE_URL);
        state = url.searchParams.get('state') || '';
      }

      return {
        url: response.data.url || response.data,
        state,
        provider,
        action: OAuthAction.LINK,
      };
    } catch (error) {
      throw this.handleOAuthError(error, provider);
    }
  }

  /**
   * Unlink an OAuth provider from the current user
   * @param provider - OAuth provider to unlink
   * @returns Promise resolving to unlink result
   */
  async unlinkOAuthProvider(provider: OAuthProvider): Promise<OAuthUnlinkResult> {
    try {
      const response = await this.httpClient.delete(
        `/data/oauth/${provider}`
      );

      return response.data as OAuthUnlinkResult;
    } catch (error) {
      throw this.handleOAuthError(error, provider);
    }
  }

  /**
   * Get all connected OAuth providers for the current user
   * @returns Promise resolving to connected providers information
   */
  async getConnectedProviders(): Promise<ConnectedProvidersResponse> {
    try {
      const response = await this.httpClient.get('/data/oauth/providers');
      return response.data as ConnectedProvidersResponse;
    } catch (error) {
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Sign in with OAuth provider (convenience method)
   * @param provider - OAuth provider to use for sign in
   * @param redirectUrl - Optional redirect URL after authentication
   * @returns Promise resolving to OAuth initiation response
   */
  async signInWithProvider(
    provider: OAuthProvider,
    redirectUrl?: string
  ): Promise<OAuthInitiateResponse> {
    return this.initiateOAuth(provider, { redirectUrl });
  }

  /**
   * Complete OAuth sign in flow after callback
   * @param callbackData - OAuth callback data
   * @returns Promise resolving to authentication session
   */
  async completeOAuthSignIn(callbackData: OAuthCallbackData): Promise<AuthSession> {
    return this.handleOAuthCallback(
      callbackData.provider,
      callbackData.code,
      callbackData.state
    );
  }

  /**
   * Complete OAuth provider linking flow after callback
   * @param callbackData - OAuth callback data
   * @returns Promise resolving to link result
   */
  async completeProviderLinking(callbackData: OAuthCallbackData): Promise<OAuthLinkResult> {
    return this.linkOAuthProvider(
      callbackData.provider,
      callbackData.code,
      callbackData.state
    );
  }

  /**
   * Refresh OAuth tokens for a specific provider
   * @param options - Token refresh options
   * @returns Promise resolving to token refresh response
   */
  async refreshOAuthToken(
    options: OAuthTokenRefreshOptions
  ): Promise<OAuthTokenRefreshResponse> {
    try {
      const response = await this.httpClient.post(
        `/data/oauth/${options.provider}/refresh`,
        options
      );

      return response.data as OAuthTokenRefreshResponse;
    } catch (error) {
      throw this.handleOAuthError(error, options.provider);
    }
  }

  /**
   * Generate OAuth URL for manual redirect (alternative to initiateOAuth)
   * @param options - OAuth initiation options
   * @returns Promise resolving to OAuth URL
   */
  async generateOAuthURL(options: OAuthInitiateOptions): Promise<string> {
    const response = await this.initiateOAuth(options.provider, {
      redirectUrl: options.redirectUrl,
    });
    return response.url;
  }

  /**
   * Check if a specific OAuth provider is connected
   * @param provider - OAuth provider to check
   * @returns Promise resolving to boolean indicating if provider is connected
   */
  async isProviderConnected(provider: OAuthProvider): Promise<boolean> {
    try {
      const providers = await this.getConnectedProviders();
      return providers.providers.some(p => p.provider === provider);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get information about a specific connected provider
   * @param provider - OAuth provider to get information for
   * @returns Promise resolving to provider information or null if not connected
   */
  async getProviderInfo(provider: OAuthProvider) {
    try {
      const providers = await this.getConnectedProviders();
      return providers.providers.find(p => p.provider === provider) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Bulk unlink multiple OAuth providers
   * @param providers - Array of OAuth providers to unlink
   * @returns Promise resolving to array of unlink results
   */
  async unlinkMultipleProviders(
    providers: OAuthProvider[]
  ): Promise<OAuthUnlinkResult[]> {
    const results: OAuthUnlinkResult[] = [];
    
    for (const provider of providers) {
      try {
        const result = await this.unlinkOAuthProvider(provider);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: `Failed to unlink ${provider}`,
          provider,
        });
      }
    }
    
    return results;
  }

  /**
   * Get available OAuth providers that can be connected
   * @returns Promise resolving to array of available providers
   */
  async getAvailableProviders(): Promise<OAuthProvider[]> {
    try {
      const response = await this.httpClient.get('/data/oauth/available');
      return response.data as OAuthProvider[];
    } catch (error) {
      // Return default providers if endpoint not available
      return [
        OAuthProvider.GOOGLE,
        OAuthProvider.GITHUB,
        OAuthProvider.MICROSOFT,
        OAuthProvider.FACEBOOK,
        OAuthProvider.TWITTER,
      ];
    }
  }

  /**
   * Handle OAuth errors
   * @param error - The error to handle
   * @param provider - Optional provider context
   * @returns Formatted OAuth error
   */
  private handleOAuthError(error: any, provider?: OAuthProvider): OAuthError {
    const baseError: OAuthError = {
      name: 'OAuthError',
      code: error.response?.data?.error || 'OAUTH_ERROR',
      message: error.response?.data?.message || error.message || 'OAuth operation failed',
      provider,
    };

    // Add specific error handling for common OAuth errors
    if (error.response?.status === 401) {
      baseError.code = 'OAUTH_UNAUTHORIZED';
      baseError.message = 'OAuth authentication failed';
    } else if (error.response?.status === 400) {
      baseError.code = 'OAUTH_INVALID_REQUEST';
      baseError.message = 'Invalid OAuth request';
    } else if (error.response?.status === 403) {
      baseError.code = 'OAUTH_FORBIDDEN';
      baseError.message = 'OAuth access denied';
    }

    return baseError;
  }
}