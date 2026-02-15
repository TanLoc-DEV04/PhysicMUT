import api from './api';

export const theoryService = {
    getTheories: async () => {
        const response = await api.get('/content/theories');
        return response.data;
    },
    createTheory: async (data: any) => {
        const response = await api.post('/content/theories', data);
        return response.data;
    },
    updateTheory: async (id: string, data: any) => {
        const response = await api.put(`/content/theories/${id}`, data);
        return response.data;
    },
    deleteTheory: async (id: string) => {
        await api.delete(`/content/theories/${id}`);
    }
};
