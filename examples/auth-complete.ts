/**
 * AppAtOnce Node SDK - Complete Authentication & User Management Guide
 * 
 * This comprehensive example demonstrates ALL authentication features using client.auth
 * The API key automatically determines the project/app context - no manual configuration needed!
 * 
 * Features covered:
 * ✅ User signup & signin
 * ✅ Password reset & email verification
 * ✅ Multi-factor authentication (MFA/2FA) - Coming Soon
 * ✅ Magic Link / Passwordless Auth - Coming Soon
 * ✅ OAuth/Social login (Google, GitHub, Facebook, etc.)
 * ✅ SSO Authentication
 * ✅ Session management
 * ✅ User profile updates
 * ✅ Tenant user management (list, search, get)
 * ✅ Token refresh & auto-refresh
 * ✅ Auth state listeners
 * 
 * IMPORTANT: Authentication Modes
 * ================================
 * AppAtOnce supports two authentication approaches:
 * 
 * 1. SSO Mode (Single Sign-On):
 *    - Unified authentication across your application
 *    - OAuth handled through the platform
 *    - No OAuth credentials needed in your app
 *    - Quick setup for SaaS applications
 *    - Configure in your project's authentication settings
 * 
 * 2. Custom OAuth Mode:
 *    - Direct integration with OAuth providers
 *    - You provide your own OAuth credentials
 *    - Full control over the authentication flow
 *    - Ideal for white-label solutions
 */

import { AppAtOnceClient } from '../src';
import type { AuthUser, AuthSession } from '../src/types';
import { OAuthProvider } from '../src/types/oauth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the client - API key automatically handles project/app context
const client = AppAtOnceClient.create(process.env.APPATONCE_API_KEY || '');

// =============================================================================
// SECTION 1: BASIC AUTHENTICATION
// =============================================================================

/**
 * Example 1: User Signup
 * Create a new user account in your project/app
 */
async function signupExample(): Promise<AuthSession | undefined> {
  try {
    console.log('📝 Creating new user account...');
    
    const session = await client.auth.signUp({
      email: 'user@example.com',
      password: 'SecurePassword123!',
      name: 'John Doe',
      metadata: {
        source: 'web',
        referrer: 'landing-page',
        plan: 'free'
      }
    });
    
    console.log('✅ User created successfully');
    console.log('   User ID:', session.user.id);
    console.log('   Email:', session.user.email);
    console.log('   Access Token:', session.access_token ? '✓' : '✗');
    console.log('   Refresh Token:', session.refresh_token ? '✓' : '✗');
    
    return session;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('⚠️ User already exists');
    } else {
      console.error('❌ Signup failed:', error.message);
    }
    return undefined;
  }
}

/**
 * Example 2: User Signin
 * Authenticate an existing user
 */
async function signinExample(): Promise<AuthSession | undefined> {
  try {
    console.log('🔐 Signing in user...');
    
    const session = await client.auth.signIn({
      email: 'user@example.com',
      password: 'SecurePassword123!'
    });
    
    console.log('✅ Signin successful');
    console.log('   User ID:', session.user.id);
    console.log('   Session expires:', new Date(session.expires_at * 1000).toLocaleString());
    
    // The client automatically updates its internal token
    console.log('   Client authenticated:', client.auth.isAuthenticated());
    
    return session;
  } catch (error: any) {
    console.error('❌ Signin failed:', error.message);
    throw error;
  }
}

/**
 * Example 3: Sign Out
 * End the current user session
 */
