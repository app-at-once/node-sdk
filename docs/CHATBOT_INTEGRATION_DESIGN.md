# AppAtOnce Chatbot SDK Integration Design

## Overview

This document outlines the design for integrating a professional chatbot widget into the AppAtOnce Node SDK. The integration allows developers to embed a fully-featured chatbot with a single function call while leveraging the existing Socket.IO infrastructure for real-time messaging.

## Architecture Overview

```
┌─────────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│                     │     │                    │     │                  │
│   Client App        │────▶│  AppAtOnce SDK     │────▶│  AppAtOnce API   │
│   (React/Vue/etc)   │     │  - Chatbot Module  │     │  - Config API    │
│                     │     │  - Realtime Module │     │  - Message API   │
└─────────────────────┘     └────────────────────┘     └──────────────────┘
           │                           │                          │
           │                           │                          │
           ▼                           ▼                          ▼
    ┌─────────────┐           ┌─────────────┐          ┌──────────────┐
    │  Chatbot    │           │  Socket.IO  │          │  Database    │
    │  Widget     │◀─────────▶│  Connection │◀────────▶│  - Messages  │
    │  (UI)       │           │             │          │  - Sessions  │
    └─────────────┘           └─────────────┘          └──────────────┘
```

## 1. SDK Method Signatures and Options

### Core Chatbot Module

```typescript
// New types for chatbot
export interface ChatbotConfig {
  id: string;
  name: string;
  avatar?: string;
  theme: ChatbotTheme;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  behavior: ChatbotBehavior;
  messages: {
    welcome?: string;
    placeholder?: string;
    offline?: string;
  };
  features: ChatbotFeatures;
  metadata?: Record<string, any>;
}

export interface ChatbotTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius?: number;
  fontFamily?: string;
  customCSS?: string;
}

export interface ChatbotBehavior {
  autoOpen?: boolean;
  autoOpenDelay?: number;
  persistState?: boolean;
  soundEnabled?: boolean;
  typingIndicator?: boolean;
  readReceipts?: boolean;
  maxHeight?: string;
  maxWidth?: string;
}

export interface ChatbotFeatures {
  fileUpload?: boolean;
  voiceInput?: boolean;
  reactions?: boolean;
  quickReplies?: boolean;
  ratings?: boolean;
  searchHistory?: boolean;
  exportChat?: boolean;
  multiLanguage?: boolean;
}

export interface ChatbotSession {
  id: string;
  userId?: string;
  visitorId: string;
  startedAt: Date;
  metadata?: Record<string, any>;
}

export interface ChatbotMessage {
  id: string;
  sessionId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'system';
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number; // for voice messages
  };
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: Array<{ emoji: string; userId: string }>;
}

// Main chatbot module
export class ChatbotModule {
  private httpClient: HttpClient;
  private realtime: RealtimeModule;
  private config?: ChatbotConfig;
  private session?: ChatbotSession;
  private widgetInstance?: ChatbotWidget;

  constructor(httpClient: HttpClient, realtime: RealtimeModule) {
    this.httpClient = httpClient;
    this.realtime = realtime;
  }

  // Initialize and render chatbot
  async render(options?: ChatbotRenderOptions): Promise<ChatbotWidget> {
    // Implementation details below
  }

  // Get or create chatbot instance
  async initialize(chatbotId?: string): Promise<ChatbotConfig> {
    // Implementation details below
  }

  // Send message
  async sendMessage(content: string, type?: ChatbotMessage['type']): Promise<ChatbotMessage> {
    // Implementation details below
  }

  // Subscribe to messages
  onMessage(callback: (message: ChatbotMessage) => void): () => void {
    // Implementation details below
  }

  // Other methods...
}

export interface ChatbotRenderOptions {
  // Widget configuration
  container?: HTMLElement | string; // DOM element or selector
  mode?: 'iframe' | 'component' | 'auto'; // Rendering mode
  
  // Override server config
  position?: ChatbotConfig['position'];
  theme?: Partial<ChatbotTheme>;
  behavior?: Partial<ChatbotBehavior>;
  
  // User identification
  user?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    metadata?: Record<string, any>;
  };
  
  // Session configuration
  sessionMetadata?: Record<string, any>;
  language?: string;
  
  // Event handlers
  onReady?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (message: ChatbotMessage) => void;
  onError?: (error: Error) => void;
}
```

### Simple Usage API

