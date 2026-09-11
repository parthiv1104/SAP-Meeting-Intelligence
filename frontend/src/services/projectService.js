import { apiFetch } from './apiClient';
import { mockResolve } from './apiUtils';
import { projects as mockProjects } from '../data/mockData';

export const projectService = {
  list: async () => {
    try {
      return await apiFetch('/projects/');
    } catch (err) {
      console.warn('Backend unavailable, using mock projects:', err);
      return mockResolve(mockProjects);
    }
  },

  get: async (id) => {
    try {
      return await apiFetch(`/projects/${id}/`);
    } catch (err) {
      console.warn(`Backend unavailable, using mock project ${id}:`, err);
      return mockResolve(mockProjects.find((p) => p.id === id));
    }
  },

  create: (data) => apiFetch('/projects/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
