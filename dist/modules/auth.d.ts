import { HttpClient } from '../core/http-client';
import { AuthUser, AuthSession, SignUpCredentials, SignInCredentials } from '../types';
import { OAuthProvider, OAuthInitiateResponse, OAuthCallbackData, ConnectedProvidersResponse, OAuthLinkOptions, OAuthLinkResult, OAuthUnlinkResult, OAuthFlowOptions, OAuthTokenRefreshOptions, OAuthTokenRefreshResponse } from '../types/oauth';
export declare class AuthModule {
    private httpClient;
    private currentUser;
    private currentSession;
    private oauthModule;
    constructor(httpClient: HttpClient);
    signUp(credentials: SignUpCredentials): Promise<AuthSession>;
    signIn(credentials: SignInCredentials): Promise<AuthSession | {
        mfa_required: boolean;
        user_id: string;
        message: string;
    }>;
    signOut(): Promise<void>;
    refreshSession(): Promise<AuthSession>;
    getCurrentUser(): Promise<AuthUser | null>;
    updateProfile(updates: Partial<AuthUser>): Promise<AuthUser>;
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    resetPassword(email: string): Promise<void>;
    confirmResetPassword(token: string, newPassword: string): Promise<void>;
    sendEmailVerification(): Promise<{
        message: string;
        expiresIn: number;
    }>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
        user?: {
            id: string;
            email: string;
            emailVerified: boolean;
        };
    }>;
    resendEmailVerification(): Promise<{
        message: string;
        expiresIn: number;
    }>;
    getEmailVerificationStatus(): Promise<{
        verified: boolean;
        pendingVerification: boolean;
        canResend: boolean;
        lastSentAt?: string;
        expiresAt?: string;
    }>;
    listUsers(options?: {
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
    }>;
    searchUsers(searchTerm: string, options?: {
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
    }>;
    getUserById(userId: string): Promise<AuthUser>;
    getUserStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        suspendedUsers: number;
        verifiedUsers: number;
        unverifiedUsers: number;
        newUsersThisMonth: number;
        newUsersThisWeek: number;
        lastSignupDate?: Date;
        userGrowthTrend?: Array<{
            date: Date;
            count: number;
        }>;
    }>;
    updateUser(userId: string, updates: {
        name?: string;
        email?: string;
        avatar?: string;
        metadata?: Record<string, any>;
        status?: 'active' | 'suspended';
        email_verified?: boolean;
    }): Promise<AuthUser>;
    suspendUser(userId: string, reason: string): Promise<AuthUser>;
    reactivateUser(userId: string): Promise<AuthUser>;
    deleteUser(userId: string, permanent?: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserActivityLogs(userId: string, options?: {
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
    }>;
    getUserSessions(): Promise<Array<{
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
    }>>;
    revokeSession(sessionId: string): Promise<{
        message: string;
    }>;
    revokeAllSessions(): Promise<{
        message: string;
        revokedCount: number;
    }>;
    revokeAllSessionsCompletely(): Promise<{
        message: string;
        revokedCount: number;
    }>;
    getSessionAnalytics(): Promise<{
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
    }>;
    getCurrentSession(): Promise<{
        id: string;
        deviceInfo: any;
        ipAddress: string | null;
        lastUsed: string;
        expiresAt: string;
    } | null>;
    refreshSessionWithToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_at: number;
        user: AuthUser;
        session: {
            id: string;
            expiresAt: string;
            deviceInfo: any;
        };
    }>;
    markSessionSuspicious(sessionId: string): Promise<{
        message: string;
    }>;
    cleanupExpiredSessions(): Promise<{
        message: string;
        cleanedCount: number;
    }>;
    generateMFASecret(): Promise<{
        secret: string;
        qr_code: string;
        backup_url: string;
    }>;
    enableMFA(code: string): Promise<{
        backup_codes: string[];
    }>;
    verifyMFA(code: string): Promise<{
        verified: boolean;
    }>;
    disableMFA(password: string): Promise<void>;
    generateBackupCodes(mfaCode: string): Promise<{
        codes: string[];
    }>;
    isMFAEnabled(): Promise<{
        enabled: boolean;
    }>;
    getMFAStatus(): Promise<{
        enabled: boolean;
        setupAt: string | null;
        backupCodesCount: number;
    }>;
    sendMagicLink(email: string, redirectTo?: string): Promise<{
        message: string;
        expires_in: number;
    }>;
    verifyMagicLink(token: string, email: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: AuthUser;
    }>;
    hasActiveMagicLink(email: string): Promise<boolean>;
    revokeMagicLinks(email: string): Promise<{
        success: boolean;
        revoked_count: number;
    }>;
    createTeam(data: {
        name: string;
        description?: string;
        settings?: any;
    }): Promise<any>;
    listUserTeams(): Promise<any[]>;
    getTeam(teamId: string): Promise<any>;
    inviteToTeam(teamId: string, data: {
        email: string;
        role?: 'admin' | 'member';
        message?: string;
    }): Promise<any>;
    acceptTeamInvitation(token: string): Promise<any>;
    listTeamMembers(teamId: string): Promise<any[]>;
    updateTeamMemberRole(teamId: string, memberId: string, role: 'admin' | 'member'): Promise<any>;
    removeTeamMember(teamId: string, memberId: string): Promise<void>;
    transferTeamOwnership(teamId: string, newOwnerId: string): Promise<void>;
    getUser(): AuthUser | null;
    getSession(): AuthSession | null;
    isAuthenticated(): boolean;
    isSessionExpired(): boolean;
    private authStateListeners;
    onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void;
    private notifyAuthStateChange;
    private startAutoRefresh;
    initiateOAuth(provider: OAuthProvider, options?: Omit<OAuthFlowOptions, 'action'>): Promise<OAuthInitiateResponse>;
    handleOAuthCallback(provider: OAuthProvider, code: string, state: string): Promise<AuthSession>;
    signInWithProvider(provider: OAuthProvider, redirectUrl?: string): Promise<OAuthInitiateResponse>;
    completeOAuthSignIn(callbackData: OAuthCallbackData): Promise<AuthSession>;
    linkOAuthProvider(provider: OAuthProvider, code: string, state: string): Promise<OAuthLinkResult>;
    initiateLinkProvider(provider: OAuthProvider, options?: OAuthLinkOptions): Promise<OAuthInitiateResponse>;
    unlinkOAuthProvider(provider: OAuthProvider): Promise<OAuthUnlinkResult>;
    getConnectedProviders(): Promise<ConnectedProvidersResponse>;
    refreshOAuthToken(options: OAuthTokenRefreshOptions): Promise<OAuthTokenRefreshResponse>;
    generateOAuthURL(provider: OAuthProvider, redirectUrl?: string): Promise<string>;
    isProviderConnected(provider: OAuthProvider): Promise<boolean>;
    getProviderInfo(provider: OAuthProvider): Promise<import("../types").ConnectedOAuthProvider | null>;
    unlinkMultipleProviders(providers: OAuthProvider[]): Promise<OAuthUnlinkResult[]>;
    getAvailableProviders(): Promise<OAuthProvider[]>;
    completeProviderLinking(callbackData: OAuthCallbackData): Promise<OAuthLinkResult>;
}
