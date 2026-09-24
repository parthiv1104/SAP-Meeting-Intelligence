import { apiFetch } from './apiClient';

export const questionService = {
  list: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`/meetings/questions-library/${query ? `?${query}` : ''}`);
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.warn('Questions fetch error:', err);
      return [];
    }
  },

  missed: async (params = {}) => {
    return await questionService.list({ status: 'missed', ...params });
  },
};
