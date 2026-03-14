import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor — attach auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Future: attach bearer token from auth store
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 / 403 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // Future: trigger logout from Zustand auth store
      // e.g. useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
