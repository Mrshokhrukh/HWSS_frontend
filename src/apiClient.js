// /src/apiClient.js
import axios from 'axios';
import endpoints from './api';

const apiClient = axios.create();

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response, 
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Unauthorized! Redirecting to login...");
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;