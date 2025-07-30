import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ClientConfig, ApiResponse, AppAtOnceError } from '../types';

export class HttpClient {
  private client: AxiosInstance;
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;
    
    // Server expects /api/v1 prefix for all endpoints
    const baseUrl = config.baseUrl || 'https://api.appatonce.com';
    const normalizedBaseUrl = baseUrl.endsWith('/api/v1') 
      ? baseUrl 
      : baseUrl.endsWith('/') 
        ? `${baseUrl}api/v1`
        : `${baseUrl}/api/v1`;
    
    const headers: any = {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
    };

    // Add project/app headers for multi-tenant support
    if (config.projectId) {
      headers['x-project-id'] = config.projectId;
    }
    if (config.appId) {
      headers['x-app-id'] = config.appId;
    }

    this.client = axios.create({
      baseURL: normalizedBaseUrl,
      timeout: config.timeout || 30000, // Increased default timeout to 30 seconds
      headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log(`[AppAtOnce SDK] ${config.method?.toUpperCase()} ${config.url}`);
        }
        // Log request details when debug is enabled
        if (this.config.debug) {
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
        if (this.config.debug) {
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
      if (this.config.debug || status === 500) {
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

  // File upload with FormData
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
        'x-api-key': this.config.apiKey,
      },
    });

    return this.formatResponse(response);
  }

  // Update API key
  updateApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers.common['x-api-key'] = apiKey;
  }

  // Get current config
  getConfig(): ClientConfig {
    return { ...this.config };
  }
}