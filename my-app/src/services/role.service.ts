import api from './api.service';

export const roleService = {
    getRoles: async () => {
        const response = await api.get('/roles');
        return response.data;
    },
    // Returns only active admin-level roles (for Add Admin dropdown)
    getAdminRoles: async () => {
        const response = await api.get('/roles/admin-roles');
        return response.data;
    },
    getRoleById: async (id: string) => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },
    createRole: async (data: any) => {
        const response = await api.post('/roles', data);
        return response.data;
    },
    updateRole: async (id: string, data: any) => {
        const response = await api.put(`/roles/${id}`, data);
        return response.data;
    },
    toggleRoleStatus: async (id: string, is_active: boolean) => {
        const response = await api.patch(`/roles/${id}/status`, { is_active });
        return response.data;
    },
    deleteRole: async (id: string) => {
        await api.delete(`/roles/${id}`);
    }
};
