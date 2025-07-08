import axios from 'axios';
import { User } from '../types';

// O'zgarmas manzil shu yerda belgilanadi
const API_BASE_URL = 'https://phoenixapi.pythonanywhere.com/api';

const apiService = axios.create({
    baseURL: API_BASE_URL, // O'zgarmas manzil ishlatildi
    headers: {
        'Content-Type': 'application/json',
    },
});

apiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiService.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Token yangilash uchun ham o'zgarmas manzil ishlatildi
                    const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('accessToken', data.access);
                    apiService.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
                    return apiService(originalRequest);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    // Logout user
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login'; 
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);


export default apiService;

// Helper function for file uploads
export const createFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value instanceof File) {
            formData.append(key, value);
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value)); // Ensure value is a string
        }
    });
    return formData;
};