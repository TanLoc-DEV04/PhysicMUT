import axios from 'axios';

export interface User {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    role: string | { name: string };
    [key: string]: any;
}

export interface AuthResponse {
    access_token: string;
    token_type?: string;
    user: User;
}

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
