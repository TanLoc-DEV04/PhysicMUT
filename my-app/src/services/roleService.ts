import api from './api';

export const roleService = {
    getRoles: async () => {
        const response = await api.get('/roles');
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
    deleteRole: async (id: string) => {
        await api.delete(`/roles/${id}`);
    }
};
