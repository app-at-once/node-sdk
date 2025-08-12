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
export declare class PaymentModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    createPaymentMethod(paymentMethod: {
        type: 'card' | 'bank_account' | 'paypal' | 'stripe' | 'crypto';
        details: Record<string, any>;
        default?: boolean;
        metadata?: Record<string, any>;
    }): Promise<PaymentMethod>;
    listPaymentMethods(options?: {
        type?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        methods: PaymentMethod[];
        total: number;
    }>;
    getPaymentMethod(methodId: string): Promise<PaymentMethod>;
    updatePaymentMethod(methodId: string, updates: {
        default?: boolean;
        metadata?: Record<string, any>;
    }): Promise<PaymentMethod>;
    deletePaymentMethod(methodId: string): Promise<void>;
    createTransaction(transaction: {
        amount: number;
        currency: string;
        payment_method_id: string;
        description?: string;
        capture?: boolean;
        metadata?: Record<string, any>;
    }): Promise<PaymentTransaction>;
    captureTransaction(transactionId: string, amount?: number): Promise<PaymentTransaction>;
    refundTransaction(transactionId: string, amount?: number, reason?: string): Promise<PaymentTransaction>;
    getTransaction(transactionId: string): Promise<PaymentTransaction>;
    listTransactions(options?: {
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
    }>;
    createSubscription(subscription: {
        plan_id: string;
        payment_method_id: string;
        trial_days?: number;
        metadata?: Record<string, any>;
    }): Promise<PaymentSubscription>;
    getSubscription(subscriptionId: string): Promise<PaymentSubscription>;
    updateSubscription(subscriptionId: string, updates: {
        plan_id?: string;
        payment_method_id?: string;
        metadata?: Record<string, any>;
    }): Promise<PaymentSubscription>;
    pauseSubscription(subscriptionId: string): Promise<PaymentSubscription>;
    resumeSubscription(subscriptionId: string): Promise<PaymentSubscription>;
    cancelSubscription(subscriptionId: string, options?: {
        immediate?: boolean;
        reason?: string;
    }): Promise<PaymentSubscription>;
    listSubscriptions(options?: {
        status?: string;
        plan_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        subscriptions: PaymentSubscription[];
        total: number;
    }>;
    createPlan(plan: {
        name: string;
        amount: number;
        currency: string;
        interval: 'day' | 'week' | 'month' | 'year';
        interval_count?: number;
        features?: string[];
        trial_days?: number;
        metadata?: Record<string, any>;
    }): Promise<PaymentPlan>;
    getPlan(planId: string): Promise<PaymentPlan>;
    updatePlan(planId: string, updates: {
        name?: string;
        features?: string[];
        active?: boolean;
        metadata?: Record<string, any>;
    }): Promise<PaymentPlan>;
    listPlans(options?: {
        active?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        plans: PaymentPlan[];
        total: number;
    }>;
    deletePlan(planId: string): Promise<void>;
    createPaymentLink(link: {
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
    }>;
    getPaymentLink(linkId: string): Promise<{
        id: string;
        url: string;
        amount: number;
        currency: string;
        status: string;
        transaction_id?: string;
        created_at: string;
        used_at?: string;
    }>;
    createInvoice(invoice: {
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
    }>;
    sendInvoice(invoiceId: string): Promise<void>;
    markInvoiceAsPaid(invoiceId: string, transaction_id?: string): Promise<void>;
    createPaymentWebhook(webhook: {
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
    }>;
    verifyWebhookSignature(_payload: string, _signature: string, _secret: string): Promise<boolean>;
    getPaymentAnalytics(options?: {
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
    }>;
}
