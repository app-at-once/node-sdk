/**
 * AppAtOnce Node.js SDK - Email Verification Example
 * 
 * This example demonstrates how to implement email verification
 * in your Node.js application using the AppAtOnce SDK.
 * 
 * Features covered:
 * ✅ Send email verification
 * ✅ Verify email with token
 * ✅ Resend verification email
 * ✅ Check verification status
 * ✅ Complete verification flow
 */

const { AppAtOnceClient } = require('../src/index');

// Initialize the client with your API key
const client = new AppAtOnceClient('your-api-key-here');

/**
 * Example 1: Send Email Verification
 * Send a verification email to the current authenticated user
 */
async function sendEmailVerificationExample() {
  try {
    console.log('📧 Sending email verification...');
    
    const response = await client.auth.sendEmailVerification();
    
    console.log('✅ Verification email sent successfully');
    console.log(`   Message: ${response.message}`);
    console.log(`   Expires in: ${response.expiresIn} seconds`);
    console.log('   Check your email for the verification link');
    
    return response;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    throw error;
  }
}

/**
 * Example 2: Verify Email with Token
 * Verify a user's email address using the token from the verification email
 */
async function verifyEmailExample(token) {
  try {
    console.log('✉️ Verifying email with token...');
    
    const result = await client.auth.verifyEmail(token);
    
    if (result.success) {
      console.log('✅ Email verified successfully');
      console.log(`   Message: ${result.message}`);
      if (result.user) {
        console.log(`   User: ${result.user.email}`);
        console.log(`   Email verified: ${result.user.emailVerified}`);
      }
    } else {
      console.log('❌ Email verification failed');
      console.log(`   Message: ${result.message}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Email verification error:', error.message);
    throw error;
  }
}

/**
 * Example 3: Resend Email Verification
 * Resend a verification email if the previous one expired
 */
async function resendEmailVerificationExample() {
  try {
    console.log('🔄 Resending verification email...');
    
    const response = await client.auth.resendEmailVerification();
    
    console.log('✅ Verification email resent successfully');
    console.log(`   Message: ${response.message}`);
    console.log(`   Expires in: ${response.expiresIn} seconds`);
    
    return response;
  } catch (error) {
    console.error('❌ Failed to resend verification email:', error.message);
    throw error;
  }
}

/**
 * Example 4: Get Email Verification Status
 * Check the current email verification status for the authenticated user
 */
async function getEmailVerificationStatusExample() {
  try {
    console.log('📊 Getting email verification status...');
    
    const status = await client.auth.getEmailVerificationStatus();
    
    console.log('✅ Email Verification Status:');
    console.log(`   Verified: ${status.verified}`);
    console.log(`   Pending verification: ${status.pendingVerification}`);
    console.log(`   Can resend: ${status.canResend}`);
    if (status.lastSentAt) {
      console.log(`   Last sent: ${status.lastSentAt}`);
    }
    if (status.expiresAt) {
      console.log(`   Expires: ${status.expiresAt}`);
    }
    
    return status;
  } catch (error) {
    console.error('❌ Failed to get verification status:', error.message);
    throw error;
  }
}

/**
 * Example 5: Complete Email Verification Flow
 * Demonstrates the complete email verification process
 */
async function emailVerificationCompleteFlow() {
  try {
    console.log('🌟 Complete Email Verification Flow');
    console.log('-'.repeat(50));
    
    // Step 1: Check current status
    console.log('\n📊 Step 1: Checking verification status...');
    const status = await getEmailVerificationStatusExample();
    
    if (status.verified) {
      console.log('✅ Email is already verified!');
      return;
    }
    
    // Step 2: Send verification email if needed
    if (status.canResend) {
      console.log('\n📧 Step 2: Sending verification email...');
      const response = await sendEmailVerificationExample();
      
      if (!response) {
        console.log('❌ Failed to send verification email, stopping flow');
        return;
      }
    } else {
      console.log('\n⏳ Step 2: Cannot resend verification email yet');
      console.log('   Please wait before requesting another verification email');
      return;
    }
    
    console.log('\n📬 Step 3: User receives email and clicks verification link');
    console.log('   (In a real app, the user would click the link in their email)');
    console.log('   (The link would redirect to your app with the token)');
    
    // In a real implementation, you would:
    // 1. User clicks verification link in email
    // 2. Link redirects to your app: https://yourapp.com/verify-email?token=xyz
    // 3. Your app extracts token from the URL
    // 4. Your app calls verifyEmail with the token
    
    console.log('\n🔍 Step 4: Simulating token verification...');
    console.log('   (In a real app, token would come from the email link)');
    
    // For demo purposes, we'll simulate having the token
    // In reality, this would come from the email link callback
    const simulatedToken = 'demo-token-would-come-from-email-link';
    
    // This would normally succeed with a real token from the email
    console.log('   Attempting verification (will fail with demo token)...');
    try {
      await verifyEmailExample(simulatedToken);
    } catch (error) {
      console.log('   Expected failure with demo token');
    }
    
    console.log('\n📱 Complete Email Verification Flow Summary:');
    console.log('   1. User signs up (email unverified)');
    console.log('   2. App calls sendEmailVerification()');
    console.log('   3. User receives email with verification link');
    console.log('   4. User clicks link, redirects to app with token');
    console.log('   5. App calls verifyEmail() with token');
    console.log('   6. User email is marked as verified');
    
  } catch (error) {
    console.error('❌ Email verification flow error:', error.message);
  }
}

/**
 * Example 6: Sign Up with Email Verification
 * Complete user registration flow with email verification
 */
async function signUpWithEmailVerification(email, password, name) {
  try {
    console.log('🚀 Complete Sign Up + Email Verification Flow');
    console.log('-'.repeat(50));
    
    // Step 1: Sign up the user
    console.log('\n📝 Step 1: Creating user account...');
    const session = await client.auth.signUp({
      email,
      password,
      name
    });
    
    console.log('✅ User created successfully');
    console.log(`   User ID: ${session.user.id}`);
    console.log(`   Email: ${session.user.email}`);
    console.log(`   Email verified: ${session.user.emailVerified}`);
    
    // Step 2: Send verification email (usually sent automatically on signup)
    if (!session.user.emailVerified) {
      console.log('\n📧 Step 2: Email verification needed');
      
      // Check if we can send verification email
      const status = await getEmailVerificationStatusExample();
      
      if (status.canResend) {
        await sendEmailVerificationExample();
        console.log('   Verification email sent to user');
      } else {
        console.log('   Verification email was already sent during signup');
      }
    } else {
      console.log('\n✅ Step 2: Email already verified');
    }
    
    console.log('\n📋 Next Steps for User:');
    console.log('   1. Check email inbox for verification link');
    console.log('   2. Click the verification link');
    console.log('   3. User will be redirected back to your app');
    console.log('   4. Extract token from URL and call verifyEmail()');
    
    return session;
  } catch (error) {
    console.error('❌ Sign up with verification error:', error.message);
    throw error;
  }
}

/**
 * Example 7: Express.js Route Handler for Email Verification
 * Example of how to handle email verification in an Express.js app
 */
function setupExpressRoutes(app) {
  // Route to handle verification link clicks
  app.get('/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({
          error: 'Verification token is required'
        });
      }
      
      // Verify the email
      const result = await client.auth.verifyEmail(token);
      
      if (result.success) {
        // Redirect to success page or send success response
        res.redirect('/verification-success');
      } else {
        // Redirect to error page or send error response
        res.redirect('/verification-failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      res.redirect('/verification-failed');
    }
  });
  
  // Route to resend verification email
  app.post('/resend-verification', async (req, res) => {
    try {
      // Assuming user is authenticated and token is in headers
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!authToken) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Set the client token for this request
      client.setToken(authToken);
      
      const response = await client.auth.resendEmailVerification();
      
      res.json({
        success: true,
        message: response.message,
        expiresIn: response.expiresIn
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Route to check verification status
  app.get('/verification-status', async (req, res) => {
    try {
      // Assuming user is authenticated and token is in headers
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (!authToken) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Set the client token for this request
      client.setToken(authToken);
      
      const status = await client.auth.getEmailVerificationStatus();
      
      res.json(status);
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  });
}

/**
 * Run the complete email verification demo
 */
async function runEmailVerificationDemo() {
  try {
    console.log('🚀 AppAtOnce Email Verification Demo\n');
    console.log('='.repeat(60));
    
    // Note: For this demo to work, you need to:
    // 1. Replace 'your-api-key-here' with your actual API key
    // 2. Have an authenticated user session
    
    if (client.config.apiKey === 'your-api-key-here') {
      console.log('❌ Please set your API key first!');
      console.log('   Get your API key from: https://appatonce.com/dashboard');
      return;
    }
    
    // First, you would need to sign in or have an authenticated session
    console.log('📋 Prerequisites:');
    console.log('   - Valid API key configured');
    console.log('   - User must be authenticated');
    console.log('   - User must have an unverified email');
    console.log('');
    
    // Example of signing up first (uncomment to test)
    /*
    console.log('📝 Creating test user account...');
    await signUpWithEmailVerification(
      'test@example.com',
      'SecurePassword123!',
      'Test User'
    );
    */
    
    // Check verification status
    console.log('📊 Checking current verification status...');
    try {
      await getEmailVerificationStatusExample();
    } catch (error) {
      console.log('   User not authenticated or API key invalid');
      return;
    }
    
    // Demonstrate complete flow
    await emailVerificationCompleteFlow();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Email verification demo completed!');
    console.log('\n📚 Additional Resources:');
    console.log('   - API Documentation: https://docs.appatonce.com');
    console.log('   - Dashboard: https://appatonce.com/dashboard');
    console.log('   - Support: support@appatonce.com');
    
  } catch (error) {
    console.error('\n❌ Demo error:', error.message);
  }
}

// Export functions for use in other modules
module.exports = {
  sendEmailVerificationExample,
  verifyEmailExample,
  resendEmailVerificationExample,
  getEmailVerificationStatusExample,
  emailVerificationCompleteFlow,
  signUpWithEmailVerification,
  setupExpressRoutes,
  runEmailVerificationDemo
};

// Run demo if this file is executed directly
if (require.main === module) {
  runEmailVerificationDemo();
}