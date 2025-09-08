import { HttpClient } from '../core/http-client';
import { AuthSession } from '../types';
import { OAuthProvider, OAuthInitiateResponse, OAuthCallbackData, ConnectedProvidersResponse, OAuthLinkOptions, OAuthFlowOptions, OAuthInitiateOptions, OAuthLinkResult, OAuthUnlinkResult, OAuthTokenRefreshOptions, OAuthTokenRefreshResponse } from '../types/oauth';
export declare class OAuthModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    initiateOAuth(provider: OAuthProvider, options?: Omit<OAuthFlowOptions, 'action'>): Promise<OAuthInitiateResponse>;
    handleOAuthCallback(provider: OAuthProvider, code: string, state: string): Promise<AuthSession>;
    linkOAuthProvider(provider: OAuthProvider, code: string, state: string): Promise<OAuthLinkResult>;
    initiateLinkProvider(provider: OAuthProvider, options?: OAuthLinkOptions): Promise<OAuthInitiateResponse>;
    unlinkOAuthProvider(provider: OAuthProvider): Promise<OAuthUnlinkResult>;
    getConnectedProviders(): Promise<ConnectedProvidersResponse>;
    getConnectionStats(): Promise<any>;
    getConnectionAuditTrail(limit?: number): Promise<any[]>;
    getProviderConnectionDetails(provider: OAuthProvider): Promise<any>;
    disconnectProvider(provider: OAuthProvider): Promise<OAuthUnlinkResult>;
    refreshProviderToken(provider: OAuthProvider): Promise<OAuthTokenRefreshResponse>;
    trackProviderUsage(provider: OAuthProvider, action?: string, metadata?: Record<string, any>): Promise<{
        success: boolean;
        message: string;
    }>;
    getProviderConnectionStatus(provider: OAuthProvider): Promise<{
        connected: boolean;
        provider: string;
        lastUsed?: Date;
    }>;
    bulkDisconnectProviders(providers: OAuthProvider[]): Promise<{
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
    }>;
    refreshOAuthToken(options: OAuthTokenRefreshOptions): Promise<OAuthTokenRefreshResponse>;
    generateOAuthURL(options: OAuthInitiateOptions): Promise<string>;
    isProviderConnected(provider: OAuthProvider): Promise<boolean>;
    getProviderInfo(provider: OAuthProvider): Promise<import("../types").ConnectedOAuthProvider | null>;
    unlinkMultipleProviders(providers: OAuthProvider[]): Promise<OAuthUnlinkResult[]>;
    getAvailableProviders(): Promise<OAuthProvider[]>;
    signInWithProvider(provider: OAuthProvider, redirectUrl?: string): Promise<OAuthInitiateResponse>;
    completeOAuthSignIn(callbackData: OAuthCallbackData): Promise<AuthSession>;
    completeProviderLinking(callbackData: OAuthCallbackData): Promise<OAuthLinkResult>;
    private handleOAuthError;
}
