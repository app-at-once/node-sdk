import { HttpClient } from '../core/http-client';
import {
  ProjectOAuthProvider,
  ProjectUserSession,
  ProjectAuthToken,
  ProjectOAuthInitiateResponse,
  ProjectOAuthCallbackParams,
  ProjectOAuthConfig,
  TestResult,
  ProjectOAuthInitiateOptions,
  ProjectOAuthTokenExchangeOptions,
  ProjectOAuthUserInfo,
  ProjectOAuthSessionWithUser,
  ProjectOAuthTokenRefreshOptions,
  ProjectOAuthTokenRefreshResponse,
  ProjectOAuthProviderStatus,
  ProjectOAuthBulkConfigResult,
  OAuthProviderTemplate,
  ProjectOAuthAnalytics,
  ProjectOAuthError,
} from '../types/project-oauth';

/**
 * Project OAuth module for handling end-user authentication in projects
 * This is for multi-tenant OAuth where each project can have its own OAuth providers
 */
export class ProjectOAuthModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Initiate OAuth flow for end-users of a project
   * @param projectId - The project ID
   * @param provider - OAuth provider to use
   * @param options - Additional options for the OAuth flow
   * @returns Promise resolving to OAuth initiation response with authorization URL
   */
  async initiateProjectOAuth(
    projectId: string,
    provider: string,
    options: ProjectOAuthInitiateOptions = {}
  ): Promise<ProjectOAuthInitiateResponse> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/${provider}/initiate`,
        {
          redirectUri: options.redirectUri,
          scope: options.scope,
          state: options.state,
          prompt: options.prompt,
          loginHint: options.loginHint,
          pkce: options.pkce,
        }
      );

      return {
        url: response.data.url,
        state: response.data.state,
        provider,
        projectId,
        codeVerifier: response.data.codeVerifier,
      };
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Handle OAuth callback for project end-users
   * @param projectId - The project ID
   * @param provider - OAuth provider
   * @param params - Callback parameters (code, state, etc.)
   * @returns Promise resolving to project user session
   */
  async handleProjectOAuthCallback(
    projectId: string,
    provider: string,
    params: ProjectOAuthCallbackParams
  ): Promise<ProjectUserSession> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/${provider}/callback`,
        params
      );

      return response.data as ProjectUserSession;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Exchange authorization code for tokens
   * @param projectId - The project ID
   * @param code - Authorization code
   * @param state - State parameter
   * @param options - Additional options for token exchange
   * @returns Promise resolving to project auth token
   */
  async exchangeProjectOAuthToken(
    projectId: string,
    code: string,
    state: string,
    options: ProjectOAuthTokenExchangeOptions = {}
  ): Promise<ProjectAuthToken> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/token`,
        {
          code,
          state,
          codeVerifier: options.codeVerifier,
          redirectUri: options.redirectUri,
        }
      );

      return response.data as ProjectAuthToken;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId);
    }
  }

  /**
   * Get OAuth providers configured for a project
   * @param projectId - The project ID
   * @returns Promise resolving to array of configured providers
   */
  async getProjectOAuthProviders(projectId: string): Promise<ProjectOAuthProvider[]> {
    try {
      const response = await this.httpClient.get(
        `/projects/${projectId}/oauth/providers`
      );

      return response.data.providers || [];
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId);
    }
  }

  /**
   * Configure OAuth provider for a project (used by project owners)
   * @param projectId - The project ID
   * @param provider - OAuth provider name
   * @param config - OAuth provider configuration
   * @returns Promise resolving when configuration is complete
   */
  async configureProjectOAuthProvider(
    projectId: string,
    provider: string,
    config: ProjectOAuthConfig
  ): Promise<void> {
    try {
      await this.httpClient.put(
        `/projects/${projectId}/oauth/providers/${provider}`,
        config
      );
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Test OAuth provider configuration
   * @param projectId - The project ID
   * @param provider - OAuth provider to test
   * @returns Promise resolving to test result
   */
  async testProjectOAuthProvider(
    projectId: string,
    provider: string
  ): Promise<TestResult> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/providers/${provider}/test`
      );

      return response.data as TestResult;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Get OAuth callback URL for a provider
   * @param projectId - The project ID
   * @param provider - OAuth provider
   * @returns Promise resolving to callback URL
   */
  async getProjectOAuthCallbackUrl(
    projectId: string,
    provider: string
  ): Promise<string> {
    try {
      const response = await this.httpClient.get(
        `/projects/${projectId}/oauth/providers/${provider}/callback-url`
      );

      return response.data.url;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Get user info from OAuth provider
   * @param projectId - The project ID
   * @param provider - OAuth provider
   * @param accessToken - User's access token
   * @returns Promise resolving to user info
   */
  async getProjectOAuthUserInfo(
    projectId: string,
    provider: string,
    accessToken: string
  ): Promise<ProjectOAuthUserInfo> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/${provider}/userinfo`,
        { accessToken }
      );

      return response.data as ProjectOAuthUserInfo;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Refresh OAuth tokens for a project user
   * @param projectId - The project ID
   * @param provider - OAuth provider
   * @param options - Token refresh options
   * @returns Promise resolving to refreshed tokens
   */
  async refreshProjectOAuthToken(
    projectId: string,
    provider: string,
    options: ProjectOAuthTokenRefreshOptions
  ): Promise<ProjectOAuthTokenRefreshResponse> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/${provider}/refresh`,
        options
      );

      return response.data as ProjectOAuthTokenRefreshResponse;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Enable OAuth provider for a project
   * @param projectId - The project ID
   * @param provider - OAuth provider to enable
   * @returns Promise resolving when provider is enabled
   */
  async enableProjectOAuthProvider(
    projectId: string,
    provider: string
  ): Promise<void> {
    try {
      await this.httpClient.post(
        `/projects/${projectId}/oauth/providers/${provider}/enable`
      );
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Disable OAuth provider for a project
   * @param projectId - The project ID
   * @param provider - OAuth provider to disable
   * @returns Promise resolving when provider is disabled
   */
  async disableProjectOAuthProvider(
    projectId: string,
    provider: string
  ): Promise<void> {
    try {
      await this.httpClient.post(
        `/projects/${projectId}/oauth/providers/${provider}/disable`
      );
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Delete OAuth provider configuration
   * @param projectId - The project ID
   * @param provider - OAuth provider to delete
   * @returns Promise resolving when provider is deleted
   */
  async deleteProjectOAuthProvider(
    projectId: string,
    provider: string
  ): Promise<void> {
    try {
      await this.httpClient.delete(
        `/projects/${projectId}/oauth/providers/${provider}`
      );
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Get OAuth provider status
   * @param projectId - The project ID
   * @param provider - OAuth provider
   * @returns Promise resolving to provider status
   */
  async getProjectOAuthProviderStatus(
    projectId: string,
    provider: string
  ): Promise<ProjectOAuthProviderStatus> {
    try {
      const response = await this.httpClient.get(
        `/projects/${projectId}/oauth/providers/${provider}/status`
      );

      return response.data as ProjectOAuthProviderStatus;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Configure multiple OAuth providers at once
   * @param projectId - The project ID
   * @param configs - Array of provider configurations
   * @returns Promise resolving to bulk configuration results
   */
  async configureMultipleProviders(
    projectId: string,
    configs: Array<{ provider: string; config: ProjectOAuthConfig }>
  ): Promise<ProjectOAuthBulkConfigResult[]> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/providers/bulk`,
        { providers: configs }
      );

      return response.data.results || [];
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId);
    }
  }

  /**
   * Get available OAuth provider templates
   * @returns Promise resolving to array of provider templates
   */
  async getOAuthProviderTemplates(): Promise<OAuthProviderTemplate[]> {
    try {
      const response = await this.httpClient.get('/oauth/templates');
      return response.data.templates || [];
    } catch (error) {
      throw this.handleProjectOAuthError(error);
    }
  }

  /**
   * Get OAuth analytics for a project
   * @param projectId - The project ID
   * @returns Promise resolving to OAuth analytics
   */
  async getProjectOAuthAnalytics(projectId: string): Promise<ProjectOAuthAnalytics> {
    try {
      const response = await this.httpClient.get(
        `/projects/${projectId}/oauth/analytics`
      );

      return response.data as ProjectOAuthAnalytics;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId);
    }
  }

  /**
   * Create OAuth session from provider response
   * Convenience method for handling provider callbacks
   * @param projectId - The project ID
   * @param provider - OAuth provider
   * @param providerData - Data from OAuth provider
   * @returns Promise resolving to project user session
   */
  async createProjectOAuthSession(
    projectId: string,
    provider: string,
    providerData: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: number;
      userInfo: ProjectOAuthUserInfo;
    }
  ): Promise<ProjectOAuthSessionWithUser> {
    try {
      const response = await this.httpClient.post(
        `/projects/${projectId}/oauth/sessions`,
        {
          provider,
          ...providerData,
        }
      );

      return response.data as ProjectOAuthSessionWithUser;
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Revoke OAuth session for a project user
   * @param projectId - The project ID
   * @param userId - User ID
   * @param provider - OAuth provider
   * @returns Promise resolving when session is revoked
   */
  async revokeProjectOAuthSession(
    projectId: string,
    userId: string,
    provider: string
  ): Promise<void> {
    try {
      await this.httpClient.delete(
        `/projects/${projectId}/oauth/sessions/${userId}/${provider}`
      );
    } catch (error) {
      throw this.handleProjectOAuthError(error, projectId, provider);
    }
  }

  /**
   * Handle project OAuth errors with proper typing and context
   * @param error - Original error
   * @param projectId - Project ID for context
   * @param provider - Optional OAuth provider for context
   * @returns Formatted project OAuth error
   */
  private handleProjectOAuthError(
    error: any,
    projectId?: string,
    provider?: string
  ): ProjectOAuthError {
    const oauthError = new Error() as ProjectOAuthError;

    if (error.response) {
      oauthError.message =
        error.response.data?.message ||
        error.response.data?.error ||
        'Project OAuth request failed';
      oauthError.code = error.response.data?.code || `HTTP_${error.response.status}`;
      oauthError.details = error.response.data?.details;
    } else if (error.request) {
      oauthError.message = 'Network error during project OAuth request';
      oauthError.code = 'NETWORK_ERROR';
    } else {
      oauthError.message = error.message || 'Unknown project OAuth error';
      oauthError.code = 'UNKNOWN_ERROR';
    }

    oauthError.projectId = projectId;
    oauthError.provider = provider;
    return oauthError;
  }
}