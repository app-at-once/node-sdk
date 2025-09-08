export declare enum OAuthProvider {
    GOOGLE = "google",
    FACEBOOK = "facebook",
    APPLE = "apple",
    GITHUB = "github",
    MICROSOFT = "microsoft",
    TWITTER = "twitter"
}
export declare enum OAuthAction {
    SIGNIN = "signin",
    LINK = "link"
}
export interface OAuthProviderConfig {
    provider: OAuthProvider;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    scope?: string[];
    enabled?: boolean;
}
export interface OAuthInitiateResponse {
    url: string;
    state: string;
    provider: OAuthProvider;
    action: OAuthAction;
}
export interface OAuthCallbackData {
    provider: OAuthProvider;
    code: string;
    state: string;
}
export interface OAuthUserData {
    provider: OAuthProvider;
    providerId: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    emailVerified?: boolean;
    rawData?: any;
}
export interface ConnectedOAuthProvider {
    provider: OAuthProvider;
    email?: string;
    name?: string;
    avatarUrl?: string;
    connectedAt: string;
}
export interface ConnectedProvidersResponse {
    providers: ConnectedOAuthProvider[];
    availableProviders: OAuthProvider[];
}
export interface OAuthLinkOptions {
    redirectUrl?: string;
}
export interface OAuthSession {
    provider: OAuthProvider;
    providerId: string;
    connectedAt: string;
}
export interface OAuthError extends Error {
    provider?: OAuthProvider;
    code?: string;
    details?: any;
}
export interface OAuthFlowOptions {
    action?: OAuthAction;
    redirectUrl?: string;
    state?: string;
    scope?: string[];
}
export interface OAuthTokenRefreshOptions {
    provider: OAuthProvider;
    providerId: string;
    refreshToken?: string;
}
export interface OAuthTokenRefreshResponse {
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
}
export interface OAuthConfig {
    providers?: Record<OAuthProvider, OAuthProviderConfig>;
    defaultRedirectUrl?: string;
    enableTokenRefresh?: boolean;
    tokenRefreshThreshold?: number;
}
export interface OAuthStateData {
    action: OAuthAction;
    userId?: string;
    redirectUrl?: string;
    csrfToken: string;
    timestamp: number;
}
export interface OAuthInitiateOptions {
    provider: OAuthProvider;
    action?: OAuthAction;
    userId?: string;
    redirectUrl?: string;
}
export interface OAuthUnlinkOptions {
    provider: OAuthProvider;
}
export interface OAuthLinkResult {
    success: boolean;
    message: string;
    provider: OAuthProvider;
}
export interface OAuthUnlinkResult {
    success: boolean;
    message: string;
    provider: OAuthProvider;
}
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
