import { apiFetch } from './apiClient';

export const authService = {
  login: async (credentials) => {
    return apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiFetch('/auth/me/');
  },

  updateProfile: async (data) => {
    return apiFetch('/auth/me/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout/', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API notification warning:', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },
};
