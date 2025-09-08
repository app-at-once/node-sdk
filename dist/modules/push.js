"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushModule = void 0;
class PushModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async send(options) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const payload = {
            ...options,
            scheduledAt: options.scheduledAt?.toISOString(),
        };
        const response = await this.httpClient.post(`/apps/${appId}/push/send`, payload);
        return response.data;
    }
    async sendBulk(notifications) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.post(`/apps/${appId}/push/send-bulk`, {
            notifications,
        });
        return response.data;
    }
    async sendWithTemplate(templateId, options) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const payload = {
            templateId,
            ...options,
            scheduledAt: options.scheduledAt?.toISOString(),
        };
        const response = await this.httpClient.post(`/apps/${appId}/push/send-template`, payload);
        return response.data;
    }
    async registerDevice(device) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.post(`/apps/${appId}/push/device/register`, device);
        return response.data;
    }
    async unregisterDevice(deviceToken) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        await this.httpClient.delete(`/apps/${appId}/push/device/${deviceToken}`);
    }
    async updateDevice(deviceToken, updates) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.patch(`/apps/${appId}/push/device/${deviceToken}`, updates);
        return response.data;
    }
    async getDevice(deviceToken) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/device/${deviceToken}`);
        return response.data;
    }
    async listDevices(options) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/devices`, {
            params: options,
        });
        return response.data;
    }
    async createTemplate(template) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.post(`/apps/${appId}/push/templates`, template);
        return response.data;
    }
    async updateTemplate(templateId, updates) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.patch(`/apps/${appId}/push/templates/${templateId}`, updates);
        return response.data;
    }
    async getTemplate(templateId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/templates/${templateId}`);
        return response.data;
    }
    async listTemplates(options) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/templates`, {
            params: options,
        });
        return response.data;
    }
    async deleteTemplate(templateId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        await this.httpClient.delete(`/apps/${appId}/push/templates/${templateId}`);
    }
    async previewTemplate(templateId, variables) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.post(`/apps/${appId}/push/templates/${templateId}/preview`, { variables });
        return response.data;
    }
    async createCampaign(campaign) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const payload = {
            ...campaign,
            scheduledAt: campaign.scheduledAt?.toISOString(),
            expiresAt: campaign.expiresAt?.toISOString(),
            segment: campaign.segment ? {
                ...campaign.segment,
                lastActiveAfter: campaign.segment.lastActiveAfter?.toISOString(),
            } : undefined,
        };
        const response = await this.httpClient.post(`/apps/${appId}/push/campaigns`, payload);
        return response.data;
    }
    async updateCampaign(campaignId, updates) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const payload = {
            ...updates,
            scheduledAt: updates.scheduledAt?.toISOString(),
            expiresAt: updates.expiresAt?.toISOString(),
        };
        const response = await this.httpClient.patch(`/apps/${appId}/push/campaigns/${campaignId}`, payload);
        return response.data;
    }
    async getCampaign(campaignId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/campaigns/${campaignId}`);
        return response.data;
    }
    async listCampaigns(options) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/campaigns`, {
            params: options,
        });
        return response.data;
    }
    async launchCampaign(campaignId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.post(`/apps/${appId}/push/campaigns/${campaignId}/launch`);
        return response.data;
    }
    async cancelCampaign(campaignId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        await this.httpClient.post(`/apps/${appId}/push/campaigns/${campaignId}/cancel`);
    }
    async deleteCampaign(campaignId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        await this.httpClient.delete(`/apps/${appId}/push/campaigns/${campaignId}`);
    }
    async trackDelivered(messageId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        await this.httpClient.post(`/apps/${appId}/push/track/delivered/${messageId}`);
    }
    async trackOpened(messageId, userId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        await this.httpClient.post(`/apps/${appId}/push/track/opened/${messageId}`, {
            userId,
        });
    }
    async getMessageStatus(messageId) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/messages/${messageId}`);
        return response.data;
    }
    async getLogs(options) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const params = { ...options };
        if (options?.from)
            params.from = options.from.toISOString();
        if (options?.to)
            params.to = options.to.toISOString();
        const response = await this.httpClient.get(`/apps/${appId}/push/logs`, { params });
        return response.data;
    }
    async getStats(from, to) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const params = {};
        if (from)
            params.from = from.toISOString();
        if (to)
            params.to = to.toISOString();
        const response = await this.httpClient.get(`/apps/${appId}/push/stats`, { params });
        return response.data;
    }
    async getAnalytics(timeRange) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const params = {};
        if (timeRange) {
            params.start_date = timeRange.start.toISOString();
            params.end_date = timeRange.end.toISOString();
        }
        const response = await this.httpClient.get(`/apps/${appId}/push/analytics`, { params });
        return response.data;
    }
    async getConfig() {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.get(`/apps/${appId}/push/config`);
        return response.data;
    }
    async updateConfig(config) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        await this.httpClient.put(`/apps/${appId}/push/config`, config);
    }
    async sendTest(deviceToken, platform) {
        const appIdResponse = await this.httpClient.get('/projects/auth/me');
        const appId = appIdResponse.data.appId;
        const response = await this.httpClient.post(`/apps/${appId}/push/test`, {
            deviceToken,
            platform,
        });
        return response.data;
    }
}
exports.PushModule = PushModule;
//# sourceMappingURL=push.js.map