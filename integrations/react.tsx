import React, { useEffect, useRef, useState } from 'react';
import { AppAtOnceClient } from '../index';
import { ChatbotWidget, ChatbotRenderOptions } from '../modules/chatbot';

/**
 * React hook for AppAtOnce chatbot
 */
export function useAppAtOnceChatbot(
  client: AppAtOnceClient,
  options?: ChatbotRenderOptions
) {
  const [widget, setWidget] = useState<ChatbotWidget | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let widgetInstance: ChatbotWidget | null = null;

    const initChatbot = async () => {
      try {
        setError(null);
        widgetInstance = await client.chatbot.render({
          ...options,
          container: containerRef.current || undefined,
          onReady: () => {
            setIsReady(true);
            options?.onReady?.();
          },
          onError: (err) => {
            setError(err);
            options?.onError?.(err);
          }
        });
        setWidget(widgetInstance);
      } catch (err) {
        setError(err as Error);
      }
    };

    initChatbot();

    return () => {
      if (widgetInstance) {
        widgetInstance.destroy();
      }
    };
  }, [client]);

  return {
    widget,
    isReady,
    error,
    containerRef
  };
}

/**
 * React component for AppAtOnce chatbot
 */
interface AppAtOnceChatbotProps {
  client: AppAtOnceClient;
  options?: ChatbotRenderOptions;
  children?: React.ReactNode;
}

export function AppAtOnceChatbot({ 
  client, 
  options,
  children 
}: AppAtOnceChatbotProps) {
  const { containerRef, error } = useAppAtOnceChatbot(client, options);

  if (error) {
    return (
      <div style={{ color: 'red', padding: '10px' }}>
        Error loading chatbot: {error.message}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

/**
 * Context provider for app-wide chatbot access
 */
const ChatbotContext = React.createContext<{
  widget: ChatbotWidget | null;
  isReady: boolean;
  error: Error | null;
}>({
  widget: null,
  isReady: false,
  error: null
});

export function ChatbotProvider({ 
  children, 
  client,
  options 
}: {
  children: React.ReactNode;
  client: AppAtOnceClient;
  options?: ChatbotRenderOptions;
}) {
  const chatbot = useAppAtOnceChatbot(client, options);
  
  return (
    <ChatbotContext.Provider value={chatbot}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  return React.useContext(ChatbotContext);
}

/**
 * Floating action button component
 */
export function ChatbotFAB({ 
  client,
  options 
}: {
  client: AppAtOnceClient;
  options?: ChatbotRenderOptions;
}) {
  return (
    <AppAtOnceChatbot 
      client={client} 
      options={{
        ...options,
        mode: 'widget',
        startMinimized: true
      }} 
    />
  );
}