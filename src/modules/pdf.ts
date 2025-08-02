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
  pageRanges?: Array<{ document: number; pages?: string }>;
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

export class PDFModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  // Generate PDF from HTML
  async generateFromHTML(
    html: string,
    options?: PDFGenerationOptions
  ): Promise<PDFDocument> {
    const response = await this.httpClient.post('/pdf/generate/html', {
      html,
      options,
    });
    return response.data;
  }

  // Generate PDF from URL
  async generateFromURL(
    url: string,
    options?: PDFGenerationOptions & {
      waitForSelector?: string;
      waitForTimeout?: number;
      cookies?: Array<{ name: string; value: string; domain?: string }>;
    }
  ): Promise<PDFDocument> {
    const response = await this.httpClient.post('/pdf/generate/url', {
      url,
      ...options,
    });
    return response.data;
  }

  // Generate PDF from template
  async generateFromTemplate(
    templateId: string,
    data: Record<string, any>,
    options?: PDFGenerationOptions
  ): Promise<PDFDocument> {
    const response = await this.httpClient.post('/pdf/generate/template', {
      templateId,
      data,
      options,
    });
    return response.data;
  }

  // Merge multiple PDFs
  async merge(
    documents: Array<string | Buffer>,
    options?: PDFMergeOptions
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    documents.forEach((doc, index) => {
      if (typeof doc === 'string') {
        formData.append(`documents[${index}]`, doc);
      } else {
        formData.append(`files[${index}]`, new Blob([doc]), `document${index}.pdf`);
      }
    });

    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/pdf/merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Split PDF
  async split(
    source: string | Buffer,
    options: {
      pageRanges?: string[];
      pagesPerDocument?: number;
      splitAt?: number[];
    }
  ): Promise<PDFDocument[]> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    formData.append('options', JSON.stringify(options));

    const response = await this.httpClient.post('/pdf/split', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Extract pages
  async extractPages(
    source: string | Buffer,
    pageRanges: string
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    formData.append('pageRanges', pageRanges);

    const response = await this.httpClient.post('/pdf/extract-pages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Rotate pages
  async rotatePages(
    source: string | Buffer,
    rotation: 90 | 180 | 270,
    pages?: string
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    formData.append('rotation', rotation.toString());
    if (pages) {
      formData.append('pages', pages);
    }

    const response = await this.httpClient.post('/pdf/rotate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Add watermark
  async addWatermark(
    source: string | Buffer,
    watermark: {
      text?: string;
      image?: string | Buffer;
      position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';
      opacity?: number;
      rotation?: number;
      fontSize?: number;
      color?: string;
      pages?: string;
    }
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }

    if (watermark.image) {
      if (typeof watermark.image === 'string') {
        formData.append('watermarkImage', watermark.image);
      } else {
        formData.append('watermarkFile', new Blob([watermark.image]), 'watermark');
      }
    }

    const watermarkOptions = { ...watermark };
    delete watermarkOptions.image;
    formData.append('watermark', JSON.stringify(watermarkOptions));

    const response = await this.httpClient.post('/pdf/watermark', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Compress PDF
  async compress(
    source: string | Buffer,
    options?: {
      quality?: 'low' | 'medium' | 'high';
      imageQuality?: number;
      removeMetadata?: boolean;
      removeFonts?: boolean;
    }
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/pdf/compress', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Protect PDF
  async protect(
    source: string | Buffer,
    options: {
      userPassword?: string;
      ownerPassword?: string;
      permissions?: {
        printing?: boolean;
        modifying?: boolean;
        copying?: boolean;
        annotating?: boolean;
        formFilling?: boolean;
      };
    }
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    formData.append('options', JSON.stringify(options));

    const response = await this.httpClient.post('/pdf/protect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Unlock PDF
  async unlock(
    source: string | Buffer,
    password: string
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    formData.append('password', password);

    const response = await this.httpClient.post('/pdf/unlock', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Get PDF info
  async getInfo(source: string | Buffer): Promise<{
    pages: number;
    size: number;
    encrypted: boolean;
    metadata: Record<string, any>;
    pageInfo: PDFPageInfo[];
  }> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }

    const response = await this.httpClient.post('/pdf/info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Convert PDF to images
  async toImages(
    source: string | Buffer,
    options?: {
      format?: 'jpeg' | 'png' | 'webp';
      dpi?: number;
      pages?: string;
      quality?: number;
    }
  ): Promise<Array<{ page: number; url: string; width: number; height: number }>> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/pdf/to-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Add form fields
  async addFormFields(
    source: string | Buffer,
    fields: Array<{
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
    }>
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    formData.append('fields', JSON.stringify(fields));

    const response = await this.httpClient.post('/pdf/add-form-fields', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Fill form
  async fillForm(
    source: string | Buffer,
    data: Record<string, any>,
    options?: {
      flatten?: boolean;
    }
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }
    
    formData.append('data', JSON.stringify(data));
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.httpClient.post('/pdf/fill-form', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Sign PDF
  async sign(
    source: string | Buffer,
    signature: {
      image?: string | Buffer;
      text?: string;
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    },
    certificate?: {
      pfx: Buffer;
      password: string;
    }
  ): Promise<PDFDocument> {
    const formData = new FormData();
    
    if (typeof source === 'string') {
      formData.append('source', source);
    } else {
      formData.append('file', new Blob([source]), 'document.pdf');
    }

    if (signature.image) {
      if (typeof signature.image === 'string') {
        formData.append('signatureImage', signature.image);
      } else {
        formData.append('signatureFile', new Blob([signature.image]), 'signature');
      }
    }

    const signatureOptions = { ...signature };
    delete signatureOptions.image;
    formData.append('signature', JSON.stringify(signatureOptions));

    if (certificate) {
      formData.append('certificate', new Blob([certificate.pfx]), 'certificate.pfx');
      formData.append('certificatePassword', certificate.password);
    }

    const response = await this.httpClient.post('/pdf/sign', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}