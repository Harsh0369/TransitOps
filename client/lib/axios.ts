import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('transitops_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('transitops_token');
        localStorage.removeItem('transitops_user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        // Show permission denied toast (will be handled by the caller)
        console.error('[API] Permission denied');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
