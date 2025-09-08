#!/usr/bin/env node

/**
 * AppAtOnce Team Management Example
 * 
 * Demonstrates tenant-level team management (NOT platform-level)
 * This is for end-user collaboration within your app.
 * 
 * Features demonstrated:
 * ✅ Create and manage teams
 * ✅ Invite team members via email
 * ✅ Accept team invitations
 * ✅ Manage member roles (owner, admin, member)
 * ✅ Remove team members
 * ✅ List pending invitations
 * ✅ Email notifications for invitations
 * 
 * Usage:
 *   export APPATONCE_API_KEY=your_api_key
 *   node examples/team-management.js
 */

const { AppAtOnceClient } = require('../dist');

// Initialize client
const apiKey = process.env.APPATONCE_API_KEY || 'your-api-key-here';

if (apiKey === 'your-api-key-here') {
  console.error('❌ Please set your API key:');
  console.error('   export APPATONCE_API_KEY=your_actual_key');
  process.exit(1);
}

const client = AppAtOnceClient.create(apiKey);

// Demo data
const teamOwnerEmail = `owner-${Date.now()}@example.com`;
const teamMemberEmail = `member-${Date.now()}@example.com`;
const teamAdminEmail = `admin-${Date.now()}@example.com`;

/**
 * Demo: Complete team management workflow
 */