```typescript
// In the main AppAtOnceClient class
export class AppAtOnceClient {
  // ... existing properties ...
  public readonly chatbot: ChatbotModule;

  constructor(config: ClientConfig) {
    // ... existing initialization ...
    this.chatbot = new ChatbotModule(this.httpClient, this.realtime);
  }
}

// Usage examples:

// 1. Simplest usage - auto render with defaults
const widget = await client.chatbot.render();

// 2. Custom container
const widget = await client.chatbot.render({
  container: '#chatbot-container'
});

// 3. With user identification
const widget = await client.chatbot.render({
  user: {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com'
  }
});

// 4. Full customization
const widget = await client.chatbot.render({
  container: '#my-chat',
  mode: 'component',
  position: 'bottom-left',
  theme: {
    primaryColor: '#007bff',
    borderRadius: 16
  },
  behavior: {
    autoOpen: true,
    autoOpenDelay: 3000
  },
  onMessage: (message) => {
    console.log('New message:', message);
  }
});
```

## 2. Implementation Approach

### Dual Approach: iFrame + Web Component

We'll support both iframe and web component approaches, with automatic selection based on the use case:

#### iFrame Approach (Default for isolation)
```typescript
class ChatbotIframeWidget implements ChatbotWidget {
  private iframe: HTMLIFrameElement;
  private config: ChatbotConfig;
  private options: ChatbotRenderOptions;
  
  constructor(config: ChatbotConfig, options: ChatbotRenderOptions) {
    this.config = config;
    this.options = options;
    this.createIframe();
  }
  
  private createIframe() {
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.buildWidgetUrl();
    this.iframe.style.cssText = this.buildIframeStyles();
    this.iframe.setAttribute('data-appatonce-chatbot', 'true');
    
    // Handle communication
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Append to container
    const container = this.getContainer();
    container.appendChild(this.iframe);
  }
  
  private buildWidgetUrl(): string {
    const params = new URLSearchParams({
      chatbotId: this.config.id,
      sessionId: this.options.sessionId,
      apiKey: this.options.apiKey,
      // Other params...
    });
    
    return `${this.options.baseUrl}/chatbot/widget?${params}`;
  }
  
  private buildIframeStyles(): string {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    };
    
    return `
      position: fixed;
      ${positions[this.config.position]}
      width: ${this.config.behavior.maxWidth || '380px'};
      height: ${this.config.behavior.maxHeight || '600px'};
      border: none;
      border-radius: ${this.config.theme.borderRadius || 12}px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      transition: all 0.3s ease;
    `;
  }
  
  private handleMessage(event: MessageEvent) {
    if (event.origin !== this.options.baseUrl) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'chatbot:ready':
        this.options.onReady?.();
        break;
      case 'chatbot:message':
        this.options.onMessage?.(data);
        break;
      case 'chatbot:resize':
        this.handleResize(data);
        break;
      // Other events...
    }
  }
  
  // Public methods
  show() {
    this.iframe.style.display = 'block';
    this.postMessage({ type: 'widget:show' });
  }
  
  hide() {
    this.iframe.style.display = 'none';
    this.postMessage({ type: 'widget:hide' });
  }
  
  sendMessage(content: string) {
    this.postMessage({ 
      type: 'widget:sendMessage', 
      data: { content }
    });
  }
  
  private postMessage(message: any) {
    this.iframe.contentWindow?.postMessage(message, this.options.baseUrl);
  }
}
```

