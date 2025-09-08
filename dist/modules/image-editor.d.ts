import { HttpClient } from '../core/http-client';
export interface ImageTemplate {
    id: string;
    name: string;
    category: string;
    thumbnail: string;
    width: number;
    height: number;
    elements: TemplateElement[];
    backgroundColor?: string;
    metadata?: {
        tags?: string[];
        description?: string;
    };
}
export interface TemplateElement {
    type: 'text' | 'shape' | 'image';
    properties: {
        x: number;
        y: number;
        width?: number;
        height?: number;
        rotation?: number;
        text?: string;
        fontSize?: number;
        fontFamily?: string;
        color?: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        src?: string;
        shape?: 'rectangle' | 'circle' | 'triangle';
        opacity?: number;
    };
}
export interface CreateImageDto {
    resourceId: string;
    resourceType: 'project' | 'app';
    title: string;
    canvasData: string | object;
    width: number;
    height: number;
    exportFormat?: 'png' | 'jpg' | 'svg' | 'pdf';
}
export interface UpdateImageDto {
    title?: string;
    canvasData?: string | object;
    width?: number;
    height?: number;
}
export interface ImageExportOptions {
    format: 'png' | 'jpg' | 'svg' | 'pdf';
    quality?: number;
    scale?: number;
    includeBleed?: boolean;
    transparentBackground?: boolean;
}
export interface ImageUploadResult {
    imageUrl: string;
    thumbnailUrl?: string;
    metadata?: {
        width: number;
        height: number;
        format: string;
        size: number;
    };
}
export declare class ImageEditorModule {
    private client;
    constructor(client: HttpClient);
    createImage(data: CreateImageDto): Promise<any>;
    updateImage(contentId: string, data: UpdateImageDto): Promise<any>;
    exportImage(contentId: string, options: ImageExportOptions): Promise<any>;
    uploadImage(imageData: string | Blob, resourceId: string, resourceType?: 'project' | 'app'): Promise<ImageUploadResult>;
    getTemplates(category?: string): Promise<ImageTemplate[]>;
    getTemplateById(templateId: string): Promise<ImageTemplate>;
    removeBackground(contentId: string): Promise<any>;
    applyFilter(contentId: string, filter: string, options?: Record<string, any>): Promise<any>;
    generateImageAI(prompt: string, options?: {
        style?: string;
        size?: string;
        model?: string;
    }): Promise<{
        imageUrl: string;
        metadata?: any;
    }>;
    createFromTemplate(templateId: string, customizations: {
        resourceId: string;
        resourceType: 'project' | 'app';
        title: string;
        elements?: Partial<TemplateElement>[];
    }): Promise<any>;
}
