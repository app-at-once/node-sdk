import { HttpClient } from '../core/http-client';
import { RealtimeModule } from './realtime';
import { APPATONCE_BASE_URL } from '../constants';

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
  // Container element or selector
  container?: string | HTMLElement;
  
  // Render mode
  mode?: 'iframe' | 'widget';
  
  // Session management
  sessionId?: string;
  userId?: string;
  
  // UI customization (overrides server config)
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  
  // Widget behavior
  position?: 'bottom-right' | 'bottom-left';
  startOpen?: boolean;
  startMinimized?: boolean;
  hideOnMobile?: boolean;
  
  // Features
  enableSounds?: boolean;
  enableNotifications?: boolean;
  
  // Event handlers
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
  setUser(user: { id?: string; name?: string; email?: string }): void;
  setContext(context: Record<string, any>): void;
  destroy(): void;
}

export class ChatbotModule {
  private widget: ChatbotWidget | null = null;
  private config: ChatbotConfig | null = null;
  private container: HTMLElement | null = null;

  constructor(
    private httpClient: HttpClient,
    private realtime: RealtimeModule,
    private apiKey: string
  ) {}

  /**
   * Render chatbot widget
   */
  async render(options: ChatbotRenderOptions = {}): Promise<ChatbotWidget> {
    try {
      // API key is all we need - server determines context
      const apiKey = this.apiKey;
      
      if (!apiKey) {
        throw new Error('API key is required for chatbot');
      }
      
      // Fetch chatbot configuration from server
      const config = await this.fetchConfig();
      if (!config.enabled) {
        throw new Error('Chatbot is not enabled');
      }
      
      this.config = config;

      // Determine render mode
      const mode = options.mode || 'iframe';
      
      if (mode === 'iframe') {
        return this.renderIframe(options, apiKey);
      } else {
        return this.renderWidget(options, apiKey);
      }
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Fetch chatbot configuration from server
   */
  private async fetchConfig(): Promise<ChatbotConfig> {
    const response = await this.httpClient.get('/chatbot/config');
    return response.data;
  }

  /**
   * Render chatbot as iframe
   */
  private renderIframe(options: ChatbotRenderOptions, apiKey: string): ChatbotWidget {
    // Create container if not exists
    const container = this.getContainer(options.container);
    
    // Generate secure session ID
    const sessionId = options.sessionId || this.generateSessionId();
    
    // Build iframe URL with parameters
    const params = new URLSearchParams({
      apiKey: apiKey,
      sessionId,
      mode: 'embedded',
      ...(options.userId && { userId: options.userId }),
      ...(options.startOpen && { startOpen: 'true' }),
      ...(options.theme?.primaryColor && { primaryColor: options.theme.primaryColor }),
      ...(options.theme?.secondaryColor && { secondaryColor: options.theme.secondaryColor })
    });

    const baseUrl = APPATONCE_BASE_URL.replace('/api/v1', '');
    const iframeUrl = `${baseUrl}/chatbot/embed?${params.toString()}`;

    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.style.cssText = `
      position: fixed;
      ${options.position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
      bottom: 20px;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 40px);
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      transition: all 0.3s ease;
    `;
    
    // Handle mobile responsiveness
    if (window.innerWidth <= 768) {
      iframe.style.width = 'calc(100vw - 40px)';
      iframe.style.maxWidth = '380px';
    }

    // Handle iframe ready event
    iframe.onload = () => {
      if (options.onReady) options.onReady();
    };

    // Append to container
    container.appendChild(iframe);

    // Create widget control interface
    const widget: ChatbotWidget = {
      show: () => { iframe.style.display = 'block'; },
      hide: () => { iframe.style.display = 'none'; },
      toggle: () => { 
        iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none'; 
      },
      open: () => {
        iframe.contentWindow?.postMessage({ action: 'open' }, '*');
      },
      close: () => {
        iframe.contentWindow?.postMessage({ action: 'close' }, '*');
      },
      sendMessage: async (message: string) => {
        iframe.contentWindow?.postMessage({ action: 'sendMessage', message }, '*');
      },
      setUser: (user) => {
        iframe.contentWindow?.postMessage({ action: 'setUser', user }, '*');
      },
      setContext: (context) => {
        iframe.contentWindow?.postMessage({ action: 'setContext', context }, '*');
      },
      destroy: () => {
        iframe.remove();
        this.widget = null;
      }
    };

    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.origin !== baseUrl) return;
      
      const { type, data } = event.data;
      switch (type) {
        case 'chatbot:open':
          if (options.onOpen) options.onOpen();
          break;
        case 'chatbot:close':
          if (options.onClose) options.onClose();
          break;
        case 'chatbot:message':
          if (options.onMessage) options.onMessage(data);
          break;
        case 'chatbot:error':
          if (options.onError) options.onError(new Error(data.message));
          break;
      }
    });

