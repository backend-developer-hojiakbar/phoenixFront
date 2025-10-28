import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const apiService = axios.create({
    baseURL: `${API_BASE_URL}/api`,
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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
                        refresh: refreshToken,
                    });
                    
                    localStorage.setItem('accessToken', data.access);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${data.access}`;
                    
                    return apiService(originalRequest);
                } catch (refreshError) {
                    console.error('Token refresh failed, logging out:', refreshError);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/#/login'; 
                    return Promise.reject(refreshError);
                }
            } else {
                console.log('No refresh token, redirecting to login');
                window.location.href = '/#/login';
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