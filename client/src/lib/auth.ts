import { apiRequest } from './queryClient';
import { API_BASE_URL } from './config';

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'submitter' | 'viewer';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User }> => {
    const response = await apiRequest('POST', `${API_BASE_URL}/auth/login`, credentials);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest('POST', `${API_BASE_URL}/auth/logout`);
  },

  getCurrentUser: async (): Promise<{ user: User } | null> => {
    try {
      const response = await apiRequest('GET', `${API_BASE_URL}/auth/me`);
      return response.json();
    } catch (error) {
      return null;
    }
  }
};
