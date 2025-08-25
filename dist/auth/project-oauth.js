"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectOAuthModule = void 0;
const constants_1 = require("../constants");
const oauth_1 = require("../types/oauth");
class ProjectOAuthModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async initiateOAuth(provider, options = {}) {
        try {
            const queryParams = new URLSearchParams({
                action: oauth_1.OAuthAction.SIGNIN,
                ...(options.redirectUrl && { redirectUrl: options.redirectUrl }),
            });
            const response = await this.httpClient.get(`/data/oauth/${provider}?${queryParams.toString()}`);
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
            const response = await this.httpClient.post(`/data/oauth/${provider}/callback`, {
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
            const response = await this.httpClient.post(`/data/oauth/${provider}/link`, {
                code,
                state,
            });
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async initiateLinkProvider(provider, options = {}) {
        try {
            const queryParams = new URLSearchParams({
                action: oauth_1.OAuthAction.LINK,
                ...(options.redirectUrl && { redirectUrl: options.redirectUrl }),
            });
            const response = await this.httpClient.get(`/data/oauth/${provider}?${queryParams.toString()}`);
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
            const response = await this.httpClient.delete(`/data/oauth/${provider}`);
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error, provider);
        }
    }
    async getConnectedProviders() {
        try {
            const response = await this.httpClient.get('/data/oauth/providers');
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error);
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
    async refreshOAuthToken(options) {
        try {
            const response = await this.httpClient.post(`/data/oauth/${options.provider}/refresh`, options);
            return response.data;
        }
        catch (error) {
            throw this.handleOAuthError(error, options.provider);
        }
    }
    async generateOAuthURL(options) {
        const response = await this.initiateOAuth(options.provider, {
            redirectUrl: options.redirectUrl,
        });
        return response.url;
    }
    async isProviderConnected(provider) {
        try {
            const providers = await this.getConnectedProviders();
            return providers.providers.some(p => p.provider === provider);
        }
        catch (error) {
            return false;
        }
    }
    async getProviderInfo(provider) {
        try {
            const providers = await this.getConnectedProviders();
            return providers.providers.find(p => p.provider === provider) || null;
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
                    message: `Failed to unlink ${provider}`,
                    provider,
                });
            }
        }
        return results;
    }
    async getAvailableProviders() {
        try {
            const response = await this.httpClient.get('/data/oauth/available');
            return response.data;
        }
        catch (error) {
            return [
                oauth_1.OAuthProvider.GOOGLE,
                oauth_1.OAuthProvider.GITHUB,
                oauth_1.OAuthProvider.MICROSOFT,
                oauth_1.OAuthProvider.FACEBOOK,
                oauth_1.OAuthProvider.TWITTER,
            ];
        }
    }
    handleOAuthError(error, provider) {
        const baseError = {
            name: 'OAuthError',
            code: error.response?.data?.error || 'OAUTH_ERROR',
            message: error.response?.data?.message || error.message || 'OAuth operation failed',
            provider,
        };
        if (error.response?.status === 401) {
            baseError.code = 'OAUTH_UNAUTHORIZED';
            baseError.message = 'OAuth authentication failed';
        }
        else if (error.response?.status === 400) {
            baseError.code = 'OAUTH_INVALID_REQUEST';
            baseError.message = 'Invalid OAuth request';
        }
        else if (error.response?.status === 403) {
            baseError.code = 'OAUTH_FORBIDDEN';
            baseError.message = 'OAuth access denied';
        }
        return baseError;
    }
}
exports.ProjectOAuthModule = ProjectOAuthModule;
//# sourceMappingURL=project-oauth.js.map