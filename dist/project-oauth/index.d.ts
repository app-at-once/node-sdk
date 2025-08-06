import { HttpClient } from '../core/http-client';
import { ProjectOAuthProvider, ProjectUserSession, ProjectAuthToken, ProjectOAuthInitiateResponse, ProjectOAuthCallbackParams, ProjectOAuthConfig, TestResult, ProjectOAuthInitiateOptions, ProjectOAuthTokenExchangeOptions, ProjectOAuthUserInfo, ProjectOAuthSessionWithUser, ProjectOAuthTokenRefreshOptions, ProjectOAuthTokenRefreshResponse, ProjectOAuthProviderStatus, ProjectOAuthBulkConfigResult, OAuthProviderTemplate, ProjectOAuthAnalytics } from '../types/project-oauth';
export declare class ProjectOAuthModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    initiateProjectOAuth(projectId: string, provider: string, options?: ProjectOAuthInitiateOptions): Promise<ProjectOAuthInitiateResponse>;
    handleProjectOAuthCallback(projectId: string, provider: string, params: ProjectOAuthCallbackParams): Promise<ProjectUserSession>;
    exchangeProjectOAuthToken(projectId: string, code: string, state: string, options?: ProjectOAuthTokenExchangeOptions): Promise<ProjectAuthToken>;
    getProjectOAuthProviders(projectId: string): Promise<ProjectOAuthProvider[]>;
    configureProjectOAuthProvider(projectId: string, provider: string, config: ProjectOAuthConfig): Promise<void>;
    testProjectOAuthProvider(projectId: string, provider: string): Promise<TestResult>;
    getProjectOAuthCallbackUrl(projectId: string, provider: string): Promise<string>;
    getProjectOAuthUserInfo(projectId: string, provider: string, accessToken: string): Promise<ProjectOAuthUserInfo>;
    refreshProjectOAuthToken(projectId: string, provider: string, options: ProjectOAuthTokenRefreshOptions): Promise<ProjectOAuthTokenRefreshResponse>;
    enableProjectOAuthProvider(projectId: string, provider: string): Promise<void>;
    disableProjectOAuthProvider(projectId: string, provider: string): Promise<void>;
    deleteProjectOAuthProvider(projectId: string, provider: string): Promise<void>;
    getProjectOAuthProviderStatus(projectId: string, provider: string): Promise<ProjectOAuthProviderStatus>;
    configureMultipleProviders(projectId: string, configs: Array<{
        provider: string;
        config: ProjectOAuthConfig;
    }>): Promise<ProjectOAuthBulkConfigResult[]>;
    getOAuthProviderTemplates(): Promise<OAuthProviderTemplate[]>;
    getProjectOAuthAnalytics(projectId: string): Promise<ProjectOAuthAnalytics>;
    createProjectOAuthSession(projectId: string, provider: string, providerData: {
        accessToken: string;
        refreshToken?: string;
        expiresIn?: number;
        userInfo: ProjectOAuthUserInfo;
    }): Promise<ProjectOAuthSessionWithUser>;
    revokeProjectOAuthSession(projectId: string, userId: string, provider: string): Promise<void>;
    private handleProjectOAuthError;
}
