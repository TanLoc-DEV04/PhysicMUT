import api from './api.service';

export const userService = {
    getUsers: async (params?: { roleId?: string; search?: string }) => {
        const response = await api.get('/users', { params });
        return response.data;
    },
    getUserById: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    createUser: async (data: any) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    updateUser: async (id: string, data: any) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: string) => {
        await api.delete(`/users/${id}`);
    },
    updateUserStatus: async (id: string, is_active: boolean) => {
        const response = await api.patch(`/users/${id}/status`, { is_active });
        return response.data;
    }
};
