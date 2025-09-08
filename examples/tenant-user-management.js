/**
 * AppAtOnce Node.js SDK - Tenant User Management Complete Example
 * 
 * This example demonstrates complete tenant user management functionality
 * API key automatically determines the project/app context - no manual configuration needed!
 * 
 * Features demonstrated:
 * ✅ List all users in your tenant with pagination and filtering
 * ✅ Search users across multiple fields
 * ✅ Get detailed user information by ID
 * ✅ Get comprehensive user statistics and analytics
 * ✅ Admin operations: update, suspend, reactivate, delete users
 * ✅ User activity logs and audit trail
 * ✅ Multi-tenant isolation and security
 * 
 * IMPORTANT: Tenant User Management
 * ===================================
 * This functionality allows you to manage users within your specific
 * project/app context as determined by your API key. Each tenant is
 * completely isolated and you can only access users belonging to your
 * specific project/app.
 * 
 * Use Cases:
 * - Admin dashboards for user management
 * - Customer support tools
 * - User analytics and reporting
 * - Compliance and audit requirements
 * - User moderation and safety
 */

const { AppAtOnceClient } = require('appatonce');

// Initialize the client - API key automatically handles project/app context
const client = new AppAtOnceClient('your-api-key');

// =============================================================================
// TENANT USER MANAGEMENT EXAMPLES
// =============================================================================

/**
 * Example 1: Get Tenant User Statistics
 * Overview of all users in your tenant
 */
