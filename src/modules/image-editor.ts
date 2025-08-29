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
  quality?: number; // 0-1 for jpg
  scale?: number; // multiplier for resolution
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

export class ImageEditorModule {
  constructor(private client: HttpClient) {}

  /**
   * Create a new image design
   * @param data Image creation data
   * @returns Created image content
   */
  async createImage(data: CreateImageDto): Promise<any> {
    const content = {
      resourceId: data.resourceId,
      resourceType: data.resourceType,
      contentType: 'image',
      title: data.title,
      content: {
        canvasData: typeof data.canvasData === 'string' ? data.canvasData : JSON.stringify(data.canvasData),
        width: data.width,
        height: data.height,
      },
      source: 'image-editor',
    };

    const response = await this.client.post('/content', content);
    return response.data;
  }

  /**
   * Update existing image design
   * @param contentId Content ID
   * @param data Update data
   * @returns Updated content
   */
  async updateImage(contentId: string, data: UpdateImageDto): Promise<any> {
    const updatePayload: any = {};

    if (data.title) {
      updatePayload.title = data.title;
    }

    if (data.canvasData || data.width || data.height) {
      updatePayload.content = {};
      if (data.canvasData) {
        updatePayload.content.canvasData = typeof data.canvasData === 'string' 
          ? data.canvasData 
          : JSON.stringify(data.canvasData);
      }
      if (data.width) updatePayload.content.width = data.width;
      if (data.height) updatePayload.content.height = data.height;
    }

    const response = await this.client.put(`/content/${contentId}`, updatePayload);
    return response.data;
  }

  /**
   * Export image in various formats
   * @param contentId Content ID
   * @param options Export options
   * @returns Export data or URL
   */
  async exportImage(contentId: string, options: ImageExportOptions): Promise<any> {
    const params = new URLSearchParams({
      format: options.format,
      ...(options.quality && { quality: options.quality.toString() }),
      ...(options.scale && { scale: options.scale.toString() }),
      ...(options.includeBleed && { includeBleed: 'true' }),
      ...(options.transparentBackground && { transparentBackground: 'true' }),
    });

    const response = await this.client.get(`/content/${contentId}/export?${params}`);
    return response.data;
  }

  /**
   * Upload image data and get URLs
   * @param imageData Base64 image data or blob
   * @param resourceId Project or app ID
   * @param resourceType Resource type
   * @returns Upload result with URLs
   */
  async uploadImage(
    imageData: string | Blob,
    resourceId: string,
    resourceType: 'project' | 'app' = 'project'
  ): Promise<ImageUploadResult> {
    const formData = new FormData();
    
    if (typeof imageData === 'string') {
      // Convert base64 to blob if needed
      if (imageData.startsWith('data:')) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        formData.append('file', blob, 'image.png');
      } else {
        formData.append('imageData', imageData);
      }
    } else {
      formData.append('file', imageData);
    }

    formData.append('resourceId', resourceId);
    formData.append('resourceType', resourceType);

    const response = await this.client.post<ImageUploadResult>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get available image templates
   * @param category Optional category filter
   * @returns Array of templates
   */
  async getTemplates(category?: string): Promise<ImageTemplate[]> {
    const url = category ? `/image-templates?category=${category}` : '/image-templates';
    const response = await this.client.get<ImageTemplate[]>(url);
    return response.data;
  }

  /**
   * Get template by ID
   * @param templateId Template ID
   * @returns Template details
   */
  async getTemplateById(templateId: string): Promise<ImageTemplate> {
    const response = await this.client.get<ImageTemplate>(`/image-templates/${templateId}`);
    return response.data;
  }

  /**
   * Apply background removal to an image
   * @param contentId Content ID
   * @returns Updated content with background removed
   */
  async removeBackground(contentId: string): Promise<any> {
    const response = await this.client.post(`/content/${contentId}/remove-background`);
    return response.data;
  }

  /**
   * Apply filters to an image
   * @param contentId Content ID
   * @param filter Filter type
   * @param options Filter options
   * @returns Updated content
   */
  async applyFilter(
    contentId: string,
    filter: string,
    options?: Record<string, any>
  ): Promise<any> {
    const response = await this.client.post(`/content/${contentId}/filter`, {
      filter,
      options,
    });
    return response.data;
  }

  /**
   * Generate image using AI
   * @param prompt Text prompt
   * @param options Generation options
   * @returns Generated image URL
   */
  async generateImageAI(
    prompt: string,
    options?: {
      style?: string;
      size?: string;
      model?: string;
    }
  ): Promise<{ imageUrl: string; metadata?: any }> {
    const response = await this.client.post('/ai/image', {
      prompt,
      ...options,
    });
    return response.data;
  }

  /**
   * Create image from template
   * @param templateId Template ID
   * @param customizations Customization options
   * @returns Created content
   */
  async createFromTemplate(
    templateId: string,
    customizations: {
      resourceId: string;
      resourceType: 'project' | 'app';
      title: string;
      elements?: Partial<TemplateElement>[];
    }
  ): Promise<any> {
    const template = await this.getTemplateById(templateId);
    
    // Apply customizations to template elements
    const customizedElements = template.elements.map((element, index) => {
      if (customizations.elements && customizations.elements[index]) {
        return {
          ...element,
          properties: {
            ...element.properties,
            ...customizations.elements[index].properties,
          },
        };
      }
      return element;
    });

    // Create canvas data from template
    const canvasData = {
      version: '2.0.0',
      objects: customizedElements,
      background: template.backgroundColor,
      width: template.width,
      height: template.height,
    };

    return this.createImage({
      resourceId: customizations.resourceId,
      resourceType: customizations.resourceType,
      title: customizations.title,
      canvasData,
      width: template.width,
      height: template.height,
    });
  }
}