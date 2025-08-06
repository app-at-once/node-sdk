# AppAtOnce Chatbot Integration Examples

This document provides comprehensive examples of integrating the AppAtOnce chatbot into various JavaScript frameworks and environments.

## Table of Contents

- [Basic Usage](#basic-usage)
- [React Integration](#react-integration)
- [Vue.js Integration](#vuejs-integration)
- [Next.js Integration](#nextjs-integration)
- [Vanilla JavaScript](#vanilla-javascript)
- [Advanced Features](#advanced-features)
- [Customization](#customization)
- [Security Best Practices](#security-best-practices)

## Basic Usage

### Installation

```bash
npm install @appatonce/sdk
# or
yarn add @appatonce/sdk
```

### Quick Start

```typescript
import { AppAtOnceClient } from '@appatonce/sdk';

// Initialize client
const client = new AppAtOnceClient('your-api-key');

// Render chatbot with minimal configuration
const widget = await client.chatbot.render();

// Control the chatbot
widget.show();
widget.hide();
widget.toggle();

// Send messages programmatically
await widget.sendMessage('Hello from code!');

// Set user information
widget.setUser({
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com'
});

// Set contextual information
widget.setContext({
  page: 'product-details',
  productId: 'prod-456',
  category: 'electronics'
});
```

## React Integration

### Using the Hook

```tsx
import React from 'react';
import { AppAtOnceClient } from '@appatonce/sdk';
import { useAppAtOnceChatbot } from '@appatonce/sdk/react';

function App() {
  const client = new AppAtOnceClient('your-api-key');
  
  const { 
    widget, 
    loading, 
    error, 
    show, 
    hide, 
    toggle,
    sendMessage 
  } = useAppAtOnceChatbot(client, {
    position: 'bottom-right',
    theme: {
      primaryColor: '#007bff',
      borderRadius: 16
    },
    behavior: {
      autoOpen: false,
      persistState: true
    },
    onMessage: (message) => {
      console.log('New message:', message);
    }
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>My App</h1>
      
      {/* Custom trigger button */}
      <button onClick={toggle}>
        {loading ? 'Loading...' : 'Chat with us'}
      </button>
      
      {/* Send predefined messages */}
      <button onClick={() => sendMessage('I need help with my order')}>
        Order Help
      </button>
    </div>
  );
}
```

### Using the Component

```tsx
import React from 'react';
import { AppAtOnceClient } from '@appatonce/sdk';
import { AppAtOnceChatbot, ChatbotFAB } from '@appatonce/sdk/react';

const client = new AppAtOnceClient('your-api-key');

function App() {
  return (
    <div>
      {/* Embedded chatbot */}
      <AppAtOnceChatbot
        client={client}
        className="my-chatbot"
        position="center"
        user={{
          id: 'user-123',
          name: 'John Doe'
        }}
        onMessage={(message) => {
          // Track messages in analytics
          analytics.track('Chatbot Message', {
            messageId: message.id,
            content: message.content
          });
        }}
        loadingComponent={<CustomLoader />}
        errorComponent={(error) => <CustomError error={error} />}
      />
      
      {/* Or use floating action button */}
      <ChatbotFAB
        client={client}
        buttonStyle={{ backgroundColor: '#28a745' }}
        icon={<CustomChatIcon />}
      />
    </div>
  );
}
```

### Using Context Provider

```tsx
import React from 'react';
import { AppAtOnceClient } from '@appatonce/sdk';
import { ChatbotProvider, useChatbot } from '@appatonce/sdk/react';

const client = new AppAtOnceClient('your-api-key');

function App() {
  return (
    <ChatbotProvider client={client} options={{ position: 'bottom-right' }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductPage />} />
        </Routes>
      </Router>
    </ChatbotProvider>
  );
}

function ProductPage() {
  const { productId } = useParams();
  const { setContext, sendMessage } = useChatbot();
  
  useEffect(() => {
    // Update chatbot context based on current page
    setContext({
      page: 'product',
      productId
    });
  }, [productId]);
  
  return (
    <div>
      <h1>Product Details</h1>
      <button onClick={() => sendMessage(`Tell me about product ${productId}`)}>
        Ask about this product
      </button>
    </div>
  );
}
```

## Vue.js Integration

### Using Composition API

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    
    <!-- Container for chatbot -->
    <div ref="chatbotContainer"></div>
    
    <!-- Control buttons -->
    <button @click="toggle">
      {{ loading ? 'Loading...' : 'Toggle Chat' }}
    </button>
    
    <button @click="sendPredefinedMessage">
      Ask for Help
    </button>
  </div>
</template>

<script setup>
import { AppAtOnceClient } from '@appatonce/sdk';
import { useAppAtOnceChatbot } from '@appatonce/sdk/vue';

const client = new AppAtOnceClient('your-api-key');

const {
  container,
  loading,
  error,
  toggle,
  sendMessage,
  setUser,
  setContext
} = useAppAtOnceChatbot(client, {
  position: 'bottom-right',
  theme: {
    primaryColor: '#42b883'
  },
  onMessage: (message) => {
    console.log('New message:', message);
  }
});

const sendPredefinedMessage = () => {
  sendMessage('I need help with Vue integration');
};

// Set user when authenticated
onMounted(() => {
  const user = getCurrentUser();
  if (user) {
    setUser({
      id: user.id,
      name: user.name,
      email: user.email
    });
  }
});
</script>
```

### Using the Component

```vue
<template>
  <div id="app">
    <!-- Chatbot component -->
    <AppAtOnceChatbot
      :client="client"
      :options="chatbotOptions"
      class="my-custom-chatbot"
      @message="handleMessage"
    >
      <template #loading>
        <div class="custom-loader">Loading chatbot...</div>
      </template>
    </AppAtOnceChatbot>
    
    <!-- Floating action button -->
    <ChatbotFAB
      :client="client"
      :button-style="{ backgroundColor: '#42b883' }"
    >
      <ChatIcon />
    </ChatbotFAB>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { AppAtOnceClient } from '@appatonce/sdk';
import { AppAtOnceChatbot, ChatbotFAB } from '@appatonce/sdk/vue';
import ChatIcon from './components/ChatIcon.vue';

export default defineComponent({
  components: {
    AppAtOnceChatbot,
    ChatbotFAB,
    ChatIcon
  },
  setup() {
    const client = new AppAtOnceClient('your-api-key');
    
    const chatbotOptions = {
      position: 'bottom-right',
      theme: {
        primaryColor: '#42b883',
        borderRadius: 12
      },
      behavior: {
        autoOpen: false,
        soundEnabled: true
      }
    };
    
    const handleMessage = (message) => {
      // Handle new messages
      console.log('Received message:', message);
    };
    
    return {
      client,
      chatbotOptions,
      handleMessage
    };
  }
});
</script>
```

### Using the Plugin

```javascript
// main.js
import { createApp } from 'vue';
import { AppAtOnceClient } from '@appatonce/sdk';
import { AppAtOnceChatbotPlugin } from '@appatonce/sdk/vue';
import App from './App.vue';

const client = new AppAtOnceClient('your-api-key');

const app = createApp(App);

app.use(AppAtOnceChatbotPlugin, {
  client,
  globalOptions: {
    position: 'bottom-right',
    theme: {
      primaryColor: '#42b883'
    }
  }
});

app.mount('#app');
```

```vue
<!-- Any component can now use the chatbot -->
<template>
  <div>
    <button @click="openChat">Open Chat</button>
  </div>
</template>

<script setup>
import { useChatbot } from '@appatonce/sdk/vue';

// Automatically uses the global client and options
const { show, setContext } = useChatbot();

const openChat = () => {
  setContext({ page: 'support' });
  show();
};
</script>
```

## Next.js Integration

### App Router with Client Component

```tsx
// app/components/ChatbotProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppAtOnceClient } from '@appatonce/sdk';
import { ChatbotProvider as Provider, useAppAtOnceChatbot } from '@appatonce/sdk/react';

const client = new AppAtOnceClient(process.env.NEXT_PUBLIC_APPATONCE_API_KEY!);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider 
      client={client} 
      options={{
        position: 'bottom-right',
        behavior: {
          autoOpen: false,
          persistState: true
        }
      }}
    >
      <ChatbotTracker />
      {children}
    </Provider>
  );
}

function ChatbotTracker() {
  const pathname = usePathname();
  const { setContext } = useAppAtOnceChatbot(client);
  
  useEffect(() => {
    // Update context on route change
    setContext({
      page: pathname,
      timestamp: new Date().toISOString()
    });
  }, [pathname, setContext]);
  
  return null;
}
```

```tsx
// app/layout.tsx
import { ChatbotProvider } from './components/ChatbotProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChatbotProvider>
          {children}
        </ChatbotProvider>
      </body>
    </html>
  );
}
```

### Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppAtOnceClient } from '@appatonce/sdk';
import { ChatbotProvider } from '@appatonce/sdk/react';

const client = new AppAtOnceClient(process.env.NEXT_PUBLIC_APPATONCE_API_KEY!);

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Track page views
    const handleRouteChange = (url: string) => {
      if (window.AppAtOnceChatbot) {
        window.AppAtOnceChatbot.setContext({
          page: url,
          previousPage: router.asPath
        });
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  
  return (
    <ChatbotProvider client={client}>
      <Component {...pageProps} />
    </ChatbotProvider>
  );
}

export default MyApp;
```

### Server-Side Context

```tsx
// app/products/[id]/page.tsx
import { ChatbotMetadata } from '@/components/ChatbotMetadata';

async function getProduct(id: string) {
  // Fetch product data
  const res = await fetch(`${process.env.API_URL}/products/${id}`);
  return res.json();
}

export default async function ProductPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const product = await getProduct(params.id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      {/* Pass server data to chatbot */}
      <ChatbotMetadata 
        context={{
          page: 'product',
          productId: product.id,
          productName: product.name,
          price: product.price,
          category: product.category,
          inStock: product.inStock
        }}
      />
    </div>
  );
}
```

```tsx
// components/ChatbotMetadata.tsx
'use client';

import { useEffect } from 'react';
import { useChatbot } from '@appatonce/sdk/react';

export function ChatbotMetadata({ context }: { context: any }) {
  const { setContext } = useChatbot();
  
  useEffect(() => {
    setContext(context);
  }, [context, setContext]);
  
  return null;
}
```

## Vanilla JavaScript

### Script Tag Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Site</h1>
  
  <!-- Method 1: Auto-initialization with data attributes -->
  <script 
    src="https://cdn.appatonce.com/sdk.js"
    data-appatonce-chatbot
    data-api-key="your-api-key"
    data-position="bottom-right"
    data-auto-open="false"
    data-theme-primary-color="#007bff"
    data-theme-border-radius="12"
  ></script>
  
  <!-- Method 2: Configuration via JSON -->
  <script 
    src="https://cdn.appatonce.com/sdk.js"
    data-appatonce-chatbot
    data-api-key="your-api-key"
    data-config='{
      "position": "bottom-right",
      "theme": {
        "primaryColor": "#007bff",
        "borderRadius": 12
      },
      "behavior": {
        "autoOpen": false,
        "soundEnabled": true
      },
      "user": {
        "id": "user-123",
        "name": "John Doe"
      }
    }'
  ></script>
</body>
</html>
```

### Manual Initialization

```html
<script src="https://cdn.appatonce.com/sdk.js"></script>
<script>
  // Wait for SDK to load
  window.addEventListener('load', function() {
    // Initialize chatbot manually
    const chatbot = new AppAtOnceChatbotInit({
      apiKey: 'your-api-key',
      position: 'bottom-left',
      theme: {
        primaryColor: '#28a745',
        backgroundColor: '#ffffff',
        textColor: '#333333'
      },
      behavior: {
        autoOpen: false,
        persistState: true,
        soundEnabled: true
      },
      user: {
        id: getUserId(),
        name: getUserName(),
        email: getUserEmail()
      },
      onReady: function() {
        console.log('Chatbot is ready!');
      },
      onMessage: function(message) {
        console.log('New message:', message);
        
        // Track in analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'chatbot_message', {
            message_id: message.id,
            message_type: message.type
          });
        }
      },
      onError: function(error) {
        console.error('Chatbot error:', error);
      }
    });
    
    // Use global methods
    document.getElementById('chat-button').addEventListener('click', function() {
      AppAtOnceChatbot.toggle();
    });
    
    // Send message
    document.getElementById('help-button').addEventListener('click', function() {
      AppAtOnceChatbot.show();
      AppAtOnceChatbot.sendMessage('I need help with my order');
    });
    
    // Update user when they log in
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      // After successful login
      AppAtOnceChatbot.setUser({
        id: 'user-456',
        name: 'Jane Smith',
        email: 'jane@example.com'
      });
    });
  });
  
  // Listen for events
  window.addEventListener('appatonce:chatbot:ready', function(event) {
    console.log('Chatbot ready event:', event.detail);
  });
  
  window.addEventListener('appatonce:chatbot:error', function(event) {
    console.error('Chatbot error event:', event.detail.error);
  });
