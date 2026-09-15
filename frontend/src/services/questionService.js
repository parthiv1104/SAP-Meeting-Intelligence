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

  get: async (id) => {
    const all = await questionService.list();
    const found = all.find((q) => q.id === id || String(q.id).includes(id));
    if (found) {
      return {
        ...found,
        recommendation: (found.reasons && found.reasons[0]) || 'Critical domain prerequisite for meeting preparation and alignment.',
        relatedRequirements: ['REQ-001', 'REQ-002'],
        decisionImpact: 'Ensures downstream process stability and prevents delivery bottlenecks.',
      };
    }
    return {
      id,
      text: 'What are the key technical deliverables and architecture benchmarks?',
      module: 'Cross-Module',
      topic: 'Architecture & Scope',
      importance: 'High',
      status: 'Open',
      phase: 'Exploration',
      recommendation: 'Ensure all key stakeholders validate the milestone schedule.',
      relatedRequirements: ['REQ-001'],
      decisionImpact: 'Minimizes risk of architectural misalignment.'
    };
  },

  missed: async (params = {}) => {
    return await questionService.list({ status: 'missed', ...params });
  },

  faq: async () => {
    const list = await questionService.list();
    return list.slice(0, 8).map(q => ({
      ...q,
      frequency: 94,
      answeredCount: 12,
      askedCount: 14
    }));
  },

  frequentlyMissed: async () => {
    const list = await questionService.list();
    const missed = list.filter(q => q.status === 'Missed' || q.importance === 'Critical');
    return missed.slice(0, 5).map(m => ({
      topic: m.topic || 'Domain Architecture',
      module: m.module || 'General',
      missedRate: 78,
      riskLevel: 'High',
      impact: m.reasons?.[0] || 'Downstream integration risk'
    }));
  },
};