async function signoutExample() {
  try {
    console.log('👋 Signing out user...');
    
    await client.auth.signOut();
    
    console.log('✅ Signed out successfully');
    console.log('   Session cleared:', !client.auth.isAuthenticated());
    
  } catch (error: any) {
    console.error('❌ Signout failed:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 2: PASSWORD MANAGEMENT
// =============================================================================

/**
 * Example 4: Request Password Reset
 * Send password reset email to user
 */
async function requestPasswordReset() {
  try {
    console.log('📧 Requesting password reset...');
    
    await client.auth.resetPassword('user@example.com');
    
    console.log('✅ Password reset email sent');
    console.log('   Check email for reset link');
    
  } catch (error: any) {
    // Password reset typically doesn't reveal if email exists for security
    console.log('✅ If email exists, reset link has been sent');
  }
}

/**
 * Example 5: Confirm Password Reset
 * Complete password reset with token from email
 */
async function confirmPasswordReset(token: string) {
  try {
    console.log('🔑 Resetting password with token...');
    
    await client.auth.confirmResetPassword(token, 'NewSecurePassword456!');
    
    console.log('✅ Password reset successful');
    console.log('   You can now sign in with the new password');
    
  } catch (error: any) {
    console.error('❌ Password reset failed:', error.message);
    throw error;
  }
}

/**
 * Example 6: Change Password (for authenticated users)
 * Change password while logged in
 */
async function changePassword() {
  try {
    console.log('🔐 Changing password...');
    
    await client.auth.changePassword(
      'CurrentPassword123!',
      'NewPassword456!'
    );
    
    console.log('✅ Password changed successfully');
    
  } catch (error: any) {
    console.error('❌ Password change failed:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 3: EMAIL VERIFICATION
// =============================================================================

/**
 * Example 7: Send Email Verification
 * Send verification email to current user
 */
async function sendEmailVerification() {
  try {
    console.log('📧 Sending email verification...');
    
    await client.auth.sendEmailVerification();
    
    console.log('✅ Verification email sent');
    console.log('   Check inbox for verification link');
    
  } catch (error: any) {
    console.error('❌ Failed to send verification:', error.message);
    throw error;
  }
}

/**
 * Example 8: Verify Email
 * Confirm email with token from verification email
 */
async function verifyEmail(token: string) {
  try {
    console.log('✉️ Verifying email...');
    
    await client.auth.verifyEmail(token);
    
    console.log('✅ Email verified successfully');
    
  } catch (error: any) {
    console.error('❌ Email verification failed:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 4: MULTI-FACTOR AUTHENTICATION (2FA)
// =============================================================================

/**
 * Example 9: Enable MFA/2FA
 * Set up two-factor authentication for enhanced security
 */
async function enableMFA() {
  try {
    console.log('🔒 Enabling two-factor authentication...');
    
    const mfaSetup = await client.auth.enableMFA();
    
    console.log('✅ MFA setup initiated');
    console.log('   Secret:', mfaSetup.secret);
    console.log('   QR Code URL:', mfaSetup.qr_code);
    console.log('   Scan QR code with authenticator app (Google Authenticator, Authy, etc.)');
    
    return mfaSetup;
  } catch (error: any) {
    console.error('❌ Failed to enable MFA:', error.message);
    throw error;
  }
}

/**
 * Example 10: Verify MFA Code
 * Complete MFA setup by verifying a code from authenticator app
 */
async function verifyMFACode(code: string) {
  try {
    console.log('🔐 Verifying MFA code...');
    
    await client.auth.verifyMFA(code);
    
    console.log('✅ MFA verified and enabled');
    console.log('   Two-factor authentication is now active');
    
  } catch (error: any) {
    console.error('❌ MFA verification failed:', error.message);
    throw error;
  }
}

/**
 * Example 11: Generate Backup Codes
 * Generate backup codes for MFA recovery
 */
async function generateBackupCodes() {
  try {
    console.log('🔑 Generating MFA backup codes...');
    
    const backupCodes = await client.auth.generateBackupCodes();
    
    console.log('✅ Backup codes generated');
    console.log('   Store these codes safely:');
    backupCodes.codes.forEach((code, index) => {
      console.log(`   ${index + 1}. ${code}`);
    });
    
    return backupCodes;
  } catch (error: any) {
    console.error('❌ Failed to generate backup codes:', error.message);
    throw error;
  }
}

/**
 * Example 12: Disable MFA
 * Turn off two-factor authentication
 */
async function disableMFA(password: string) {
  try {
    console.log('🔓 Disabling two-factor authentication...');
    
    await client.auth.disableMFA(password);
    
    console.log('✅ MFA disabled successfully');
    
  } catch (error: any) {
    console.error('❌ Failed to disable MFA:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 5: MAGIC LINK / PASSWORDLESS (COMING SOON)
// =============================================================================

/**
 * Example: Magic Link Authentication
 * Send a magic link for passwordless authentication
 * 
 * NOTE: This feature is coming soon to AppAtOnce
 */
async function sendMagicLink(email: string) {
  console.log('🔮 Magic Link authentication coming soon!');
  console.log('   This will allow passwordless login via email');
  
  // When available, usage will be:
  // await client.auth.sendMagicLink(email);
  // User clicks link in email to authenticate
}

// =============================================================================
// SECTION 6: SSO AUTHENTICATION
// =============================================================================

/**
 * Example: SSO Authentication
 * 
 * When SSO is enabled in your project settings, OAuth authentication
 * is handled through the AppAtOnce platform. Users will see a unified
 * login page with all configured OAuth providers.
 * 
 * Benefits of SSO Mode:
 * - No OAuth credentials needed in your code
 * - Unified authentication experience
 * - Automatic provider management
 * - Built-in security and compliance
 * 
 * To enable SSO:
 * 1. Go to your project settings
 * 2. Navigate to Authentication section
 * 3. Enable SSO mode
 * 4. Configure OAuth providers through the dashboard
 */
async function ssoAuthentication() {
  console.log('🔐 SSO Authentication');
  console.log('   When SSO is enabled, OAuth is handled automatically');
  console.log('   Users authenticate through the platform\'s unified login');
  
  // With SSO enabled, you simply redirect users to the login page
  // The platform handles all OAuth provider interactions
  
  // Check if SSO is enabled for your project
  // This information would typically come from your project configuration
  const ssoEnabled = true; // Configure in project settings
  
  if (ssoEnabled) {
    console.log('✅ SSO is enabled - OAuth handled by platform');
    // Users authenticate through platform-provided login page
  } else {
    console.log('📝 Using custom OAuth credentials');
    // Use the OAuth methods below for custom integration
  }
}

// =============================================================================
// SECTION 7: CUSTOM OAUTH / SOCIAL LOGIN
// =============================================================================

/**
 * Example 13: Initiate OAuth Login (Custom Mode)
 * Start OAuth flow with providers like Google, GitHub, Facebook
 * Use this when SSO is disabled and you're using your own OAuth credentials
 */
async function initiateOAuthLogin(): Promise<any> {
  try {
    console.log('🌐 Initiating OAuth login...');
    
    // Supported providers: google, github, facebook, microsoft, twitter, apple
    const oauthResponse = await client.auth.initiateOAuth(OAuthProvider.GOOGLE, {
      redirectUrl: 'https://yourapp.com/auth/callback'
    });
    
    console.log('✅ OAuth initiated');
    console.log('   Redirect user to:', oauthResponse.url);
    console.log('   State:', oauthResponse.state);
    
    return oauthResponse;
  } catch (error: any) {
    console.error('❌ OAuth initiation failed:', error.message);
    throw error;
  }
}

/**
 * Example 14: Complete OAuth Callback
 * Handle OAuth callback after user returns from provider
 */
async function handleOAuthCallback(provider: OAuthProvider, code: string, state: string): Promise<AuthSession | undefined> {
  try {
    console.log('🔄 Processing OAuth callback...');
    
    const session = await client.auth.handleOAuthCallback(
      provider as any,
      code,
      state
    );
    
    console.log('✅ OAuth login successful');
    console.log('   User:', session.user.email);
    console.log('   Provider:', provider);
    
    return session;
  } catch (error: any) {
    console.error('❌ OAuth callback failed:', error.message);
    throw error;
  }
}

/**
 * Example 15: Link OAuth Provider
 * Connect additional OAuth providers to existing account
 */
async function linkOAuthProvider() {
  try {
    console.log('🔗 Linking OAuth provider...');
    
    const linkResponse = await client.auth.initiateLinkProvider(OAuthProvider.GITHUB, {
      redirectUrl: 'https://yourapp.com/settings/connected'
    });
    
    console.log('✅ Provider linking initiated');
    console.log('   Redirect to:', linkResponse.url);
    
    return linkResponse;
  } catch (error: any) {
    console.error('❌ Provider linking failed:', error.message);
    throw error;
  }
}

/**
 * Example 16: Get Connected OAuth Providers
 * List all OAuth providers connected to current user
 */
async function getConnectedProviders(): Promise<any> {
  try {
    console.log('📋 Getting connected providers...');
    
    const providers = await client.auth.getConnectedProviders();
    
    console.log('✅ Connected providers:');
    providers.providers.forEach(p => {
      console.log(`   - ${p.provider}: ${p.email || p.name || 'Connected'}`);
    });
    
    return providers;
  } catch (error: any) {
    console.error('❌ Failed to get providers:', error.message);
    throw error;
  }
}

/**
 * Example 17: Unlink OAuth Provider
 * Remove OAuth provider from account
 */
async function unlinkOAuthProvider(provider: string) {
  try {
    console.log('🔗 Unlinking OAuth provider...');
    
    await client.auth.unlinkOAuthProvider(provider as any);
    
    console.log('✅ Provider unlinked:', provider);
    
  } catch (error: any) {
    console.error('❌ Failed to unlink provider:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 8: USER PROFILE MANAGEMENT
// =============================================================================

/**
 * Example 18: Get Current User
 * Retrieve current authenticated user's profile
 */
async function getCurrentUser() {
  try {
    console.log('👤 Getting current user...');
    
    const user = await client.auth.getCurrentUser();
    
    if (user) {
      console.log('✅ Current user:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Verified:', user.email_verified);
      console.log('   Created:', user.created_at);
    } else {
      console.log('❌ No authenticated user');
    }
    
    return user;
  } catch (error: any) {
    console.error('❌ Failed to get user:', error.message);
    throw error;
  }
}

/**
 * Example 19: Update User Profile
 * Update current user's profile information
 */
async function updateUserProfile() {
  try {
    console.log('✏️ Updating user profile...');
    
    const updatedUser = await client.auth.updateUser({
      name: 'Jane Smith',
      avatar: 'https://example.com/avatar.jpg',
      metadata: {
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }
    });
    
    console.log('✅ Profile updated:');
    console.log('   Name:', updatedUser.name);
    console.log('   Avatar:', updatedUser.avatar);
    
    return updatedUser;
  } catch (error: any) {
    console.error('❌ Profile update failed:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 9: TENANT USER MANAGEMENT (API Key Context)
// =============================================================================

/**
 * Example 20: List All Users in Project/App
 * Get all users in your tenant (determined by API key)
 */
async function listTenantUsers() {
  try {
    console.log('👥 Listing all users in tenant...');
    
    const result = await client.auth.listUsers({
      limit: 50,
      offset: 0,
      orderBy: 'created_at',
      ascending: false
    });
    
    console.log(`✅ Found ${result.total} users`);
    result.users.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'No name'})`);
    });
    
    return result;
  } catch (error: any) {
    console.error('❌ Failed to list users:', error.message);
    throw error;
  }
}

/**
 * Example 21: Search Users
 * Search for users by email or name in your tenant
 */
async function searchTenantUsers(searchTerm: string) {
  try {
    console.log(`🔍 Searching for users matching "${searchTerm}"...`);
    
    const users = await client.auth.searchUsers(searchTerm, 10);
    
    console.log(`✅ Found ${users.length} matching users`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
    });
    
    return users;
  } catch (error: any) {
    console.error('❌ Search failed:', error.message);
    throw error;
  }
}

/**
 * Example 22: Get User by ID
 * Retrieve specific user details from your tenant
 */
async function getTenantUserById(userId: string) {
  try {
    console.log(`👤 Getting user ${userId}...`);
    
    const user = await client.auth.getUserById(userId);
    
    console.log('✅ User details:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Verified:', user.email_verified);
    console.log('   Created:', user.created_at);
    
    return user;
  } catch (error: any) {
    console.error('❌ Failed to get user:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 10: SESSION MANAGEMENT
// =============================================================================

/**
 * Example 23: Refresh Session Token
 * Refresh access token using refresh token
 */
async function refreshSession() {
  try {
    console.log('🔄 Refreshing session token...');
    
    const newSession = await client.auth.refreshSession();
    
    console.log('✅ Session refreshed');
    console.log('   New access token obtained');
    console.log('   Expires:', new Date(newSession.expires_at * 1000).toLocaleString());
    
    return newSession;
  } catch (error: any) {
    console.error('❌ Session refresh failed:', error.message);
    throw error;
  }
}

/**
 * Example 24: Get User Sessions
 * List all active sessions for current user
 */
async function getUserSessions() {
  try {
    console.log('📋 Getting user sessions...');
    
    const sessions = await client.auth.getUserSessions();
    
    console.log(`✅ Found ${sessions.length} active sessions`);
    sessions.forEach(session => {
      console.log(`   - ${session.ip_address} | ${session.user_agent}`);
      console.log(`     Created: ${session.created_at}`);
    });
    
    return sessions;
  } catch (error: any) {
    console.error('❌ Failed to get sessions:', error.message);
    throw error;
  }
}

/**
 * Example 25: Revoke Session
 * Terminate a specific session
 */
async function revokeSession(sessionId: string) {
  try {
    console.log(`🚫 Revoking session ${sessionId}...`);
    
    await client.auth.revokeSession(sessionId);
    
    console.log('✅ Session revoked');
    
  } catch (error: any) {
    console.error('❌ Failed to revoke session:', error.message);
    throw error;
  }
}

/**
 * Example 26: Revoke All Sessions
 * Sign out from all devices
 */
async function revokeAllSessions() {
  try {
    console.log('🚫 Revoking all sessions...');
    
    await client.auth.revokeAllSessions();
    
    console.log('✅ All sessions revoked');
    console.log('   User signed out from all devices');
    
  } catch (error: any) {
    console.error('❌ Failed to revoke sessions:', error.message);
    throw error;
  }
}

// =============================================================================
// SECTION 11: AUTH STATE MANAGEMENT
// =============================================================================

/**
 * Example 27: Auth State Listener
 * Listen for authentication state changes
 */
function setupAuthStateListener() {
  console.log('👂 Setting up auth state listener...');
  
  const unsubscribe = client.auth.onAuthStateChange((event, session) => {
    console.log(`🔔 Auth event: ${event}`);
    if (session) {
      console.log('   User:', session.user.email);
    } else {
      console.log('   No active session');
    }
  });
  
  console.log('✅ Listener active (call returned function to unsubscribe)');
  
  return unsubscribe;
}

/**
 * Example 28: Check Authentication Status
 * Various ways to check if user is authenticated
 */
function checkAuthStatus() {
  console.log('🔍 Checking authentication status...');
  
  // Check if authenticated
  const isAuth = client.auth.isAuthenticated();
  console.log('   Authenticated:', isAuth);
  
  // Get current session
  const session = client.auth.getSession();
  console.log('   Has session:', !!session);
  
  // Check if session expired
  const isExpired = client.auth.isSessionExpired();
  console.log('   Session expired:', isExpired);
  
  // Get current user from memory
  const user = client.auth.getUser();
  console.log('   Current user:', user?.email || 'None');
  
  return {
    isAuthenticated: isAuth,
    hasSession: !!session,
    isExpired,
    user
  };
}

// =============================================================================
// MAIN DEMO FUNCTION
// =============================================================================

async function runAuthDemo() {
  console.log('🚀 AppAtOnce Authentication Complete Demo\n');
  console.log('=' .repeat(60));
  
  try {
    // Basic Authentication Flow
    console.log('\n📌 BASIC AUTHENTICATION');
    console.log('-'.repeat(40));
    
    // Signup
    await signupExample().catch(() => {
      console.log('   Skipping signup (user may exist)');
    });
    
    // Signin
    const session = await signinExample();
    
    // Get current user
    await getCurrentUser();
    
    // Update profile
    await updateUserProfile();
    
    // Password Management
    console.log('\n📌 PASSWORD MANAGEMENT');
    console.log('-'.repeat(40));
    
    // Request password reset
    await requestPasswordReset();
    
    // Email Verification
    console.log('\n📌 EMAIL VERIFICATION');
    console.log('-'.repeat(40));
    
    // Send verification email
    await sendEmailVerification().catch(e => {
      console.log('   Email may already be verified');
    });
    
    // Multi-Factor Authentication
    console.log('\n📌 MULTI-FACTOR AUTHENTICATION');
    console.log('-'.repeat(40));
    
    // Enable MFA
    const mfa = await enableMFA().catch(e => {
      console.log('   MFA may already be enabled');
      return null;
    });
    
    if (mfa) {
      // Generate backup codes
      await generateBackupCodes();
    }
    
    // SSO Authentication
    console.log('\n📌 SSO AUTHENTICATION');
    console.log('-'.repeat(40));
    
    // Check SSO configuration
    await ssoAuthentication();
    
    // OAuth/Social Login (Custom Mode)
    console.log('\n📌 CUSTOM OAUTH / SOCIAL LOGIN');
    console.log('-'.repeat(40));
    
    // Initiate OAuth (when not using SSO)
    const oauth = await initiateOAuthLogin();
    console.log('   User would be redirected to:', oauth.url);
    
    // Get connected providers
    await getConnectedProviders();
    
    // Tenant User Management
    console.log('\n📌 TENANT USER MANAGEMENT');
    console.log('-'.repeat(40));
    
    // List users
    const tenantUsers = await listTenantUsers();
    
    // Search users
    if (tenantUsers.total > 0) {
      await searchTenantUsers('admin');
    }
    
    // Session Management
    console.log('\n📌 SESSION MANAGEMENT');
    console.log('-'.repeat(40));
    
    // Get sessions
    await getUserSessions();
    
    // Check auth status
    checkAuthStatus();
    
    // Setup listener
    const unsubscribe = setupAuthStateListener();
    
    // Refresh session
    await refreshSession();
    
    // Clean up
    console.log('\n📌 CLEANUP');
    console.log('-'.repeat(40));
    
    // Unsubscribe from auth state
    unsubscribe();
    console.log('✅ Unsubscribed from auth state');
    
    // Sign out
    await signoutExample();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Authentication demo completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Demo error:', error.message);
    process.exit(1);
  }
}

// =============================================================================
// UTILITY: Check Environment
// =============================================================================

function checkEnvironment() {
  if (!process.env.APPATONCE_API_KEY) {
    console.error('❌ APPATONCE_API_KEY not found!');
    console.error('');
    console.error('Please set your API key:');
    console.error('  export APPATONCE_API_KEY=your_api_key_here');
    console.error('');
    console.error('Get your API key from:');
    console.error('  https://appatonce.com/dashboard');
    process.exit(1);
  }
  
  console.log('✅ Environment configured');
  console.log('   API Key:', process.env.APPATONCE_API_KEY.substring(0, 10) + '...');
}

// =============================================================================
// RUN DEMO
// =============================================================================

// Run if executed directly
if (require.main === module) {
  checkEnvironment();
  runAuthDemo();
}

// Export all functions for use in other modules
export {
  // Basic Auth
  signupExample,
  signinExample,
  signoutExample,
  
  // Password Management
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
  
  // Email Verification
  sendEmailVerification,
  verifyEmail,
  
  // MFA
  enableMFA,
  verifyMFACode,
  generateBackupCodes,
  disableMFA,
  
  // Magic Link
  sendMagicLink,
  
  // SSO
  ssoAuthentication,
  
  // OAuth
  initiateOAuthLogin,
  handleOAuthCallback,
  linkOAuthProvider,
  getConnectedProviders,
  unlinkOAuthProvider,
  
  // Profile
  getCurrentUser,
  updateUserProfile,
  
  // Tenant Users
  listTenantUsers,
  searchTenantUsers,
  getTenantUserById,
  
  // Sessions
  refreshSession,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  
  // State
  setupAuthStateListener,
  checkAuthStatus
};