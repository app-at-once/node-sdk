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
        const response = await this.httpClient.post('/projects/auth/signup', credentials);
        this.currentSession = response.data;
        this.currentUser = response.data.user;
        this.httpClient.updateApiKey(response.data.access_token);
        return response.data;
    }
    async signIn(credentials) {
        const response = await this.httpClient.post('/projects/auth/signin', credentials);
        if (response.data.mfa_required) {
            return response.data;
        }
        this.currentSession = response.data;
        this.currentUser = response.data.user;
        this.httpClient.updateApiKey(response.data.access_token);
        return response.data;
    }
    async signOut() {
        if (this.currentSession) {
            await this.httpClient.post('/projects/auth/signout', {});
        }
        this.currentSession = null;
        this.currentUser = null;
        this.httpClient.updateApiKey('');
    }
    async refreshSession() {
        if (!this.currentSession?.refresh_token) {
            throw new Error('No refresh token available');
        }
        const response = await this.httpClient.post('/projects/auth/refresh', {
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
                const response = await this.httpClient.get('/projects/auth/me');
                this.currentUser = response.data;
            }
            catch (error) {
                this.currentUser = null;
            }
        }
        return this.currentUser;
    }
    async updateProfile(updates) {
        const response = await this.httpClient.patch('/projects/auth/me', updates);
        this.currentUser = response.data;
        return response.data;
    }
    async changePassword(currentPassword, newPassword) {
        await this.httpClient.post('/projects/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        });
    }
    async resetPassword(email) {
        await this.httpClient.post('/projects/auth/reset-password', { email });
    }
    async confirmResetPassword(token, newPassword) {
        await this.httpClient.post('/projects/auth/confirm-reset-password', {
            token,
            password: newPassword,
        });
    }
    async sendEmailVerification() {
        const response = await this.httpClient.post('/projects/auth/resend-verification', {});
        return response.data;
    }
    async verifyEmail(token) {
        const response = await this.httpClient.post('/projects/auth/verify-email', { token });
        return response.data;
    }
    async resendEmailVerification() {
        const response = await this.httpClient.post('/projects/auth/resend-verification', {});
        return response.data;
    }
    async getEmailVerificationStatus() {
        const response = await this.httpClient.get('/projects/auth/verification-status');
        return response.data;
    }
    async listUsers(options) {
        const params = {};
        if (options?.page)
            params.page = options.page;
        if (options?.limit)
            params.limit = options.limit;
        if (options?.cursor)
            params.cursor = options.cursor;
        if (options?.email)
            params.email = options.email;
        if (options?.name)
            params.name = options.name;
        if (options?.status)
            params.status = options.status;
        if (options?.verified !== undefined)
            params.verified = options.verified;
        if (options?.createdAfter)
            params.createdAfter = options.createdAfter.toISOString();
        if (options?.createdBefore)
            params.createdBefore = options.createdBefore.toISOString();
        if (options?.sortField)
            params.sortField = options.sortField;
        if (options?.sortDirection)
            params.sortDirection = options.sortDirection;
        const response = await this.httpClient.get('/projects/auth/users', { params });
        return response.data;
    }
    async searchUsers(searchTerm, options) {
        const params = { q: searchTerm };
        if (options?.page)
            params.page = options.page;
        if (options?.limit)
            params.limit = options.limit;
        if (options?.sortField)
            params.sortField = options.sortField;
        if (options?.sortDirection)
            params.sortDirection = options.sortDirection;
        const response = await this.httpClient.get('/projects/auth/users/search', { params });
        return response.data;
    }
    async getUserById(userId) {
        const response = await this.httpClient.get(`/projects/auth/users/${userId}`);
        return response.data;
    }
    async getUserStats() {
        const response = await this.httpClient.get('/projects/auth/users/stats');
        return response.data;
    }
    async updateUser(userId, updates) {
        const response = await this.httpClient.put(`/projects/auth/users/${userId}`, updates);
        return response.data;
    }
    async suspendUser(userId, reason) {
        const response = await this.httpClient.post(`/projects/auth/users/${userId}/suspend`, { reason });
        return response.data;
    }
    async reactivateUser(userId) {
        const response = await this.httpClient.post(`/projects/auth/users/${userId}/reactivate`);
        return response.data;
    }
    async deleteUser(userId, permanent = false) {
        const params = permanent ? { permanent: true } : {};
        const response = await this.httpClient.delete(`/projects/auth/users/${userId}`, { params });
        return response.data;
    }
    async getUserActivityLogs(userId, options) {
        const params = {};
        if (options?.page)
            params.page = options.page;
        if (options?.limit)
            params.limit = options.limit;
        const response = await this.httpClient.get(`/tenant/users/${userId}/activity`, { params });
        return response.data;
    }
    async getUserSessions() {
        const response = await this.httpClient.get('/projects/auth/sessions');
        return response.data;
    }
    async revokeSession(sessionId) {
        const response = await this.httpClient.delete(`/projects/auth/sessions/${sessionId}`);
        return response.data;
    }
    async revokeAllSessions() {
        const response = await this.httpClient.delete('/projects/auth/sessions');
        return response.data;
    }
    async revokeAllSessionsCompletely() {
        const response = await this.httpClient.post('/projects/auth/sessions/revoke-all');
        return response.data;
    }
    async getSessionAnalytics() {
        const response = await this.httpClient.get('/projects/auth/sessions/analytics');
        return response.data;
    }
    async getCurrentSession() {
        const response = await this.httpClient.get('/projects/auth/sessions/current');
        return response.data;
    }
    async refreshSessionWithToken(refreshToken) {
        const response = await this.httpClient.post('/projects/auth/sessions/refresh', {
            refreshToken,
        });
        this.currentSession = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expires_at: response.data.expires_at,
            user: response.data.user,
        };
        this.currentUser = response.data.user;
        this.httpClient.updateApiKey(response.data.access_token);
        this.notifyAuthStateChange('SESSION_REFRESHED');
        return response.data;
    }
    async markSessionSuspicious(sessionId) {
        const response = await this.httpClient.post(`/projects/auth/sessions/mark-suspicious/${sessionId}`);
        return response.data;
    }
    async cleanupExpiredSessions() {
        const response = await this.httpClient.post('/projects/auth/sessions/cleanup-expired');
        return response.data;
    }
    async generateMFASecret() {
        const response = await this.httpClient.post('/projects/auth/mfa/generate-secret', {});
        return response.data;
    }
    async enableMFA(code) {
        const response = await this.httpClient.post('/projects/auth/mfa/enable', { code });
        return response.data;
    }
    async verifyMFA(code) {
        const response = await this.httpClient.post('/projects/auth/mfa/verify', { code });
        return response.data;
    }
    async disableMFA(password) {
        await this.httpClient.post('/projects/auth/mfa/disable', { password });
    }
    async generateBackupCodes(mfaCode) {
        const response = await this.httpClient.post('/projects/auth/mfa/backup-codes', { mfaCode });
        return response.data;
    }
    async isMFAEnabled() {
        const response = await this.httpClient.get('/projects/auth/mfa/enabled');
        return response.data;
    }
    async getMFAStatus() {
        const response = await this.httpClient.get('/projects/auth/mfa/status');
        return response.data;
    }
    async sendMagicLink(email, redirectTo) {
        const response = await this.httpClient.post('/projects/auth/magic-link/send', {
            email,
            redirectTo
        });
        return response.data;
    }
    async verifyMagicLink(token, email) {
        const response = await this.httpClient.post('/projects/auth/magic-link/verify', {
            token,
            email
        });
        this.currentUser = response.data.user;
        this.currentSession = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            user: response.data.user,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
        };
        this.notifyAuthStateChange('SIGNED_IN');
        return response.data;
    }
    async hasActiveMagicLink(email) {
        const response = await this.httpClient.post('/projects/auth/magic-link/check', { email });
        return response.data.has_active_link;
    }
    async revokeMagicLinks(email) {
        const response = await this.httpClient.post('/projects/auth/magic-link/revoke', { email });
        return response.data;
    }
    async createTeam(data) {
        const response = await this.httpClient.post('/projects/auth/teams', data);
        return response.data;
    }
    async listUserTeams() {
        const response = await this.httpClient.get('/projects/auth/teams/user');
        return response.data;
    }
    async getTeam(teamId) {
        const response = await this.httpClient.get(`/projects/auth/teams/${teamId}`);
        return response.data;
    }
    async inviteToTeam(teamId, data) {
        const response = await this.httpClient.post(`/projects/auth/teams/${teamId}/invite`, data);
        return response.data;
    }
    async acceptTeamInvitation(token) {
        const response = await this.httpClient.post('/projects/auth/teams/accept-invite', { token });
        return response.data;
    }
    async listTeamMembers(teamId) {
        const response = await this.httpClient.get(`/projects/auth/teams/${teamId}/members`);
        return response.data;
    }
    async updateTeamMemberRole(teamId, memberId, role) {
        const response = await this.httpClient.put(`/projects/auth/teams/${teamId}/members/${memberId}/role`, { role });
        return response.data;
    }
    async removeTeamMember(teamId, memberId) {
        await this.httpClient.delete(`/projects/auth/teams/${teamId}/members/${memberId}`);
    }
    async transferTeamOwnership(teamId, newOwnerId) {
        await this.httpClient.post(`/projects/auth/teams/${teamId}/transfer-ownership`, { newOwnerId });
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