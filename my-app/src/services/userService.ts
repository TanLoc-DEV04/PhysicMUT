import api from './api';

export const userService = {
    getUsers: async () => {
        const response = await api.get('/users');
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
    }
};
