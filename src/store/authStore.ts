import { create } from 'zustand';
import apiClient from '../api/axios';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  error: string | null;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password:string) => Promise<boolean>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('authToken'),
  token: localStorage.getItem('authToken'),
  error: null,
  user: null, // We'll fetch this after login
  isLoading: false,
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ token: string }>('/login/', {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem('authToken', token);
      // Set the token for all future axios requests
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;

      // After setting the token, fetch the user details
      await useAuthStore.getState().fetchUser();

      // Now that user is fetched, update the rest of the state
      set({ isAuthenticated: true, token, isLoading: false });
      return true;
    } catch (err) {
      set({ error: 'Invalid username or password.', isLoading: false });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem('authToken');
    // Clear user from state
    delete apiClient.defaults.headers.common['Authorization'];
    set({ isAuthenticated: false, token: null, user: null });
  },
  fetchUser: async () => {
    try {
      const response = await apiClient.get<User>('/user/');
      set({ user: response.data });
    } catch (error) {
      console.error("Failed to fetch user details on load:", error);
      // If fetching user fails, it might be a stale token, so log out.
      useAuthStore.getState().logout();
    }
  }
}));