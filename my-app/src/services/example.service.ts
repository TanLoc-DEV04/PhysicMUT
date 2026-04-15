import api from './api.service';

export const exampleService = {
    getExamples: async (model_type_name?: string | null, example_type_name?: string | null, search?: string) => {
        const params: any = {};
        if (model_type_name) params.model_type_name = model_type_name;
        if (example_type_name) params.example_type_name = example_type_name;
        if (search) params.search = search;
        const response = await api.get('/content/examples', { params });
        return response.data;
    },
    getExampleCategories: async () => {
        const response = await api.get('/content/examples/categories');
        return response.data;
    },
    getExampleTypes: async () => {
        const response = await api.get('/content/examples/types');
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
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/content/examples/${id}/status`, { status });
        return response.data;
    }
};
