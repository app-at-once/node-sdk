import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, AppAtOnceError } from '../types';
import { APPATONCE_BASE_URL } from '../constants';

export class HttpClient {
  private client: AxiosInstance;
  private apiKey: string;
  private timeout: number;
  private debug: boolean = process.env.DEBUG === 'true' || process.env.APPATONCE_DEBUG === 'true';

  constructor(apiKey: string, timeout?: number) {
    this.apiKey = apiKey;
    this.timeout = timeout || 120000;
    
    // Use the base URL directly from constants
    const baseUrl = APPATONCE_BASE_URL;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: this.timeout,
      headers,
      // CRITICAL FIX: Use custom parameter serializer for nested arrays
      paramsSerializer: (params) => {
        return this.serializeParams(params);
      }
    });

    this.setupInterceptors();
  }

  /**
   * Custom parameter serializer that properly handles nested arrays and indexed parameters
   * This is CRITICAL for WHERE clause and other complex query parameters
   * 
   * Handles formats like:
   * - where[0][field]=name&where[0][operator]=eq&where[0][value]=test
   * - orderBy[0][field]=created_at&orderBy[0][direction]=desc
   */
  private serializeParams(params: any): string {
    const parts: string[] = [];
    
    // Check if params are already in the indexed format (e.g., where[0][field])
    const hasIndexedFormat = Object.keys(params || {}).some(key => 
      /\[\d+\]\[/.test(key)
    );
    
    if (hasIndexedFormat) {
      // Params are already indexed, just encode them
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });
    } else {
      // Need to serialize nested objects/arrays properly
      const encode = (key: string, value: any) => {
        if (value === null || value === undefined) {
          return;
        }
        
        // Already a string in indexed format - just add it
        if (typeof key === 'string' && key.includes('[') && key.includes(']')) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        } 
        // Array of objects (like where conditions)
        else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              Object.keys(item).forEach(prop => {
                const encodedKey = `${key}[${index}][${prop}]`;
                if (item[prop] !== null && item[prop] !== undefined) {
                  parts.push(`${encodeURIComponent(encodedKey)}=${encodeURIComponent(item[prop])}`);
                }
              });
            } else {
              parts.push(`${encodeURIComponent(`${key}[${index}]`)}=${encodeURIComponent(item)}`);
            }
          });
        } 
        // Simple object
        else if (typeof value === 'object') {
          Object.keys(value).forEach((k) => {
            encode(`${key}[${k}]`, value[k]);
          });
        } 
        // Primitive value
        else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      };
      
      Object.keys(params || {}).forEach((key) => {
        encode(key, params[key]);
      });
    }
    
    const serialized = parts.join('&');
    
    if (this.debug) {
      console.log('[HttpClient] Serialized params:', serialized);
      console.log('[HttpClient] Original params:', JSON.stringify(params, null, 2));
    }
    
    return serialized;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Debug logging
        console.log(`[SDK HTTP] ${config.method?.toUpperCase()} ${config.url}`);
        console.log('[SDK HTTP] Headers:', config.headers);
        
        // CRITICAL: Log query parameters for debugging WHERE clause issues
        if (config.params) {
          console.log('[SDK HTTP] Query params object:', JSON.stringify(config.params, null, 2));
          // Show the serialized URL that will be sent
          if (config.paramsSerializer && typeof config.paramsSerializer === 'function') {
            const serialized = config.paramsSerializer(config.params);
            console.log('[SDK HTTP] Serialized query string:', serialized);
          }
        }
        
        if (config.data) {
          console.log('[SDK HTTP] Body present, size:', JSON.stringify(config.data).length);
        } else {
          console.log('[SDK HTTP] No body data');
        }
        
        if (this.debug) {
          console.log(`[AppAtOnce SDK] ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`[AppAtOnce SDK Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
          if (config.data) {
            console.log('[AppAtOnce SDK Request Body]:', JSON.stringify(config.data, null, 2));
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.debug) {
          console.log(`[AppAtOnce SDK] Response:`, response.data);
        }
        return response;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): AppAtOnceError {
    const appError = new Error() as AppAtOnceError;
    
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      // Extract error message from various possible fields
      let errorMessage = data?.message || data?.error || 'Request failed';
      
      // If data is a string, use it as the message
      if (typeof data === 'string') {
        errorMessage = data;
      }
      
      // Check for nested error structures
      if (data?.data?.message) {
        errorMessage = data.data.message;
      }
      
      appError.message = errorMessage;
      
      // Add more details for debugging
      if (data?.stack) {
        console.error('Server error stack:', data.stack);
      }
      
      // Log full error response for debugging
      if (this.debug || status === 500) {
        console.error('Full error response:', {
          status,
          data,
          headers: error.response.headers
        });
      }
      
      appError.code = data?.code || `HTTP_${status}`;
      appError.statusCode = status;
      appError.details = data?.details || data;
    } else if (error.request) {
      // Request was made but no response
      appError.message = 'Network error - no response received';
      appError.code = 'NETWORK_ERROR';
    } else {
      // Something else happened
      appError.message = error.message || 'Unknown error';
      appError.code = 'UNKNOWN_ERROR';
    }

    return appError;
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return this.formatResponse(response);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return this.formatResponse(response);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return this.formatResponse(response);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return this.formatResponse(response);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return this.formatResponse(response);
  }

  private formatResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      data: response.data,
      meta: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      },
    };
  }

  // File upload with FormData (Node.js)
  async uploadFile(url: string, file: Buffer, filename: string, options?: any): Promise<ApiResponse> {
    // Dynamic import to avoid ESLint error
    const { default: FormData } = await import('form-data');
    const formData = new FormData();
    
    formData.append('file', file, filename);

    // Add any additional options
    if (options) {
      Object.keys(options).forEach(key => {
        formData.append(key, typeof options[key] === 'object' ? JSON.stringify(options[key]) : options[key]);
      });
    }

    const response = await this.client.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': this.apiKey,
      },
    });

    return this.formatResponse(response);
  }

  // Browser-friendly file upload with File object
  async uploadFileFromBrowser(url: string, file: File, options?: any): Promise<ApiResponse> {
    console.log('uploadFileFromBrowser called with:', { url, fileName: file.name, fileType: file.type, fileSize: file.size, options });
    
    const formData = new FormData(); // Browser FormData
    
    formData.append('file', file);
    console.log('FormData file appended');

    // Add any additional options
    if (options) {
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined) {
          formData.append(key, typeof options[key] === 'object' ? JSON.stringify(options[key]) : options[key]);
          console.log(`FormData appended: ${key} = ${typeof options[key] === 'object' ? JSON.stringify(options[key]) : options[key]}`);
        }
      });
    }
    
    // Debug: Let's see what's in the FormData
    console.log('FormData created with file:', file.name, 'size:', file.size);

    console.log('Sending request to:', url);
    console.log('API Key being used:', this.apiKey);
    
    const response = await this.client.post(url, formData, {
      headers: {
        'x-api-key': this.apiKey,
        // Don't set Content-Type - let browser set it with boundary
      },
      // Ensure axios treats this as form data
      transformRequest: [(data, _headers) => {
        return data;
      }],
    });

    return this.formatResponse(response);
  }

  // Update API key
  updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client.defaults.headers.common['x-api-key'] = apiKey;
  }

  // Set custom header
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  // Enable/disable debug mode
  setDebug(debug: boolean): void {
    this.debug = debug;
  }
}