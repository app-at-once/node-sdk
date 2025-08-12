import { OAuthProvider } from './oauth';
export interface ProjectOAuthProviderConfig {
    provider: OAuthProvider | string;
    clientId: string;
    clientSecret?: string;
    redirectUri?: string;
    scope?: string[];
    enabled: boolean;
    customDomain?: string;
    metadata?: Record<string, any>;
}
export interface ProjectOAuthProvider {
    provider: OAuthProvider | string;
    enabled: boolean;
    scope?: string[];
    customDomain?: string;
    configured: boolean;
    configuredAt?: string;
}
export interface ProjectUserSession {
    projectId: string;
    userId: string;
    provider: OAuthProvider | string;
    providerId: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    metadata?: Record<string, any>;
    createdAt: string;
}
export interface ProjectAuthToken {
    projectId: string;
    userId: string;
    accessToken: string;
    refreshToken?: string;
    tokenType: string;
    expiresIn: number;
    scope?: string[];
    idToken?: string;
}
export interface ProjectOAuthInitiateResponse {
    url: string;
    state: string;
    provider: OAuthProvider | string;
    projectId: string;
    codeVerifier?: string;
}
export interface ProjectOAuthCallbackParams {
    code: string;
    state: string;
    error?: string;
    errorDescription?: string;
}
export interface ProjectOAuthConfig {
    provider: OAuthProvider | string;
    clientId: string;
    clientSecret?: string;
    redirectUri?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
    scope?: string[];
    customHeaders?: Record<string, string>;
    pkce?: boolean;
}
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
export interface ProjectOAuthError extends Error {
    projectId?: string;
    provider?: OAuthProvider | string;
    code?: string;
    details?: any;
}
export interface ProjectOAuthInitiateOptions {
    redirectUri?: string;
    scope?: string[];
    state?: string;
    prompt?: 'none' | 'consent' | 'select_account';
    loginHint?: string;
    pkce?: boolean;
}
export interface ProjectOAuthTokenExchangeOptions {
    codeVerifier?: string;
    redirectUri?: string;
}
export interface ProjectOAuthUserInfo {
    id: string;
    email?: string;
    emailVerified?: boolean;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    locale?: string;
    raw: Record<string, any>;
}
export interface ProjectOAuthSessionWithUser extends ProjectUserSession {
    user: ProjectOAuthUserInfo;
}
export interface ProjectOAuthTokenRefreshOptions {
    refreshToken: string;
    scope?: string[];
}
export interface ProjectOAuthTokenRefreshResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    scope?: string[];
    tokenType: string;
}
export interface ProjectOAuthProviderStatus {
    provider: OAuthProvider | string;
    configured: boolean;
    enabled: boolean;
    lastTestedAt?: string;
    lastTestResult?: boolean;
    userCount?: number;
    metadata?: Record<string, any>;
}
export interface ProjectOAuthBulkConfigResult {
    provider: OAuthProvider | string;
    success: boolean;
    message?: string;
    error?: string;
}
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