#### Web Component Approach (For better integration)
```typescript
// Define custom element
class AppAtOnceChatbot extends HTMLElement {
  private shadow: ShadowRoot;
  private config: ChatbotConfig;
  private socket?: Socket;
  
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
    this.connectSocket();
  }
  
  disconnectedCallback() {
    this.socket?.disconnect();
  }
  
  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          --primary-color: ${this.config.theme.primaryColor};
          --secondary-color: ${this.config.theme.secondaryColor};
          --bg-color: ${this.config.theme.backgroundColor};
          --text-color: ${this.config.theme.textColor};
          --border-radius: ${this.config.theme.borderRadius}px;
          
          display: block;
          position: fixed;
          ${this.getPositionStyles()}
          width: var(--chatbot-width, 380px);
          height: var(--chatbot-height, 600px);
          background: var(--bg-color);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          font-family: ${this.config.theme.fontFamily || 'system-ui'};
        }
        
        .chatbot-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .chatbot-header {
          background: var(--primary-color);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        
        .chatbot-input {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
        }
        
        /* More styles... */
      </style>
      
      <div class="chatbot-container">
        <header class="chatbot-header">
          <div class="chatbot-info">
            <img src="${this.config.avatar}" alt="${this.config.name}" />
            <span>${this.config.name}</span>
          </div>
          <button class="chatbot-close">&times;</button>
        </header>
        
        <div class="chatbot-messages" id="messages">
          <!-- Messages will be rendered here -->
        </div>
        
        <div class="chatbot-input">
          <input type="text" placeholder="${this.config.messages.placeholder}" />
          <button>Send</button>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  private connectSocket() {
    // Connect to Socket.IO for real-time messaging
    this.socket = io(this.getAttribute('realtime-url') || '', {
      query: {
        chatbotId: this.config.id,
        sessionId: this.getAttribute('session-id')
      }
    });
    
    this.socket.on('message', this.handleNewMessage.bind(this));
    this.socket.on('typing', this.handleTypingIndicator.bind(this));
  }
  
  private handleNewMessage(message: ChatbotMessage) {
    const messagesEl = this.shadow.getElementById('messages');
    const messageEl = this.createMessageElement(message);
    messagesEl?.appendChild(messageEl);
    messagesEl?.scrollTo(0, messagesEl.scrollHeight);
  }
}

// Register custom element
customElements.define('appatonce-chatbot', AppAtOnceChatbot);
```

## 3. Authentication and Security

### Security Layers

```typescript
interface ChatbotSecurity {
  // API Key validation
  apiKey: string;
  
  // Origin validation for iframe
  allowedOrigins: string[];
  
  // Session management
  sessionToken?: string;
  sessionExpiry?: number;
  
  // Rate limiting
  rateLimit: {
    messages: number;
    window: number; // seconds
  };
  
  // Content Security Policy
  csp: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
  
  // Data encryption
  encryption: {
    enabled: boolean;
    algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  };
}

class ChatbotSecurityManager {
  private config: ChatbotSecurity;
  
  validateOrigin(origin: string): boolean {
    return this.config.allowedOrigins.includes(origin) || 
           this.config.allowedOrigins.includes('*');
  }
  
  generateSessionToken(userId?: string): string {
    const payload = {
      chatbotId: this.chatbotId,
      userId: userId || `visitor_${Date.now()}`,
      exp: Date.now() + (this.config.sessionExpiry || 3600000),
      jti: crypto.randomUUID()
    };
    
    return this.signJWT(payload);
  }
  
  validateSession(token: string): boolean {
    try {
      const payload = this.verifyJWT(token);
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }
  
  enforceRateLimit(sessionId: string): boolean {
    const key = `ratelimit:${sessionId}`;
    const count = this.cache.get(key) || 0;
    
    if (count >= this.config.rateLimit.messages) {
      return false;
    }
    
    this.cache.set(key, count + 1, this.config.rateLimit.window);
    return true;
  }
  
  sanitizeMessage(content: string): string {
    // XSS prevention
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
      ALLOWED_ATTR: ['href', 'target']
    });
  }
  
  encryptSensitiveData(data: any): string {
    if (!this.config.encryption.enabled) return JSON.stringify(data);
    
    const cipher = crypto.createCipher(
      this.config.encryption.algorithm,
      this.encryptionKey
    );
    
    return cipher.update(JSON.stringify(data), 'utf8', 'base64') + 
           cipher.final('base64');
  }
}
```

### Authentication Flow

```typescript
class ChatbotAuthManager {
  async authenticate(options: ChatbotRenderOptions): Promise<AuthResult> {
    // 1. Validate API key
    const apiKeyValid = await this.validateApiKey(this.apiKey);
    if (!apiKeyValid) {
      throw new Error('Invalid API key');
    }
    
    // 2. Create or retrieve session
    let session: ChatbotSession;
    
    if (options.user?.id) {
      // Authenticated user
      session = await this.createAuthenticatedSession(options.user);
    } else {
      // Anonymous visitor
      session = await this.createAnonymousSession();
    }
    
    // 3. Generate secure token
    const token = this.security.generateSessionToken(session.userId);
    
    // 4. Setup secure channel
    const channel = await this.setupSecureChannel(session.id, token);
    
    return {
      session,
      token,
      channel
    };
  }
  
  private async setupSecureChannel(sessionId: string, token: string): Promise<Channel> {
    // Create encrypted channel for sensitive data
    const channel = await this.realtime.createChannel(`chatbot:${sessionId}`, {
      auth: token,
      encryption: true
    });
    
    // Setup message encryption/decryption
    channel.on('message', (encrypted) => {
      const decrypted = this.security.decrypt(encrypted);
      this.handleMessage(decrypted);
    });
    
    return channel;
  }
}
```

