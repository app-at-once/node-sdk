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
    const response = await this.httpClient.post('/data/users/auth/signup', credentials);
    
    this.currentSession = response.data;
    this.currentUser = response.data.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(response.data.access_token);
    
    return response.data;
  }

  async signIn(credentials: SignInCredentials): Promise<AuthSession | { mfa_required: boolean; user_id: string; message: string }> {
    // ALWAYS use project/app-specific authentication
    const response = await this.httpClient.post('/auth/login', credentials);
    
    // Check if MFA is required
    if (response.data.mfa_required) {
      return response.data;
    }
    
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

  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
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
  async sendEmailVerification(): Promise<{
    message: string;
    expiresIn: number;
  }> {
    const response = await this.httpClient.post('/auth/resend-verification', {});
    return response.data;
  }

  async verifyEmail(token: string): Promise<{
    success: boolean;
    message: string;
    user?: {
      id: string;
      email: string;
      emailVerified: boolean;
    };
  }> {
    const response = await this.httpClient.post('/auth/verify-email', { token });
    return response.data;
  }

  async resendEmailVerification(): Promise<{
    message: string;
    expiresIn: number;
  }> {
    const response = await this.httpClient.post('/auth/resend-verification', {});
    return response.data;
  }

  async getEmailVerificationStatus(): Promise<{
    verified: boolean;
    pendingVerification: boolean;
    canResend: boolean;
    lastSentAt?: string;
    expiresAt?: string;
  }> {
    const response = await this.httpClient.get('/auth/verification-status');
    return response.data;
  }

  // ==================================================================
  // TENANT USER MANAGEMENT - API Key-based user management
  // ==================================================================

  /**
   * List all users in the current tenant (project/app)
   * Supports pagination, filtering, and sorting
   */
  async listUsers(options?: {
    page?: number;
    limit?: number;
    cursor?: string;
    email?: string;
    name?: string;
    status?: 'active' | 'suspended' | 'deleted';
    verified?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
    sortField?: 'email' | 'name' | 'created_at' | 'updated_at' | 'last_login';
    sortDirection?: 'asc' | 'desc';
  }): Promise<{
    users: AuthUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
      nextCursor?: string;
      prevCursor?: string;
    };
  }> {
    const params: any = {};
    
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
    if (options?.cursor) params.cursor = options.cursor;
    if (options?.email) params.email = options.email;
    if (options?.name) params.name = options.name;
    if (options?.status) params.status = options.status;
    if (options?.verified !== undefined) params.verified = options.verified;
    if (options?.createdAfter) params.createdAfter = options.createdAfter.toISOString();
    if (options?.createdBefore) params.createdBefore = options.createdBefore.toISOString();
    if (options?.sortField) params.sortField = options.sortField;
    if (options?.sortDirection) params.sortDirection = options.sortDirection;
    
    const response = await this.httpClient.get('/tenant/users', { params });
    return response.data;
  }

  /**
   * Search users across multiple fields
   */
  async searchUsers(searchTerm: string, options?: {
    page?: number;
    limit?: number;
    sortField?: 'email' | 'name' | 'created_at' | 'updated_at' | 'last_login';
    sortDirection?: 'asc' | 'desc';
  }): Promise<{
    users: AuthUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const params: any = { q: searchTerm };
    
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
    if (options?.sortField) params.sortField = options.sortField;
    if (options?.sortDirection) params.sortDirection = options.sortDirection;
    
    const response = await this.httpClient.get('/tenant/users/search', { params });
    return response.data;
  }

  /**
   * Get specific user by ID
   */
  async getUserById(userId: string): Promise<AuthUser> {
    const response = await this.httpClient.get(`/tenant/users/${userId}`);
    return response.data;
  }

  /**
   * Get tenant user statistics and analytics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
    lastSignupDate?: Date;
    userGrowthTrend?: Array<{ date: Date; count: number }>;
  }> {
    const response = await this.httpClient.get('/tenant/users/stats');
    return response.data;
  }

  /**
   * Update user profile (admin operation)
   */
  async updateUser(userId: string, updates: {
    name?: string;
    email?: string;
    avatar?: string;
    metadata?: Record<string, any>;
    status?: 'active' | 'suspended';
    email_verified?: boolean;
  }): Promise<AuthUser> {
    const response = await this.httpClient.put(`/tenant/users/${userId}`, updates);
    return response.data;
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: string, reason: string): Promise<AuthUser> {
    const response = await this.httpClient.post(`/tenant/users/${userId}/suspend`, { reason });
    return response.data;
  }

  /**
   * Reactivate suspended user
   */
  async reactivateUser(userId: string): Promise<AuthUser> {
    const response = await this.httpClient.post(`/tenant/users/${userId}/reactivate`);
    return response.data;
  }

  /**
   * Delete user account (soft delete by default)
   */
  async deleteUser(userId: string, permanent: boolean = false): Promise<{
    success: boolean;
    message: string;
  }> {
    const params = permanent ? { permanent: true } : {};
    const response = await this.httpClient.delete(`/tenant/users/${userId}`, { params });
    return response.data;
  }

  /**
   * Get user activity logs for audit trail
   */
  async getUserActivityLogs(userId: string, options?: {
    page?: number;
    limit?: number;
  }): Promise<{
    logs: Array<{
      id: string;
      userId: string;
      action: string;
      details: Record<string, any>;
      performedBy: string;
      performedAt: Date;
      ipAddress?: string;
      userAgent?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const params: any = {};
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
    
    const response = await this.httpClient.get(`/tenant/users/${userId}/activity`, { params });
    return response.data;
  }

  // API Key management - REMOVED for security
  // API keys should be managed through the platform dashboard, not the SDK

  // Session management
  async getUserSessions(): Promise<Array<{
    id: string;
    userId: string;
    deviceInfo: {
      platform?: string;
      browser?: string;
      version?: string;
      mobile?: boolean;
      os?: string;
      fingerprint?: string;
    };
    ipAddress: string | null;
    userAgent: string | null;
    isCurrent: boolean;
    lastUsed: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    const response = await this.httpClient.get('/auth/sessions');
    return response.data;
  }

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await this.httpClient.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  }

  async revokeAllSessions(): Promise<{ message: string; revokedCount: number }> {
    const response = await this.httpClient.delete('/auth/sessions');
    return response.data;
  }

  async revokeAllSessionsCompletely(): Promise<{ message: string; revokedCount: number }> {
    const response = await this.httpClient.post('/auth/sessions/revoke-all');
    return response.data;
  }

  async getSessionAnalytics(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    deviceTypes: Record<string, number>;
    locations: Record<string, number>;
    securityEvents: {
      suspiciousLogins: number;
      multipleDevices: number;
      locationChanges: number;
    };
  }> {
    const response = await this.httpClient.get('/auth/sessions/analytics');
    return response.data;
  }

  async getCurrentSession(): Promise<{
    id: string;
    deviceInfo: any;
    ipAddress: string | null;
    lastUsed: string;
    expiresAt: string;
  } | null> {
    const response = await this.httpClient.get('/auth/sessions/current');
    return response.data;
  }

  async refreshSessionWithToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
    user: AuthUser;
    session: {
      id: string;
      expiresAt: string;
      deviceInfo: any;
    };
  }> {
    const response = await this.httpClient.post('/auth/sessions/refresh', {
      refreshToken,
    });
    
    // Update internal session state
    this.currentSession = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: response.data.expires_at,
      user: response.data.user,
    };
    this.currentUser = response.data.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(response.data.access_token);
    
    // Notify auth state change
    this.notifyAuthStateChange('SESSION_REFRESHED');
    
    return response.data;
  }

  async markSessionSuspicious(sessionId: string): Promise<{ message: string }> {
    const response = await this.httpClient.post(`/auth/sessions/mark-suspicious/${sessionId}`);
    return response.data;
  }

  async cleanupExpiredSessions(): Promise<{ message: string; cleanedCount: number }> {
    const response = await this.httpClient.post('/auth/sessions/cleanup-expired');
    return response.data;
  }

  // OAuth methods are handled through project-specific OAuth configuration

  // Multi-factor authentication

  /**
   * Generate MFA secret for setup (step 1 of MFA setup)
   * Returns secret and QR code for authenticator apps
   */
  async generateMFASecret(): Promise<{ secret: string; qr_code: string; backup_url: string }> {
    const response = await this.httpClient.post('/auth/mfa/generate-secret', {});
    return response.data;
  }

  /**
   * Enable MFA after verifying the setup code (step 2 of MFA setup)
   * Returns backup codes for recovery
   */
  async enableMFA(code: string): Promise<{ backup_codes: string[] }> {
    const response = await this.httpClient.post('/auth/mfa/enable', { code });
    return response.data;
  }

  /**
   * Verify MFA code (for login or operations requiring MFA)
   */
  async verifyMFA(code: string): Promise<{ verified: boolean }> {
    const response = await this.httpClient.post('/auth/mfa/verify', { code });
    return response.data;
  }

  /**
   * Disable MFA (requires password verification)
   */
  async disableMFA(password: string): Promise<void> {
    await this.httpClient.post('/auth/mfa/disable', { password });
  }

  /**
   * Generate new backup codes (requires MFA verification)
   */
  async generateBackupCodes(mfaCode: string): Promise<{ codes: string[] }> {
    const response = await this.httpClient.post('/auth/mfa/backup-codes', { mfaCode });
    return response.data;
  }

  /**
   * Check if MFA is enabled for current user
   */
  async isMFAEnabled(): Promise<{ enabled: boolean }> {
    const response = await this.httpClient.get('/auth/mfa/enabled');
    return response.data;
  }

  /**
   * Get MFA status for current user
   */
  async getMFAStatus(): Promise<{
    enabled: boolean;
    setupAt: string | null;
    backupCodesCount: number;
  }> {
    const response = await this.httpClient.get('/auth/mfa/status');
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

  // Magic Link / Passwordless Authentication Methods

  /**
   * Send a magic link for passwordless authentication
   * @param email - Email address to send magic link to
   * @param redirectTo - Optional redirect URL after successful authentication
   * @returns Promise resolving to magic link response
   */
  async sendMagicLink(
    email: string,
    redirectTo?: string
  ): Promise<{
    message: string;
    expires_in: number;
  }> {
    const response = await this.httpClient.post('/auth/magic-link/send', {
      email,
      redirectTo,
    });

    return response.data;
  }

  /**
   * Verify magic link token and authenticate user
   * @param token - Magic link token from email
   * @param email - Email address associated with the magic link
   * @returns Promise resolving to authentication session
   */
  async verifyMagicLink(
    token: string,
    email: string
  ): Promise<AuthSession> {
    const response = await this.httpClient.post('/auth/magic-link/verify', {
      token,
      email,
    });

    const session = response.data;
    this.currentSession = session;
    this.currentUser = session.user;
    
    // Update HTTP client with new token
    this.httpClient.updateApiKey(session.access_token);
    
    // Notify auth state change
    this.notifyAuthStateChange('MAGIC_LINK_SIGNIN');
    
    // Start auto-refresh
    this.startAutoRefresh();
    
    return session;
  }

  /**
   * Revoke all active magic links for the current user
   * @returns Promise resolving to revocation result
   */
  async revokeMagicLinks(): Promise<{
    message: string;
    revoked_count: number;
  }> {
    const response = await this.httpClient.post('/auth/magic-link/revoke');
    
    // Notify auth state change
    this.notifyAuthStateChange('MAGIC_LINKS_REVOKED');
    
    return response.data;
  }

  /**
   * Sign in with magic link (convenience method that combines send and verify)
   * This method sends a magic link and returns instructions for the user
   * @param email - Email address to send magic link to
   * @param redirectTo - Optional redirect URL after successful authentication
   * @returns Promise resolving to instructions for the user
   */
  async signInWithMagicLink(
    email: string,
    redirectTo?: string
  ): Promise<{
    message: string;
    expires_in: number;
    instructions: string;
  }> {
    const result = await this.sendMagicLink(email, redirectTo);
    
    return {
      ...result,
      instructions: 'Please check your email and click the secure sign-in link to complete authentication.',
    };
  }
}