</script>
```

### jQuery Integration

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.appatonce.com/sdk.js"></script>
<script>
  $(document).ready(function() {
    // Initialize on specific container
    $('#chatbot-container').appAtOnceChatbot({
      apiKey: 'your-api-key',
      position: 'center',
      theme: {
        primaryColor: '#dc3545'
      }
    });
    
    // Control methods
    $('#show-chat').click(function() {
      $('#chatbot-container').appAtOnceChatbot('show');
    });
    
    $('#hide-chat').click(function() {
      $('#chatbot-container').appAtOnceChatbot('hide');
    });
    
    $('#send-message').click(function() {
      const message = $('#message-input').val();
      $('#chatbot-container').appAtOnceChatbot('sendMessage', message);
    });
    
    // Set user
    $('#chatbot-container').appAtOnceChatbot('setUser', {
      id: 'user-789',
      name: 'Bob Johnson'
    });
    
    // Set context based on page
    const pageContext = {
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };
    $('#chatbot-container').appAtOnceChatbot('setContext', pageContext);
  });
</script>
```

## Advanced Features

### Multi-language Support

```typescript
// Set language during initialization
const widget = await client.chatbot.render({
  language: 'es', // Spanish
  user: {
    id: 'user-123',
    metadata: {
      preferredLanguage: 'es'
    }
  }
});

// Change language dynamically
widget.setContext({
  language: 'fr' // Switch to French
});
```

