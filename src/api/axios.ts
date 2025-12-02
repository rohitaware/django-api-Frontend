import axios from 'axios';


const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL_DEPLOY ||
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});


if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('authToken');
  if (stored) apiClient.defaults.headers.common['Authorization'] = `Token ${stored}`;
}


apiClient.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)['Authorization'] = `Token ${token}`;
    }
  } catch (e) {
    // ignore storage errors
  }
  return config;
});


apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('authToken');
      } catch (e) {}
      
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;