    this.widget = widget;
    return widget;
  }

  /**
   * Render chatbot as web component
   */
  private renderWidget(options: ChatbotRenderOptions, _apiKey: string): ChatbotWidget {
    // Create container
    const container = this.getContainer(options.container);
    
    // Generate session ID
    const sessionId = options.sessionId || this.generateSessionId();
    
    // Create widget element
    const widgetEl = document.createElement('div');
    widgetEl.id = 'appatonce-chatbot-widget';
    widgetEl.innerHTML = `
      <style>
        #appatonce-chatbot-widget {
          position: fixed;
          ${options.position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
          bottom: 20px;
          z-index: 999999;
        }
        
        .chatbot-bubble {
          width: 60px;
          height: 60px;
          border-radius: 30px;
          background-color: ${this.config?.primaryColor || '#007bff'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s ease;
        }
        
        .chatbot-bubble:hover {
          transform: scale(1.1);
        }
        
        .chatbot-window {
          position: absolute;
          ${options.position === 'bottom-left' ? 'left: 0' : 'right: 0'};
          bottom: 80px;
          width: 380px;
          height: 600px;
          max-height: calc(100vh - 120px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        
        .chatbot-window.open {
          display: flex;
        }
        
        .chatbot-header {
          background-color: ${this.config?.primaryColor || '#007bff'};
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
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
        
        @media (max-width: 768px) {
          .chatbot-window {
            width: calc(100vw - 40px);
            max-width: 380px;
          }
        }
      </style>
      
      <div class="chatbot-bubble" id="chatbot-toggle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L1 23l6.71-1.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      </div>
      
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <span>${this.config?.name || 'Assistant'}</span>
          <button id="chatbot-close" style="background:none;border:none;color:white;cursor:pointer;">✕</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input">
          <input type="text" id="chatbot-input-field" placeholder="${this.config?.placeholder || 'Type a message...'}" 
                 style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
        </div>
      </div>
    `;
    
    container.appendChild(widgetEl);
    
    // Setup event handlers
    const toggle = widgetEl.querySelector('#chatbot-toggle') as HTMLElement;
    const window = widgetEl.querySelector('#chatbot-window') as HTMLElement;
    const closeBtn = widgetEl.querySelector('#chatbot-close') as HTMLElement;
    const inputField = widgetEl.querySelector('#chatbot-input-field') as HTMLInputElement;
    const messagesEl = widgetEl.querySelector('#chatbot-messages') as HTMLElement;
    
    // Toggle window
    toggle.onclick = () => {
      window.classList.toggle('open');
      if (window.classList.contains('open') && options.onOpen) {
        options.onOpen();
      } else if (!window.classList.contains('open') && options.onClose) {
        options.onClose();
      }
    };
    
    closeBtn.onclick = () => {
      window.classList.remove('open');
      if (options.onClose) options.onClose();
    };
    
    // Handle message sending
    const sendMessage = async (message: string) => {
      if (!message.trim()) return;
      
      // Add user message to UI
      this.addMessageToUI(messagesEl, {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      inputField.value = '';
      
      try {
        // Send message to server
        const response = await this.httpClient.post(
          `/chatbot/send`,
          {
            message,
            sessionId,
            userId: options.userId
          }
        );
        
        // Add assistant response to UI
        this.addMessageToUI(messagesEl, response.data.message);
        
        if (options.onMessage) {
          options.onMessage(response.data.message);
        }
      } catch (error) {
        if (options.onError) {
          options.onError(error as Error);
        }
      }
    };
    
    inputField.onkeypress = (e) => {
      if (e.key === 'Enter') {
        sendMessage(inputField.value);
      }
    };
    
    // Connect to real-time updates
    this.setupRealtimeConnection(sessionId, messagesEl, options);
    
    // Show welcome message
    if (this.config?.welcomeMessage) {
      this.addMessageToUI(messagesEl, {
        id: 'welcome',
        role: 'assistant',
        content: this.config.welcomeMessage,
        timestamp: new Date()
      });
    }
    
    // Create widget interface
    const widget: ChatbotWidget = {
      show: () => { widgetEl.style.display = 'block'; },
      hide: () => { widgetEl.style.display = 'none'; },
      toggle: () => { toggle.click(); },
      open: () => { window.classList.add('open'); },
      close: () => { window.classList.remove('open'); },
      sendMessage: async (message: string) => { await sendMessage(message); },
      setUser: (_user) => { /* Store user info */ },
      setContext: (_context) => { /* Store context */ },
      destroy: () => {
        widgetEl.remove();
        this.widget = null;
      }
    };
    
    this.widget = widget;
    
    // Call onReady
    if (options.onReady) options.onReady();
    
    // Start open if requested
    if (options.startOpen) {
      widget.open();
    }
    
    return widget;
  }

  /**
   * Setup real-time connection for messages
   */
  private async setupRealtimeConnection(
    sessionId: string, 
    messagesEl: HTMLElement,
    options: ChatbotRenderOptions
  ) {
    // Subscribe to chat messages - server handles app/project context
    await this.realtime.subscribeToChannel(
      `chat:${sessionId}`,
      (message) => {
        if (message.type === 'chat:message' && message.data.message.role === 'assistant') {
          this.addMessageToUI(messagesEl, message.data.message);
          if (options.onMessage) {
            options.onMessage(message.data.message);
          }
        }
      }
    );
  }

  /**
   * Add message to UI
   */
  private addMessageToUI(container: HTMLElement, message: ChatMessage) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 80%;
      ${message.role === 'user' ? 
        'background-color: #007bff; color: white; margin-left: auto; text-align: right;' : 
        'background-color: #f0f0f0; color: #333;'}
    `;
    messageEl.textContent = message.content;
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Get or create container element
   */
  private getContainer(container?: string | HTMLElement): HTMLElement {
    if (!container) {
      // Create default container
      let defaultContainer = document.getElementById('appatonce-chatbot-container');
      if (!defaultContainer) {
        defaultContainer = document.createElement('div');
        defaultContainer.id = 'appatonce-chatbot-container';
        document.body.appendChild(defaultContainer);
      }
      return defaultContainer;
    }
    
    if (typeof container === 'string') {
      const el = document.querySelector(container) as HTMLElement;
      if (!el) {
        throw new Error(`Container element not found: ${container}`);
      }
      return el;
    }
    
    return container;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current widget instance
   */
  getWidget(): ChatbotWidget | null {
    return this.widget;
  }
}