import { HttpClient } from '../core/http-client';
import { PushDevice, PushCampaign, PushTemplate, PushAnalytics } from '../types';
export declare class PushModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    send(options: {
        to: string | string[];
        title: string;
        body: string;
        data?: Record<string, any>;
        badge?: number;
        sound?: string;
        image?: string;
        priority?: 'high' | 'normal';
        targetType?: 'user' | 'device' | 'tag' | 'all';
        tags?: string[];
        silent?: boolean;
        mutableContent?: boolean;
        category?: string;
        threadId?: string;
        ttl?: number;
        scheduledAt?: Date;
    }): Promise<{
        messageId: string;
        status: 'sent' | 'scheduled' | 'queued' | 'failed';
        details?: any;
    }>;
    sendBulk(notifications: Array<{
        to: string | string[];
        title: string;
        body: string;
        data?: Record<string, any>;
        badge?: number;
        sound?: string;
        image?: string;
        priority?: 'high' | 'normal';
        targetType?: 'user' | 'device' | 'tag' | 'all';
        tags?: string[];
        silent?: boolean;
    }>): Promise<{
        sent: number;
        failed: number;
        results: Array<{
            status: 'sent' | 'failed';
            messageId?: string;
            error?: string;
        }>;
    }>;
    sendWithTemplate(templateId: string, options: {
        to: string | string[];
        targetType?: 'user' | 'device' | 'tag' | 'all';
        tags?: string[];
        data?: Record<string, any>;
        variables?: Record<string, any>;
        scheduledAt?: Date;
    }): Promise<{
        messageId: string;
        status: 'sent' | 'scheduled' | 'queued' | 'failed';
    }>;
    registerDevice(device: {
        userId: string;
        deviceToken: string;
        platform: 'ios' | 'android' | 'web';
        deviceInfo?: {
            model?: string;
            osVersion?: string;
            appVersion?: string;
            locale?: string;
            timezone?: string;
        };
        tags?: string[];
    }): Promise<PushDevice>;
    unregisterDevice(deviceToken: string): Promise<void>;
    updateDevice(deviceToken: string, updates: {
        tags?: string[];
        deviceInfo?: Record<string, any>;
        active?: boolean;
    }): Promise<PushDevice>;
    getDevice(deviceToken: string): Promise<PushDevice>;
    listDevices(options?: {
        userId?: string;
        platform?: 'ios' | 'android' | 'web';
        tags?: string[];
        active?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        devices: PushDevice[];
        total: number;
    }>;
    createTemplate(template: {
        name: string;
        title: string;
        body: string;
        data?: Record<string, any>;
        sound?: string;
        badge?: number;
        image?: string;
        variables?: Array<{
            name: string;
            type: 'string' | 'number' | 'boolean';
            required?: boolean;
            defaultValue?: any;
        }>;
        tags?: string[];
        category?: string;
    }): Promise<PushTemplate>;
    updateTemplate(templateId: string, updates: Partial<{
        name: string;
        title: string;
        body: string;
        data: Record<string, any>;
        sound: string;
        badge: number;
        image: string;
        variables: Array<any>;
        tags: string[];
        category: string;
    }>): Promise<PushTemplate>;
    getTemplate(templateId: string): Promise<PushTemplate>;
    listTemplates(options?: {
        category?: string;
        tags?: string[];
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        templates: PushTemplate[];
        total: number;
    }>;
    deleteTemplate(templateId: string): Promise<void>;
    previewTemplate(templateId: string, variables?: Record<string, any>): Promise<{
        title: string;
        body: string;
        data: Record<string, any>;
    }>;
    createCampaign(campaign: {
        name: string;
        title: string;
        body: string;
        targetType: 'all' | 'segment' | 'tags';
        tags?: string[];
        segment?: {
            platform?: 'ios' | 'android' | 'web';
            lastActiveAfter?: Date;
            lastActiveWithin?: number;
            locale?: string[];
            timezone?: string[];
        };
        data?: Record<string, any>;
        image?: string;
        sound?: string;
        badge?: number;
        scheduledAt?: Date;
        expiresAt?: Date;
    }): Promise<PushCampaign>;
    updateCampaign(campaignId: string, updates: Partial<{
        name: string;
        title: string;
        body: string;
        targetType: 'all' | 'segment' | 'tags';
        tags: string[];
        segment: any;
        data: Record<string, any>;
        scheduledAt: Date;
        expiresAt: Date;
    }>): Promise<PushCampaign>;
    getCampaign(campaignId: string): Promise<PushCampaign>;
    listCampaigns(options?: {
        status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
        limit?: number;
        offset?: number;
    }): Promise<{
        campaigns: PushCampaign[];
        total: number;
    }>;
    launchCampaign(campaignId: string): Promise<{
        campaignId: string;
        status: 'running';
        startedAt: string;
    }>;
    cancelCampaign(campaignId: string): Promise<void>;
    deleteCampaign(campaignId: string): Promise<void>;
    trackDelivered(messageId: string): Promise<void>;
    trackOpened(messageId: string, userId?: string): Promise<void>;
    getMessageStatus(messageId: string): Promise<{
        messageId: string;
        status: 'sent' | 'delivered' | 'opened' | 'failed';
        sentAt?: string;
        deliveredAt?: string;
        openedAt?: string;
        error?: string;
    }>;
    getLogs(options?: {
        userId?: string;
        deviceId?: string;
        status?: 'sent' | 'delivered' | 'opened' | 'failed';
        from?: Date;
        to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        logs: Array<{
            id: string;
            userId?: string;
            deviceId?: string;
            title: string;
            body: string;
            status: string;
            platform?: string;
            sentAt?: string;
            deliveredAt?: string;
            openedAt?: string;
            error?: string;
        }>;
        total: number;
    }>;
    getStats(from?: Date, to?: Date): Promise<{
        total: number;
        sent: number;
        delivered: number;
        opened: number;
        failed: number;
        byPlatform: Record<string, number>;
        byStatus: Record<string, number>;
    }>;
    getAnalytics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<PushAnalytics>;
    getConfig(): Promise<{
        fcmConfig?: any;
        apnsConfig?: any;
        defaultSettings?: {
            sound?: string;
            badge?: boolean;
            priority?: 'high' | 'normal';
        };
    }>;
    updateConfig(config: {
        fcmConfig?: {
            projectId: string;
            privateKey: string;
            clientEmail: string;
        };
        apnsConfig?: {
            keyId: string;
            teamId: string;
            privateKey: string;
            bundleId: string;
            production: boolean;
        };
        defaultSettings?: {
            sound?: string;
            badge?: boolean;
            priority?: 'high' | 'normal';
        };
    }): Promise<void>;
    sendTest(deviceToken: string, platform: 'ios' | 'android'): Promise<{
        messageId: string;
        status: 'sent' | 'failed';
        message?: string;
    }>;
}
