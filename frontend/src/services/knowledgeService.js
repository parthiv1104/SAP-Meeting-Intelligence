import { apiFetch } from './apiClient';

export const knowledgeService = {
  list: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiFetch(`/meetings/knowledge-library/${query ? `?${query}` : ''}`);
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.warn('Knowledge items fetch error:', err);
      return [];
    }
  },

  timeline: async () => {
    const list = await knowledgeService.list();
    return list.map((item, idx) => ({
      id: item.id || `tl-${idx}`,
      date: item.lastUpdated || item.date || 'Recent',
      title: item.title,
      description: item.content,
      type: item.category || 'Architecture',
      author: item.verifiedBy || 'Project Consultant',
      status: item.status || 'Confirmed'
    }));
  },
};
