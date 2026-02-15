import api from './api';

export const exampleService = {
    getExamples: async () => {
        const response = await api.get('/content/examples');
        return response.data;
    },
    createExample: async (data: any) => {
        const response = await api.post('/content/examples', data);
        return response.data;
    },
    updateExample: async (id: string, data: any) => {
        const response = await api.put(`/content/examples/${id}`, data);
        return response.data;
    },
    deleteExample: async (id: string) => {
        await api.delete(`/content/examples/${id}`);
    }
};
