import api from './api';

export const exerciseService = {
    getExercises: async () => {
        const response = await api.get('/content/exercises');
        return response.data;
    },
    createExercise: async (data: any) => {
        const response = await api.post('/content/exercises', data);
        return response.data;
    },
    updateExercise: async (id: string, data: any) => {
        const response = await api.put(`/content/exercises/${id}`, data);
        return response.data;
    },
    deleteExercise: async (id: string) => {
        await api.delete(`/content/exercises/${id}`);
    }
};
