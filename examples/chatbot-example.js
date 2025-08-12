#!/usr/bin/env node

/**
 * AppAtOnce SDK Chatbot Documentation
 * 
 * IMPORTANT: The chatbot is a BROWSER-ONLY feature!
 * This file shows the API documentation, but the actual chatbot
 * can only be used in web browsers, not Node.js.
 * 
 * For a working example, see chatbot-browser-example.html
 */

console.log('🤖 AppAtOnce Chatbot Documentation\n');
console.log('⚠️  IMPORTANT: Chatbot is browser-only!\n');

console.log('═'.repeat(60));
console.log('📋 BROWSER USAGE');
console.log('═'.repeat(60) + '\n');

console.log('In a browser environment (React, Vue, vanilla JS):');
console.log(`
import { loadChatbot } from '@appatonce/node-sdk/browser';

// Simple one-line integration
const widget = loadChatbot('your-api-key');

// With options
const widget = loadChatbot('your-api-key', {
  position: 'bottom-right',    // or 'bottom-left'
  theme: {
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4'
  },
  // baseUrl is configured internally in the SDK
  startOpen: false,
  zIndex: 999999
});

// Control methods
widget.show();      // Show the chatbot
widget.hide();      // Hide the chatbot
widget.toggle();    // Toggle visibility
widget.destroy();   // Remove from DOM
widget.isOpen();    // Check if open
`);

console.log('\n' + '═'.repeat(60));
console.log('⚛️ REACT EXAMPLE');
console.log('═'.repeat(60) + '\n');

console.log(`
import { useEffect } from 'react';
import { loadChatbot } from '@appatonce/node-sdk/browser';

function App() {
  useEffect(() => {
    const widget = loadChatbot(process.env.REACT_APP_APPATONCE_API_KEY);
    
    // Cleanup on unmount
    return () => widget.destroy();
  }, []);

  return <div>Your app content</div>;
}
`);

console.log('\n' + '═'.repeat(60));
console.log('🟢 VUE EXAMPLE');
console.log('═'.repeat(60) + '\n');

console.log(`
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { loadChatbot } from '@appatonce/node-sdk/browser';

let widget = null;

onMounted(() => {
  widget = loadChatbot(import.meta.env.VITE_APPATONCE_API_KEY);
});

onUnmounted(() => {
  widget?.destroy();
});
</script>
`);

console.log('\n' + '═'.repeat(60));
console.log('📌 VANILLA JS EXAMPLE');
console.log('═'.repeat(60) + '\n');

console.log(`
<script type="module">
  import { loadChatbot } from '@appatonce/node-sdk/browser';
  
  // Load on page ready
  document.addEventListener('DOMContentLoaded', () => {
    const widget = loadChatbot('your-api-key');
    
    // Optional: Add controls
    document.getElementById('toggle-chat')?.addEventListener('click', () => {
      widget.toggle();
    });
  });
</script>
`);

console.log('\n' + '═'.repeat(60));
console.log('❌ WHY NOT NODE.JS?');
console.log('═'.repeat(60) + '\n');

console.log(`
The chatbot is a visual UI component that requires:
- DOM manipulation
- User interaction (clicks, typing)
- Visual rendering
- Browser APIs

These don't exist in Node.js environments (servers, CLIs, APIs).

For Node.js, use other SDK features:
- Database operations
- AI text generation
- Real-time subscriptions
- File storage
- Email sending
- etc.
`);

console.log('\n✅ See chatbot-browser-example.html for a working demo!\n');