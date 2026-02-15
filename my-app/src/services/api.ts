import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- TYPES ---
export interface User {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    role?: {
        name: string;
        permissions: any;
    };
    role_id?: string;
    status?: boolean; // mapped from backend if exists or assumed
}

export interface AuthResponse {
    user: User;
    role: string;
    access_token: string;
}

export interface ContentItem {
    id: string;
    title?: string;
    name?: string; // for Model3D
    type: string;
    status: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

// --- SERVICES ---

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

export const contentService = {
    // Theories
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
    },

    // Models 3D
    getModels3D: async () => {
        const response = await api.get('/content/models3d');
        return response.data;
    },
    // Note: Model3D create/update needs FormData, not JSON. 
    // The component should pass a FormData object. 
    // Axios handles Content-Type: multipart/form-data automatically when data is FormData.
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
    },

    // Examples
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
    },

    // Exercises
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
    },
    
    // Chapters/Lessons (for Dropdowns)
    getChapters: async () => {
        const response = await api.get('/content/chapters');
        return response.data;
    }
};

export const userService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    getUserById: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    createUser: async (data: any) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    updateUser: async (id: string, data: any) => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: string) => {
        await api.delete(`/users/${id}`);
    },
    // Roles
    getRoles: async () => {
        const response = await api.get('/roles');
        return response.data;
    },
    getRoleById: async (id: string) => {
        const response = await api.get(`/roles/${id}`);
        return response.data;
    },
    createRole: async (data: any) => {
        const response = await api.post('/roles', data);
        return response.data;
    },
    updateRole: async (id: string, data: any) => {
        const response = await api.put(`/roles/${id}`, data);
        return response.data;
    },
    deleteRole: async (id: string) => {
        await api.delete(`/roles/${id}`);
    }
};

export default api;
