import api from './api';

export const theoryService = {
    getTheories: async (model_type_name?: string | null, theory_type_name?: string | null, search?: string) => {
        const params: any = {};
        if (model_type_name) params.model_type_name = model_type_name;
        if (theory_type_name) params.theory_type_name = theory_type_name;
        if (search) params.search = search;
        const response = await api.get('/content/theories', { params });
        return response.data;
    },
    getTheoryCategories: async () => {
        const response = await api.get('/content/theories/categories');
        return response.data;
    },
    getTheoryTypes: async () => {
        const response = await api.get('/content/theories/types');
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
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/content/theories/${id}/status`, { status });
        return response.data;
    }
};
