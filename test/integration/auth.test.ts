import { AppAtOnceClient } from '../../src/index.js';
import { startMockServer, stopMockServer, MOCK_SERVER_URL, TEST_USER } from './setup.js';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

describe('Auth Module Integration Tests', () => {
  let client: AppAtOnceClient;

  beforeAll(async () => {
    await startMockServer();
    client = AppAtOnceClient.createWithApiKey('test-api-key', MOCK_SERVER_URL);
  });

  afterAll(async () => {
    await stopMockServer();
  });

  describe('signIn', () => {
    test('should authenticate user with valid credentials', async () => {
      const session = await client.auth.signIn({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      expect(session).toBeDefined();
      expect(session.user.email).toBe(TEST_USER.email);
      expect(session.accessToken).toBeDefined();
      expect(session.refreshToken).toBeDefined();
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    test('should throw error with invalid credentials', async () => {
      await expect(
        client.auth.signIn({
          email: TEST_USER.email,
          password: `wrong_${Date.now()}`
        })
      ).rejects.toThrow();
    });

    test('should throw error with missing credentials', async () => {
      await expect(
        client.auth.signIn({
          email: '',
          password: ''
        })
      ).rejects.toThrow();
    });
  });

  describe('signUp', () => {
    test('should create new user account', async () => {
      const timestamp = Date.now();
      const newUser = {
        email: `newuser_${timestamp}@example.com`,
        password: `Pass${timestamp}!`,
        name: 'New User'
      };

      const session = await client.auth.signUp(newUser);

      expect(session).toBeDefined();
      expect(session.user.email).toBe(newUser.email);
      expect(session.user.name).toBe(newUser.name);
      expect(session.accessToken).toBeDefined();
    });

    test('should throw error when user already exists', async () => {
      await expect(
        client.auth.signUp({
          email: TEST_USER.email,
          password: `pass_${Date.now()}`
        })
      ).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    test('should get current user after sign in', async () => {
      // First sign in
      const session = await client.auth.signIn({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      // Update client with the session token
      const authClient = AppAtOnceClient.createWithToken(
        session.accessToken,
        MOCK_SERVER_URL
      );

      const user = await authClient.auth.getCurrentUser();

      expect(user).toBeDefined();
      expect(user.email).toBe(TEST_USER.email);
      expect(user.id).toBeDefined();
    });

    test('should throw error without authentication', async () => {
      const unauthClient = AppAtOnceClient.createWithApiKey(
        'invalid-key',
        MOCK_SERVER_URL
      );

      await expect(
        unauthClient.auth.getCurrentUser()
      ).rejects.toThrow();
    });
  });

  describe('signOut', () => {
    test('should sign out user', async () => {
      // First sign in
      const session = await client.auth.signIn({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      const authClient = AppAtOnceClient.createWithToken(
        session.accessToken,
        MOCK_SERVER_URL
      );

      await expect(authClient.auth.signOut()).resolves.not.toThrow();
    });
  });

  describe('refreshToken', () => {
    test('should refresh authentication token', async () => {
      // First sign in
      const session = await client.auth.signIn({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

      // Refresh the token
      const newSession = await client.auth.refreshToken(session.refreshToken!);

      expect(newSession).toBeDefined();
      expect(newSession.accessToken).toBeDefined();
      expect(newSession.accessToken).not.toBe(session.accessToken);
      expect(newSession.user.email).toBe(session.user.email);
    });

    test('should throw error with invalid refresh token', async () => {
      await expect(
        client.auth.refreshToken('invalid-refresh-token')
      ).rejects.toThrow();
    });
  });
});