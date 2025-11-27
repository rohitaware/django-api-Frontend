import axios from 'axios';

// Resolve base URL from environment variables (build-time). Prefer explicit production vars first.
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

// On page load, if a token exists in localStorage ensure it's used for requests (helps reloads)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('authToken');
  if (stored) apiClient.defaults.headers.common['Authorization'] = `Token ${stored}`;
}

// Attach latest token for each request (in case auth changed during runtime)
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

// On 401 (unauthorized) automatically clear token and reload so app returns to login state
apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('authToken');
      } catch (e) {}
      // reload the page so auth store resets to unauthenticated and user lands on login
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;