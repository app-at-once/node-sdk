import { HttpClient } from '../core/http-client';
export interface ImageProcessingOptions {
    resize?: {
        width?: number;
        height?: number;
        fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
        position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right';
    };
    crop?: {
        width: number;
        height: number;
        x?: number;
        y?: number;
    };
    rotate?: number;
    flip?: boolean;
    flop?: boolean;
    blur?: number;
    sharpen?: number;
    grayscale?: boolean;
    sepia?: boolean;
    tint?: string;
    format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff';
    quality?: number;
    compress?: boolean;
    watermark?: {
        text?: string;
        image?: string;
        position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        opacity?: number;
        size?: number;
    };
    background?: string;
    removeBackground?: boolean;
    enhance?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
    };
}
export interface ProcessedImage {
    id: string;
    url: string;
    width: number;
    height: number;
    format: string;
    size: number;
    metadata?: Record<string, any>;
    operations: string[];
    created_at: string;
}
export interface ImageAnalysis {
    width: number;
    height: number;
    format: string;
    size: number;
    colorSpace: string;
    hasAlpha: boolean;
    metadata: {
        exif?: Record<string, any>;
        iptc?: Record<string, any>;
        xmp?: Record<string, any>;
    };
    colors: {
        dominant: string[];
        palette: Array<{
            color: string;
            percentage: number;
        }>;
    };
    faces?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        confidence: number;
    }>;
    objects?: Array<{
        label: string;
        confidence: number;
        boundingBox: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    text?: Array<{
        text: string;
        confidence: number;
        boundingBox: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
}
export declare class ImageProcessingModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    processImage(source: string | Buffer, options: ImageProcessingOptions): Promise<ProcessedImage>;
    batchProcess(images: Array<{
        source: string | Buffer;
        options: ImageProcessingOptions;
    }>, commonOptions?: ImageProcessingOptions): Promise<ProcessedImage[]>;
    analyzeImage(source: string | Buffer, options?: {
        detectFaces?: boolean;
        detectObjects?: boolean;
        extractText?: boolean;
        analyzeColors?: boolean;
        extractMetadata?: boolean;
    }): Promise<ImageAnalysis>;
    generateThumbnail(source: string | Buffer, options?: {
        width?: number;
        height?: number;
        format?: 'jpeg' | 'png' | 'webp';
        quality?: number;
    }): Promise<ProcessedImage>;
    convertFormat(source: string | Buffer, format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff', options?: {
        quality?: number;
        compress?: boolean;
    }): Promise<ProcessedImage>;
    optimizeForWeb(source: string | Buffer, options?: {
        maxWidth?: number;
        maxHeight?: number;
        format?: 'jpeg' | 'webp' | 'avif';
        quality?: number;
    }): Promise<ProcessedImage>;
    createVariants(source: string | Buffer, variants: Array<{
        name: string;
        width?: number;
        height?: number;
        format?: string;
        quality?: number;
    }>): Promise<Record<string, ProcessedImage>>;
    compareImages(image1: string | Buffer, image2: string | Buffer): Promise<{
        similarity: number;
        difference: number;
        diffImage?: string;
        identical: boolean;
    }>;
    extractColorPalette(source: string | Buffer, count?: number): Promise<Array<{
        color: string;
        percentage: number;
        rgb: number[];
        hex: string;
    }>>;
    smartCrop(source: string | Buffer, options: {
        width: number;
        height: number;
        focusOn?: 'faces' | 'center' | 'attention';
    }): Promise<ProcessedImage>;
    createCollage(images: Array<string | Buffer>, options?: {
        layout?: 'grid' | 'horizontal' | 'vertical' | 'custom';
        spacing?: number;
        backgroundColor?: string;
        width?: number;
        height?: number;
    }): Promise<ProcessedImage>;
    applyFilter(source: string | Buffer, filter: 'vintage' | 'noir' | 'chrome' | 'fade' | 'vivid' | 'dramatic' | 'warm' | 'cold', intensity?: number): Promise<ProcessedImage>;
    generatePlaceholder(options: {
        width: number;
        height: number;
        text?: string;
        backgroundColor?: string;
        textColor?: string;
        format?: 'jpeg' | 'png' | 'webp';
    }): Promise<ProcessedImage>;
    private hexToRgb;
}
