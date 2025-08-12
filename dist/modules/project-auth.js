"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectAuthModule = void 0;
class ProjectAuthModule {
    constructor(httpClient, options) {
        this.currentUser = null;
        this.currentSession = null;
        this.httpClient = httpClient;
        this.projectId = options?.projectId;
        this.appId = options?.appId;
    }
    setProject(projectId) {
        this.projectId = projectId;
    }
    setApp(appId) {
        this.appId = appId;
    }
    async signUp(credentials) {
        try {
            const response = await this.httpClient.post('/data/users/auth', {
                operation: 'signup',
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                metadata: credentials.metadata || {},
            });
            const session = response.data;
            this.currentSession = session;
            this.currentUser = session.user;
            this.httpClient.updateApiKey(session.access_token);
            return session;
        }
        catch (error) {
            if (error.message?.includes('already exists')) {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }
    async signIn(credentials) {
        try {
            const response = await this.httpClient.post('/data/users/auth', {
                operation: 'signin',
                email: credentials.email,
                password: credentials.password,
            });
            const session = response.data;
            this.currentSession = session;
            this.currentUser = session.user;
            this.httpClient.updateApiKey(session.access_token);
            return session;
        }
        catch (error) {
            if (error.message?.includes('Invalid') || error.message?.includes('password')) {
                throw new Error('Invalid email or password');
            }
            throw new Error('Authentication failed');
        }
    }
    async signOut() {
        this.currentSession = null;
        this.currentUser = null;
        this.httpClient.updateApiKey('');
    }
    async getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }
        try {
            const response = await this.httpClient.post('/data/users/auth', {
                operation: 'me',
            });
            this.currentUser = response.data.user;
            return this.currentUser;
        }
        catch (error) {
            return null;
        }
    }
    async updateUser(updates) {
        if (!this.currentUser) {
            throw new Error('No authenticated user');
        }
        try {
            const response = await this.httpClient.post('/data/users/auth', {
                operation: 'update_profile',
                ...updates,
            });
            this.currentUser = response.data.user;
            return this.currentUser;
        }
        catch (error) {
            throw new Error(error.message || 'Failed to update profile');
        }
    }
    async changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('No authenticated user');
        }
        try {
            await this.httpClient.post('/data/users/auth', {
                operation: 'change_password',
                current_password: currentPassword,
                new_password: newPassword,
            });
        }
        catch (error) {
            throw new Error(error.message || 'Failed to change password');
        }
    }
    async resetPassword(email) {
        try {
            await this.httpClient.post('/data/users/auth', {
                operation: 'reset_password',
                email,
            });
        }
        catch (error) {
        }
    }
    async refreshSession() {
        if (!this.currentSession?.refresh_token) {
            throw new Error('No refresh token available');
        }
        try {
            const response = await this.httpClient.post('/data/users/auth', {
                operation: 'refresh',
                refresh_token: this.currentSession.refresh_token,
            });
            const session = response.data;
            this.currentSession = session;
            this.currentUser = session.user;
            this.httpClient.updateApiKey(session.access_token);
            return session;
        }
        catch (error) {
            throw new Error('Failed to refresh session');
        }
    }
    getSession() {
        return this.currentSession;
    }
    isAuthenticated() {
        return !!this.currentSession && !!this.currentUser;
    }
}
exports.ProjectAuthModule = ProjectAuthModule;
//# sourceMappingURL=project-auth.js.map