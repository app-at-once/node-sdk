"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
class EmailModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async sendEmail(options) {
        const payload = {
            ...options,
            sendAt: options.sendAt?.toISOString(),
        };
        const response = await this.httpClient.post('/email/send', payload);
        return response.data;
    }
    async sendBulkEmail(options) {
        const payload = {
            ...options,
            sendAt: options.sendAt?.toISOString(),
        };
        const response = await this.httpClient.post('/email/send-bulk', payload);
        return response.data;
    }
    async sendTemplateEmail(templateId, options) {
        const payload = {
            templateId,
            ...options,
            sendAt: options.sendAt?.toISOString(),
        };
        const response = await this.httpClient.post('/email/send-template', payload);
        return response.data;
    }
    async getEmailStatus(emailId) {
        const response = await this.httpClient.get(`/email/${emailId}/status`);
        return response.data;
    }
    async getBulkEmailStatus(batchId) {
        const response = await this.httpClient.get(`/email/bulk/${batchId}/status`);
        return response.data;
    }
    async getEmailEvents(emailId, options) {
        const response = await this.httpClient.get(`/email/${emailId}/events`, {
            params: options,
        });
        return response.data;
    }
    async createTemplate(template) {
        const response = await this.httpClient.post('/email/templates', template);
        return response.data;
    }
    async updateTemplate(templateId, updates) {
        const response = await this.httpClient.patch(`/email/templates/${templateId}`, updates);
        return response.data;
    }
    async getTemplate(templateId) {
        const response = await this.httpClient.get(`/email/templates/${templateId}`);
        return response.data;
    }
    async listTemplates(options) {
        const response = await this.httpClient.get('/email/templates', {
            params: options,
        });
        return response.data;
    }
    async deleteTemplate(templateId) {
        await this.httpClient.delete(`/email/templates/${templateId}`);
    }
    async previewTemplate(templateId, variables) {
        const response = await this.httpClient.post(`/email/templates/${templateId}/preview`, {
            variables,
        });
        return response.data;
    }
    async testTemplate(templateId, options) {
        const response = await this.httpClient.post(`/email/templates/${templateId}/test`, options);
        return response.data;
    }
    async createContact(contact) {
        const response = await this.httpClient.post('/email/contacts', contact);
        return response.data;
    }
    async updateContact(contactId, updates) {
        const response = await this.httpClient.patch(`/email/contacts/${contactId}`, updates);
        return response.data;
    }
    async getContact(contactId) {
        const response = await this.httpClient.get(`/email/contacts/${contactId}`);
        return response.data;
    }
    async listContacts(options) {
        const response = await this.httpClient.get('/email/contacts', {
            params: options,
        });
        return response.data;
    }
    async deleteContact(contactId) {
        await this.httpClient.delete(`/email/contacts/${contactId}`);
    }
    async subscribeContact(contactId) {
        await this.httpClient.post(`/email/contacts/${contactId}/subscribe`);
    }
    async unsubscribeContact(contactId) {
        await this.httpClient.post(`/email/contacts/${contactId}/unsubscribe`);
    }
    async createList(list) {
        const response = await this.httpClient.post('/email/lists', list);
        return response.data;
    }
    async updateList(listId, updates) {
        const response = await this.httpClient.patch(`/email/lists/${listId}`, updates);
        return response.data;
    }
    async getList(listId) {
        const response = await this.httpClient.get(`/email/lists/${listId}`);
        return response.data;
    }
    async listLists() {
        const response = await this.httpClient.get('/email/lists');
        return response.data;
    }
    async deleteList(listId) {
        await this.httpClient.delete(`/email/lists/${listId}`);
    }
    async addContactToList(listId, contactId) {
        await this.httpClient.post(`/email/lists/${listId}/contacts`, { contactId });
    }
    async removeContactFromList(listId, contactId) {
        await this.httpClient.delete(`/email/lists/${listId}/contacts/${contactId}`);
    }
    async getListContacts(listId, options) {
        const response = await this.httpClient.get(`/email/lists/${listId}/contacts`, {
            params: options,
        });
        return response.data;
    }
    async createCampaign(campaign) {
        const payload = {
            ...campaign,
            sendAt: campaign.sendAt?.toISOString(),
        };
        const response = await this.httpClient.post('/email/campaigns', payload);
        return response.data;
    }
    async updateCampaign(campaignId, updates) {
        const payload = {
            ...updates,
            sendAt: updates.sendAt?.toISOString(),
        };
        const response = await this.httpClient.patch(`/email/campaigns/${campaignId}`, payload);
        return response.data;
    }
    async getCampaign(campaignId) {
        const response = await this.httpClient.get(`/email/campaigns/${campaignId}`);
        return response.data;
    }
    async listCampaigns(options) {
        const response = await this.httpClient.get('/email/campaigns', {
            params: options,
        });
        return response.data;
    }
    async sendCampaign(campaignId) {
        const response = await this.httpClient.post(`/email/campaigns/${campaignId}/send`);
        return response.data;
    }
    async cancelCampaign(campaignId) {
        await this.httpClient.post(`/email/campaigns/${campaignId}/cancel`);
    }
    async deleteCampaign(campaignId) {
        await this.httpClient.delete(`/email/campaigns/${campaignId}`);
    }
    async getEmailAnalytics(timeRange) {
        const params = {};
        if (timeRange) {
            params.start_date = timeRange.start.toISOString();
            params.end_date = timeRange.end.toISOString();
        }
        const response = await this.httpClient.get('/email/analytics', { params });
        return response.data;
    }
    async getDomainReputation() {
        const response = await this.httpClient.get('/email/reputation');
        return response.data;
    }
    async getSuppressionList(options) {
        const response = await this.httpClient.get('/email/suppressions', {
            params: options,
        });
        return response.data;
    }
    async removeFromSuppressionList(email) {
        await this.httpClient.delete(`/email/suppressions/${email}`);
    }
}
exports.EmailModule = EmailModule;
//# sourceMappingURL=email.js.map