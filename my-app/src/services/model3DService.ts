import api from './api';

export const model3DService = {
    getModels3D: async () => {
        const response = await api.get('/content/models3d');
        return response.data;
    },
    // Note: Model3D create/update needs FormData
    createModel3D: async (formData: FormData) => { 
        const response = await api.post('/content/models3d', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    updateModel3D: async (id: string, formData: FormData) => {
        const response = await api.put(`/content/models3d/${id}`, formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteModel3D: async (id: string) => {
        await api.delete(`/content/models3d/${id}`);
    }
};