### File Upload

```typescript
// Enable file upload in configuration
const widget = await client.chatbot.render({
  features: {
    fileUpload: true,
    voiceInput: true
  },
  onMessage: async (message) => {
    if (message.type === 'file') {
      console.log('File uploaded:', message.metadata);
      // Handle file upload
    }
  }
});
```

### Custom Quick Replies

```typescript
// Send quick reply suggestions
widget.on('ready', () => {
  widget.setContext({
    quickReplies: [
      { text: 'Order Status', value: 'check_order' },
      { text: 'Product Info', value: 'product_info' },
      { text: 'Contact Support', value: 'contact_support' }
    ]
  });
});
```

### Analytics Integration

```typescript
// Track chatbot events
const widget = await client.chatbot.render({
  onOpen: () => {
    analytics.track('Chatbot Opened', {
      timestamp: new Date()
    });
  },
  onClose: () => {
    analytics.track('Chatbot Closed', {
      timestamp: new Date()
    });
  },
  onMessage: (message) => {
    analytics.track('Chatbot Message', {
      messageId: message.id,
      type: message.type,
      sender: message.sender
    });
  }
});
```

### Programmatic Conversations

```typescript
// Create a guided conversation flow
async function startGuidedFlow() {
  const widget = await client.chatbot.render();
  
  // Wait for ready
  await new Promise(resolve => widget.on('ready', resolve));
  
  // Start conversation
  await widget.sendMessage('I want to check my order status');
  
  // Listen for bot response
  widget.on('message', (message) => {
    if (message.sender === 'bot' && message.content.includes('order number')) {
      // Automatically provide order number
      setTimeout(() => {
        widget.sendMessage('ORDER-12345');
      }, 1000);
    }
  });
}
```

