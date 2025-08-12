import { HttpClient } from '../core/http-client';
export interface OCROptions {
    languages?: string[];
    mode?: 'fast' | 'accurate' | 'handwriting';
    outputFormat?: 'text' | 'json' | 'pdf' | 'docx';
    preserveLayout?: boolean;
    detectTables?: boolean;
    detectBarcodes?: boolean;
    enhanceImage?: boolean;
    deskew?: boolean;
    removeNoise?: boolean;
    confidence?: number;
}
export interface OCRResult {
    text: string;
    confidence: number;
    language: string;
    pages?: Array<{
        pageNumber: number;
        text: string;
        confidence: number;
        width: number;
        height: number;
        blocks: OCRTextBlock[];
    }>;
    tables?: OCRTable[];
    barcodes?: Array<{
        type: string;
        data: string;
        format: string;
        position: OCRBoundingBox;
    }>;
    metadata?: {
        processingTime: number;
        characterCount: number;
        wordCount: number;
        lineCount: number;
    };
}
export interface OCRTextBlock {
    text: string;
    confidence: number;
    boundingBox: OCRBoundingBox;
    words?: Array<{
        text: string;
        confidence: number;
        boundingBox: OCRBoundingBox;
    }>;
    language?: string;
    type?: 'text' | 'title' | 'heading' | 'caption';
}
export interface OCRBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface OCRTable {
    rows: number;
    columns: number;
    cells: Array<Array<{
        text: string;
        rowSpan?: number;
        colSpan?: number;
        confidence: number;
    }>>;
    boundingBox: OCRBoundingBox;
    confidence: number;
}
export declare class OCRModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    extractFromImage(source: string | Buffer, options?: OCROptions): Promise<OCRResult>;
    extractFromPDF(source: string | Buffer, options?: OCROptions & {
        pages?: string;
        ocrOnlyImages?: boolean;
    }): Promise<OCRResult>;
    batchExtract(files: Array<{
        source: string | Buffer;
        options?: OCROptions;
    }>, commonOptions?: OCROptions): Promise<OCRResult[]>;
    extractRegion(source: string | Buffer, region: OCRBoundingBox, options?: OCROptions): Promise<OCRResult>;
    extractStructured(source: string | Buffer, documentType: 'invoice' | 'receipt' | 'form' | 'id-card' | 'passport' | 'driver-license' | 'custom', schema?: Record<string, any>): Promise<{
        data: Record<string, any>;
        confidence: number;
        rawText: string;
        fields: Array<{
            name: string;
            value: any;
            confidence: number;
            location?: OCRBoundingBox;
        }>;
    }>;
    extractAndTranslate(source: string | Buffer, targetLanguage: string, options?: OCROptions): Promise<{
        originalText: string;
        translatedText: string;
        detectedLanguage: string;
        targetLanguage: string;
        confidence: number;
    }>;
    searchText(source: string | Buffer, searchQuery: string, options?: {
        caseSensitive?: boolean;
        wholeWord?: boolean;
        regex?: boolean;
        maxResults?: number;
    }): Promise<Array<{
        text: string;
        pageNumber?: number;
        location: OCRBoundingBox;
        context: string;
    }>>;
    createSearchablePDF(source: string | Buffer, options?: OCROptions & {
        overlay?: boolean;
        compression?: 'low' | 'medium' | 'high';
    }): Promise<{
        id: string;
        url: string;
        size: number;
        pages: number;
        searchable: boolean;
    }>;
    detectOrientation(source: string | Buffer): Promise<{
        angle: number;
        confidence: number;
        corrected?: string;
    }>;
    detectLanguage(source: string | Buffer): Promise<{
        languages: Array<{
            code: string;
            name: string;
            confidence: number;
        }>;
        primary: string;
    }>;
    getSupportedLanguages(): Promise<Array<{
        code: string;
        name: string;
        nativeName: string;
        scriptDirection: 'ltr' | 'rtl';
    }>>;
    createJob(source: string | Buffer, options?: OCROptions & {
        callback?: string;
        priority?: 'low' | 'normal' | 'high';
    }): Promise<{
        jobId: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        estimatedTime?: number;
    }>;
    getJobStatus(jobId: string): Promise<{
        jobId: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        progress?: number;
        result?: OCRResult;
        error?: string;
        createdAt: string;
        completedAt?: string;
    }>;
    waitForJob(jobId: string, options?: {
        timeout?: number;
        pollInterval?: number;
    }): Promise<OCRResult>;
}
