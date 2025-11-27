import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Resolve base URL from environment variables; fall back to localhost for dev.
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL_DEPLOY ||
  'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// On module load, set Authorization if stored token exists (helps on page reloads in production)
const initialToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
if (initialToken) {
  apiClient.defaults.headers.common['Authorization'] = `Token ${initialToken}`;
}

// Ensure every request contains the latest auth token (if any)
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Token ${token}`;
  }
  return config;
});

// Global response handler — auto logout on 401 to keep UI consistent
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token missing/invalid — perform logout via the auth store so UI updates.
      try {
        useAuthStore.getState().logout();
      } catch (e) {
        // swallow errors here, still rethrow for callers
        // eslint-disable-next-line no-console
        console.warn('Failed to call logout after 401:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;