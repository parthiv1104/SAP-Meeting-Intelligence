import { apiFetch } from './apiClient';

export const projectService = {
  list: async () => {
    const data = await apiFetch('/projects/');
    return Array.isArray(data) ? data : [];
  },

  get: async (id) => {
    return await apiFetch(`/projects/${id}/`);
  },

  create: (data) => apiFetch('/projects/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
