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

export class OCRModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Extract text from image
  async extractFromImage(
    source: string | Buffer,
    options?: OCROptions
  ): Promise<OCRResult> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'image');
    }
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/ocr/extract/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Extract text from PDF
  async extractFromPDF(
    source: string | Buffer,
    options?: OCROptions & {
      pages?: string;
      ocrOnlyImages?: boolean;
    }
  ): Promise<OCRResult> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/ocr/extract/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Batch process multiple files
  async batchExtract(
    files: Array<{ source: string | Buffer; options?: OCROptions }>,
    commonOptions?: OCROptions
  ): Promise<OCRResult[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      if (typeof file.source === 'string') {
        formData.append(`sources[${index}]`, file.source);
      } else {
        formData.append(`files[${index}]`, new Blob([file.source]), `file${index}`);
      }
      if (file.options) {
        formData.append(`options[${index}]`, JSON.stringify(file.options));
      }
    });

    if (commonOptions) {
      formData.append('commonOptions', JSON.stringify(commonOptions));
    }

    const response = await this.httpClient.post('/ocr/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Extract text from specific region
  async extractRegion(
    source: string | Buffer,
    region: OCRBoundingBox,
    options?: OCROptions
  ): Promise<OCRResult> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'image');
    }
    
    formData.append('region', JSON.stringify(region));
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/ocr/extract/region', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Extract structured data (forms, invoices, receipts)
  async extractStructured(
    source: string | Buffer,
    documentType: 'invoice' | 'receipt' | 'form' | 'id-card' | 'passport' | 'driver-license' | 'custom',
    schema?: Record<string, any>
  ): Promise<{
    data: Record<string, any>;
    confidence: number;
    rawText: string;
    fields: Array<{
      name: string;
      value: any;
      confidence: number;
      location?: OCRBoundingBox;
    }>;
  }> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }
    
    formData.append('documentType', documentType);
    
    if (schema) {
      formData.append('schema', JSON.stringify(schema));
    }

    const response = await this.httpClient.post('/ocr/extract/structured', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Extract and translate text
  async extractAndTranslate(
    source: string | Buffer,
    targetLanguage: string,
    options?: OCROptions
  ): Promise<{
    originalText: string;
    translatedText: string;
    detectedLanguage: string;
    targetLanguage: string;
    confidence: number;
  }> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'image');
    }
    
    formData.append('targetLanguage', targetLanguage);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/ocr/extract-translate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Search text in document
  async searchText(
    source: string | Buffer,
    searchQuery: string,
    options?: {
      caseSensitive?: boolean;
      wholeWord?: boolean;
      regex?: boolean;
      maxResults?: number;
    }
  ): Promise<Array<{
    text: string;
    pageNumber?: number;
    location: OCRBoundingBox;
    context: string;
  }>> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }
    
    formData.append('searchQuery', searchQuery);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/ocr/search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Create searchable PDF
  async createSearchablePDF(
    source: string | Buffer,
    options?: OCROptions & {
      overlay?: boolean;
      compression?: 'low' | 'medium' | 'high';
    }
  ): Promise<{
    id: string;
    url: string;
    size: number;
    pages: number;
    searchable: boolean;
  }> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/ocr/create-searchable-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Detect document orientation
  async detectOrientation(
    source: string | Buffer
  ): Promise<{
    angle: number;
    confidence: number;
    corrected?: string;
  }> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'image');
    }

    const response = await this.httpClient.post('/ocr/detect-orientation', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Detect document language
  async detectLanguage(
    source: string | Buffer
  ): Promise<{
    languages: Array<{
      code: string;
      name: string;
      confidence: number;
    }>;
    primary: string;
  }> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document');
    }

    const response = await this.httpClient.post('/ocr/detect-language', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get supported languages
  async getSupportedLanguages(): Promise<Array<{
    code: string;
    name: string;
    nativeName: string;
    scriptDirection: 'ltr' | 'rtl';
  }>> {
    const response = await this.httpClient.get('/ocr/languages');
    return response.data;
  }

  // Create OCR job for large files
  async createJob(
    source: string | Buffer,
    options?: OCROptions & {
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
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/ocr/jobs', formData, {
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
    result?: OCRResult;
    error?: string;
    createdAt: string;
    completedAt?: string;
  }> {
    const response = await this.httpClient.get(`/ocr/jobs/${jobId}`);
    return response.data;
  }

  // Wait for job completion
  async waitForJob(jobId: string, options?: {
    timeout?: number;
    pollInterval?: number;
  }): Promise<OCRResult> {
    const timeout = options?.timeout || 300000; // 5 minutes default
    const pollInterval = options?.pollInterval || 2000; // 2 seconds default
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const job = await this.getJobStatus(jobId);
      
      if (job.status === 'completed' && job.result) {
        return job.result;
      }
      
      if (job.status === 'failed') {
        throw new Error(job.error || 'OCR job failed');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`OCR job ${jobId} timed out after ${timeout}ms`);
  }
}