import { HttpClient } from '../core/http-client';
import { RealtimeModule } from './realtime';
export interface ChatbotConfig {
    enabled: boolean;
    name: string;
    welcomeMessage: string;
    placeholder: string;
    primaryColor: string;
    secondaryColor: string;
    position: 'bottom-right' | 'bottom-left';
    model: string;
    temperature: number;
    maxTokens: number;
    language: string;
    enableMultilingual: boolean;
    enableFileUpload: boolean;
    enableVoice: boolean;
    customInstructions?: string;
}
export interface ChatbotRenderOptions {
    container?: string | HTMLElement;
    mode?: 'iframe' | 'widget';
    sessionId?: string;
    userId?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
    };
    position?: 'bottom-right' | 'bottom-left';
    startOpen?: boolean;
    startMinimized?: boolean;
    hideOnMobile?: boolean;
    enableSounds?: boolean;
    enableNotifications?: boolean;
    onReady?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
    onMessage?: (message: ChatMessage) => void;
    onError?: (error: Error) => void;
}
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: any;
}
export interface ChatbotWidget {
    show(): void;
    hide(): void;
    toggle(): void;
    open(): void;
    close(): void;
    sendMessage(message: string): Promise<void>;
    setUser(user: {
        id?: string;
        name?: string;
        email?: string;
    }): void;
    setContext(context: Record<string, any>): void;
    destroy(): void;
}
export declare class ChatbotModule {
    private httpClient;
    private realtime;
    private apiKey;
    private widget;
    private config;
    private container;
    constructor(httpClient: HttpClient, realtime: RealtimeModule, apiKey: string);
    render(options?: ChatbotRenderOptions): Promise<ChatbotWidget>;
    private fetchConfig;
    private renderIframe;
    private renderWidget;
    private setupRealtimeConnection;
    private addMessageToUI;
    private getContainer;
    private generateSessionId;
    getWidget(): ChatbotWidget | null;
}