## Customization

### Custom Theme

```typescript
const widget = await client.chatbot.render({
  theme: {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
    borderRadius: 20,
    fontFamily: 'Inter, system-ui, sans-serif',
    customCSS: `
      .chatbot-header {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      }
      .chatbot-message.user {
        background: #6366f1;
        box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
      }
      .chatbot-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }
    `
  }
});
```

### Custom Container

```html
<style>
  .my-chat-container {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 400px;
    height: 600px;
    z-index: 1000;
  }
</style>

<div class="my-chat-container" id="custom-chatbot"></div>

<script>
  const widget = await client.chatbot.render({
    container: '#custom-chatbot',
    mode: 'component' // Use component mode for custom containers
  });
</script>
```

### Custom Loading State

```tsx
// React
<AppAtOnceChatbot
  client={client}
  loadingComponent={
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3">Initializing chat...</span>
    </div>
  }
/>

// Vue
<AppAtOnceChatbot :client="client">
  <template #loading>
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading your assistant...</p>
    </div>
  </template>
</AppAtOnceChatbot>
```

## Security Best Practices

### API Key Security

```javascript
// Never expose API keys in client-side code
// Bad: API key in frontend
const client = new AppAtOnceClient('sk_live_abcd1234'); // Don't do this!

// Good: Use environment variables
const client = new AppAtOnceClient(process.env.NEXT_PUBLIC_APPATONCE_API_KEY);

// Better: Use a backend proxy
// Note: For backend proxy scenarios, configure your server to add the API key
// and forward requests to the AppAtOnce API. The client would then use:
const client = new AppAtOnceClient('dummy-key-for-proxy');
// with your proxy server intercepting and adding the real API key
```

