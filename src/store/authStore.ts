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
  user: null, 
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
    
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;

      
      await useAuthStore.getState().fetchUser();

      
      set({ isAuthenticated: true, token, isLoading: false });
      return true;
    } catch (err) {
      set({ error: 'Invalid username or password.', isLoading: false });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem('authToken');
   
    delete apiClient.defaults.headers.common['Authorization'];
    set({ isAuthenticated: false, token: null, user: null });
  },
  fetchUser: async () => {
    try {
      const response = await apiClient.get<User>('/user/');
      set({ user: response.data });
    } catch (error) {
      console.error("Failed to fetch user details on load:", error);
     
      useAuthStore.getState().logout();
    }
  }
}));