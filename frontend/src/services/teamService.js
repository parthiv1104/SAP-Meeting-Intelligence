import { apiFetch } from './apiClient';

export const teamService = {
  list: async () => {
    try {
      const data = await apiFetch('/auth/users/');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Failed to fetch users:', err);
      return [];
    }
  },
  get: async (id) => {
    const list = await teamService.list();
    return list.find((t) => String(t.id) === String(id)) || null;
  },
  create: async (userData) => {
    return apiFetch('/auth/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  updateRole: async (userId, role) => {
    return apiFetch(`/auth/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
  delete: async (userId) => {
    return apiFetch(`/auth/users/${userId}/`, {
      method: 'DELETE',
    });
  },
};