### Content Security Policy

```html
<!-- Add CSP headers for iframe mode -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  frame-src https://api.appatonce.com;
  connect-src https://api.appatonce.com wss://realtime.appatonce.com;
  script-src 'self' https://cdn.appatonce.com;
  style-src 'self' 'unsafe-inline' https://cdn.appatonce.com;
">
```

### User Authentication

```typescript
// Validate user tokens server-side
app.post('/api/chatbot-auth', async (req, res) => {
  const userToken = req.headers.authorization;
  
  // Verify user token
  const user = await verifyUserToken(userToken);
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Generate chatbot session token
  const chatbotToken = await appAtOnceAdmin.chatbot.createSessionToken({
    userId: user.id,
    metadata: {
      role: user.role,
      permissions: user.permissions
    }
  });
  
  res.json({ token: chatbotToken });
});

// Frontend
const response = await fetch('/api/chatbot-auth', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

const { token } = await response.json();

const widget = await client.chatbot.render({
  sessionToken: token
});
```

### Input Sanitization

```typescript
// Always sanitize user input before displaying
widget.on('message', (message) => {
  if (message.sender === 'user') {
    // Sanitize before logging or displaying
    const sanitized = DOMPurify.sanitize(message.content);
    console.log('User message:', sanitized);
  }
});

// Validate file uploads
widget.on('file-upload', (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    alert('File type not allowed');
    return false;
  }
  
  if (file.size > maxSize) {
    alert('File too large');
    return false;
  }
});
```

## Troubleshooting

### Common Issues

```typescript
// Handle initialization errors
try {
  const widget = await client.chatbot.render();
} catch (error) {
  if (error.code === 'INVALID_API_KEY') {
    console.error('Invalid API key');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network error - check your connection');
  } else {
    console.error('Failed to initialize chatbot:', error);
  }
}

// Debug mode
const widget = await client.chatbot.render({
  debug: true, // Enable debug logging
  onError: (error) => {
    console.error('Chatbot error:', error);
    // Send to error tracking service
    Sentry.captureException(error);
  }
});

// Check connection status
widget.on('connection-change', (connected) => {
  if (!connected) {
    console.warn('Chatbot disconnected');
    // Show offline indicator
  }
});
```

## Performance Optimization

### Lazy Loading

```typescript
// Load chatbot only when needed
let widgetPromise;

function loadChatbot() {
  if (!widgetPromise) {
    widgetPromise = client.chatbot.render({
      behavior: { autoOpen: false }
    });
  }
  return widgetPromise;
}

// Load on user interaction
document.getElementById('chat-button').addEventListener('click', async () => {
  const widget = await loadChatbot();
  widget.show();
});
```

### Preloading

```html
<!-- Preload chatbot resources -->
<link rel="preconnect" href="https://api.appatonce.com">
<link rel="preconnect" href="https://realtime.appatonce.com">
<link rel="preload" href="https://cdn.appatonce.com/chatbot.css" as="style">
<link rel="preload" href="https://cdn.appatonce.com/chatbot.js" as="script">
```

This comprehensive guide covers all major use cases and integration patterns for the AppAtOnce chatbot SDK.