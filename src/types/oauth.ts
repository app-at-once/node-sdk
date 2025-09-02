// OAuth Types for AppAtOnce Node SDK

/**
 * Supported OAuth providers
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
  TWITTER = 'twitter',
}

/**
 * OAuth action types
 */
export enum OAuthAction {
  SIGNIN = 'signin',
  LINK = 'link',
}

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  provider: OAuthProvider;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: string[];
  enabled?: boolean;
}

/**
 * OAuth initialization response
 */
export interface OAuthInitiateResponse {
  url: string;
  state: string;
  provider: OAuthProvider;
  action: OAuthAction;
}

/**
 * OAuth callback data
 */
export interface OAuthCallbackData {
  provider: OAuthProvider;
  code: string;
  state: string;
}

/**
 * OAuth user data from provider
 */
export interface OAuthUserData {
  provider: OAuthProvider;
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  rawData?: any;
}

/**
 * Connected OAuth provider information
 */
export interface ConnectedOAuthProvider {
  provider: OAuthProvider;
  email?: string;
  name?: string;
  avatarUrl?: string;
  connectedAt: string;
}

/**
 * Connected providers response
 */
export interface ConnectedProvidersResponse {
  providers: ConnectedOAuthProvider[];
  availableProviders: OAuthProvider[];
}

/**
 * OAuth link provider options
 */
export interface OAuthLinkOptions {
  redirectUrl?: string;
}

/**
 * OAuth session data that extends the main AuthSession
 */
export interface OAuthSession {
  provider: OAuthProvider;
  providerId: string;
  connectedAt: string;
}

/**
 * OAuth error types
 */
export interface OAuthError extends Error {
  provider?: OAuthProvider;
  code?: string;
  details?: any;
}

/**
 * OAuth flow options
 */
export interface OAuthFlowOptions {
  action?: OAuthAction;
  redirectUrl?: string;
  state?: string;
  scope?: string[];
}

/**
 * OAuth token refresh options
 */
export interface OAuthTokenRefreshOptions {
  provider: OAuthProvider;
  providerId: string;
  refreshToken?: string;
}

/**
 * OAuth token refresh response
 */
export interface OAuthTokenRefreshResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * OAuth configuration for the SDK
 */
export interface OAuthConfig {
  providers?: Record<OAuthProvider, OAuthProviderConfig>;
  defaultRedirectUrl?: string;
  enableTokenRefresh?: boolean;
  tokenRefreshThreshold?: number; // Minutes before expiry to refresh
}

/**
 * OAuth state parameter data
 */
export interface OAuthStateData {
  action: OAuthAction;
  userId?: string;
  redirectUrl?: string;
  csrfToken: string;
  timestamp: number;
}

/**
 * OAuth initiate request options
 */
export interface OAuthInitiateOptions {
  provider: OAuthProvider;
  action?: OAuthAction;
  userId?: string;
  redirectUrl?: string;
}

/**
 * OAuth unlink options
 */
export interface OAuthUnlinkOptions {
  provider: OAuthProvider;
}

/**
 * OAuth provider linking result
 */
export interface OAuthLinkResult {
  success: boolean;
  message: string;
  provider: OAuthProvider;
}

/**
 * OAuth provider unlinking result
 */
export interface OAuthUnlinkResult {
  success: boolean;
  message: string;
  provider: OAuthProvider;
}

/**
 * OAuth authentication result
 */
export interface OAuthAuthResult {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
    emailVerified?: boolean;
  };
  expires_at?: number;
  oauth?: {
    provider: OAuthProvider;
    providerId: string;
    connectedAt: string;
  };
}