import { HttpClient } from '../core/http-client';
export interface PDFGenerationOptions {
    format?: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Tabloid';
    orientation?: 'portrait' | 'landscape';
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    printBackground?: boolean;
    scale?: number;
    pageRanges?: string;
    preferCSSPageSize?: boolean;
}
export interface PDFDocument {
    id: string;
    url: string;
    pages: number;
    size: number;
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
        creator?: string;
        producer?: string;
        creationDate?: string;
        modificationDate?: string;
    };
    created_at: string;
}
export interface PDFMergeOptions {
    pageRanges?: Array<{
        document: number;
        pages?: string;
    }>;
    alternatePages?: boolean;
    reverse?: boolean;
}
export interface PDFPageInfo {
    pageNumber: number;
    width: number;
    height: number;
    rotation: number;
    text?: string;
    images?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        url?: string;
    }>;
    links?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        url: string;
    }>;
}
export declare class PDFModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    generateFromHTML(html: string, options?: PDFGenerationOptions): Promise<PDFDocument>;
    generateFromURL(url: string, options?: PDFGenerationOptions & {
        waitForSelector?: string;
        waitForTimeout?: number;
        cookies?: Array<{
            name: string;
            value: string;
            domain?: string;
        }>;
    }): Promise<PDFDocument>;
    generateFromTemplate(templateId: string, data: Record<string, any>, options?: PDFGenerationOptions): Promise<PDFDocument>;
    merge(documents: Array<string | Buffer>, options?: PDFMergeOptions): Promise<PDFDocument>;
    split(source: string | Buffer, options: {
        pageRanges?: string[];
        pagesPerDocument?: number;
        splitAt?: number[];
    }): Promise<PDFDocument[]>;
    extractPages(source: string | Buffer, pageRanges: string): Promise<PDFDocument>;
    rotatePages(source: string | Buffer, rotation: 90 | 180 | 270, pages?: string): Promise<PDFDocument>;
    addWatermark(source: string | Buffer, watermark: {
        text?: string;
        image?: string | Buffer;
        position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';
        opacity?: number;
        rotation?: number;
        fontSize?: number;
        color?: string;
        pages?: string;
    }): Promise<PDFDocument>;
    compress(source: string | Buffer, options?: {
        quality?: 'low' | 'medium' | 'high';
        imageQuality?: number;
        removeMetadata?: boolean;
        removeFonts?: boolean;
    }): Promise<PDFDocument>;
    protect(source: string | Buffer, options: {
        userPassword?: string;
        ownerPassword?: string;
        permissions?: {
            printing?: boolean;
            modifying?: boolean;
            copying?: boolean;
            annotating?: boolean;
            formFilling?: boolean;
        };
    }): Promise<PDFDocument>;
    unlock(source: string | Buffer, password: string): Promise<PDFDocument>;
    getInfo(source: string | Buffer): Promise<{
        pages: number;
        size: number;
        encrypted: boolean;
        metadata: Record<string, any>;
        pageInfo: PDFPageInfo[];
    }>;
    toImages(source: string | Buffer, options?: {
        format?: 'jpeg' | 'png' | 'webp';
        dpi?: number;
        pages?: string;
        quality?: number;
    }): Promise<Array<{
        page: number;
        url: string;
        width: number;
        height: number;
    }>>;
    addFormFields(source: string | Buffer, fields: Array<{
        type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'signature';
        name: string;
        page: number;
        x: number;
        y: number;
        width: number;
        height: number;
        required?: boolean;
        defaultValue?: any;
        options?: string[];
    }>): Promise<PDFDocument>;
    fillForm(source: string | Buffer, data: Record<string, any>, options?: {
        flatten?: boolean;
    }): Promise<PDFDocument>;
    sign(source: string | Buffer, signature: {
        image?: string | Buffer;
        text?: string;
        page: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }, certificate?: {
        pfx: Buffer;
        password: string;
    }): Promise<PDFDocument>;
}
