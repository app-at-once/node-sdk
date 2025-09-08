export interface ChatbotOptions {
    position?: 'bottom-right' | 'bottom-left';
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
    };
    startOpen?: boolean;
    zIndex?: number;
}
export interface ChatbotWidget {
    show(): void;
    hide(): void;
    toggle(): void;
    destroy(): void;
    isOpen(): boolean;
}
export declare function loadChatbot(apiKey: string, options?: ChatbotOptions): ChatbotWidget;
export default loadChatbot;