async function runTeamDemo() {
  console.log('🚀 AppAtOnce Team Management Demo\n');
  console.log('='.repeat(60));
  
  let teamOwner, teamMember, teamAdmin, team;
  
  try {
    // Step 1: Create users for the demo
    console.log('\n📝 Step 1: Creating demo users');
    console.log('-'.repeat(40));
    
    // Create team owner
    teamOwner = await client.auth.signUp({
      email: teamOwnerEmail,
      password: 'SecurePassword123!',
      name: 'Team Owner',
      metadata: { role: 'team_owner' }
    });
    console.log(`✅ Team owner created: ${teamOwner.user.email}`);
    
    // Create team member
    teamMember = await client.auth.signUp({
      email: teamMemberEmail,
      password: 'SecurePassword123!',
      name: 'Team Member',
      metadata: { role: 'team_member' }
    });
    console.log(`✅ Team member created: ${teamMember.user.email}`);
    
    // Create team admin
    teamAdmin = await client.auth.signUp({
      email: teamAdminEmail,
      password: 'SecurePassword123!',
      name: 'Team Admin',
      metadata: { role: 'team_admin' }
    });
    console.log(`✅ Team admin created: ${teamAdmin.user.email}`);
    
    // Step 2: Team owner creates a team
    console.log('\n🏗️ Step 2: Creating a team');
    console.log('-'.repeat(40));
    
    team = await client.teams.create({
      name: 'Marketing Team',
      description: 'Our awesome marketing team for product promotion',
      settings: {
        allowPublicJoin: false,
        defaultMemberRole: 'member',
        maxMembers: 50
      }
    });
    
    console.log(`✅ Team created: ${team.name}`);
    console.log(`   Team ID: ${team.id}`);
    console.log(`   Team slug: ${team.slug}`);
    console.log(`   Owner: ${teamOwner.user.email}`);
    
    // Step 3: List owner's teams
    console.log('\n📋 Step 3: Listing owner\'s teams');
    console.log('-'.repeat(40));
    
    const ownerTeams = await client.teams.list();
    console.log(`✅ Found ${ownerTeams.length} team(s)`);
    ownerTeams.forEach(t => {
      console.log(`   - ${t.name} (${t.role})`);
    });
    
    // Step 4: Invite members to the team
    console.log('\n📧 Step 4: Sending team invitations');
    console.log('-'.repeat(40));
    
    // Invite team member
    const memberInvite = await client.teams.invite(team.id, {
      email: teamMemberEmail,
      role: 'member',
      message: 'Welcome to our marketing team! We\'re excited to have you aboard.'
    });
    console.log(`✅ Invitation sent to ${teamMemberEmail}`);
    console.log(`   Invitation ID: ${memberInvite.id}`);
    console.log(`   Token: ${memberInvite.token.substring(0, 10)}...`);
    
    // Invite team admin
    const adminInvite = await client.teams.invite(team.id, {
      email: teamAdminEmail,
      role: 'admin',
      message: 'You\'ve been invited as an admin. Looking forward to working together!'
    });
    console.log(`✅ Invitation sent to ${teamAdminEmail}`);
    console.log(`   Role: ${adminInvite.role}`);
    
    // Step 5: List pending invitations
    console.log('\n📬 Step 5: Checking pending invitations');
    console.log('-'.repeat(40));
    
    const pendingInvites = await client.teams.listInvites(team.id);
    console.log(`✅ Found ${pendingInvites.length} pending invitation(s)`);
    pendingInvites.forEach(invite => {
      console.log(`   - ${invite.email} → ${invite.role} (expires: ${new Date(invite.expires_at).toLocaleString()})`);
    });
    
    // Step 6: Accept invitations (simulate users accepting)
    console.log('\n✉️ Step 6: Accepting team invitations');
    console.log('-'.repeat(40));
    
    // Switch to team member user
    await client.auth.signIn({
      email: teamMemberEmail,
      password: 'SecurePassword123!'
    });
    
    // Accept member invitation
    const acceptedTeamMember = await client.teams.acceptInvite(memberInvite.token);
    console.log(`✅ ${teamMemberEmail} joined team: ${acceptedTeamMember.name}`);
    
    // Switch to team admin user
    await client.auth.signIn({
      email: teamAdminEmail,
      password: 'SecurePassword123!'
    });
    
    // Accept admin invitation
    const acceptedTeamAdmin = await client.teams.acceptInvite(adminInvite.token);
    console.log(`✅ ${teamAdminEmail} joined team: ${acceptedTeamAdmin.name}`);
    
    // Step 7: Switch back to owner and list team members
    console.log('\n👥 Step 7: Reviewing team members');
    console.log('-'.repeat(40));
    
    // Switch back to team owner
    await client.auth.signIn({
      email: teamOwnerEmail,
      password: 'SecurePassword123!'
    });
    
    const teamMembers = await client.teams.listMembers(team.id);
    console.log(`✅ Team has ${teamMembers.length} member(s):`);
    teamMembers.forEach(member => {
      console.log(`   - ${member.email} (${member.name}) → ${member.role}`);
      console.log(`     Joined: ${new Date(member.joined_at).toLocaleDateString()}`);
    });
    
    // Step 8: Update member role
    console.log('\n🔄 Step 8: Updating member roles');
    console.log('-'.repeat(40));
    
    // Find the member user ID
    const memberUser = teamMembers.find(m => m.email === teamMemberEmail);
    
    // Promote member to admin
    const updatedMember = await client.teams.updateMemberRole(
      team.id,
      memberUser.id,
      'admin'
    );
    console.log(`✅ Promoted ${memberUser.email} to ${updatedMember.role}`);
    
    // Step 9: Get updated team details
    console.log('\n📊 Step 9: Team overview');
    console.log('-'.repeat(40));
    
    const teamDetails = await client.teams.get(team.id);
    console.log(`✅ Team: ${teamDetails.name}`);
    console.log(`   Description: ${teamDetails.description}`);
    console.log(`   Members: ${teamDetails.member_count}`);
    console.log(`   Your role: ${teamDetails.user_role}`);
    console.log(`   Created: ${new Date(teamDetails.created_at).toLocaleDateString()}`);
    
    // Step 10: Demonstrate member removal
    console.log('\n🚪 Step 10: Managing team departures');
    console.log('-'.repeat(40));
    
    // Find admin user to remove
    const updatedMembers = await client.teams.listMembers(team.id);
    const adminUser = updatedMembers.find(m => m.email === teamAdminEmail);
    
    // Remove admin from team
    const removeResult = await client.teams.removeMember(team.id, adminUser.id);
    console.log(`✅ ${adminUser.email} removed from team`);
    console.log(`   ${removeResult.message}`);
    
    // Final member count
    const finalMembers = await client.teams.listMembers(team.id);
    console.log(`✅ Team now has ${finalMembers.length} member(s)`);
    
    // Step 11: Cleanup demo
    console.log('\n🧹 Step 11: Cleanup');
    console.log('-'.repeat(40));
    
    // Note: In a real app, you might want to keep the team
    // For demo purposes, we'll delete it
    await client.teams.delete(team.id);
    console.log(`✅ Team "${team.name}" deleted`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Team management demo completed successfully!');
    console.log('\nKey features demonstrated:');
    console.log('  ✓ Team creation and management');
    console.log('  ✓ Email-based invitation system');
    console.log('  ✓ Role-based permissions (owner, admin, member)');
    console.log('  ✓ Member management and role updates');
    console.log('  ✓ Secure invitation tokens with expiration');
    console.log('  ✓ Email notifications (configured separately)');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    
    // Additional error context
    if (error.response?.data) {
      console.error('   Server response:', error.response.data);
    }
    
    // Cleanup on error
    if (team?.id) {
      try {
        await client.teams.delete(team.id);
        console.log('🧹 Cleaned up team after error');
      } catch (cleanupError) {
        console.error('   Cleanup failed:', cleanupError.message);
      }
    }
    
    process.exit(1);
  }
}

/**
 * Alternative demo: Real-world team management patterns
 */
async function realWorldPatterns() {
  console.log('\n📚 Real-world Team Management Patterns');
  console.log('='.repeat(60));
  
  try {
    // Pattern 1: Bulk invite with role assignment
    console.log('\n🎯 Pattern 1: Bulk team setup');
    
    const projectTeam = await client.teams.create({
      name: 'Project Alpha',
      description: 'Cross-functional project team'
    });
    
    // Invite multiple members with different roles
    const invitePromises = [
      client.teams.invite(projectTeam.id, {
        email: 'manager@company.com',
        role: 'admin',
        message: 'You\'re the project manager for Project Alpha'
      }),
      client.teams.invite(projectTeam.id, {
        email: 'developer@company.com',
        role: 'member',
        message: 'Welcome to the development team!'
      }),
      client.teams.invite(projectTeam.id, {
        email: 'designer@company.com',
        role: 'member',
        message: 'We need your design expertise!'
      })
    ];
    
    const invites = await Promise.all(invitePromises);
    console.log(`✅ Sent ${invites.length} invitations for bulk setup`);
    
    // Pattern 2: Team settings and customization
    console.log('\n⚙️ Pattern 2: Team customization');
    
    const customTeam = await client.teams.create({
      name: 'Design System Team',
      description: 'Maintaining our design system and components',
      settings: {
        allowPublicJoin: false,
        requireApproval: true,
        defaultMemberRole: 'member',
        maxMembers: 15,
        features: {
          fileSharing: true,
          realTimeChat: true,
          taskManagement: true
        },
        notifications: {
          newMembers: true,
          roleChanges: true,
          teamUpdates: true
        }
      }
    });
    
    console.log(`✅ Created customized team: ${customTeam.name}`);
    console.log(`   Max members: ${customTeam.settings.maxMembers}`);
    console.log(`   Features enabled: ${Object.keys(customTeam.settings.features).length}`);
    
    // Pattern 3: Team hierarchy simulation
    console.log('\n🏢 Pattern 3: Organizational structure');
    
    // Parent team
    const engineeringTeam = await client.teams.create({
      name: 'Engineering',
      description: 'Engineering department'
    });
    
    // Sub-teams (simulated through naming and settings)
    const frontendTeam = await client.teams.create({
      name: 'Engineering - Frontend',
      description: 'Frontend development team',
      settings: {
        parentTeamId: engineeringTeam.id, // Custom field for your app logic
        department: 'Engineering',
        specialty: 'Frontend'
      }
    });
    
    const backendTeam = await client.teams.create({
      name: 'Engineering - Backend',
      description: 'Backend development team',
      settings: {
        parentTeamId: engineeringTeam.id,
        department: 'Engineering',
        specialty: 'Backend'
      }
    });
    
    console.log(`✅ Created organizational structure:`);
    console.log(`   ${engineeringTeam.name} (parent)`);
    console.log(`   ├── ${frontendTeam.name}`);
    console.log(`   └── ${backendTeam.name}`);
    
    // Cleanup patterns demo
    const patternTeams = [projectTeam, customTeam, engineeringTeam, frontendTeam, backendTeam];
    for (const team of patternTeams) {
      await client.teams.delete(team.id);
    }
    console.log(`\n🧹 Cleaned up ${patternTeams.length} pattern demo teams`);
    
  } catch (error) {
    console.error('❌ Pattern demo failed:', error.message);
  }
}

/**
 * Error handling patterns
 */
async function errorHandlingPatterns() {
  console.log('\n🚨 Error Handling Patterns');
  console.log('='.repeat(60));
  
  try {
    // Create a test team
    const testTeam = await client.teams.create({
      name: 'Error Test Team'
    });
    
    // Pattern 1: Duplicate invitation handling
    console.log('\n🔄 Pattern 1: Duplicate invitation handling');
    try {
      await client.teams.invite(testTeam.id, {
        email: 'test@example.com',
        role: 'member'
      });
      
      // Try to invite the same email again
      await client.teams.invite(testTeam.id, {
        email: 'test@example.com',
        role: 'admin'
      });
    } catch (error) {
      console.log('✅ Correctly caught duplicate invitation error');
      console.log(`   Error: ${error.message}`);
    }
    
    // Pattern 2: Permission errors
    console.log('\n🔒 Pattern 2: Permission validation');
    
    // Create another user
    const regularUser = await client.auth.signUp({
      email: `regular-${Date.now()}@example.com`,
      password: 'SecurePassword123!',
      name: 'Regular User'
    });
    
    // Switch to regular user (not team member)
    await client.auth.signIn({
      email: regularUser.user.email,
      password: 'SecurePassword123!'
    });
    
    try {
      // Try to invite someone to a team they're not part of
      await client.teams.invite(testTeam.id, {
        email: 'someone@example.com',
        role: 'member'
      });
    } catch (error) {
      console.log('✅ Correctly caught permission error');
      console.log(`   Error: ${error.message}`);
    }
    
    // Cleanup
    await client.teams.delete(testTeam.id);
    console.log('🧹 Cleaned up error test team');
    
  } catch (error) {
    console.error('❌ Error pattern demo failed:', error.message);
  }
}

// Run the complete demo
async function main() {
  await runTeamDemo();
  await realWorldPatterns();
  await errorHandlingPatterns();
  
  console.log('\n🎉 All team management demos completed!');
  console.log('\nNext steps:');
  console.log('  1. Set up email templates for team invitations');
  console.log('  2. Customize team settings for your use case');
  console.log('  3. Implement team-based permissions in your app');
  console.log('  4. Add team analytics and member activity tracking');
  console.log('  5. Consider team-based data isolation with RLS policies');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Demo interrupted by user');
  process.exit(0);
});

// Run the demo
main().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});