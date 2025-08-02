import { HttpClient } from '../core/http-client';
import { EmailTemplate, EmailAttachment, EmailRecipient } from '../types';
export declare class EmailModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    sendEmail(options: {
        to: EmailRecipient[];
        from?: string;
        subject: string;
        text?: string;
        html?: string;
        cc?: EmailRecipient[];
        bcc?: EmailRecipient[];
        attachments?: EmailAttachment[];
        headers?: Record<string, string>;
        tags?: Record<string, string>;
        metadata?: Record<string, any>;
        template?: {
            id: string;
            variables?: Record<string, any>;
        };
        priority?: 'low' | 'normal' | 'high';
        sendAt?: Date;
    }): Promise<{
        id: string;
        status: 'queued' | 'sending' | 'sent' | 'failed';
        message_id: string;
        created_at: string;
    }>;
    sendBulkEmail(options: {
        emails: Array<{
            to: EmailRecipient[];
            subject: string;
            text?: string;
            html?: string;
            template?: {
                id: string;
                variables?: Record<string, any>;
            };
            tags?: Record<string, string>;
            metadata?: Record<string, any>;
        }>;
        from?: string;
        cc?: EmailRecipient[];
        bcc?: EmailRecipient[];
        headers?: Record<string, string>;
        priority?: 'low' | 'normal' | 'high';
        sendAt?: Date;
    }): Promise<{
        batch_id: string;
        total_emails: number;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        created_at: string;
    }>;
    sendTemplateEmail(templateId: string, options: {
        to: EmailRecipient[];
        from?: string;
        variables?: Record<string, any>;
        cc?: EmailRecipient[];
        bcc?: EmailRecipient[];
        attachments?: EmailAttachment[];
        headers?: Record<string, string>;
        tags?: Record<string, string>;
        metadata?: Record<string, any>;
        priority?: 'low' | 'normal' | 'high';
        sendAt?: Date;
    }): Promise<{
        id: string;
        status: 'queued' | 'sending' | 'sent' | 'failed';
        message_id: string;
        created_at: string;
    }>;
    getEmailStatus(emailId: string): Promise<{
        id: string;
        status: 'queued' | 'sending' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'failed';
        sent_at?: string;
        delivered_at?: string;
        opened_at?: string;
        clicked_at?: string;
        bounced_at?: string;
        complained_at?: string;
        error?: string;
        tracking: {
            opens: number;
            clicks: number;
            unsubscribes: number;
        };
    }>;
    getBulkEmailStatus(batchId: string): Promise<{
        batch_id: string;
        total_emails: number;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        created_at: string;
        completed_at?: string;
        stats: {
            queued: number;
            sent: number;
            delivered: number;
            bounced: number;
            failed: number;
        };
    }>;
    getEmailEvents(emailId: string, options?: {
        types?: Array<'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'>;
        limit?: number;
        offset?: number;
    }): Promise<{
        events: Array<{
            type: string;
            timestamp: string;
            data?: any;
        }>;
        total: number;
    }>;
    createTemplate(template: {
        name: string;
        subject: string;
        text?: string;
        html?: string;
        variables?: Array<{
            name: string;
            type: 'string' | 'number' | 'boolean' | 'date';
            default_value?: any;
            required?: boolean;
            description?: string;
        }>;
        category?: string;
        tags?: string[];
        metadata?: Record<string, any>;
    }): Promise<EmailTemplate>;
    updateTemplate(templateId: string, updates: {
        name?: string;
        subject?: string;
        text?: string;
        html?: string;
        variables?: Array<{
            name: string;
            type: 'string' | 'number' | 'boolean' | 'date';
            default_value?: any;
            required?: boolean;
            description?: string;
        }>;
        category?: string;
        tags?: string[];
        metadata?: Record<string, any>;
    }): Promise<EmailTemplate>;
    getTemplate(templateId: string): Promise<EmailTemplate>;
    listTemplates(options?: {
        category?: string;
        tags?: string[];
        search?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'name' | 'created_at' | 'updated_at';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        templates: EmailTemplate[];
        total: number;
    }>;
    deleteTemplate(templateId: string): Promise<void>;
    previewTemplate(templateId: string, variables?: Record<string, any>): Promise<{
        subject: string;
        text: string;
        html: string;
    }>;
    testTemplate(templateId: string, options: {
        to: string;
        variables?: Record<string, any>;
    }): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
    createContact(contact: {
        email: string;
        name?: string;
        tags?: string[];
        metadata?: Record<string, any>;
        lists?: string[];
        subscribed?: boolean;
    }): Promise<{
        id: string;
        email: string;
        name?: string;
        tags: string[];
        metadata: Record<string, any>;
        subscribed: boolean;
        created_at: string;
    }>;
    updateContact(contactId: string, updates: {
        name?: string;
        tags?: string[];
        metadata?: Record<string, any>;
        subscribed?: boolean;
    }): Promise<{
        id: string;
        email: string;
        name?: string;
        tags: string[];
        metadata: Record<string, any>;
        subscribed: boolean;
        updated_at: string;
    }>;
    getContact(contactId: string): Promise<{
        id: string;
        email: string;
        name?: string;
        tags: string[];
        metadata: Record<string, any>;
        subscribed: boolean;
        created_at: string;
        updated_at: string;
    }>;
    listContacts(options?: {
        subscribed?: boolean;
        tags?: string[];
        search?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'email' | 'name' | 'created_at' | 'updated_at';
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        contacts: Array<{
            id: string;
            email: string;
            name?: string;
            tags: string[];
            subscribed: boolean;
            created_at: string;
        }>;
        total: number;
    }>;
    deleteContact(contactId: string): Promise<void>;
    subscribeContact(contactId: string): Promise<void>;
    unsubscribeContact(contactId: string): Promise<void>;
    createList(list: {
        name: string;
        description?: string;
        tags?: string[];
    }): Promise<{
        id: string;
        name: string;
        description?: string;
        tags: string[];
        subscriber_count: number;
        created_at: string;
    }>;
    updateList(listId: string, updates: {
        name?: string;
        description?: string;
        tags?: string[];
    }): Promise<{
        id: string;
        name: string;
        description?: string;
        tags: string[];
        subscriber_count: number;
        updated_at: string;
    }>;
    getList(listId: string): Promise<{
        id: string;
        name: string;
        description?: string;
        tags: string[];
        subscriber_count: number;
        created_at: string;
        updated_at: string;
    }>;
    listLists(): Promise<Array<{
        id: string;
        name: string;
        description?: string;
        tags: string[];
        subscriber_count: number;
        created_at: string;
    }>>;
    deleteList(listId: string): Promise<void>;
    addContactToList(listId: string, contactId: string): Promise<void>;
    removeContactFromList(listId: string, contactId: string): Promise<void>;
    getListContacts(listId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        contacts: Array<{
            id: string;
            email: string;
            name?: string;
            subscribed: boolean;
        }>;
        total: number;
    }>;
    createCampaign(campaign: {
        name: string;
        subject: string;
        templateId?: string;
        text?: string;
        html?: string;
        lists?: string[];
        tags?: string[];
        sendAt?: Date;
        timezone?: string;
    }): Promise<{
        id: string;
        name: string;
        status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
        recipient_count: number;
        created_at: string;
    }>;
    updateCampaign(campaignId: string, updates: {
        name?: string;
        subject?: string;
        templateId?: string;
        text?: string;
        html?: string;
        lists?: string[];
        tags?: string[];
        sendAt?: Date;
        timezone?: string;
    }): Promise<{
        id: string;
        name: string;
        status: string;
        recipient_count: number;
        updated_at: string;
    }>;
    getCampaign(campaignId: string): Promise<{
        id: string;
        name: string;
        subject: string;
        status: string;
        recipient_count: number;
        sent_count: number;
        opened_count: number;
        clicked_count: number;
        bounce_count: number;
        created_at: string;
        sent_at?: string;
    }>;
    listCampaigns(options?: {
        status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
        limit?: number;
        offset?: number;
    }): Promise<{
        campaigns: Array<{
            id: string;
            name: string;
            status: string;
            recipient_count: number;
            sent_count: number;
            created_at: string;
        }>;
        total: number;
    }>;
    sendCampaign(campaignId: string): Promise<{
        id: string;
        status: 'sending';
        started_at: string;
    }>;
    cancelCampaign(campaignId: string): Promise<void>;
    deleteCampaign(campaignId: string): Promise<void>;
    getEmailAnalytics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        total_sent: number;
        total_delivered: number;
        total_opened: number;
        total_clicked: number;
        total_bounced: number;
        total_complained: number;
        delivery_rate: number;
        open_rate: number;
        click_rate: number;
        bounce_rate: number;
        complaint_rate: number;
        daily_stats: Array<{
            date: string;
            sent: number;
            delivered: number;
            opened: number;
            clicked: number;
            bounced: number;
        }>;
    }>;
    getDomainReputation(): Promise<{
        domain: string;
        reputation_score: number;
        status: 'excellent' | 'good' | 'fair' | 'poor';
        blacklist_status: Array<{
            list: string;
            listed: boolean;
            checked_at: string;
        }>;
        last_updated: string;
    }>;
    getSuppressionList(options?: {
        type?: 'bounced' | 'complained' | 'unsubscribed';
        limit?: number;
        offset?: number;
    }): Promise<{
        suppressions: Array<{
            email: string;
            type: 'bounced' | 'complained' | 'unsubscribed';
            reason?: string;
            created_at: string;
        }>;
        total: number;
    }>;
    removeFromSuppressionList(email: string): Promise<void>;
}
