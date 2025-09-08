import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';
export declare class HttpClient {
    private client;
    private apiKey;
    private timeout;
    private debug;
    constructor(apiKey: string, timeout?: number);
    private serializeParams;
    private setupInterceptors;
    private handleError;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    private formatResponse;
    uploadFile(url: string, file: Buffer, filename: string, options?: any): Promise<ApiResponse>;
    uploadFileFromBrowser(url: string, file: File, options?: any): Promise<ApiResponse>;
    updateApiKey(apiKey: string): void;
    setHeader(key: string, value: string): void;
    setDebug(debug: boolean): void;
}
