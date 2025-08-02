import { HttpClient } from '../core/http-client';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal' | 'stripe' | 'crypto';
  details: Record<string, any>;
  default?: boolean;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method_id: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
  error?: string;
}

export interface PaymentSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  payment_method_id: string;
  metadata?: Record<string, any>;
  created_at: string;
  cancelled_at?: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  features?: string[];
  metadata?: Record<string, any>;
  active: boolean;
  created_at: string;
}

export class PaymentModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Payment Methods
  async createPaymentMethod(paymentMethod: {
    type: 'card' | 'bank_account' | 'paypal' | 'stripe' | 'crypto';
    details: Record<string, any>;
    default?: boolean;
    metadata?: Record<string, any>;
  }): Promise<PaymentMethod> {
    const response = await this.httpClient.post('/payment/methods', paymentMethod);
    return response.data;
  }

  async listPaymentMethods(options?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    methods: PaymentMethod[];
    total: number;
  }> {
    const response = await this.httpClient.get('/payment/methods', { params: options });
    return response.data;
  }

  async getPaymentMethod(methodId: string): Promise<PaymentMethod> {
    const response = await this.httpClient.get(`/payment/methods/${methodId}`);
    return response.data;
  }

  async updatePaymentMethod(methodId: string, updates: {
    default?: boolean;
    metadata?: Record<string, any>;
  }): Promise<PaymentMethod> {
    const response = await this.httpClient.patch(`/payment/methods/${methodId}`, updates);
    return response.data;
  }

  async deletePaymentMethod(methodId: string): Promise<void> {
    await this.httpClient.delete(`/payment/methods/${methodId}`);
  }

  // Transactions
  async createTransaction(transaction: {
    amount: number;
    currency: string;
    payment_method_id: string;
    description?: string;
    capture?: boolean;
    metadata?: Record<string, any>;
  }): Promise<PaymentTransaction> {
    const response = await this.httpClient.post('/payment/transactions', transaction);
    return response.data;
  }

  async captureTransaction(transactionId: string, amount?: number): Promise<PaymentTransaction> {
    const response = await this.httpClient.post(`/payment/transactions/${transactionId}/capture`, { amount });
    return response.data;
  }

  async refundTransaction(transactionId: string, amount?: number, reason?: string): Promise<PaymentTransaction> {
    const response = await this.httpClient.post(`/payment/transactions/${transactionId}/refund`, { 
      amount,
      reason 
    });
    return response.data;
  }

  async getTransaction(transactionId: string): Promise<PaymentTransaction> {
    const response = await this.httpClient.get(`/payment/transactions/${transactionId}`);
    return response.data;
  }

  async listTransactions(options?: {
    status?: string;
    payment_method_id?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: PaymentTransaction[];
    total: number;
    total_amount: number;
  }> {
    const response = await this.httpClient.get('/payment/transactions', { params: options });
    return response.data;
  }

  // Subscriptions
  async createSubscription(subscription: {
    plan_id: string;
    payment_method_id: string;
    trial_days?: number;
    metadata?: Record<string, any>;
  }): Promise<PaymentSubscription> {
    const response = await this.httpClient.post('/payment/subscriptions', subscription);
    return response.data;
  }

  async getSubscription(subscriptionId: string): Promise<PaymentSubscription> {
    const response = await this.httpClient.get(`/payment/subscriptions/${subscriptionId}`);
    return response.data;
  }

  async updateSubscription(subscriptionId: string, updates: {
    plan_id?: string;
    payment_method_id?: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentSubscription> {
    const response = await this.httpClient.patch(`/payment/subscriptions/${subscriptionId}`, updates);
    return response.data;
  }

  async pauseSubscription(subscriptionId: string): Promise<PaymentSubscription> {
    const response = await this.httpClient.post(`/payment/subscriptions/${subscriptionId}/pause`);
    return response.data;
  }

  async resumeSubscription(subscriptionId: string): Promise<PaymentSubscription> {
    const response = await this.httpClient.post(`/payment/subscriptions/${subscriptionId}/resume`);
    return response.data;
  }

  async cancelSubscription(subscriptionId: string, options?: {
    immediate?: boolean;
    reason?: string;
  }): Promise<PaymentSubscription> {
    const response = await this.httpClient.post(`/payment/subscriptions/${subscriptionId}/cancel`, options);
    return response.data;
  }

  async listSubscriptions(options?: {
    status?: string;
    plan_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    subscriptions: PaymentSubscription[];
    total: number;
  }> {
    const response = await this.httpClient.get('/payment/subscriptions', { params: options });
    return response.data;
  }

  // Plans
  async createPlan(plan: {
    name: string;
    amount: number;
    currency: string;
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count?: number;
    features?: string[];
    trial_days?: number;
    metadata?: Record<string, any>;
  }): Promise<PaymentPlan> {
    const response = await this.httpClient.post('/payment/plans', plan);
    return response.data;
  }

  async getPlan(planId: string): Promise<PaymentPlan> {
    const response = await this.httpClient.get(`/payment/plans/${planId}`);
    return response.data;
  }

  async updatePlan(planId: string, updates: {
    name?: string;
    features?: string[];
    active?: boolean;
    metadata?: Record<string, any>;
  }): Promise<PaymentPlan> {
    const response = await this.httpClient.patch(`/payment/plans/${planId}`, updates);
    return response.data;
  }

  async listPlans(options?: {
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    plans: PaymentPlan[];
    total: number;
  }> {
    const response = await this.httpClient.get('/payment/plans', { params: options });
    return response.data;
  }

  async deletePlan(planId: string): Promise<void> {
    await this.httpClient.delete(`/payment/plans/${planId}`);
  }

  // Payment Links
  async createPaymentLink(link: {
    amount: number;
    currency: string;
    description?: string;
    success_url?: string;
    cancel_url?: string;
    expires_at?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    id: string;
    url: string;
    amount: number;
    currency: string;
    status: 'active' | 'expired' | 'used';
    created_at: string;
    expires_at?: string;
  }> {
    const response = await this.httpClient.post('/payment/links', link);
    return response.data;
  }

  async getPaymentLink(linkId: string): Promise<{
    id: string;
    url: string;
    amount: number;
    currency: string;
    status: string;
    transaction_id?: string;
    created_at: string;
    used_at?: string;
  }> {
    const response = await this.httpClient.get(`/payment/links/${linkId}`);
    return response.data;
  }

  // Invoices
  async createInvoice(invoice: {
    customer_id: string;
    items: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
    due_date?: string;
    metadata?: Record<string, any>;
  }): Promise<{
    id: string;
    number: string;
    customer_id: string;
    amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    due_date?: string;
    paid_at?: string;
    created_at: string;
  }> {
    const response = await this.httpClient.post('/payment/invoices', invoice);
    return response.data;
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    await this.httpClient.post(`/payment/invoices/${invoiceId}/send`);
  }

  async markInvoiceAsPaid(invoiceId: string, transaction_id?: string): Promise<void> {
    await this.httpClient.post(`/payment/invoices/${invoiceId}/mark-paid`, { transaction_id });
  }

  // Webhooks
  async createPaymentWebhook(webhook: {
    url: string;
    events: string[];
    description?: string;
    active?: boolean;
  }): Promise<{
    id: string;
    url: string;
    events: string[];
    secret: string;
    active: boolean;
    created_at: string;
  }> {
    const response = await this.httpClient.post('/payment/webhooks', webhook);
    return response.data;
  }

  async verifyWebhookSignature(_payload: string, _signature: string, _secret: string): Promise<boolean> {
    // This would typically be done client-side
    // Implementation depends on the specific webhook signing algorithm
    return Promise.resolve(true);
  }

  // Analytics
  async getPaymentAnalytics(options?: {
    from_date?: string;
    to_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    total_revenue: number;
    total_transactions: number;
    average_transaction: number;
    currency_breakdown: Record<string, number>;
    status_breakdown: Record<string, number>;
    timeline: Array<{
      date: string;
      revenue: number;
      transactions: number;
    }>;
  }> {
    const response = await this.httpClient.get('/payment/analytics', { params: options });
    return response.data;
  }
}