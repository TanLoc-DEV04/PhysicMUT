import api from './api';
import type { AuthResponse } from './api';

export const authService = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },
    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    changePassword: async (data: any) => {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    }
};
