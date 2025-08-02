import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mockServerProcess: ChildProcess | null = null;

export async function startMockServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const mockServerPath = path.join(__dirname, '../../../mock-server');
    
    // Check if server is already running
    fetch('http://localhost:4000/health')
      .then(() => {
        console.log('Mock server is already running');
        resolve();
      })
      .catch(() => {
        console.log('Starting mock server...');
        
        mockServerProcess = spawn('npm', ['start'], {
          cwd: mockServerPath,
          stdio: 'inherit',
          shell: true
        });
        
        // Wait for server to start
        const checkServer = setInterval(async () => {
          try {
            const response = await fetch('http://localhost:4000/health');
            if (response.ok) {
              clearInterval(checkServer);
              console.log('Mock server started successfully');
              resolve();
            }
          } catch (e) {
            // Server not ready yet
          }
        }, 1000);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkServer);
          reject(new Error('Mock server failed to start'));
        }, 30000);
      });
  });
}

export async function stopMockServer(): Promise<void> {
  if (mockServerProcess) {
    console.log('Stopping mock server...');
    mockServerProcess.kill();
    mockServerProcess = null;
    
    // Wait a bit for the process to clean up
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export const MOCK_SERVER_URL = 'http://localhost:4000';
export const TEST_API_KEY = 'test-api-key';
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || `test_${Date.now()}@example.com`,
  password: process.env.TEST_USER_PASSWORD || `TestPass${Date.now()}!`
};