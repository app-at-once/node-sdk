import { HttpClient } from '../core/http-client';
import { AuthUser, AuthSession, SignUpCredentials, SignInCredentials } from '../types';
import { ProjectOAuthModule } from '../auth/project-oauth';
import {
  OAuthProvider,
  OAuthInitiateResponse,
  OAuthCallbackData,
  ConnectedProvidersResponse,
  OAuthLinkOptions,
  OAuthLinkResult,
  OAuthUnlinkResult,
  OAuthFlowOptions,
  OAuthTokenRefreshOptions,
  OAuthTokenRefreshResponse,
} from '../types/oauth';

export class AuthModule {
  private httpClient: HttpClient;
  private currentUser: AuthUser | null = null;
  private currentSession: AuthSession | null = null;
  private oauthModule: ProjectOAuthModule;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.oauthModule = new ProjectOAuthModule(httpClient);
  }

  // Authentication methods
  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    // ALWAYS use project/app-specific authentication
    // SDK should NEVER expose platform-level auth endpoints
    const response = await this.httpClient.post('/data/users/auth/signup', credentials);
    
    this.currentSession = response.data;
    this.currentUser = response.data.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(response.data.access_token);
    
    return response.data;
  }

  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    // ALWAYS use project/app-specific authentication
    const response = await this.httpClient.post('/data/users/auth/signin', credentials);
    
    this.currentSession = response.data;
    this.currentUser = response.data.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(response.data.access_token);
    
    return response.data;
  }

  async signOut(): Promise<void> {
    if (this.currentSession) {
      await this.httpClient.post('/data/users/auth/signout', {});
    }
    
    this.currentSession = null;
    this.currentUser = null;
    
    // Reset HTTP client token
    this.httpClient.updateApiKey('');
  }

  async refreshSession(): Promise<AuthSession> {
    if (!this.currentSession?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await this.httpClient.post('/data/users/auth/refresh', {
      refresh_token: this.currentSession.refresh_token,
    });

    this.currentSession = response.data;
    this.currentUser = response.data.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(response.data.access_token);
    
    return response.data;
  }

  // User management
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.currentUser) {
      try {
        const response = await this.httpClient.get('/data/users/auth/me');
        this.currentUser = response.data;
      } catch (error) {
        this.currentUser = null;
      }
    }
    
    return this.currentUser;
  }

  async updateUser(updates: Partial<AuthUser>): Promise<AuthUser> {
    const response = await this.httpClient.patch('/data/users/auth/me', updates);
    this.currentUser = response.data;
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.httpClient.post('/data/users/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  async resetPassword(email: string): Promise<void> {
    await this.httpClient.post('/data/users/auth/reset-password', { email });
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    await this.httpClient.post('/data/users/auth/confirm-reset-password', {
      token,
      password: newPassword,
    });
  }

  // Email verification
  async sendEmailVerification(): Promise<void> {
    await this.httpClient.post('/data/users/auth/send-verification', {});
  }

  async verifyEmail(token: string): Promise<void> {
    await this.httpClient.post('/data/users/auth/verify-email', { token });
  }

  // API Key management - REMOVED for security
  // API keys should be managed through the platform dashboard, not the SDK

  // Session management
  async getUserSessions(): Promise<Array<{
    id: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    last_active: string;
  }>> {
    const response = await this.httpClient.get('/data/sessions');
    return response.data;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.httpClient.delete(`/data/sessions/${sessionId}`);
  }

  async revokeAllSessions(): Promise<void> {
    await this.httpClient.delete('/data/sessions');
  }

  // OAuth methods are handled through project-specific OAuth configuration

  // Multi-factor authentication
  async enableMFA(): Promise<{ secret: string; qr_code: string }> {
    const response = await this.httpClient.post('/data/users/auth/mfa-enable', {});
    return response.data;
  }

  async verifyMFA(code: string): Promise<void> {
    await this.httpClient.post('/data/users/auth/mfa-verify', { code });
  }

  async disableMFA(password: string): Promise<void> {
    await this.httpClient.post('/data/users/auth/mfa-disable', { password });
  }

  async generateBackupCodes(): Promise<{ codes: string[] }> {
    const response = await this.httpClient.post('/data/users/auth/mfa-backup-codes', {});
    return response.data;
  }

  // Organization management - REMOVED
  // Organizations should be managed at the project level, not through the SDK

  // State management
  getUser(): AuthUser | null {
    return this.currentUser;
  }

  getSession(): AuthSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && !!this.currentUser;
  }

  isSessionExpired(): boolean {
    if (!this.currentSession) return true;
    return Date.now() > this.currentSession.expires_at * 1000;
  }

  // Event listeners for auth state changes
  private authStateListeners: Array<(event: string, session: AuthSession | null) => void> = [];

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  private notifyAuthStateChange(event: string): void {
    this.authStateListeners.forEach(callback => {
      callback(event, this.currentSession);
    });
  }

  // Auto-refresh token when it's about to expire
  private startAutoRefresh(): void {
    if (!this.currentSession) return;

    const refreshTime = (this.currentSession.expires_at * 1000) - Date.now() - 60000; // 1 minute before expiry
    
    if (refreshTime > 0) {
      setTimeout(async () => {
        try {
          await this.refreshSession();
          this.notifyAuthStateChange('TOKEN_REFRESHED');
          this.startAutoRefresh(); // Schedule next refresh
        } catch (error) {
          this.notifyAuthStateChange('TOKEN_REFRESH_FAILED');
        }
      }, refreshTime);
    }
  }

  // OAuth Methods

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
    return this.oauthModule.initiateOAuth(provider, options);
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
    const session = await this.oauthModule.handleOAuthCallback(provider, code, state);
    
    // Update internal session state
    this.currentSession = session;
    this.currentUser = session.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(session.access_token);
    
    // Notify auth state change
    this.notifyAuthStateChange('OAUTH_SIGNIN');
    
    return session;
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
    return this.oauthModule.signInWithProvider(provider, redirectUrl);
  }

  /**
   * Complete OAuth sign in flow after callback
   * @param callbackData - OAuth callback data
   * @returns Promise resolving to authentication session
   */
  async completeOAuthSignIn(callbackData: OAuthCallbackData): Promise<AuthSession> {
    const session = await this.oauthModule.completeOAuthSignIn(callbackData);
    
    // Update internal session state
    this.currentSession = session;
    this.currentUser = session.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(session.access_token);
    
    // Notify auth state change
    this.notifyAuthStateChange('OAUTH_SIGNIN');
    
    return session;
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
    const result = await this.oauthModule.linkOAuthProvider(provider, code, state);
    
    // Notify auth state change for provider linking
    this.notifyAuthStateChange('OAUTH_PROVIDER_LINKED');
    
    return result;
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
    return this.oauthModule.initiateLinkProvider(provider, options);
  }

  /**
   * Unlink an OAuth provider from the current user
   * @param provider - OAuth provider to unlink
   * @returns Promise resolving to unlink result
   */
  async unlinkOAuthProvider(provider: OAuthProvider): Promise<OAuthUnlinkResult> {
    const result = await this.oauthModule.unlinkOAuthProvider(provider);
    
    // Notify auth state change for provider unlinking
    this.notifyAuthStateChange('OAUTH_PROVIDER_UNLINKED');
    
    return result;
  }

  /**
   * Get all connected OAuth providers for the current user
   * @returns Promise resolving to connected providers information
   */
  async getConnectedProviders(): Promise<ConnectedProvidersResponse> {
    return this.oauthModule.getConnectedProviders();
  }

  /**
   * Refresh OAuth tokens for a specific provider
   * @param options - Token refresh options
   * @returns Promise resolving to token refresh response
   */
  async refreshOAuthToken(
    options: OAuthTokenRefreshOptions
  ): Promise<OAuthTokenRefreshResponse> {
    return this.oauthModule.refreshOAuthToken(options);
  }

  /**
   * Generate OAuth URL for manual redirect (alternative to initiateOAuth)
   * @param provider - OAuth provider
   * @param redirectUrl - Optional redirect URL after authentication
   * @returns Promise resolving to OAuth URL
   */
  async generateOAuthURL(provider: OAuthProvider, redirectUrl?: string): Promise<string> {
    return this.oauthModule.generateOAuthURL({ provider, redirectUrl });
  }

  /**
   * Check if a specific OAuth provider is connected
   * @param provider - OAuth provider to check
   * @returns Promise resolving to boolean indicating if provider is connected
   */
  async isProviderConnected(provider: OAuthProvider): Promise<boolean> {
    return this.oauthModule.isProviderConnected(provider);
  }

  /**
   * Get information about a specific connected provider
   * @param provider - OAuth provider to get information for
   * @returns Promise resolving to provider information or null if not connected
   */
  async getProviderInfo(provider: OAuthProvider) {
    return this.oauthModule.getProviderInfo(provider);
  }

  /**
   * Bulk unlink multiple OAuth providers
   * @param providers - Array of OAuth providers to unlink
   * @returns Promise resolving to array of unlink results
   */
  async unlinkMultipleProviders(
    providers: OAuthProvider[]
  ): Promise<OAuthUnlinkResult[]> {
    const results = await this.oauthModule.unlinkMultipleProviders(providers);
    
    // Notify auth state change for bulk unlinking
    this.notifyAuthStateChange('OAUTH_PROVIDERS_UNLINKED');
    
    return results;
  }

  /**
   * Get available OAuth providers that can be connected
   * @returns Promise resolving to array of available providers
   */
  async getAvailableProviders(): Promise<OAuthProvider[]> {
    return this.oauthModule.getAvailableProviders();
  }

  /**
   * Complete OAuth provider linking flow after callback
   * @param callbackData - OAuth callback data
   * @returns Promise resolving to link result
   */
  async completeProviderLinking(callbackData: OAuthCallbackData): Promise<OAuthLinkResult> {
    const result = await this.oauthModule.completeProviderLinking(callbackData);
    
    // Notify auth state change for provider linking
    this.notifyAuthStateChange('OAUTH_PROVIDER_LINKED');
    
    return result;
  }
}