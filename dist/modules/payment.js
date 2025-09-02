"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
class PaymentModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async createPaymentMethod(paymentMethod) {
        const response = await this.httpClient.post('/payment/methods', paymentMethod);
        return response.data;
    }
    async listPaymentMethods(options) {
        const response = await this.httpClient.get('/payment/methods', { params: options });
        return response.data;
    }
    async getPaymentMethod(methodId) {
        const response = await this.httpClient.get(`/payment/methods/${methodId}`);
        return response.data;
    }
    async updatePaymentMethod(methodId, updates) {
        const response = await this.httpClient.patch(`/payment/methods/${methodId}`, updates);
        return response.data;
    }
    async deletePaymentMethod(methodId) {
        await this.httpClient.delete(`/payment/methods/${methodId}`);
    }
    async createTransaction(transaction) {
        const response = await this.httpClient.post('/payment/transactions', transaction);
        return response.data;
    }
    async captureTransaction(transactionId, amount) {
        const response = await this.httpClient.post(`/payment/transactions/${transactionId}/capture`, { amount });
        return response.data;
    }
    async refundTransaction(transactionId, amount, reason) {
        const response = await this.httpClient.post(`/payment/transactions/${transactionId}/refund`, {
            amount,
            reason
        });
        return response.data;
    }
    async getTransaction(transactionId) {
        const response = await this.httpClient.get(`/payment/transactions/${transactionId}`);
        return response.data;
    }
    async listTransactions(options) {
        const response = await this.httpClient.get('/payment/transactions', { params: options });
        return response.data;
    }
    async createSubscription(subscription) {
        const response = await this.httpClient.post('/payment/subscriptions', subscription);
        return response.data;
    }
    async getSubscription(subscriptionId) {
        const response = await this.httpClient.get(`/payment/subscriptions/${subscriptionId}`);
        return response.data;
    }
    async updateSubscription(subscriptionId, updates) {
        const response = await this.httpClient.patch(`/payment/subscriptions/${subscriptionId}`, updates);
        return response.data;
    }
    async pauseSubscription(subscriptionId) {
        const response = await this.httpClient.post(`/payment/subscriptions/${subscriptionId}/pause`);
        return response.data;
    }
    async resumeSubscription(subscriptionId) {
        const response = await this.httpClient.post(`/payment/subscriptions/${subscriptionId}/resume`);
        return response.data;
    }
    async cancelSubscription(subscriptionId, options) {
        const response = await this.httpClient.post(`/payment/subscriptions/${subscriptionId}/cancel`, options);
        return response.data;
    }
    async listSubscriptions(options) {
        const response = await this.httpClient.get('/payment/subscriptions', { params: options });
        return response.data;
    }
    async createPlan(plan) {
        const response = await this.httpClient.post('/payment/plans', plan);
        return response.data;
    }
    async getPlan(planId) {
        const response = await this.httpClient.get(`/payment/plans/${planId}`);
        return response.data;
    }
    async updatePlan(planId, updates) {
        const response = await this.httpClient.patch(`/payment/plans/${planId}`, updates);
        return response.data;
    }
    async listPlans(options) {
        const response = await this.httpClient.get('/payment/plans', { params: options });
        return response.data;
    }
    async deletePlan(planId) {
        await this.httpClient.delete(`/payment/plans/${planId}`);
    }
    async createPaymentLink(link) {
        const response = await this.httpClient.post('/payment/links', link);
        return response.data;
    }
    async getPaymentLink(linkId) {
        const response = await this.httpClient.get(`/payment/links/${linkId}`);
        return response.data;
    }
    async createInvoice(invoice) {
        const response = await this.httpClient.post('/payment/invoices', invoice);
        return response.data;
    }
    async sendInvoice(invoiceId) {
        await this.httpClient.post(`/payment/invoices/${invoiceId}/send`);
    }
    async markInvoiceAsPaid(invoiceId, transaction_id) {
        await this.httpClient.post(`/payment/invoices/${invoiceId}/mark-paid`, { transaction_id });
    }
    async createPaymentWebhook(webhook) {
        const response = await this.httpClient.post('/payment/webhooks', webhook);
        return response.data;
    }
    async verifyWebhookSignature(_payload, _signature, _secret) {
        return Promise.resolve(true);
    }
    async getPaymentAnalytics(options) {
        const response = await this.httpClient.get('/payment/analytics', { params: options });
        return response.data;
    }
}
exports.PaymentModule = PaymentModule;
//# sourceMappingURL=payment.js.map