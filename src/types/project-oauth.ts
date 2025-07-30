// Project OAuth Types for AppAtOnce Node SDK
// These types are for end-user authentication in projects (multi-tenant OAuth)

import { OAuthProvider } from './oauth';

/**
 * Project OAuth provider configuration
 * Used by project owners to configure OAuth for their projects
 */
export interface ProjectOAuthProviderConfig {
  provider: OAuthProvider | string; // Support custom providers
  clientId: string;
  clientSecret?: string; // Optional for some providers
  redirectUri?: string;
  scope?: string[];
  enabled: boolean;
  customDomain?: string; // For custom OAuth domains
  metadata?: Record<string, any>;
}

/**
 * Project OAuth provider information
 * Returned when querying available providers for a project
 */
export interface ProjectOAuthProvider {
  provider: OAuthProvider | string;
  enabled: boolean;
  scope?: string[];
  customDomain?: string;
  configured: boolean;
  configuredAt?: string;
}

/**
 * Project user session after OAuth authentication
 * Represents an end-user authenticated to a project
 */
export interface ProjectUserSession {
  projectId: string;
  userId: string;
  provider: OAuthProvider | string;
  providerId: string; // Provider-specific user ID
  email?: string;
  name?: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

/**
 * Project OAuth token after exchange
 */
export interface ProjectAuthToken {
  projectId: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope?: string[];
  idToken?: string; // For OpenID Connect
}

/**
 * Project OAuth initiation response
 */
export interface ProjectOAuthInitiateResponse {
  url: string;
  state: string;
  provider: OAuthProvider | string;
  projectId: string;
  codeVerifier?: string; // For PKCE flow
}

/**
 * Project OAuth callback parameters
 */
export interface ProjectOAuthCallbackParams {
  code: string;
  state: string;
  error?: string;
  errorDescription?: string;
}

/**
 * OAuth configuration for projects
 */
export interface ProjectOAuthConfig {
  provider: OAuthProvider | string;
  clientId: string;
  clientSecret?: string;
  redirectUri?: string;
  authorizationUrl?: string; // For custom providers
  tokenUrl?: string; // For custom providers
  userInfoUrl?: string; // For custom providers
  scope?: string[];
  customHeaders?: Record<string, string>;
  pkce?: boolean; // Enable PKCE for security
}

/**
 * Test result for OAuth provider configuration
 */
export interface TestResult {
  success: boolean;
  message: string;
  provider: OAuthProvider | string;
  details?: {
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    configValid: boolean;
    redirectUriValid: boolean;
    errors?: string[];
  };
}

/**
 * Project OAuth error
 */
export interface ProjectOAuthError extends Error {
  projectId?: string;
  provider?: OAuthProvider | string;
  code?: string;
  details?: any;
}

/**
 * Options for initiating project OAuth
 */
export interface ProjectOAuthInitiateOptions {
  redirectUri?: string;
  scope?: string[];
  state?: string; // Custom state parameter
  prompt?: 'none' | 'consent' | 'select_account';
  loginHint?: string; // Pre-fill email
  pkce?: boolean; // Enable PKCE
}

/**
 * Options for exchanging OAuth token
 */
export interface ProjectOAuthTokenExchangeOptions {
  codeVerifier?: string; // For PKCE
  redirectUri?: string;
}

/**
 * Project OAuth user info
 * Normalized user information from various providers
 */
export interface ProjectOAuthUserInfo {
  id: string; // Provider-specific ID
  email?: string;
  emailVerified?: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
  raw: Record<string, any>; // Raw provider response
}

/**
 * Project OAuth session with user info
 */
export interface ProjectOAuthSessionWithUser extends ProjectUserSession {
  user: ProjectOAuthUserInfo;
}

/**
 * Options for refreshing project OAuth tokens
 */
export interface ProjectOAuthTokenRefreshOptions {
  refreshToken: string;
  scope?: string[];
}

/**
 * Response from refreshing project OAuth tokens
 */
export interface ProjectOAuthTokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string[];
  tokenType: string;
}

/**
 * Project OAuth provider status
 */
export interface ProjectOAuthProviderStatus {
  provider: OAuthProvider | string;
  configured: boolean;
  enabled: boolean;
  lastTestedAt?: string;
  lastTestResult?: boolean;
  userCount?: number;
  metadata?: Record<string, any>;
}

/**
 * Bulk configuration result
 */
export interface ProjectOAuthBulkConfigResult {
  provider: OAuthProvider | string;
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * OAuth provider template for quick setup
 */
export interface OAuthProviderTemplate {
  provider: OAuthProvider | string;
  name: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  scope: string[];
  pkce: boolean;
  logoUrl?: string;
  documentation?: string;
}

/**
 * Project OAuth analytics
 */
export interface ProjectOAuthAnalytics {
  projectId: string;
  totalUsers: number;
  byProvider: Record<string, {
    userCount: number;
    lastSignIn?: string;
    signInCount: number;
  }>;
  recentSignIns: Array<{
    userId: string;
    provider: string;
    timestamp: string;
  }>;
}