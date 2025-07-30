import { AxiosRequestConfig } from 'axios';
import { ClientConfig, ApiResponse } from '../types';
export declare class HttpClient {
    private client;
    private config;
    constructor(config: ClientConfig);
    private setupInterceptors;
    private handleError;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    private formatResponse;
    uploadFile(url: string, file: Buffer, filename: string, options?: any): Promise<ApiResponse>;
    updateApiKey(apiKey: string): void;
    getConfig(): ClientConfig;
}
