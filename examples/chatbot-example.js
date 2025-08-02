#!/usr/bin/env node

/**
 * AppAtOnce SDK Chatbot Example
 * 
 * This example demonstrates how to integrate the AppAtOnce chatbot
 * into your application with a single function call.
 * 
 * Prerequisites:
 * - Set APPATONCE_API_KEY environment variable
 * - Ensure chatbot is enabled in your AppAtOnce project
 */

require('dotenv').config();

// Check API key
if (!process.env.APPATONCE_API_KEY) {
  console.error('❌ APPATONCE_API_KEY not found!');
  console.error('Please set it as an environment variable:');
  console.error('export APPATONCE_API_KEY=your_api_key_here');
  process.exit(1);
}

// Import the SDK
const { AppAtOnceClient } = require('@appatonce/node-sdk');

async function testChatbot() {
  console.log('🤖 AppAtOnce Chatbot Integration Example\n');
  
  // Initialize client
  const client = AppAtOnceClient.createWithApiKey(process.env.APPATONCE_API_KEY);
  
  try {
    // ========================================================================
    // BASIC CHATBOT INTEGRATION
    // ========================================================================
    console.log('═'.repeat(60));
    console.log('📋 BASIC CHATBOT INTEGRATION');
    console.log('═'.repeat(60) + '\n');
    
    // Simple one-line integration
    console.log('Rendering chatbot widget...\n');
    
    // In a real browser environment, this would render the chatbot
    // For this example, we'll just demonstrate the API
    const widget = await client.chatbot.render({
      mode: 'iframe',  // or 'widget' for embedded component
      position: 'bottom-right',
      startOpen: false,
      
      // Event handlers
      onReady: () => {
        console.log('✅ Chatbot is ready!');
      },
      onOpen: () => {
        console.log('💬 Chatbot opened');
      },
      onClose: () => {
        console.log('💬 Chatbot closed');
      },
      onMessage: (message) => {
        console.log('📨 New message:', message.content);
      },
      onError: (error) => {
        console.error('❌ Chatbot error:', error.message);
      }
    });
    
    console.log('✅ Chatbot widget created successfully!\n');
    
    // ========================================================================
    // WIDGET CONTROL
    // ========================================================================
    console.log('═'.repeat(60));
    console.log('🎮 WIDGET CONTROL');
    console.log('═'.repeat(60) + '\n');
    
    // Control the widget programmatically
    console.log('Available widget methods:');
    console.log('- widget.show()     // Show the widget');
    console.log('- widget.hide()     // Hide the widget');
    console.log('- widget.toggle()   // Toggle visibility');
    console.log('- widget.open()     // Open chat window');
    console.log('- widget.close()    // Close chat window');
    console.log('- widget.sendMessage("Hello!") // Send message');
    console.log('- widget.setUser({...})        // Set user info');
    console.log('- widget.setContext({...})     // Set context');
    console.log('- widget.destroy()  // Remove widget\n');
    
    // ========================================================================
    // CUSTOMIZATION OPTIONS
    // ========================================================================
    console.log('═'.repeat(60));
    console.log('🎨 CUSTOMIZATION OPTIONS');
    console.log('═'.repeat(60) + '\n');
    
    console.log('You can customize the chatbot with these options:');
    console.log(`
const widget = await client.chatbot.render({
  // Container element or selector
  container: '#my-chatbot-container',
  
  // Render mode
  mode: 'iframe',        // or 'widget' for embedded component
  
  // Session management
  sessionId: 'custom-session-123',
  userId: 'user-456',
  
  // UI customization (overrides server config)
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    fontFamily: 'Arial, sans-serif'
  },
  
  // Widget behavior
  position: 'bottom-right',  // or 'bottom-left'
  startOpen: false,
  startMinimized: true,
  hideOnMobile: false,
  
  // Features
  enableSounds: true,
  enableNotifications: true,
  
  // Event handlers
  onReady: () => console.log('Ready!'),
  onOpen: () => console.log('Opened!'),
  onClose: () => console.log('Closed!'),
  onMessage: (msg) => console.log('Message:', msg),
  onError: (err) => console.error('Error:', err)
});
    `);
    
    // ========================================================================
    // REACT INTEGRATION
    // ========================================================================
    console.log('═'.repeat(60));
    console.log('⚛️  REACT INTEGRATION');
    console.log('═'.repeat(60) + '\n');
    
    console.log('For React applications, use the provided hook:');
    console.log(`
import { useAppAtOnceChatbot } from '@appatonce/node-sdk/react';

function MyApp() {
  const client = AppAtOnceClient.createWithApiKey('YOUR_API_KEY');
  
  const { widget, isReady, error } = useAppAtOnceChatbot(client, {
    position: 'bottom-right',
    startOpen: false
  });
  
  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Loading chatbot...</div>;
  
  return (
    <div>
      <h1>My App</h1>
      <button onClick={() => widget?.toggle()}>
        Toggle Chat
      </button>
    </div>
  );
}
    `);
    
    console.log('\nOr use the component directly:');
    console.log(`
import { AppAtOnceChatbot } from '@appatonce/node-sdk/react';

function MyApp() {
  const client = AppAtOnceClient.createWithApiKey('YOUR_API_KEY');
  
  return (
    <div>
      <h1>My App</h1>
      <AppAtOnceChatbot 
        client={client}
        options={{
          position: 'bottom-right',
          theme: { primaryColor: '#007bff' }
        }}
      />
    </div>
  );
}
    `);
    
    // ========================================================================
    // VUE INTEGRATION
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('🟢 VUE INTEGRATION');
    console.log('═'.repeat(60) + '\n');
    
    console.log('For Vue applications:');
    console.log(`
import { useAppAtOnceChatbot } from '@appatonce/node-sdk/vue';

export default {
  setup() {
    const client = AppAtOnceClient.createWithApiKey('YOUR_API_KEY');
    
    const { widget, isReady, error } = useAppAtOnceChatbot(client, {
      position: 'bottom-right'
    });
    
    return { widget, isReady, error };
  }
}
    `);
    
    // ========================================================================
    // NEXT.JS INTEGRATION
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('▲ NEXT.JS INTEGRATION');
    console.log('═'.repeat(60) + '\n');
    
    console.log('For Next.js applications:');
    console.log(`
// pages/_app.js
import { AppAtOnceChatbot } from '@appatonce/node-sdk/react';
import { AppAtOnceClient } from '@appatonce/node-sdk';

const client = AppAtOnceClient.createWithApiKey(
  process.env.NEXT_PUBLIC_APPATONCE_API_KEY
);

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <AppAtOnceChatbot 
        client={client}
        options={{
          position: 'bottom-right',
          hideOnMobile: false
        }}
      />
    </>
  );
}
    `);
    
    // ========================================================================
    // VANILLA JAVASCRIPT
    // ========================================================================
    console.log('\n' + '═'.repeat(60));
    console.log('📜 VANILLA JAVASCRIPT');
    console.log('═'.repeat(60) + '\n');
    
    console.log('For vanilla JavaScript:');
    console.log(`
<script src="https://cdn.appatonce.com/sdk/v2/appatonce.min.js"></script>
<script>
  // Initialize client
  const client = AppAtOnceClient.createWithApiKey('YOUR_API_KEY');
  
  // Render chatbot when DOM is ready
  document.addEventListener('DOMContentLoaded', async () => {
    const widget = await client.chatbot.render({
      container: document.body,
      position: 'bottom-right',
      startOpen: false
    });
    
    // Control programmatically
    document.getElementById('chat-button')?.addEventListener('click', () => {
      widget.toggle();
    });
  });
</script>
    `);
    
    // Clean up (in browser environment)
    // widget.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

// Run the example
testChatbot().catch(console.error);