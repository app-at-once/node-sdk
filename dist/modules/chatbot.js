"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotModule = void 0;
const constants_1 = require("../constants");
class ChatbotModule {
    constructor(httpClient, realtime, apiKey) {
        this.httpClient = httpClient;
        this.realtime = realtime;
        this.apiKey = apiKey;
        this.widget = null;
        this.config = null;
        this.container = null;
    }
    async render(options = {}) {
        try {
            const apiKey = this.apiKey;
            if (!apiKey) {
                throw new Error('API key is required for chatbot');
            }
            const config = await this.fetchConfig();
            if (!config.enabled) {
                throw new Error('Chatbot is not enabled');
            }
            this.config = config;
            const mode = options.mode || 'iframe';
            if (mode === 'iframe') {
                return this.renderIframe(options, apiKey);
            }
            else {
                return this.renderWidget(options, apiKey);
            }
        }
        catch (error) {
            if (options.onError) {
                options.onError(error);
            }
            throw error;
        }
    }
    async fetchConfig() {
        const response = await this.httpClient.get('/chatbot/config');
        return response.data;
    }
    renderIframe(options, apiKey) {
        const container = this.getContainer(options.container);
        const sessionId = options.sessionId || this.generateSessionId();
        const params = new URLSearchParams({
            apiKey: apiKey,
            sessionId,
            mode: 'embedded',
            ...(options.userId && { userId: options.userId }),
            ...(options.startOpen && { startOpen: 'true' }),
            ...(options.theme?.primaryColor && { primaryColor: options.theme.primaryColor }),
            ...(options.theme?.secondaryColor && { secondaryColor: options.theme.secondaryColor })
        });
        const baseUrl = constants_1.APPATONCE_BASE_URL.replace('/api/v1', '');
        const iframeUrl = `${baseUrl}/chatbot/embed?${params.toString()}`;
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
        if (window.innerWidth <= 768) {
            iframe.style.width = 'calc(100vw - 40px)';
            iframe.style.maxWidth = '380px';
        }
        iframe.onload = () => {
            if (options.onReady)
                options.onReady();
        };
        container.appendChild(iframe);
        const widget = {
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
            sendMessage: async (message) => {
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
        window.addEventListener('message', (event) => {
            if (event.origin !== baseUrl)
                return;
            const { type, data } = event.data;
            switch (type) {
                case 'chatbot:open':
                    if (options.onOpen)
                        options.onOpen();
                    break;
                case 'chatbot:close':
                    if (options.onClose)
                        options.onClose();
                    break;
                case 'chatbot:message':
                    if (options.onMessage)
                        options.onMessage(data);
                    break;
                case 'chatbot:error':
                    if (options.onError)
                        options.onError(new Error(data.message));
                    break;
            }
        });
        this.widget = widget;
        return widget;
    }
    renderWidget(options, _apiKey) {
        const container = this.getContainer(options.container);
        const sessionId = options.sessionId || this.generateSessionId();
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
        const toggle = widgetEl.querySelector('#chatbot-toggle');
        const window = widgetEl.querySelector('#chatbot-window');
        const closeBtn = widgetEl.querySelector('#chatbot-close');
        const inputField = widgetEl.querySelector('#chatbot-input-field');
        const messagesEl = widgetEl.querySelector('#chatbot-messages');
        toggle.onclick = () => {
            window.classList.toggle('open');
            if (window.classList.contains('open') && options.onOpen) {
                options.onOpen();
            }
            else if (!window.classList.contains('open') && options.onClose) {
                options.onClose();
            }
        };
        closeBtn.onclick = () => {
            window.classList.remove('open');
            if (options.onClose)
                options.onClose();
        };
        const sendMessage = async (message) => {
            if (!message.trim())
                return;
            this.addMessageToUI(messagesEl, {
                id: Date.now().toString(),
                role: 'user',
                content: message,
                timestamp: new Date()
            });
            inputField.value = '';
            try {
                const response = await this.httpClient.post(`/chatbot/send`, {
                    message,
                    sessionId,
                    userId: options.userId
                });
                this.addMessageToUI(messagesEl, response.data.message);
                if (options.onMessage) {
                    options.onMessage(response.data.message);
                }
            }
            catch (error) {
                if (options.onError) {
                    options.onError(error);
                }
            }
        };
        inputField.onkeypress = (e) => {
            if (e.key === 'Enter') {
                sendMessage(inputField.value);
            }
        };
        this.setupRealtimeConnection(sessionId, messagesEl, options);
        if (this.config?.welcomeMessage) {
            this.addMessageToUI(messagesEl, {
                id: 'welcome',
                role: 'assistant',
                content: this.config.welcomeMessage,
                timestamp: new Date()
            });
        }
        const widget = {
            show: () => { widgetEl.style.display = 'block'; },
            hide: () => { widgetEl.style.display = 'none'; },
            toggle: () => { toggle.click(); },
            open: () => { window.classList.add('open'); },
            close: () => { window.classList.remove('open'); },
            sendMessage: async (message) => { await sendMessage(message); },
            setUser: (_user) => { },
            setContext: (_context) => { },
            destroy: () => {
                widgetEl.remove();
                this.widget = null;
            }
        };
        this.widget = widget;
        if (options.onReady)
            options.onReady();
        if (options.startOpen) {
            widget.open();
        }
        return widget;
    }
    async setupRealtimeConnection(sessionId, messagesEl, options) {
        await this.realtime.subscribeToChannel(`chat:${sessionId}`, (message) => {
            if (message.type === 'chat:message' && message.data.message.role === 'assistant') {
                this.addMessageToUI(messagesEl, message.data.message);
                if (options.onMessage) {
                    options.onMessage(message.data.message);
                }
            }
        });
    }
    addMessageToUI(container, message) {
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
    getContainer(container) {
        if (!container) {
            let defaultContainer = document.getElementById('appatonce-chatbot-container');
            if (!defaultContainer) {
                defaultContainer = document.createElement('div');
                defaultContainer.id = 'appatonce-chatbot-container';
                document.body.appendChild(defaultContainer);
            }
            return defaultContainer;
        }
        if (typeof container === 'string') {
            const el = document.querySelector(container);
            if (!el) {
                throw new Error(`Container element not found: ${container}`);
            }
            return el;
        }
        return container;
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getWidget() {
        return this.widget;
    }
}
exports.ChatbotModule = ChatbotModule;
//# sourceMappingURL=chatbot.js.map