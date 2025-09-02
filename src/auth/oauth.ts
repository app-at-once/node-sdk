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
 * OAuth module for handling OAuth authentication flows
 */
export class OAuthModule {
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

      const response = await this.httpClient.get(
        `/projects/auth/oauth/${provider}?${queryParams.toString()}`
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
        `/projects/auth/oauth/${provider}/callback`,
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
        `/projects/auth/oauth/${provider}/callback`,
        {
          code,
          state,
        }
      );

      return {
        success: true,
        message: response.data.message || `${provider} account linked successfully`,
        provider,
      };
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
      const response = await this.httpClient.post(
        `/projects/auth/oauth/${provider}/link`,
        {
          provider,
          redirectUrl: options.redirectUrl,
        }
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
        `/projects/auth/oauth/${provider}/unlink`
      );

      return {
        success: true,
        message: response.data.message || `${provider} account unlinked successfully`,
        provider,
      };
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
      const response = await this.httpClient.get('/projects/auth/oauth-connections');
      return response.data as ConnectedProvidersResponse;
    } catch (error) {
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Get OAuth connection statistics for the current user
   * @returns Promise resolving to connection statistics
   */
  async getConnectionStats(): Promise<any> {
    try {
      const response = await this.httpClient.get('/projects/auth/oauth-connections/stats');
      return response.data;
    } catch (error) {
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Get OAuth connection audit trail for the current user
   * @param limit - Maximum number of audit entries to retrieve (default: 50, max: 100)
   * @returns Promise resolving to audit trail
   */
  async getConnectionAuditTrail(limit: number = 50): Promise<any[]> {
    try {
      const response = await this.httpClient.get(`/projects/auth/oauth-connections/audit?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Get detailed information for a specific connected provider
   * @param provider - OAuth provider to get information for
   * @returns Promise resolving to provider connection details
   */
  async getProviderConnectionDetails(provider: OAuthProvider): Promise<any> {
    try {
      const response = await this.httpClient.get(`/projects/auth/oauth-connections/${provider}`);
      return response.data;
    } catch (error) {
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Disconnect an OAuth provider from the current user account
   * @param provider - OAuth provider to disconnect
   * @returns Promise resolving to disconnect result
   */
  async disconnectProvider(provider: OAuthProvider): Promise<OAuthUnlinkResult> {
    try {
      const response = await this.httpClient.delete(`/projects/auth/oauth-connections/${provider}`);
      return {
        success: true,
        message: response.data.message || `${provider} account disconnected successfully`,
        provider,
      };
    } catch (error) {
      throw this.handleOAuthError(error, provider);
    }
  }

  /**
   * Refresh OAuth tokens for a specific provider
   * @param provider - OAuth provider to refresh tokens for
   * @returns Promise resolving to token refresh response
   */
  async refreshProviderToken(provider: OAuthProvider): Promise<OAuthTokenRefreshResponse> {
    try {
      const response = await this.httpClient.post(
        `/projects/auth/oauth-connections/${provider}/refresh-token`
      );

      return {
        success: true,
        expiresAt: response.data.expiresAt,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to refresh OAuth token',
      };
    }
  }

  /**
   * Track OAuth provider usage
   * @param provider - OAuth provider to track usage for
   * @param action - Action being performed (optional)
   * @param metadata - Additional metadata (optional)
   * @returns Promise resolving to tracking result
   */
  async trackProviderUsage(
    provider: OAuthProvider,
    action?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.httpClient.post(
        `/projects/auth/oauth-connections/${provider}/track-usage`,
        {
          action,
          metadata,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleOAuthError(error, provider);
    }
  }

  /**
   * Check if a specific OAuth provider is connected (enhanced version)
   * @param provider - OAuth provider to check
   * @returns Promise resolving to connection status with additional details
   */
  async getProviderConnectionStatus(provider: OAuthProvider): Promise<{
    connected: boolean;
    provider: string;
    lastUsed?: Date;
  }> {
    try {
      const response = await this.httpClient.get(
        `/projects/auth/oauth-connections/${provider}/is-connected`
      );
      return response.data;
    } catch (error) {
      return {
        connected: false,
        provider,
      };
    }
  }

  /**
   * Disconnect multiple OAuth providers at once
   * @param providers - Array of OAuth providers to disconnect
   * @returns Promise resolving to bulk disconnect results
   */
  async bulkDisconnectProviders(
    providers: OAuthProvider[]
  ): Promise<{
    results: Array<{
      provider: string;
      success: boolean;
      message: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    try {
      const response = await this.httpClient.post(
        '/projects/auth/oauth-connections/bulk-disconnect',
        {
          providers,
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleOAuthError(error);
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use refreshProviderToken instead
   */
  async refreshOAuthToken(
    options: OAuthTokenRefreshOptions
  ): Promise<OAuthTokenRefreshResponse> {
    return this.refreshProviderToken(options.provider);
  }

  /**
   * Generate OAuth URL for manual redirect (alternative to initiateOAuth)
   * @param options - OAuth initiation options
   * @returns Promise resolving to OAuth URL
   */
  async generateOAuthURL(options: OAuthInitiateOptions): Promise<string> {
    const result = await this.initiateOAuth(options.provider, {
      redirectUrl: options.redirectUrl,
    });
    return result.url;
  }

  /**
   * Check if a specific OAuth provider is connected
   * @param provider - OAuth provider to check
   * @returns Promise resolving to boolean indicating if provider is connected
   */
  async isProviderConnected(provider: OAuthProvider): Promise<boolean> {
    try {
      const connectedProviders = await this.getConnectedProviders();
      return connectedProviders.providers.some(p => p.provider === provider);
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
      const connectedProviders = await this.getConnectedProviders();
      return connectedProviders.providers.find(p => p.provider === provider) || null;
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
      } catch (error: any) {
        results.push({
          success: false,
          message: error.message || `Failed to unlink ${provider}`,
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
      const connectedProviders = await this.getConnectedProviders();
      return connectedProviders.availableProviders;
    } catch (error) {
      // Return all providers if we can't fetch connected ones
      return Object.values(OAuthProvider);
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
   * @returns Promise resolving to authentication result
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
   * Handle OAuth errors with proper typing and context
   * @param error - Original error
   * @param provider - Optional OAuth provider for context
   * @returns Formatted OAuth error
   */
  private handleOAuthError(error: any, provider?: OAuthProvider): OAuthError {
    const oauthError = new Error() as OAuthError;

    if (error.response) {
      oauthError.message = error.response.data?.message || error.response.data?.error || 'OAuth request failed';
      oauthError.code = error.response.data?.code || `HTTP_${error.response.status}`;
      oauthError.details = error.response.data?.details;
    } else if (error.request) {
      oauthError.message = 'Network error during OAuth request';
      oauthError.code = 'NETWORK_ERROR';
    } else {
      oauthError.message = error.message || 'Unknown OAuth error';
      oauthError.code = 'UNKNOWN_ERROR';
    }

    oauthError.provider = provider;
    return oauthError;
  }
}