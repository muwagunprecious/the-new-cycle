import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'An unexpected error occurred';
        console.error('[API Error]', message);
        return Promise.reject(error);
    }
);

export default api;
