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
    palette: Array<{ color: string; percentage: number }>;
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

export class ImageProcessingModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Process image with various operations
  async processImage(
    source: string | Buffer,
    options: ImageProcessingOptions
  ): Promise<ProcessedImage> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'image');
    }
    
    formData.append('options', JSON.stringify(options));

    const response = await this.httpClient.post('/image-processing/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Batch process multiple images
  async batchProcess(
    images: Array<{ source: string | Buffer; options: ImageProcessingOptions }>,
    commonOptions?: ImageProcessingOptions
  ): Promise<ProcessedImage[]> {
    const formData = new FormData();
    
    images.forEach((img, index) => {
      if (typeof img.source === 'string') {
        formData.append(`sources[${index}]`, img.source);
      } else {
        formData.append(`files[${index}]`, new Blob([img.source]), `image${index}`);
      }
      formData.append(`options[${index}]`, JSON.stringify(img.options));
    });

    if (commonOptions) {
      formData.append('commonOptions', JSON.stringify(commonOptions));
    }

    const response = await this.httpClient.post('/image-processing/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Analyze image content
  async analyzeImage(
    source: string | Buffer,
    options?: {
      detectFaces?: boolean;
      detectObjects?: boolean;
      extractText?: boolean;
      analyzeColors?: boolean;
      extractMetadata?: boolean;
    }
  ): Promise<ImageAnalysis> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'image');
    }
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/image-processing/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Generate thumbnail
  async generateThumbnail(
    source: string | Buffer,
    options?: {
      width?: number;
      height?: number;
      format?: 'jpeg' | 'png' | 'webp';
      quality?: number;
    }
  ): Promise<ProcessedImage> {
    return this.processImage(source, {
      resize: {
        width: options?.width || 200,
        height: options?.height || 200,
        fit: 'cover',
      },
      format: options?.format,
      quality: options?.quality,
    });
  }

  // Convert image format
  async convertFormat(
    source: string | Buffer,
    format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff',
    options?: {
      quality?: number;
      compress?: boolean;
    }
  ): Promise<ProcessedImage> {
    return this.processImage(source, {
      format,
      quality: options?.quality,
      compress: options?.compress,
    });
  }

  // Optimize image for web
  async optimizeForWeb(
    source: string | Buffer,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      format?: 'jpeg' | 'webp' | 'avif';
      quality?: number;
    }
  ): Promise<ProcessedImage> {
    return this.processImage(source, {
      resize: {
        width: options?.maxWidth,
        height: options?.maxHeight,
        fit: 'inside',
      },
      format: options?.format || 'webp',
      quality: options?.quality || 85,
      compress: true,
    });
  }

  // Create image variants
  async createVariants(
    source: string | Buffer,
    variants: Array<{
      name: string;
      width?: number;
      height?: number;
      format?: string;
      quality?: number;
    }>
  ): Promise<Record<string, ProcessedImage>> {
    const results: Record<string, ProcessedImage> = {};
    
    const promises = variants.map(async (variant) => {
      const processed = await this.processImage(source, {
        resize: {
          width: variant.width,
          height: variant.height,
          fit: 'cover',
        },
        format: variant.format as any,
        quality: variant.quality,
      });
      results[variant.name] = processed;
    });

    await Promise.all(promises);
    return results;
  }

  // Compare images
  async compareImages(
    image1: string | Buffer,
    image2: string | Buffer
  ): Promise<{
    similarity: number;
    difference: number;
    diffImage?: string;
    identical: boolean;
  }> {
    const formData = new FormData();
    
    if (typeof image1 === 'string') {
      formData.append('image1', image1);
    } else {
      formData.append('file1', new Blob([image1]), 'image1');
    }
    
    if (typeof image2 === 'string') {
      formData.append('image2', image2);
    } else {
      formData.append('file2', new Blob([image2]), 'image2');
    }

    const response = await this.httpClient.post('/image-processing/compare', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Extract color palette
  async extractColorPalette(
    source: string | Buffer,
    count?: number
  ): Promise<Array<{ color: string; percentage: number; rgb: number[]; hex: string }>> {
    const analysis = await this.analyzeImage(source, { analyzeColors: true });
    return analysis.colors.palette.slice(0, count || 5).map(p => ({
      ...p,
      rgb: this.hexToRgb(p.color),
      hex: p.color,
    }));
  }

  // Smart crop with face detection
  async smartCrop(
    source: string | Buffer,
    options: {
      width: number;
      height: number;
      focusOn?: 'faces' | 'center' | 'attention';
    }
  ): Promise<ProcessedImage> {
    // First analyze the image to detect faces
    const analysis = await this.analyzeImage(source, { detectFaces: true });
    
    const cropOptions: any = {
      width: options.width,
      height: options.height,
    };

    if (options.focusOn === 'faces' && analysis.faces && analysis.faces.length > 0) {
      // Calculate crop position based on face detection
      const face = analysis.faces[0];
      cropOptions.x = Math.max(0, face.x - (options.width - face.width) / 2);
      cropOptions.y = Math.max(0, face.y - (options.height - face.height) / 2);
    }

    return this.processImage(source, { crop: cropOptions });
  }

  // Create collage from multiple images
  async createCollage(
    images: Array<string | Buffer>,
    options?: {
      layout?: 'grid' | 'horizontal' | 'vertical' | 'custom';
      spacing?: number;
      backgroundColor?: string;
      width?: number;
      height?: number;
    }
  ): Promise<ProcessedImage> {
    const formData = new FormData();
    
    images.forEach((img, index) => {
      if (typeof img === 'string') {
        formData.append(`images[${index}]`, img);
      } else {
        formData.append(`files[${index}]`, new Blob([img]), `image${index}`);
      }
    });

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/image-processing/collage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Apply filters
  async applyFilter(
    source: string | Buffer,
    filter: 'vintage' | 'noir' | 'chrome' | 'fade' | 'vivid' | 'dramatic' | 'warm' | 'cold',
    intensity?: number
  ): Promise<ProcessedImage> {
    const response = await this.httpClient.post('/image-processing/filter', {
      source: typeof source === 'string' ? source : source.toString('base64'),
      filter,
      intensity: intensity || 1.0,
    });
    return response.data;
  }

  // Generate image from text (placeholder/mockup)
  async generatePlaceholder(options: {
    width: number;
    height: number;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    format?: 'jpeg' | 'png' | 'webp';
  }): Promise<ProcessedImage> {
    const response = await this.httpClient.post('/image-processing/placeholder', options);
    return response.data;
  }

  // Helper method
  private hexToRgb(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  }
}