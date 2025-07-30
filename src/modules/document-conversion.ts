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

export class DocumentConversionModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Convert document between formats
  async convert(
    source: string | Buffer,
    targetFormat: string,
    options?: ConversionOptions
  ): Promise<ConvertedDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }
    
    formData.append('targetFormat', targetFormat);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/document-conversion/convert', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Batch convert multiple documents
  async batchConvert(
    documents: Array<{
      source: string | Buffer;
      targetFormat: string;
      options?: ConversionOptions;
    }>,
    commonOptions?: ConversionOptions
  ): Promise<ConvertedDocument[]> {
    const formData = new FormData();
    
    documents.forEach((doc, index) => {
      if (typeof doc.source === 'string') {
        formData.append(`sources[${index}]`, doc.source);
      } else {
        formData.append(`files[${index}]`, new Blob([doc.source]), `document${index}`);
      }
      formData.append(`targetFormats[${index}]`, doc.targetFormat);
      if (doc.options) {
        formData.append(`options[${index}]`, JSON.stringify(doc.options));
      }
    });

    if (commonOptions) {
      formData.append('commonOptions', JSON.stringify(commonOptions));
    }

    const response = await this.httpClient.post('/document-conversion/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Office document conversions
  async convertOffice(
    source: string | Buffer,
    targetFormat: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'odt' | 'ods' | 'odp',
    options?: ConversionOptions & {
      compatibility?: 'office2007' | 'office2010' | 'office2016' | 'office365';
      macros?: 'keep' | 'remove' | 'disable';
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, targetFormat, options);
  }

  // Convert to PDF
  async toPDF(
    source: string | Buffer,
    options?: ConversionOptions & {
      pdfVersion?: '1.4' | '1.5' | '1.6' | '1.7' | '2.0';
      pdfA?: boolean;
      optimization?: 'web' | 'print' | 'prepress' | 'default';
      compression?: boolean;
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, 'pdf', options);
  }

  // Convert from PDF
  async fromPDF(
    source: string | Buffer,
    targetFormat: 'docx' | 'xlsx' | 'pptx' | 'html' | 'txt' | 'rtf' | 'epub',
    options?: ConversionOptions & {
      ocrEnabled?: boolean;
      preserveLayout?: boolean;
      extractImages?: boolean;
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, targetFormat, options);
  }

  // Image format conversions
  async convertImage(
    source: string | Buffer,
    targetFormat: 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'bmp' | 'svg',
    options?: ConversionOptions & {
      width?: number;
      height?: number;
      dpi?: number;
      colorSpace?: 'rgb' | 'cmyk' | 'grayscale';
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, targetFormat, options);
  }

  // eBook conversions
  async convertEbook(
    source: string | Buffer,
    targetFormat: 'epub' | 'mobi' | 'azw3' | 'pdf' | 'txt',
    options?: ConversionOptions & {
      fontSize?: number;
      fontFamily?: string;
      marginSize?: number;
      chapterDetection?: boolean;
      tableOfContents?: boolean;
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, targetFormat, options);
  }

  // HTML conversions
  async convertHTML(
    source: string | Buffer,
    targetFormat: 'pdf' | 'docx' | 'epub' | 'markdown',
    options?: ConversionOptions & {
      includeCSS?: boolean;
      includeImages?: boolean;
      baseUrl?: string;
      encoding?: string;
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, targetFormat, options);
  }

  // Markdown conversions
  async convertMarkdown(
    source: string | Buffer,
    targetFormat: 'html' | 'pdf' | 'docx' | 'epub',
    options?: ConversionOptions & {
      theme?: string;
      syntaxHighlighting?: boolean;
      mathRendering?: boolean;
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, targetFormat, options);
  }

  // CAD conversions
  async convertCAD(
    source: string | Buffer,
    targetFormat: 'pdf' | 'dwg' | 'dxf' | 'svg' | 'png',
    options?: ConversionOptions & {
      scale?: number;
      layers?: string[];
      colorMode?: 'color' | 'blackwhite' | 'grayscale';
      lineWeight?: number;
    }
  ): Promise<ConvertedDocument> {
    return this.convert(source, targetFormat, options);
  }

  // Get document information
  async getInfo(source: string | Buffer): Promise<DocumentInfo> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }

    const response = await this.httpClient.post('/document-conversion/info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get supported formats
  async getSupportedFormats(sourceFormat?: string): Promise<{
    sourceFormats: string[];
    targetFormats: Record<string, string[]>;
    categories: Record<string, string[]>;
  }> {
    const params = sourceFormat ? { sourceFormat } : {};
    const response = await this.httpClient.get('/document-conversion/formats', { params });
    return response.data;
  }

  // Validate conversion
  async validateConversion(
    sourceFormat: string,
    targetFormat: string
  ): Promise<{
    supported: boolean;
    limitations?: string[];
    recommendations?: string[];
    estimatedQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    const response = await this.httpClient.post('/document-conversion/validate', {
      sourceFormat,
      targetFormat,
    });
    return response.data;
  }

  // Create conversion job for large files
  async createJob(
    source: string | Buffer,
    targetFormat: string,
    options?: ConversionOptions & {
      callback?: string;
      priority?: 'low' | 'normal' | 'high';
    }
  ): Promise<{
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    estimatedTime?: number;
  }> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }
    
    formData.append('targetFormat', targetFormat);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/document-conversion/jobs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<{
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: ConvertedDocument;
    error?: string;
    createdAt: string;
    completedAt?: string;
  }> {
    const response = await this.httpClient.get(`/document-conversion/jobs/${jobId}`);
    return response.data;
  }

  // Cancel job
  async cancelJob(jobId: string): Promise<void> {
    await this.httpClient.delete(`/document-conversion/jobs/${jobId}`);
  }

  // Wait for job completion
  async waitForJob(jobId: string, options?: {
    timeout?: number;
    pollInterval?: number;
  }): Promise<ConvertedDocument> {
    const timeout = options?.timeout || 300000; // 5 minutes default
    const pollInterval = options?.pollInterval || 2000; // 2 seconds default
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const job = await this.getJobStatus(jobId);
      
      if (job.status === 'completed' && job.result) {
        return job.result;
      }
      
      if (job.status === 'failed') {
        throw new Error(job.error || 'Conversion job failed');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Conversion job ${jobId} timed out after ${timeout}ms`);
  }

  // Merge multiple documents
  async merge(
    documents: Array<string | Buffer>,
    targetFormat: string,
    options?: ConversionOptions & {
      insertPageBreaks?: boolean;
      uniformFormatting?: boolean;
      tableOfContents?: boolean;
    }
  ): Promise<ConvertedDocument> {
    const formData = new FormData();
    
    documents.forEach((doc, index) => {
      if (typeof doc === 'string') {
        formData.append(`documents[${index}]`, doc);
      } else {
        formData.append(`files[${index}]`, new Blob([doc]), `document${index}`);
      }
    });
    
    formData.append('targetFormat', targetFormat);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/document-conversion/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Split document
  async split(
    source: string | Buffer,
    options: {
      splitBy: 'pages' | 'size' | 'bookmarks' | 'headings';
      value?: number | string[];
      targetFormat?: string;
    }
  ): Promise<ConvertedDocument[]> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }
    
    formData.append('options', JSON.stringify(options));

    const response = await this.httpClient.post('/document-conversion/split', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}