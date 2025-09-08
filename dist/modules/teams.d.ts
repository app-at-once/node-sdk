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
    role?: string;
    joined_at?: string;
    member_count?: number;
}
export interface TeamMember {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role: string;
    joined_at: string;
}
export interface TeamInvite {
    id: string;
    team_id: string;
    email: string;
    role: string;
    token: string;
    message?: string;
    status: 'pending' | 'accepted' | 'cancelled' | 'expired';
    expires_at: string;
    invited_by: string;
    created_at: string;
    inviter_name?: string;
}
export interface CustomRole {
    name: string;
    displayName: string;
    description?: string;
    permissions: RolePermission[];
    hierarchy: number;
    isBuiltIn: boolean;
    isActive: boolean;
}
export interface RolePermission {
    action: string;
    resource?: string;
    condition?: any;
}
export declare class TeamsModule {
    private httpClient;
    constructor(httpClient: HttpClient);
    list(): Promise<Team[]>;
    create(data: {
        name: string;
        description?: string;
        settings?: any;
    }): Promise<Team>;
    get(teamId: string): Promise<Team>;
    update(teamId: string, data: {
        name?: string;
        description?: string;
        settings?: any;
    }): Promise<Team>;
    delete(teamId: string): Promise<void>;
    listMembers(teamId: string): Promise<TeamMember[]>;
    invite(teamId: string, data: {
        email: string;
        role?: string;
        message?: string;
    }): Promise<TeamInvite>;
    acceptInvite(token: string): Promise<Team>;
    updateMemberRole(teamId: string, memberId: string, role: string): Promise<TeamMember>;
    removeMember(teamId: string, memberId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    leave(teamId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listInvites(teamId: string): Promise<TeamInvite[]>;
    cancelInvite(teamId: string, inviteId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getInviteDetails(token: string): Promise<{
        team: Team;
        role: string;
        inviter: {
            name?: string;
            email: string;
        };
        expires_at: string;
    }>;
    transferOwnership(teamId: string, newOwnerId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAvailableRoles(): Promise<CustomRole[]>;
    createCustomRole(data: {
        name: string;
        displayName: string;
        description?: string;
        permissions: RolePermission[];
        hierarchy: number;
    }): Promise<CustomRole>;
    updateCustomRole(roleName: string, data: {
        displayName?: string;
        description?: string;
        permissions?: RolePermission[];
        hierarchy?: number;
        isActive?: boolean;
    }): Promise<CustomRole>;
    deleteCustomRole(roleName: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getRoleDetails(roleName: string): Promise<CustomRole>;
    checkPermission(data: {
        teamId: string;
        action: string;
        resource?: string;
        context?: any;
    }): Promise<{
        hasPermission: boolean;
        message?: string;
    }>;
}