## 4. Style Injection and Isolation

### Style Management System

```typescript
class ChatbotStyleManager {
  private styles: Map<string, string> = new Map();
  
  // Generate scoped styles
  generateStyles(config: ChatbotConfig, scopeId: string): string {
    const baseStyles = this.getBaseStyles(scopeId);
    const themeStyles = this.generateThemeStyles(config.theme, scopeId);
    const customStyles = this.processCustomCSS(config.theme.customCSS, scopeId);
    const responsiveStyles = this.generateResponsiveStyles(config, scopeId);
    
    return `
      ${baseStyles}
      ${themeStyles}
      ${customStyles}
      ${responsiveStyles}
    `;
  }
  
  private getBaseStyles(scopeId: string): string {
    return `
      .${scopeId} {
        /* Reset styles */
        all: initial;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        
        /* Base container */
        * {
          box-sizing: border-box;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        /* Animation classes */
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        .slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      }
    `;
  }
  
  private generateThemeStyles(theme: ChatbotTheme, scopeId: string): string {
    return `
      .${scopeId} {
        --primary: ${theme.primaryColor};
        --secondary: ${theme.secondaryColor};
        --background: ${theme.backgroundColor};
        --text: ${theme.textColor};
        --border-radius: ${theme.borderRadius || 12}px;
        --font-family: ${theme.fontFamily || 'inherit'};
        
        /* Component styles using CSS variables */
        .chatbot-header {
          background: var(--primary);
          color: white;
        }
        
        .chatbot-message {
          border-radius: var(--border-radius);
          padding: 12px 16px;
          margin: 8px 0;
        }
        
        .chatbot-message.user {
          background: var(--primary);
          color: white;
          margin-left: auto;
        }
        
        .chatbot-message.bot {
          background: #f0f0f0;
          color: var(--text);
        }
        
        .chatbot-input {
          background: var(--background);
          border: 1px solid #e0e0e0;
          border-radius: var(--border-radius);
          color: var(--text);
        }
      }
    `;
  }
  
  private generateResponsiveStyles(config: ChatbotConfig, scopeId: string): string {
    return `
      /* Mobile responsive */
      @media (max-width: 480px) {
        .${scopeId}.chatbot-widget {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
          max-width: none !important;
          max-height: none !important;
        }
        
        .${scopeId} .chatbot-header {
          border-radius: 0;
        }
      }
      
      /* Tablet adjustments */
      @media (max-width: 768px) and (min-width: 481px) {
        .${scopeId}.chatbot-widget {
          max-width: 420px;
        }
      }
      
      /* High DPI displays */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .${scopeId} img {
          image-rendering: -webkit-optimize-contrast;
        }
      }
    `;
  }
  
  // Inject styles with isolation
  injectStyles(styles: string, container: HTMLElement | ShadowRoot): void {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    
    if (container instanceof ShadowRoot) {
      // Shadow DOM provides style isolation
      container.appendChild(styleElement);
    } else {
      // For iframe or regular DOM, add to head with scope
      styleElement.setAttribute('data-appatonce-chatbot', 'true');
      document.head.appendChild(styleElement);
    }
  }
  
  // Process custom CSS with scope
  private processCustomCSS(customCSS: string | undefined, scopeId: string): string {
    if (!customCSS) return '';
    
    // Add scope to all selectors
    return customCSS.replace(/([^{]+){/g, (match, selector) => {
      const scopedSelector = selector
        .split(',')
        .map(s => `.${scopeId} ${s.trim()}`)
        .join(', ');
      return `${scopedSelector} {`;
    });
  }
}
```

## 5. Framework Integration Examples

### React Integration

```typescript
// React hook
import { useEffect, useRef, useState } from 'react';
import { AppAtOnceClient, ChatbotWidget } from '@appatonce/sdk';

export function useAppAtOnceChatbot(client: AppAtOnceClient, options?: ChatbotRenderOptions) {
  const [widget, setWidget] = useState<ChatbotWidget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let mounted = true;
    
    async function initChatbot() {
      try {
        setLoading(true);
        
        const chatWidget = await client.chatbot.render({
          ...options,
          container: options?.container || containerRef.current!,
          onError: (err) => {
            if (mounted) setError(err);
            options?.onError?.(err);
          }
        });
        
        if (mounted) {
          setWidget(chatWidget);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }
    
    initChatbot();
    
    return () => {
      mounted = false;
      widget?.destroy();
    };
  }, [client]);
  
  return {
    widget,
    loading,
    error,
    containerRef,
    show: () => widget?.show(),
    hide: () => widget?.hide(),
    toggle: () => widget?.toggle(),
    sendMessage: (content: string) => widget?.sendMessage(content)
  };
}

// React component
export function AppAtOnceChatbot({ client, ...options }: ChatbotProps) {
  const { containerRef, loading, error } = useAppAtOnceChatbot(client, options);
  
  if (error) {
    return <div>Error loading chatbot: {error.message}</div>;
  }
  
  return (
    <div ref={containerRef} className="appatonce-chatbot-container">
      {loading && <div>Loading chatbot...</div>}
    </div>
  );
}

// Usage
function MyApp() {
  const client = new AppAtOnceClient({ apiKey: 'your-api-key' });
  
  return (
    <div>
      <AppAtOnceChatbot 
        client={client}
        position="bottom-right"
        user={{
          id: 'user-123',
          name: 'John Doe'
        }}
        onMessage={(message) => {
          console.log('Received:', message);
        }}
      />
    </div>
  );
}
```

### Vue Integration

```typescript
// Vue 3 Composition API
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { AppAtOnceClient, ChatbotWidget } from '@appatonce/sdk';

export const AppAtOnceChatbot = defineComponent({
  name: 'AppAtOnceChatbot',
  props: {
    client: {
      type: Object as () => AppAtOnceClient,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const container = ref<HTMLElement>();
    const widget = ref<ChatbotWidget | null>(null);
    const loading = ref(true);
    const error = ref<Error | null>(null);
    
    onMounted(async () => {
      try {
        widget.value = await props.client.chatbot.render({
          ...props.options,
          container: container.value
        });
        loading.value = false;
      } catch (err) {
        error.value = err as Error;
        loading.value = false;
      }
    });
    
    onUnmounted(() => {
      widget.value?.destroy();
    });
    
    return {
      container,
      widget,
      loading,
      error,
      show: () => widget.value?.show(),
      hide: () => widget.value?.hide(),
      sendMessage: (content: string) => widget.value?.sendMessage(content)
    };
  },
  template: `
    <div ref="container" class="appatonce-chatbot-container">
      <div v-if="loading">Loading chatbot...</div>
      <div v-if="error">Error: {{ error.message }}</div>
    </div>
  `
});

// Vue plugin
export const AppAtOnceChatbotPlugin = {
  install(app: any, options: { client: AppAtOnceClient }) {
    app.component('AppAtOnceChatbot', AppAtOnceChatbot);
    app.config.globalProperties.$appatonceChatbot = options.client.chatbot;
  }
};

// Usage
import { createApp } from 'vue';
import { AppAtOnceClient } from '@appatonce/sdk';
import { AppAtOnceChatbotPlugin } from '@appatonce/sdk/vue';

const client = new AppAtOnceClient({ apiKey: 'your-api-key' });

const app = createApp(App);
app.use(AppAtOnceChatbotPlugin, { client });
app.mount('#app');
```

### Next.js Integration

```typescript
// Next.js with App Router
'use client';

import { useEffect } from 'react';
import { AppAtOnceClient } from '@appatonce/sdk';
import { useAppAtOnceChatbot } from '@appatonce/sdk/react';

// Client component
export function ChatbotProvider({ 
  children,
  apiKey 
}: { 
  children: React.ReactNode;
  apiKey: string;
}) {
  const client = new AppAtOnceClient({ apiKey });
  const { widget } = useAppAtOnceChatbot(client, {
    position: 'bottom-right',
    behavior: {
      autoOpen: false,
      persistState: true
    }
  });
  
  useEffect(() => {
    // Track page changes
    const handleRouteChange = () => {
      widget?.trackPageView(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [widget]);
  
  return <>{children}</>;
}

// Layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChatbotProvider apiKey={process.env.NEXT_PUBLIC_APPATONCE_API_KEY!}>
          {children}
        </ChatbotProvider>
      </body>
    </html>
  );
}

// Page component with SSR data
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <ChatbotMetadata 
        context={{
          page: 'product',
          productId: product.id,
          productName: product.name,
          price: product.price
        }}
      />
    </div>
  );
}

// Metadata component for context
'use client';
export function ChatbotMetadata({ context }: { context: any }) {
  const { widget } = useAppAtOnceChatbot();
  
  useEffect(() => {
    widget?.setContext(context);
  }, [widget, context]);
  
  return null;
}
```

### Vanilla JavaScript

```typescript
// Pure JavaScript integration
class AppAtOnceChatbotInit {
  constructor(config) {
    this.client = new AppAtOnceClient({
      apiKey: config.apiKey
    });
    
    this.options = {
      position: config.position || 'bottom-right',
      autoOpen: config.autoOpen || false,
      user: config.user,
      ...config
    };
  }
  
  async init() {
    try {
      // Wait for DOM ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // Initialize chatbot
      this.widget = await this.client.chatbot.render(this.options);
      
      // Setup global methods
      window.AppAtOnceChatbot = {
        show: () => this.widget.show(),
        hide: () => this.widget.hide(),
        toggle: () => this.widget.toggle(),
        sendMessage: (content) => this.widget.sendMessage(content),
        setUser: (user) => this.widget.setUser(user),
        on: (event, callback) => this.widget.on(event, callback)
      };
      
      // Dispatch ready event
      window.dispatchEvent(new CustomEvent('appatonce:chatbot:ready', {
        detail: { widget: this.widget }
      }));
      
    } catch (error) {
      console.error('Failed to initialize AppAtOnce Chatbot:', error);
      window.dispatchEvent(new CustomEvent('appatonce:chatbot:error', {
        detail: { error }
      }));
    }
  }
}

// Auto-initialization from script tag
(function() {
  const script = document.currentScript;
  const apiKey = script.getAttribute('data-api-key');
  const config = script.getAttribute('data-config');
  
  if (apiKey) {
    const chatbot = new AppAtOnceChatbotInit({
      apiKey,
      ...(config ? JSON.parse(config) : {})
    });
    
    chatbot.init();
  }
})();

// Usage in HTML
/*
<script 
  src="https://cdn.appatonce.com/chatbot.js"
  data-api-key="your-api-key"
  data-config='{"position":"bottom-right","autoOpen":true}'
></script>

<script>
  // Or manual initialization
  const chatbot = new AppAtOnceChatbot({
    apiKey: 'your-api-key',
    position: 'bottom-left',
    user: {
      id: 'user-123',
      name: 'John Doe'
    },
    onMessage: function(message) {
      console.log('New message:', message);
    }
  });
  
  chatbot.init();
</script>
*/
```

## 6. Performance Optimization Strategies

### Lazy Loading and Code Splitting

```typescript
class ChatbotLoader {
  private static instance: ChatbotLoader;
  private loadPromise?: Promise<ChatbotModule>;
  
  static getInstance(): ChatbotLoader {
    if (!this.instance) {
      this.instance = new ChatbotLoader();
    }
    return this.instance;
  }
  
  async loadChatbotModule(): Promise<ChatbotModule> {
    if (!this.loadPromise) {
      this.loadPromise = this.performLoad();
    }
    return this.loadPromise;
  }
  
  private async performLoad(): Promise<ChatbotModule> {
    // Dynamic import for code splitting
    const { ChatbotModule } = await import(
      /* webpackChunkName: "chatbot" */
      /* webpackPreload: true */
      './modules/chatbot'
    );
    
    // Preload assets
    await this.preloadAssets();
    
    return ChatbotModule;
  }
  
  private async preloadAssets(): Promise<void> {
    const assets = [
      '/chatbot/styles.css',
      '/chatbot/icons.svg',
      '/chatbot/sounds/notification.mp3'
    ];
    
    const preloadPromises = assets.map(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = asset.endsWith('.css') ? 'style' : 
                asset.endsWith('.svg') ? 'image' : 'audio';
      document.head.appendChild(link);
      
      return new Promise(resolve => {
        link.onload = resolve;
        link.onerror = resolve; // Don't fail on preload errors
      });
    });
    
    await Promise.all(preloadPromises);
  }
}

// Optimized client initialization
export class AppAtOnceClient {
  private _chatbot?: ChatbotModule;
  
  // Lazy getter for chatbot module
  get chatbot(): ChatbotModule {
    if (!this._chatbot) {
      // Return proxy that loads on first method call
      this._chatbot = new Proxy({} as ChatbotModule, {
        get: (target, prop) => {
          return async (...args: any[]) => {
            const loader = ChatbotLoader.getInstance();
            const ChatbotModule = await loader.loadChatbotModule();
            
            if (!this._chatbot || Object.keys(this._chatbot).length === 0) {
              this._chatbot = new ChatbotModule(this.httpClient, this.realtime);
            }
            
            return (this._chatbot as any)[prop](...args);
          };
        }
      });
    }
    
    return this._chatbot;
  }
}
```

### Message Queue and Batching

```typescript
class MessageQueue {
  private queue: Array<QueuedMessage> = [];
  private processing = false;
  private batchSize = 10;
  private flushInterval = 100; // ms
  private flushTimer?: NodeJS.Timeout;
  
  enqueue(message: ChatbotMessage): void {
    this.queue.push({
      message,
      timestamp: Date.now(),
      retries: 0
    });
    
    this.scheduleFlush();
  }
  
  private scheduleFlush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    
    // Flush immediately if queue is full
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      // Otherwise schedule flush
      this.flushTimer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }
  
  private async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await this.processBatch(batch);
    } catch (error) {
      // Re-queue failed messages
      batch.forEach(item => {
        if (item.retries < 3) {
          item.retries++;
          this.queue.unshift(item);
        }
      });
    } finally {
      this.processing = false;
      
      // Continue processing if more messages
      if (this.queue.length > 0) {
        this.scheduleFlush();
      }
    }
  }
  
  private async processBatch(batch: QueuedMessage[]): Promise<void> {
    const messages = batch.map(item => item.message);
    
    // Send batch to server
    await this.httpClient.post('/chatbot/messages/batch', {
      messages,
      sessionId: this.sessionId
    });
  }
}
```

### Virtual Scrolling for Message History

```typescript
class VirtualMessageList {
  private container: HTMLElement;
  private messages: ChatbotMessage[] = [];
  private itemHeight = 80; // Estimated height
  private visibleRange = { start: 0, end: 0 };
  private scrollTop = 0;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.setupScrollListener();
  }
  
  setMessages(messages: ChatbotMessage[]): void {
    this.messages = messages;
    this.render();
  }
  
  private setupScrollListener(): void {
    let ticking = false;
    
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateVisibleRange();
          this.render();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  
  private updateVisibleRange(): void {
    const containerHeight = this.container.clientHeight;
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const end = Math.ceil((this.scrollTop + containerHeight) / this.itemHeight);
    
    // Add buffer for smooth scrolling
    this.visibleRange = {
      start: Math.max(0, start - 5),
      end: Math.min(this.messages.length, end + 5)
    };
  }
  
  private render(): void {
    const totalHeight = this.messages.length * this.itemHeight;
    const offsetY = this.visibleRange.start * this.itemHeight;
    
    // Create scrollable space
    this.container.innerHTML = `
      <div style="height: ${totalHeight}px; position: relative;">
        <div style="transform: translateY(${offsetY}px);">
          ${this.renderVisibleMessages()}
        </div>
      </div>
    `;
  }
  
  private renderVisibleMessages(): string {
    const visibleMessages = this.messages.slice(
      this.visibleRange.start,
      this.visibleRange.end
    );
    
    return visibleMessages
      .map(msg => this.renderMessage(msg))
      .join('');
  }
  
  private renderMessage(message: ChatbotMessage): string {
    return `
      <div class="message ${message.sender}" data-id="${message.id}">
        <div class="message-content">${message.content}</div>
        <div class="message-time">${this.formatTime(message.timestamp)}</div>
      </div>
    `;
  }
}
```

### Caching Strategy

```typescript
class ChatbotCache {
  private messageCache = new Map<string, ChatbotMessage>();
  private configCache = new Map<string, CachedConfig>();
  private storage: Storage;
  
  constructor(storage: Storage = localStorage) {
    this.storage = storage;
    this.loadFromStorage();
  }
  
  // Cache configuration with TTL
  setChatbotConfig(id: string, config: ChatbotConfig): void {
    const cached: CachedConfig = {
      config,
      timestamp: Date.now(),
      ttl: 3600000 // 1 hour
    };
    
    this.configCache.set(id, cached);
    this.saveToStorage();
  }
  
  getChatbotConfig(id: string): ChatbotConfig | null {
    const cached = this.configCache.get(id);
    
    if (!cached) return null;
    
    // Check TTL
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.configCache.delete(id);
      return null;
    }
    
    return cached.config;
  }
  
  // Cache messages with pagination
  cacheMessages(sessionId: string, messages: ChatbotMessage[]): void {
    const key = `messages:${sessionId}`;
    const existing = this.getMessages(sessionId);
    
    // Merge and deduplicate
    const merged = [...existing, ...messages];
    const unique = Array.from(
      new Map(merged.map(m => [m.id, m])).values()
    );
    
    // Keep only last 100 messages
    const trimmed = unique.slice(-100);
    
    trimmed.forEach(msg => {
      this.messageCache.set(`${sessionId}:${msg.id}`, msg);
    });
    
    this.saveToStorage();
  }
  
  getMessages(sessionId: string, limit = 50): ChatbotMessage[] {
    const messages: ChatbotMessage[] = [];
    
    for (const [key, message] of this.messageCache) {
      if (key.startsWith(`${sessionId}:`)) {
        messages.push(message);
      }
    }
    
    return messages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
  }
  
  // Persistent storage
  private saveToStorage(): void {
    try {
      const data = {
        configs: Array.from(this.configCache.entries()),
        messages: Array.from(this.messageCache.entries()).slice(-200)
      };
      
      this.storage.setItem('appatonce:chatbot:cache', JSON.stringify(data));
    } catch (error) {
      // Handle quota exceeded
      this.cleanup();
    }
  }
  
  private loadFromStorage(): void {
    try {
      const stored = this.storage.getItem('appatonce:chatbot:cache');
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      // Restore configs
      data.configs?.forEach(([key, value]: [string, CachedConfig]) => {
        this.configCache.set(key, value);
      });
      
      // Restore messages
      data.messages?.forEach(([key, value]: [string, ChatbotMessage]) => {
        this.messageCache.set(key, value);
      });
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }
  
  private cleanup(): void {
    // Remove old entries
    const now = Date.now();
    const maxAge = 86400000; // 24 hours
    
    for (const [key, cached of this.configCache) {
      if (now - cached.timestamp > maxAge) {
        this.configCache.delete(key);
      }
    }
    
    // Keep only recent messages
    const recentMessages = Array.from(this.messageCache.entries())
      .sort(([, a], [, b]) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 100);
    
    this.messageCache.clear();
    recentMessages.forEach(([key, value]) => {
      this.messageCache.set(key, value);
    });
  }
}
```

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Create ChatbotModule class
- [ ] Implement basic iframe widget
- [ ] Setup Socket.IO integration
- [ ] Basic authentication flow

### Phase 2: UI Components (Week 3-4)
- [ ] Build web component version
- [ ] Implement message UI
- [ ] Add typing indicators
- [ ] Create default themes

### Phase 3: Framework Integration (Week 5-6)
- [ ] React hooks and components
- [ ] Vue 3 plugin
- [ ] Next.js integration
- [ ] Vanilla JS bundle

### Phase 4: Advanced Features (Week 7-8)
- [ ] File upload support
- [ ] Voice messages
- [ ] Message reactions
- [ ] Quick replies

### Phase 5: Performance & Polish (Week 9-10)
- [ ] Virtual scrolling
- [ ] Message caching
- [ ] Lazy loading
- [ ] Production optimization

## Security Checklist

- [ ] API key validation
- [ ] Origin validation for iframes
- [ ] XSS prevention in messages
- [ ] Rate limiting implementation
- [ ] Session token security
- [ ] Content Security Policy
- [ ] HTTPS enforcement
- [ ] Input sanitization
- [ ] File upload validation
- [ ] WebSocket security

## Testing Strategy

```typescript
// Unit tests
describe('ChatbotModule', () => {
  it('should initialize with default config', async () => {
    const client = new AppAtOnceClient({ apiKey: 'test' });
    const config = await client.chatbot.initialize();
    expect(config).toBeDefined();
    expect(config.position).toBe('bottom-right');
  });
  
  it('should handle authentication correctly', async () => {
    // Test auth flow
  });
  
  it('should queue messages when offline', async () => {
    // Test message queuing
  });
});

// Integration tests
describe('Chatbot Widget Integration', () => {
  it('should render in iframe mode', async () => {
    // Test iframe rendering
  });
  
  it('should connect to Socket.IO', async () => {
    // Test real-time connection
  });
  
  it('should sync messages across tabs', async () => {
    // Test multi-tab support
  });
});

// E2E tests
describe('Chatbot User Flow', () => {
  it('should complete a full conversation', async () => {
    // Test complete user journey
  });
});
```

This design provides a comprehensive, production-ready chatbot integration for the AppAtOnce SDK with modern features, security, and excellent developer experience.