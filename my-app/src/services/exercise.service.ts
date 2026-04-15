import api from './api.service';

export const exerciseService = {
    getExercises: async (model_type_name?: string | null, exercise_type_name?: string | null, type?: string | null, search?: string) => {
        const params: any = {};
        if (model_type_name) params.model_type_name = model_type_name;
        if (exercise_type_name) params.exercise_type_name = exercise_type_name;
        if (type) params.type = type;
        if (search) params.search = search;
        const response = await api.get('/content/exercises', { params });
        return response.data;
    },
    getExerciseCategories: async () => {
        const response = await api.get('/content/exercises/categories');
        return response.data;
    },
    getExerciseTypes: async () => {
        const response = await api.get('/content/exercises/types');
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
    },
    updateStatus: async (id: string, status: string) => {
        const response = await api.patch(`/content/exercises/${id}/status`, { status });
        return response.data;
    }
};
