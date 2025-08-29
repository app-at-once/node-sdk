"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectOAuthModule = void 0;
class ProjectOAuthModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async initiateProjectOAuth(projectId, provider, options = {}) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/${provider}/initiate`, {
                redirectUri: options.redirectUri,
                scope: options.scope,
                state: options.state,
                prompt: options.prompt,
                loginHint: options.loginHint,
                pkce: options.pkce,
            });
            return {
                url: response.data.url,
                state: response.data.state,
                provider,
                projectId,
                codeVerifier: response.data.codeVerifier,
            };
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async handleProjectOAuthCallback(projectId, provider, params) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/${provider}/callback`, params);
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async exchangeProjectOAuthToken(projectId, code, state, options = {}) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/token`, {
                code,
                state,
                codeVerifier: options.codeVerifier,
                redirectUri: options.redirectUri,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId);
        }
    }
    async getProjectOAuthProviders(projectId) {
        try {
            const response = await this.httpClient.get(`/projects/${projectId}/oauth/providers`);
            return response.data.providers || [];
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId);
        }
    }
    async configureProjectOAuthProvider(projectId, provider, config) {
        try {
            await this.httpClient.put(`/projects/${projectId}/oauth/providers/${provider}`, config);
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async testProjectOAuthProvider(projectId, provider) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/providers/${provider}/test`);
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async getProjectOAuthCallbackUrl(projectId, provider) {
        try {
            const response = await this.httpClient.get(`/projects/${projectId}/oauth/providers/${provider}/callback-url`);
            return response.data.url;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async getProjectOAuthUserInfo(projectId, provider, accessToken) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/${provider}/userinfo`, { accessToken });
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async refreshProjectOAuthToken(projectId, provider, options) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/${provider}/refresh`, options);
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async enableProjectOAuthProvider(projectId, provider) {
        try {
            await this.httpClient.post(`/projects/${projectId}/oauth/providers/${provider}/enable`);
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async disableProjectOAuthProvider(projectId, provider) {
        try {
            await this.httpClient.post(`/projects/${projectId}/oauth/providers/${provider}/disable`);
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async deleteProjectOAuthProvider(projectId, provider) {
        try {
            await this.httpClient.delete(`/projects/${projectId}/oauth/providers/${provider}`);
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async getProjectOAuthProviderStatus(projectId, provider) {
        try {
            const response = await this.httpClient.get(`/projects/${projectId}/oauth/providers/${provider}/status`);
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async configureMultipleProviders(projectId, configs) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/providers/bulk`, { providers: configs });
            return response.data.results || [];
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId);
        }
    }
    async getOAuthProviderTemplates() {
        try {
            const response = await this.httpClient.get('/oauth/templates');
            return response.data.templates || [];
        }
        catch (error) {
            throw this.handleProjectOAuthError(error);
        }
    }
    async getProjectOAuthAnalytics(projectId) {
        try {
            const response = await this.httpClient.get(`/projects/${projectId}/oauth/analytics`);
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId);
        }
    }
    async createProjectOAuthSession(projectId, provider, providerData) {
        try {
            const response = await this.httpClient.post(`/projects/${projectId}/oauth/sessions`, {
                provider,
                ...providerData,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    async revokeProjectOAuthSession(projectId, userId, provider) {
        try {
            await this.httpClient.delete(`/projects/${projectId}/oauth/sessions/${userId}/${provider}`);
        }
        catch (error) {
            throw this.handleProjectOAuthError(error, projectId, provider);
        }
    }
    handleProjectOAuthError(error, projectId, provider) {
        const oauthError = new Error();
        if (error.response) {
            oauthError.message =
                error.response.data?.message ||
                    error.response.data?.error ||
                    'Project OAuth request failed';
            oauthError.code = error.response.data?.code || `HTTP_${error.response.status}`;
            oauthError.details = error.response.data?.details;
        }
        else if (error.request) {
            oauthError.message = 'Network error during project OAuth request';
            oauthError.code = 'NETWORK_ERROR';
        }
        else {
            oauthError.message = error.message || 'Unknown project OAuth error';
            oauthError.code = 'UNKNOWN_ERROR';
        }
        oauthError.projectId = projectId;
        oauthError.provider = provider;
        return oauthError;
    }
}
exports.ProjectOAuthModule = ProjectOAuthModule;
//# sourceMappingURL=index.js.map