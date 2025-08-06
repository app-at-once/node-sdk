"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const project_oauth_1 = require("../auth/project-oauth");
class AuthModule {
    constructor(httpClient) {
        this.currentUser = null;
        this.currentSession = null;
        this.authStateListeners = [];
        this.httpClient = httpClient;
        this.oauthModule = new project_oauth_1.ProjectOAuthModule(httpClient);
    }
    async signUp(credentials) {
        const response = await this.httpClient.post('/data/users/auth/signup', credentials);
        this.currentSession = response.data;
        this.currentUser = response.data.user;
        this.httpClient.updateApiKey(response.data.access_token);
        return response.data;
    }
    async signIn(credentials) {
        const response = await this.httpClient.post('/data/users/auth/signin', credentials);
        this.currentSession = response.data;
        this.currentUser = response.data.user;
        this.httpClient.updateApiKey(response.data.access_token);
        return response.data;
    }
    async signOut() {
        if (this.currentSession) {
            await this.httpClient.post('/data/users/auth/signout', {});
        }
        this.currentSession = null;
        this.currentUser = null;
        this.httpClient.updateApiKey('');
    }
    async refreshSession() {
        if (!this.currentSession?.refresh_token) {
            throw new Error('No refresh token available');
        }
        const response = await this.httpClient.post('/data/users/auth/refresh', {
            refresh_token: this.currentSession.refresh_token,
        });
        this.currentSession = response.data;
        this.currentUser = response.data.user;
        this.httpClient.updateApiKey(response.data.access_token);
        return response.data;
    }
    async getCurrentUser() {
        if (!this.currentUser) {
            try {
                const response = await this.httpClient.get('/data/users/auth/me');
                this.currentUser = response.data;
            }
            catch (error) {
                this.currentUser = null;
            }
        }
        return this.currentUser;
    }
    async updateUser(updates) {
        const response = await this.httpClient.patch('/data/users/auth/me', updates);
        this.currentUser = response.data;
        return response.data;
    }
    async changePassword(currentPassword, newPassword) {
        await this.httpClient.post('/data/users/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        });
    }
    async resetPassword(email) {
        await this.httpClient.post('/data/users/auth/reset-password', { email });
    }
    async confirmResetPassword(token, newPassword) {
        await this.httpClient.post('/data/users/auth/confirm-reset-password', {
            token,
            password: newPassword,
        });
    }
    async sendEmailVerification() {
        await this.httpClient.post('/data/users/auth/send-verification', {});
    }
    async verifyEmail(token) {
        await this.httpClient.post('/data/users/auth/verify-email', { token });
    }
    async getUserSessions() {
        const response = await this.httpClient.get('/data/sessions');
        return response.data;
    }
    async revokeSession(sessionId) {
        await this.httpClient.delete(`/data/sessions/${sessionId}`);
    }
    async revokeAllSessions() {
        await this.httpClient.delete('/data/sessions');
    }
    async enableMFA() {
        const response = await this.httpClient.post('/data/users/auth/mfa-enable', {});
        return response.data;
    }
    async verifyMFA(code) {
        await this.httpClient.post('/data/users/auth/mfa-verify', { code });
    }
    async disableMFA(password) {
        await this.httpClient.post('/data/users/auth/mfa-disable', { password });
    }
    async generateBackupCodes() {
        const response = await this.httpClient.post('/data/users/auth/mfa-backup-codes', {});
        return response.data;
    }
    getUser() {
        return this.currentUser;
    }
    getSession() {
        return this.currentSession;
    }
    isAuthenticated() {
        return !!this.currentSession && !!this.currentUser;
    }
    isSessionExpired() {
        if (!this.currentSession)
            return true;
        return Date.now() > this.currentSession.expires_at * 1000;
    }
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }
    notifyAuthStateChange(event) {
        this.authStateListeners.forEach(callback => {
            callback(event, this.currentSession);
        });
    }
    startAutoRefresh() {
        if (!this.currentSession)
            return;
        const refreshTime = (this.currentSession.expires_at * 1000) - Date.now() - 60000;
        if (refreshTime > 0) {
            setTimeout(async () => {
                try {
                    await this.refreshSession();
                    this.notifyAuthStateChange('TOKEN_REFRESHED');
                    this.startAutoRefresh();
                }
                catch (error) {
                    this.notifyAuthStateChange('TOKEN_REFRESH_FAILED');
                }
            }, refreshTime);
        }
    }
    async initiateOAuth(provider, options = {}) {
        return this.oauthModule.initiateOAuth(provider, options);
    }
    async handleOAuthCallback(provider, code, state) {
        const session = await this.oauthModule.handleOAuthCallback(provider, code, state);
        this.currentSession = session;
        this.currentUser = session.user;
        this.httpClient.updateApiKey(session.access_token);
        this.notifyAuthStateChange('OAUTH_SIGNIN');
        return session;
    }
    async signInWithProvider(provider, redirectUrl) {
        return this.oauthModule.signInWithProvider(provider, redirectUrl);
    }
    async completeOAuthSignIn(callbackData) {
        const session = await this.oauthModule.completeOAuthSignIn(callbackData);
        this.currentSession = session;
        this.currentUser = session.user;
        this.httpClient.updateApiKey(session.access_token);
        this.notifyAuthStateChange('OAUTH_SIGNIN');
        return session;
    }
    async linkOAuthProvider(provider, code, state) {
        const result = await this.oauthModule.linkOAuthProvider(provider, code, state);
        this.notifyAuthStateChange('OAUTH_PROVIDER_LINKED');
        return result;
    }
    async initiateLinkProvider(provider, options = {}) {
        return this.oauthModule.initiateLinkProvider(provider, options);
    }
    async unlinkOAuthProvider(provider) {
        const result = await this.oauthModule.unlinkOAuthProvider(provider);
        this.notifyAuthStateChange('OAUTH_PROVIDER_UNLINKED');
        return result;
    }
    async getConnectedProviders() {
        return this.oauthModule.getConnectedProviders();
    }
    async refreshOAuthToken(options) {
        return this.oauthModule.refreshOAuthToken(options);
    }
    async generateOAuthURL(provider, redirectUrl) {
        return this.oauthModule.generateOAuthURL({ provider, redirectUrl });
    }
    async isProviderConnected(provider) {
        return this.oauthModule.isProviderConnected(provider);
    }
    async getProviderInfo(provider) {
        return this.oauthModule.getProviderInfo(provider);
    }
    async unlinkMultipleProviders(providers) {
        const results = await this.oauthModule.unlinkMultipleProviders(providers);
        this.notifyAuthStateChange('OAUTH_PROVIDERS_UNLINKED');
        return results;
    }
    async getAvailableProviders() {
        return this.oauthModule.getAvailableProviders();
    }
    async completeProviderLinking(callbackData) {
        const result = await this.oauthModule.completeProviderLinking(callbackData);
        this.notifyAuthStateChange('OAUTH_PROVIDER_LINKED');
        return result;
    }
}
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.js.map