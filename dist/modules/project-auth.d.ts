import { HttpClient } from '../core/http-client';
import { AuthUser, AuthSession, SignUpCredentials, SignInCredentials } from '../types';
export declare class ProjectAuthModule {
    private httpClient;
    private projectId?;
    private appId?;
    private currentUser;
    private currentSession;
    constructor(httpClient: HttpClient, options?: {
        projectId?: string;
        appId?: string;
    });
    setProject(projectId: string): void;
    setApp(appId: string): void;
    signUp(credentials: SignUpCredentials): Promise<AuthSession>;
    signIn(credentials: SignInCredentials): Promise<AuthSession>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<AuthUser | null>;
    updateUser(updates: Partial<AuthUser>): Promise<AuthUser>;
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    resetPassword(email: string): Promise<void>;
    refreshSession(): Promise<AuthSession>;
    getSession(): AuthSession | null;
    isAuthenticated(): boolean;
}
