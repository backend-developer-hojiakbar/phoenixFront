// src/services/apiService.ts

import axios from 'axios';

// Lokal server uchun manzil
const API_BASE_URL = 'http://127.0.0.1:8000'; // /api qismi olib tashlandi

const apiService = axios.create({
    baseURL: `${API_BASE_URL}/api`, // /api qismi bu yerga qo'shildi
    headers: {
        'Content-Type': 'application/json',
    },
});

// ... qolgan kod o'zgarishsiz qoladi
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
                    // Token yangilash uchun to'liq manzil ishlatiladi
                    const { data } = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    localStorage.setItem('accessToken', data.access);
                    apiService.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
                    return apiService(originalRequest);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
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

export const createFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value instanceof File) {
            formData.append(key, value);
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });
    return formData;
};

export default apiService;