"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthModule = void 0;
const constants_1 = require("../constants");
const oauth_1 = require("../types/oauth");
class OAuthModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async initiateOAuth(provider, options = {}) {
        try {
            const queryParams = new URLSearchParams({
                action: oauth_1.OAuthAction.SIGNIN,
                ...(options.redirectUrl && { redirectUrl: options.redirectUrl }),
            });
            const response = await this.httpClient.get(`/projects/auth/oauth/${provider}?${queryParams.toString()}`);
            let state = '';
            if (response.data.url && response.data.url.includes('state=')) {
                const url = new URL(response.data.url, constants_1.APPATONCE_BASE_URL);
                state = url.searchParams.get('state') || '';
            }
            return {
                url: response.data.url || response.data,
                state,
                provider,
                action: oauth_1.OAuthAction.SIGNIN,
            };
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async handleOAuthCallback(provider, code, state) {
        try {
            const response = await this.httpClient.post(`/projects/auth/oauth/${provider}/callback`, {
                code,
                state,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async linkOAuthProvider(provider, code, state) {
        try {
            const response = await this.httpClient.post(`/projects/auth/oauth/${provider}/callback`, {
                code,
                state,
            });
            return {
                success: true,
                message: response.data.message || `${provider} account linked successfully`,
                provider,
            };
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async initiateLinkProvider(provider, options = {}) {
        try {
            const response = await this.httpClient.post(`/projects/auth/oauth/${provider}/link`, {
                provider,
                redirectUrl: options.redirectUrl,
            });
            let state = '';
            if (response.data.url && response.data.url.includes('state=')) {
                const url = new URL(response.data.url, constants_1.APPATONCE_BASE_URL);
                state = url.searchParams.get('state') || '';
            }
            return {
                url: response.data.url || response.data,
                state,
                provider,
                action: oauth_1.OAuthAction.LINK,
            };
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async unlinkOAuthProvider(provider) {
        try {
            const response = await this.httpClient.delete(`/projects/auth/oauth/${provider}/unlink`);
            return {
                success: true,
                message: response.data.message || `${provider} account unlinked successfully`,
                provider,
            };
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async getConnectedProviders() {
        try {
            const response = await this.httpClient.get('/projects/auth/oauth-connections');
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error);
        }
    }
    async getConnectionStats() {
        try {
            const response = await this.httpClient.get('/projects/auth/oauth-connections/stats');
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error);
        }
    }
    async getConnectionAuditTrail(limit = 50) {
        try {
            const response = await this.httpClient.get(`/projects/auth/oauth-connections/audit?limit=${limit}`);
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error);
        }
    }
    async getProviderConnectionDetails(provider) {
        try {
            const response = await this.httpClient.get(`/projects/auth/oauth-connections/${provider}`);
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error);
        }
    }
    async disconnectProvider(provider) {
        try {
            const response = await this.httpClient.delete(`/projects/auth/oauth-connections/${provider}`);
            return {
                success: true,
                message: response.data.message || `${provider} account disconnected successfully`,
                provider,
            };
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async refreshProviderToken(provider) {
        try {
            const response = await this.httpClient.post(`/projects/auth/oauth-connections/${provider}/refresh-token`);
            return {
                success: true,
                expiresAt: response.data.expiresAt,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to refresh OAuth token',
            };
        }
    }
    async trackProviderUsage(provider, action, metadata) {
        try {
            const response = await this.httpClient.post(`/projects/auth/oauth-connections/${provider}/track-usage`, {
                action,
                metadata,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async getProviderConnectionStatus(provider) {
        try {
            const response = await this.httpClient.get(`/projects/auth/oauth-connections/${provider}/is-connected`);
            return response.data;
        }
        catch (error) {
            return {
                connected: false,
                provider,
            };
        }
    }
    async bulkDisconnectProviders(providers) {
        try {
            const response = await this.httpClient.post('/projects/auth/oauth-connections/bulk-disconnect', {
                providers,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error);
        }
    }
    async refreshOAuthToken(options) {
        return this.refreshProviderToken(options.provider);
    }
    async generateOAuthURL(options) {
        const result = await this.initiateOAuth(options.provider, {
            redirectUrl: options.redirectUrl,
        });
        return result.url;
    }
    async isProviderConnected(provider) {
        try {
            const connectedProviders = await this.getConnectedProviders();
            return connectedProviders.providers.some(p => p.provider === provider);
        }
        catch (error) {
            return false;
        }
    }
    async getProviderInfo(provider) {
        try {
            const connectedProviders = await this.getConnectedProviders();
            return connectedProviders.providers.find(p => p.provider === provider) || null;
        }
        catch (error) {
            return null;
        }
    }
    async unlinkMultipleProviders(providers) {
        const results = [];
        for (const provider of providers) {
            try {
                const result = await this.unlinkOAuthProvider(provider);
                results.push(result);
            }
            catch (error) {
                results.push({
                    success: false,
                    message: error.message || `Failed to unlink ${provider}`,
                    provider,
                });
            }
        }
        return results;
    }
    async getAvailableProviders() {
        try {
            const connectedProviders = await this.getConnectedProviders();
            return connectedProviders.availableProviders;
        }
        catch (error) {
            return Object.values(oauth_1.OAuthProvider);
        }
    }
    async signInWithProvider(provider, redirectUrl) {
        return this.initiateOAuth(provider, { redirectUrl });
    }
    async completeOAuthSignIn(callbackData) {
        return this.handleOAuthCallback(callbackData.provider, callbackData.code, callbackData.state);
    }
    async completeProviderLinking(callbackData) {
        return this.linkOAuthProvider(callbackData.provider, callbackData.code, callbackData.state);
    }
    handleOAuthError(error, provider) {
        const oauthError = new Error();
        if (error.response) {
            oauthError.message = error.response.data?.message || error.response.data?.error || 'OAuth request failed';
            oauthError.code = error.response.data?.code || `HTTP_${error.response.status}`;
            oauthError.details = error.response.data?.details;
        }
        else if (error.request) {
            oauthError.message = 'Network error during OAuth request';
            oauthError.code = 'NETWORK_ERROR';
        }
        else {
            oauthError.message = error.message || 'Unknown OAuth error';
            oauthError.code = 'UNKNOWN_ERROR';
        }
        oauthError.provider = provider;
        return oauthError;
    }
}
exports.OAuthModule = OAuthModule;
//# sourceMappingURL=oauth.js.map