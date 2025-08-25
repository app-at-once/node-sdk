import { HttpClient } from '../core/http-client';

export interface Team {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  settings?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Added when listing user's teams
  role?: string;
  joined_at?: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: 'admin' | 'member';
  token: string;
  message?: string;
  status: 'pending' | 'accepted' | 'cancelled' | 'expired';
  expires_at: string;
  invited_by: string;
  created_at: string;
  inviter_name?: string;
}

/**
 * Team Module - Manages tenant-level teams/teams
 * 
 * This is for end-user collaboration within your app, NOT platform-level teams.
 * Users can create teams, invite members, and manage permissions.
 * 
 * Example usage:
 * ```javascript
 * // Create a team
 * const team = await client.teams.create({
 *   name: 'Marketing Team',
 *   description: 'Team for marketing collaboration'
 * });
 * 
 * // Invite a team member
 * await client.teams.invite(team.id, {
 *   email: 'colleague@company.com',
 *   role: 'member',
 *   message: 'Join our marketing team!'
 * });
 * 
 * // List team members
 * const members = await client.teams.listMembers(team.id);
 * ```
 */
export class TeamsModule {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List all teams the current user belongs to
   */
  async list(): Promise<Team[]> {
    const response = await this.httpClient.get('/auth/teams');
    return response.data;
  }

  /**
   * Create a new team
   */
  async create(data: {
    name: string;
    description?: string;
    settings?: any;
  }): Promise<Team> {
    const response = await this.httpClient.post('/auth/teams', data);
    return response.data;
  }

  /**
   * Get team details
   */
  async get(teamId: string): Promise<Team> {
    const response = await this.httpClient.get(`/auth/teams/${teamId}`);
    return response.data;
  }

  /**
   * Update team details
   * Only team owner can update
   */
  async update(
    teamId: string,
    data: {
      name?: string;
      description?: string;
      settings?: any;
    }
  ): Promise<Team> {
    const response = await this.httpClient.put(`/auth/teams/${teamId}`, data);
    return response.data;
  }

  /**
   * Delete a team
   * Only team owner can delete
   */
  async delete(teamId: string): Promise<void> {
    await this.httpClient.delete(`/auth/teams/${teamId}`);
  }

  /**
   * List team members
   */
  async listMembers(teamId: string): Promise<TeamMember[]> {
    const response = await this.httpClient.get(`/auth/teams/${teamId}/members`);
    return response.data;
  }

  /**
   * Invite a user to team
   * Only team owner/admin can invite
   */
  async invite(
    teamId: string,
    data: {
      email: string;
      role?: 'admin' | 'member';
      message?: string;
    }
  ): Promise<TeamInvite> {
    const response = await this.httpClient.post(
      `/auth/teams/${teamId}/invite`,
      data
    );
    return response.data;
  }

  /**
   * Accept a team invitation
   * User must be authenticated and email must match invitation
   */
  async acceptInvite(token: string): Promise<Team> {
    const response = await this.httpClient.post('/auth/teams/accept-invite', {
      token,
    });
    return response.data;
  }

  /**
   * Update a member's role
   * Only team owner can change roles
   */
  async updateMemberRole(
    teamId: string,
    memberId: string,
    role: 'admin' | 'member'
  ): Promise<TeamMember> {
    const response = await this.httpClient.put(
      `/auth/teams/${teamId}/members/${memberId}`,
      { role }
    );
    return response.data;
  }

  /**
   * Remove a member from team
   * Members can remove themselves, admins/owners can remove others
   */
  async removeMember(
    teamId: string,
    memberId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.httpClient.delete(
      `/auth/teams/${teamId}/members/${memberId}`
    );
    return response.data;
  }

  /**
   * Leave a team
   * Convenience method for removing yourself
   */
  async leave(teamId: string): Promise<{ success: boolean; message: string }> {
    // Server will use the authenticated user's ID
    const response = await this.httpClient.delete(
      `/auth/teams/${teamId}/members/me`
    );
    return response.data;
  }

  /**
   * List pending invitations for a team
   * Only team owner/admin can view
   */
  async listInvites(teamId: string): Promise<TeamInvite[]> {
    const response = await this.httpClient.get(`/auth/teams/${teamId}/invites`);
    return response.data;
  }

  /**
   * Cancel a pending invitation
   * Only team owner/admin can cancel
   */
  async cancelInvite(
    teamId: string,
    inviteId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.httpClient.delete(
      `/auth/teams/${teamId}/invites/${inviteId}`
    );
    return response.data;
  }

  /**
   * Get team invitation details by token
   * Useful for displaying invitation details before accepting
   */
  async getInviteDetails(token: string): Promise<{
    team: Team;
    role: string;
    inviter: { name?: string; email: string };
    expires_at: string;
  }> {
    const response = await this.httpClient.get('/auth/teams/invites/details', {
      params: { token },
    });
    return response.data;
  }

  /**
   * Transfer team ownership
   * Only current owner can transfer ownership
   */
  async transferOwnership(
    teamId: string,
    newOwnerId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.httpClient.post(
      `/auth/teams/${teamId}/transfer-ownership`,
      { new_owner_id: newOwnerId }
    );
    return response.data;
  }
}