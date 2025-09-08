import { HttpClient } from '../core/http-client';
export interface Content {
    id: string;
    resourceId: string;
    resourceType: 'project' | 'app';
    contentType: string;
    title: string;
    content: any;
    source?: string;
    sourceDetails?: any;
    parameters?: any;
    metadata?: any;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateContentDto {
    resourceId: string;
    resourceType: 'project' | 'app';
    contentType: string;
    title: string;
    content: any;
    source?: string;
    sourceDetails?: any;
    parameters?: any;
    metadata?: any;
    status?: string;
}
export interface UpdateContentDto {
    title?: string;
    content?: any;
    contentType?: string;
    status?: string;
    metadata?: any;
}
export interface GetContentsOptions {
    resourceId?: string;
    resourceType?: 'project' | 'app';
    contentType?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class ContentModule {
    private client;
    constructor(client: HttpClient);
    create(data: CreateContentDto): Promise<Content>;
    getAll(options?: GetContentsOptions): Promise<Content[]>;
    getById(contentId: string): Promise<Content>;
    update(contentId: string, data: UpdateContentDto): Promise<Content>;
    delete(contentId: string): Promise<void>;
    archive(contentId: string): Promise<void>;
    restore(contentId: string): Promise<void>;
    duplicate(contentId: string): Promise<Content>;
    export(contentId: string, format?: 'json' | 'html' | 'pdf'): Promise<any>;
    generateAI(type: 'blog_post' | 'caption' | 'email' | 'summary' | 'custom', data: any): Promise<any>;
}
