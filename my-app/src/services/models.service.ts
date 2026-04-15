import api from './api.service';

export const model3DService = {
    getModels3D: async (model_type_name?: string | null, search?: string) => {
        const params: any = {};
        if (model_type_name) params.model_type_name = model_type_name;
        if (search) params.search = search;
        const response = await api.get('/content/models3d', { params });
        return response.data;
    },
    getModel3DTypes: async () => {
        const response = await api.get('/content/models3d/types');
        return response.data;
    },
    // Note: Model3D create/update needs FormData
    createModel3D: async (formData: FormData) => { 
        const response = await api.post('/content/models3d', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    updateModel3D: async (typeName: string, formData: FormData) => {
        const response = await api.put(`/content/models3d/${typeName}`, formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteModel3D: async (typeName: string) => {
        await api.delete(`/content/models3d/${typeName}`);
    },
    updateStatus: async (typeName: string, status: string) => {
        const response = await api.patch(`/content/models3d/${typeName}/status`, { status });
        return response.data;
    }
};
