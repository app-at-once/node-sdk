import { HttpClient } from '../core/http-client';
export interface ConversionOptions {
    format?: string;
    quality?: 'low' | 'medium' | 'high' | 'best';
    preserveFormatting?: boolean;
    embedFonts?: boolean;
    embedImages?: boolean;
    pageRange?: string;
    password?: string;
    metadata?: Record<string, any>;
}
export interface ConvertedDocument {
    id: string;
    url: string;
    format: string;
    size: number;
    pages?: number;
    metadata?: Record<string, any>;
    created_at: string;
}
export interface DocumentInfo {
    format: string;
    size: number;
    pages?: number;
    encrypted?: boolean;
    metadata?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
        created?: string;
        modified?: string;
        application?: string;
    };
    compatibility?: {
        formats: string[];
        versions: string[];
    };
}
export declare class DocumentConversionModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    convert(source: string | Buffer, targetFormat: string, options?: ConversionOptions): Promise<ConvertedDocument>;
    batchConvert(documents: Array<{
        source: string | Buffer;
        targetFormat: string;
        options?: ConversionOptions;
    }>, commonOptions?: ConversionOptions): Promise<ConvertedDocument[]>;
    convertOffice(source: string | Buffer, targetFormat: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'odt' | 'ods' | 'odp', options?: ConversionOptions & {
        compatibility?: 'office2007' | 'office2010' | 'office2016' | 'office365';
        macros?: 'keep' | 'remove' | 'disable';
    }): Promise<ConvertedDocument>;
    toPDF(source: string | Buffer, options?: ConversionOptions & {
        pdfVersion?: '1.4' | '1.5' | '1.6' | '1.7' | '2.0';
        pdfA?: boolean;
        optimization?: 'web' | 'print' | 'prepress' | 'default';
        compression?: boolean;
    }): Promise<ConvertedDocument>;
    fromPDF(source: string | Buffer, targetFormat: 'docx' | 'xlsx' | 'pptx' | 'html' | 'txt' | 'rtf' | 'epub', options?: ConversionOptions & {
        ocrEnabled?: boolean;
        preserveLayout?: boolean;
        extractImages?: boolean;
    }): Promise<ConvertedDocument>;
    convertImage(source: string | Buffer, targetFormat: 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'bmp' | 'svg', options?: ConversionOptions & {
        width?: number;
        height?: number;
        dpi?: number;
        colorSpace?: 'rgb' | 'cmyk' | 'grayscale';
    }): Promise<ConvertedDocument>;
    convertEbook(source: string | Buffer, targetFormat: 'epub' | 'mobi' | 'azw3' | 'pdf' | 'txt', options?: ConversionOptions & {
        fontSize?: number;
        fontFamily?: string;
        marginSize?: number;
        chapterDetection?: boolean;
        tableOfContents?: boolean;
    }): Promise<ConvertedDocument>;
    convertHTML(source: string | Buffer, targetFormat: 'pdf' | 'docx' | 'epub' | 'markdown', options?: ConversionOptions & {
        includeCSS?: boolean;
        includeImages?: boolean;
        baseUrl?: string;
        encoding?: string;
    }): Promise<ConvertedDocument>;
    convertMarkdown(source: string | Buffer, targetFormat: 'html' | 'pdf' | 'docx' | 'epub', options?: ConversionOptions & {
        theme?: string;
        syntaxHighlighting?: boolean;
        mathRendering?: boolean;
    }): Promise<ConvertedDocument>;
    convertCAD(source: string | Buffer, targetFormat: 'pdf' | 'dwg' | 'dxf' | 'svg' | 'png', options?: ConversionOptions & {
        scale?: number;
        layers?: string[];
        colorMode?: 'color' | 'blackwhite' | 'grayscale';
        lineWeight?: number;
    }): Promise<ConvertedDocument>;
    getInfo(source: string | Buffer): Promise<DocumentInfo>;
    getSupportedFormats(sourceFormat?: string): Promise<{
        sourceFormats: string[];
        targetFormats: Record<string, string[]>;
        categories: Record<string, string[]>;
    }>;
    validateConversion(sourceFormat: string, targetFormat: string): Promise<{
        supported: boolean;
        limitations?: string[];
        recommendations?: string[];
        estimatedQuality?: 'excellent' | 'good' | 'fair' | 'poor';
    }>;
    createJob(source: string | Buffer, targetFormat: string, options?: ConversionOptions & {
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
        result?: ConvertedDocument;
        error?: string;
        createdAt: string;
        completedAt?: string;
    }>;
    cancelJob(jobId: string): Promise<void>;
    waitForJob(jobId: string, options?: {
        timeout?: number;
        pollInterval?: number;
    }): Promise<ConvertedDocument>;
    merge(documents: Array<string | Buffer>, targetFormat: string, options?: ConversionOptions & {
        insertPageBreaks?: boolean;
        uniformFormatting?: boolean;
        tableOfContents?: boolean;
    }): Promise<ConvertedDocument>;
    split(source: string | Buffer, options: {
        splitBy: 'pages' | 'size' | 'bookmarks' | 'headings';
        value?: number | string[];
        targetFormat?: string;
    }): Promise<ConvertedDocument[]>;
}