async function getTenantOverview() {
  try {
    console.log('📊 Getting tenant user overview...');
    
    const stats = await client.auth.getUserStats();
    
    console.log('✅ Tenant Overview:');
    console.log(`   📊 Total Users: ${stats.totalUsers}`);
    console.log(`   ✅ Active Users: ${stats.activeUsers}`);
    console.log(`   🚫 Suspended Users: ${stats.suspendedUsers}`);
    console.log(`   ✉️ Verified Users: ${stats.verifiedUsers}`);
    console.log(`   ⚠️ Unverified Users: ${stats.unverifiedUsers}`);
    console.log(`   📈 New This Month: ${stats.newUsersThisMonth}`);
    console.log(`   📈 New This Week: ${stats.newUsersThisWeek}`);
    
    // Calculate percentages
    const verificationRate = (stats.verifiedUsers / stats.totalUsers * 100).toFixed(1);
    const activityRate = (stats.activeUsers / stats.totalUsers * 100).toFixed(1);
    
    console.log('\n   📈 Key Metrics:');
    console.log(`   - Email Verification Rate: ${verificationRate}%`);
    console.log(`   - User Activity Rate: ${activityRate}%`);
    
    if (stats.lastSignupDate) {
      const daysSinceLastSignup = Math.floor((Date.now() - new Date(stats.lastSignupDate)) / (1000 * 60 * 60 * 24));
      console.log(`   - Days Since Last Signup: ${daysSinceLastSignup}`);
    }
    
    if (stats.userGrowthTrend && stats.userGrowthTrend.length > 0) {
      console.log('\n   📈 Growth Trend (Recent):');
      const recentTrend = stats.userGrowthTrend.slice(0, 5);
      recentTrend.forEach(dataPoint => {
        const dateStr = new Date(dataPoint.date).toISOString().split('T')[0];
        console.log(`     ${dateStr}: ${dataPoint.count} new users`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to get tenant overview:', error.message);
  }
}

/**
 * Example 2: List Users with Advanced Filtering
 * Demonstrate pagination, filtering, and sorting capabilities
 */
async function listUsersAdvanced() {
  try {
    console.log('👥 Listing users with advanced filtering...');
    
    // Example 1: Get recent users
    console.log('\n📅 Recent Users (Last 7 Days):');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await client.auth.listUsers({
      page: 1,
      limit: 10,
      createdAfter: sevenDaysAgo,
      sortField: 'created_at',
      sortDirection: 'desc',
    });
    
    console.log(`   Found ${recentUsers.users.length} recent users`);
    recentUsers.users.forEach(user => {
      const daysAgo = Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
      console.log(`   - ${user.email} (${daysAgo} days ago)`);
    });
    
    // Example 2: Get unverified users
    console.log('\n⚠️ Unverified Users:');
    const unverifiedUsers = await client.auth.listUsers({
      page: 1,
      limit: 10,
      verified: false,
      sortField: 'created_at',
      sortDirection: 'asc', // Oldest first
    });
    
    console.log(`   Found ${unverifiedUsers.users.length} unverified users`);
    unverifiedUsers.users.forEach(user => {
      const daysAgo = Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
      console.log(`   - ${user.email} (pending ${daysAgo} days)`);
    });
    
    // Example 3: Get users by status
    console.log('\n🟢 Active Users (Latest):');
    const activeUsers = await client.auth.listUsers({
      page: 1,
      limit: 5,
      status: 'active',
      sortField: 'updated_at',
      sortDirection: 'desc',
    });
    
    console.log(`   Found ${activeUsers.users.length} active users`);
    activeUsers.users.forEach(user => {
      console.log(`   - ${user.email} (${user.name || 'No name'})`);
    });
    
    // Pagination example
    console.log('\n📄 Pagination Info:');
    console.log(`   Current page: ${activeUsers.pagination.page}`);
    console.log(`   Total pages: ${activeUsers.pagination.totalPages}`);
    console.log(`   Total users: ${activeUsers.pagination.total}`);
    console.log(`   Has next page: ${activeUsers.pagination.hasNext}`);
    console.log(`   Has previous page: ${activeUsers.pagination.hasPrev}`);
    
  } catch (error) {
    console.error('❌ Failed to list users:', error.message);
  }
}

/**
 * Example 3: Search Users Effectively
 * Demonstrate different search strategies
 */
async function searchUsersDemo() {
  try {
    console.log('🔍 User Search Demonstration...');
    
    // Search by email domain
    console.log('\n📧 Search by Email Domain (.com):');
    const emailSearchResults = await client.auth.searchUsers('.com', {
      page: 1,
      limit: 5,
    });
    
    console.log(`   Found ${emailSearchResults.users.length} users with .com emails`);
    emailSearchResults.users.forEach(user => {
      console.log(`   - ${user.email}`);
    });
    
    // Search by name
    console.log('\n👤 Search by Name (John):');
    const nameSearchResults = await client.auth.searchUsers('John', {
      page: 1,
      limit: 5,
    });
    
    console.log(`   Found ${nameSearchResults.users.length} users named John`);
    nameSearchResults.users.forEach(user => {
      console.log(`   - ${user.name || 'No name'} (${user.email})`);
    });
    
    // Search with sorting
    console.log('\n📊 Search Results Sorted by Creation Date:');
    const sortedSearchResults = await client.auth.searchUsers('user', {
      page: 1,
      limit: 5,
      sortField: 'created_at',
      sortDirection: 'desc',
    });
    
    console.log(`   Found ${sortedSearchResults.users.length} users matching "user"`);
    sortedSearchResults.users.forEach(user => {
      const createdDate = new Date(user.created_at).toISOString().split('T')[0];
      console.log(`   - ${user.email} (created: ${createdDate})`);
    });
    
  } catch (error) {
    console.error('❌ Failed to search users:', error.message);
  }
}

/**
 * Example 4: User Profile Management
 * Demonstrate getting detailed user information
 */
async function userProfileDemo(userId = null) {
  try {
    // If no user ID provided, get one from the user list
    if (!userId) {
      console.log('🔍 Getting a user ID for demo...');
      const userList = await client.auth.listUsers({ limit: 1 });
      if (userList.users.length === 0) {
        console.log('   No users found in tenant for demo');
        return;
      }
      userId = userList.users[0].id;
      console.log(`   Using user ID: ${userId}`);
    }
    
    console.log('👤 User Profile Management Demo...');
    
    // Get detailed user information
    console.log('\n📋 User Details:');
    const user = await client.auth.getUserById(userId);
    
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'No name set'}`);
    console.log(`   Avatar: ${user.avatar || 'No avatar set'}`);
    console.log(`   Email Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Updated: ${user.updated_at}`);
    
    // Display metadata if available
    if (user.metadata && Object.keys(user.metadata).length > 0) {
      console.log('\n🏷️ User Metadata:');
      Object.entries(user.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    } else {
      console.log('\n🏷️ No custom metadata found');
    }
    
    // Get user activity logs
    console.log('\n📋 Recent Activity:');
    const activityResult = await client.auth.getUserActivityLogs(userId, {
      page: 1,
      limit: 3,
    });
    
    if (activityResult.logs.length > 0) {
      console.log(`   Last ${activityResult.logs.length} activities:`);
      activityResult.logs.forEach((log, i) => {
        const timeAgo = Date.now() - new Date(log.performedAt);
        let timeAgoStr;
        
        const days = Math.floor(timeAgo / (1000 * 60 * 60 * 24));
        const hours = Math.floor(timeAgo / (1000 * 60 * 60));
        const minutes = Math.floor(timeAgo / (1000 * 60));
        
        if (days > 0) {
          timeAgoStr = `${days} days ago`;
        } else if (hours > 0) {
          timeAgoStr = `${hours} hours ago`;
        } else {
          timeAgoStr = `${minutes} minutes ago`;
        }
        
        console.log(`   ${i + 1}. ${log.action} (${timeAgoStr})`);
        console.log(`      Performed by: ${log.performedBy}`);
        if (log.ipAddress) {
          console.log(`      IP: ${log.ipAddress}`);
        }
      });
      
      console.log(`\n   Total activity entries: ${activityResult.pagination.total}`);
    } else {
      console.log('   No activity logs found');
    }
    
  } catch (error) {
    console.error('❌ Failed to get user profile:', error.message);
  }
}

/**
 * Example 5: User Administration (DEMO ONLY - BE CAREFUL!)
 * Demonstrate admin operations - commented out for safety
 */
async function userAdministrationDemo(userId = null) {
  try {
    console.log('⚙️ User Administration Demo...');
    console.log('⚠️ IMPORTANT: These are admin operations that modify user accounts!');
    console.log('   In production, ensure proper authorization and logging.');
    console.log('');
    
    if (!userId) {
      console.log('❌ No user ID provided for admin demo');
      return;
    }
    
    // DEMO: Update user metadata (safe operation)
    console.log('📝 DEMO: Update user metadata...');
    try {
      const updatedUser = await client.auth.updateUser(userId, {
        metadata: {
          admin_note: 'Updated via Node.js SDK demo',
          last_admin_update: new Date().toISOString(),
          demo_flag: true,
        },
      });
      
      console.log('   ✅ User metadata updated successfully');
      console.log(`   User: ${updatedUser.email}`);
      console.log(`   Updated: ${updatedUser.updated_at}`);
      
    } catch (error) {
      console.log(`   ❌ Failed to update user metadata: ${error.message}`);
    }
    
    // DEMO: Admin operations (commented out for safety)
    console.log('\n🚫 Admin Operations Available (COMMENTED OUT FOR SAFETY):');
    console.log('   // Suspend user:');
    console.log('   // await client.auth.suspendUser(userId, "Policy violation");');
    console.log('');
    console.log('   // Reactivate user:');
    console.log('   // await client.auth.reactivateUser(userId);');
    console.log('');
    console.log('   // Soft delete user:');
    console.log('   // await client.auth.deleteUser(userId, false);');
    console.log('');
    console.log('   // Permanent delete user (DANGEROUS!):');
    console.log('   // await client.auth.deleteUser(userId, true);');
    
    console.log('\n🔒 Security Best Practices:');
    console.log('   1. Always verify admin permissions before operations');
    console.log('   2. Log all administrative actions');
    console.log('   3. Use soft delete by default');
    console.log('   4. Implement approval workflows for sensitive operations');
    console.log('   5. Regular audit of admin activities');
    console.log('   6. Role-based access control for different admin levels');
    
  } catch (error) {
    console.error('❌ Admin demo error:', error.message);
  }
}

/**
 * Example 6: Compliance and Reporting
 * Generate compliance reports and user analytics
 */
async function complianceReporting() {
  try {
    console.log('📊 Compliance and Reporting Demo...');
    
    // Get overall statistics
    const stats = await client.auth.getUserStats();
    
    // Generate compliance report
    console.log('\n📋 Compliance Report:');
    console.log(`   Report Generated: ${new Date()}`);
    console.log('   ═══════════════════════════════════════');
    
    console.log('\n📊 User Statistics:');
    console.log(`   Total Users: ${stats.totalUsers}`);
    console.log(`   Active Users: ${stats.activeUsers} (${(stats.activeUsers / stats.totalUsers * 100).toFixed(1)}%)`);
    console.log(`   Suspended Users: ${stats.suspendedUsers}`);
    console.log(`   Email Verified: ${stats.verifiedUsers} (${(stats.verifiedUsers / stats.totalUsers * 100).toFixed(1)}%)`);
    console.log(`   Email Unverified: ${stats.unverifiedUsers} (${(stats.unverifiedUsers / stats.totalUsers * 100).toFixed(1)}%)`);
    
    console.log('\n📈 Growth Metrics:');
    console.log(`   New Users This Week: ${stats.newUsersThisWeek}`);
    console.log(`   New Users This Month: ${stats.newUsersThisMonth}`);
    
    if (stats.lastSignupDate) {
      const daysSinceLastSignup = Math.floor((Date.now() - new Date(stats.lastSignupDate)) / (1000 * 60 * 60 * 24));
      console.log(`   Days Since Last Signup: ${daysSinceLastSignup}`);
    }
    
    // Check for potential compliance issues
    console.log('\n⚠️ Compliance Alerts:');
    
    let hasIssues = false;
    
    if (stats.unverifiedUsers > stats.verifiedUsers) {
      console.log('   🔴 HIGH: More unverified than verified users');
      hasIssues = true;
    }
    
    if (stats.suspendedUsers > stats.totalUsers * 0.05) { // More than 5% suspended
      console.log(`   🟡 MEDIUM: High suspension rate (${stats.suspendedUsers} users)`);
      hasIssues = true;
    }
    
    if (stats.newUsersThisWeek === 0) {
      console.log('   🟡 MEDIUM: No new users this week');
      hasIssues = true;
    }
    
    if (!hasIssues) {
      console.log('   ✅ No compliance issues detected');
    }
    
    console.log('\n📋 Recommended Actions:');
    if (stats.unverifiedUsers > 0) {
      console.log(`   1. Follow up with ${stats.unverifiedUsers} unverified users`);
    }
    if (stats.suspendedUsers > 0) {
      console.log(`   2. Review ${stats.suspendedUsers} suspended accounts`);
    }
    console.log('   3. Monitor user activity and engagement');
    console.log('   4. Regular security audits and user verification');
    
  } catch (error) {
    console.error('❌ Failed to generate compliance report:', error.message);
  }
}

/**
 * Example 7: Complete Tenant User Management Workflow
 * Demonstrate a complete user management workflow
 */
async function completeWorkflowDemo() {
  try {
    console.log('🌟 Complete Tenant User Management Workflow');
    console.log('═'.repeat(60));
    
    // Step 1: Get overview
    console.log('\n📊 Step 1: Tenant Overview');
    await getTenantOverview();
    
    // Step 2: Advanced user listing
    console.log('\n👥 Step 2: Advanced User Listing');
    await listUsersAdvanced();
    
    // Step 3: User search
    console.log('\n🔍 Step 3: User Search');
    await searchUsersDemo();
    
    // Step 4: User profile management
    console.log('\n👤 Step 4: User Profile Management');
    await userProfileDemo(); // Will auto-select a user
    
    // Step 5: Admin operations demo
    console.log('\n⚙️ Step 5: Administration Demo');
    await userAdministrationDemo(); // Demo only, no real changes
    
    // Step 6: Compliance reporting
    console.log('\n📊 Step 6: Compliance Reporting');
    await complianceReporting();
    
    console.log('\n✅ Complete Workflow Demo Finished!');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Integrate these patterns into your admin dashboard');
    console.log('   2. Set up monitoring and alerting for user metrics');
    console.log('   3. Implement role-based access control for admins');
    console.log('   4. Create automated compliance reporting');
    console.log('   5. Set up user engagement and retention workflows');
    
  } catch (error) {
    console.error('❌ Workflow demo error:', error.message);
  }
}

// =============================================================================
// MAIN DEMO FUNCTION
// =============================================================================

async function runTenantUserManagementDemo() {
  console.log('🚀 AppAtOnce Tenant User Management Demo\n');
  console.log('═'.repeat(60));
  
  try {
    // Run the complete workflow demo
    await completeWorkflowDemo();
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ Tenant User Management Demo completed successfully!');
    console.log('');
    console.log('📚 Key Features Demonstrated:');
    console.log('   • Complete user listing with pagination and filtering');
    console.log('   • Advanced search across multiple user fields');
    console.log('   • Detailed user profile management');
    console.log('   • Comprehensive user statistics and analytics');
    console.log('   • Admin operations (update, suspend, delete users)');
    console.log('   • User activity logs and audit trails');
    console.log('   • Compliance reporting and monitoring');
    console.log('   • Multi-tenant security and isolation');
    
  } catch (error) {
    console.error('\n❌ Demo error:', error.message);
  }
}

// =============================================================================
// RUN DEMO
// =============================================================================

(async () => {
  // Replace with your actual API key
  if (client.config.apiKey === 'your-api-key') {
    console.error('❌ Please set your API key first!');
    console.error('   Get your API key from: https://appatonce.com/dashboard');
    return;
  }
  
  await runTenantUserManagementDemo();
})();

module.exports = {
  getTenantOverview,
  listUsersAdvanced,
  searchUsersDemo,
  userProfileDemo,
  userAdministrationDemo,
  complianceReporting,
  completeWorkflowDemo,
  runTenantUserManagementDemo,
};