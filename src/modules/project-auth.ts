import { HttpClient } from '../core/http-client';
import { AuthUser, AuthSession, SignUpCredentials, SignInCredentials } from '../types';

/**
 * Project-specific authentication module
 * Handles authentication for multi-tenant projects where each project has its own user database
 */
export class ProjectAuthModule {
  private httpClient: HttpClient;
  private projectId?: string;
  private appId?: string;
  private currentUser: AuthUser | null = null;
  private currentSession: AuthSession | null = null;

  constructor(httpClient: HttpClient, options?: { projectId?: string; appId?: string }) {
    this.httpClient = httpClient;
    this.projectId = options?.projectId;
    this.appId = options?.appId;
  }

  /**
   * Set the project context for authentication
   */
  setProject(projectId: string): void {
    this.projectId = projectId;
  }

  /**
   * Set the app context for authentication
   */
  setApp(appId: string): void {
    this.appId = appId;
  }

  /**
   * Sign up a new user in the project's user database
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthSession> {
    try {
      // Use the auth endpoint for signup
      const response = await this.httpClient.post<AuthSession>('/data/users/auth', {
        operation: 'signup',
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        metadata: credentials.metadata || {},
      });

      const session = response.data;

      this.currentSession = session;
      this.currentUser = session.user;

      // Update HTTP client with new token
      this.httpClient.updateApiKey(session.access_token);

      return session;
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    try {
      // Use the auth endpoint for signin
      const response = await this.httpClient.post<AuthSession>('/data/users/auth', {
        operation: 'signin',
        email: credentials.email,
        password: credentials.password,
      });

      const session = response.data;

      this.currentSession = session;
      this.currentUser = session.user;

      // Update HTTP client with new token
      this.httpClient.updateApiKey(session.access_token);

      return session;
    } catch (error: any) {
      if (error.message?.includes('Invalid') || error.message?.includes('password')) {
        throw new Error('Invalid email or password');
      }
      throw new Error('Authentication failed');
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    // In a real implementation, you might want to:
    // 1. Invalidate the token on the server
    // 2. Clear any server-side sessions
    // 3. Log the sign-out event

    this.currentSession = null;
    this.currentUser = null;
    
    // Reset HTTP client token
    this.httpClient.updateApiKey('');
  }

  /**
   * Get the current user from token
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      // Use the auth endpoint to get current user
      const response = await this.httpClient.post<{ user: AuthUser }>('/data/users/auth', {
        operation: 'me',
      });

      this.currentUser = response.data.user;
      return this.currentUser;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(updates: Partial<AuthUser>): Promise<AuthUser> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      const response = await this.httpClient.post<{ user: AuthUser }>('/data/users/auth', {
        operation: 'update_profile',
        ...updates,
      });

      this.currentUser = response.data.user;
      return this.currentUser;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      await this.httpClient.post('/data/users/auth', {
        operation: 'change_password',
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await this.httpClient.post('/data/users/auth', {
        operation: 'reset_password',
        email,
      });
    } catch (error) {
      // Don't reveal if user exists - silently succeed
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshSession(): Promise<AuthSession> {
    if (!this.currentSession?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.httpClient.post<AuthSession>('/data/users/auth', {
        operation: 'refresh',
        refresh_token: this.currentSession.refresh_token,
      });

      const session = response.data;

      this.currentSession = session;
      this.currentUser = session.user;

      // Update HTTP client with new token
      this.httpClient.updateApiKey(session.access_token);

      return session;
    } catch (error) {
      throw new Error('Failed to refresh session');
    }
  }


  /**
   * Get current session
   */
  getSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.currentSession && !!this.currentUser;
  }
}