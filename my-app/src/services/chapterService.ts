import api from './api';

export const chapterService = {
    getChapters: async () => {
        const response = await api.get('/content/chapters');
        return response.data;
    }
};
