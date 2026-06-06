import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_backend_url || 'http://localhost:5000',
  // Longer timeout to account for Render free-tier cold starts (can take ~30s)
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling + retry on network/server errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx responses (e.g. Render cold start)
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500;

    if ((isNetworkError || isServerError) && !config._retryCount) {
      config._retryCount = 0;
    }

    const MAX_RETRIES = 3;
    if ((isNetworkError || isServerError) && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      const delay = config._retryCount * 3000; // 3s, 6s, 9s
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;