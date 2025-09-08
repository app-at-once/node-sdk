"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsModule = void 0;
class TeamsModule {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async list() {
        const response = await this.httpClient.get('/projects/auth/teams/user');
        return response.data;
    }
    async create(data) {
        const response = await this.httpClient.post('/projects/auth/teams', data);
        return response.data;
    }
    async get(teamId) {
        const response = await this.httpClient.get(`/projects/auth/teams/${teamId}`);
        return response.data;
    }
    async update(teamId, data) {
        const response = await this.httpClient.put(`/projects/auth/teams/${teamId}`, data);
        return response.data;
    }
    async delete(teamId) {
        await this.httpClient.delete(`/projects/auth/teams/${teamId}`);
    }
    async listMembers(teamId) {
        const response = await this.httpClient.get(`/projects/auth/teams/${teamId}/members`);
        return response.data;
    }
    async invite(teamId, data) {
        const response = await this.httpClient.post(`/projects/auth/teams/${teamId}/invite`, data);
        return response.data;
    }
    async acceptInvite(token) {
        const response = await this.httpClient.post('/projects/auth/teams/accept-invite', {
            token,
        });
        return response.data;
    }
    async updateMemberRole(teamId, memberId, role) {
        const response = await this.httpClient.put(`/projects/auth/teams/${teamId}/members/${memberId}`, { role });
        return response.data;
    }
    async removeMember(teamId, memberId) {
        const response = await this.httpClient.delete(`/projects/auth/teams/${teamId}/members/${memberId}`);
        return response.data;
    }
    async leave(teamId) {
        const response = await this.httpClient.delete(`/projects/auth/teams/${teamId}/members/me`);
        return response.data;
    }
    async listInvites(teamId) {
        const response = await this.httpClient.get(`/projects/auth/teams/${teamId}/invites`);
        return response.data;
    }
    async cancelInvite(teamId, inviteId) {
        const response = await this.httpClient.delete(`/projects/auth/teams/${teamId}/invites/${inviteId}`);
        return response.data;
    }
    async getInviteDetails(token) {
        const response = await this.httpClient.get('/projects/auth/teams/invites/details', {
            params: { token },
        });
        return response.data;
    }
    async transferOwnership(teamId, newOwnerId) {
        const response = await this.httpClient.post(`/projects/auth/teams/${teamId}/transfer-ownership`, { new_owner_id: newOwnerId });
        return response.data;
    }
    async getAvailableRoles() {
        const response = await this.httpClient.get('/projects/auth/roles');
        return response.data;
    }
    async createCustomRole(data) {
        const response = await this.httpClient.post('/projects/auth/roles', data);
        return response.data;
    }
    async updateCustomRole(roleName, data) {
        const response = await this.httpClient.put(`/projects/auth/roles/${roleName}`, data);
        return response.data;
    }
    async deleteCustomRole(roleName) {
        const response = await this.httpClient.delete(`/projects/auth/roles/${roleName}`);
        return response.data;
    }
    async getRoleDetails(roleName) {
        const response = await this.httpClient.get(`/projects/auth/roles/${roleName}`);
        return response.data;
    }
    async checkPermission(data) {
        const response = await this.httpClient.post('/projects/auth/roles/check-permission', data);
        return response.data;
    }
}
exports.TeamsModule = TeamsModule;
//# sourceMappingURL=teams.js.map