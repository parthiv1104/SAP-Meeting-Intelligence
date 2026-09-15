import { apiFetch } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const meetingService = {
  // Fetch list of meetings with optional filters
  list: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await apiFetch(`/meetings/${query ? `?${query}` : ''}`);
    return Array.isArray(data) ? data : [];
  },

  // Fetch live MS Teams meetings from Graph API
  getLiveTeams: async (email) => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : '';
      return await apiFetch(`/meetings/live-teams/${query}`);
    } catch (err) {
      console.warn('Live Teams sync error:', err);
      return { connected: false, meetings: [] };
    }
  },

  // Fetch single meeting by ID
  get: async (id) => {
    return await apiFetch(`/meetings/${encodeURIComponent(id)}/`);
  },

  // Get AI Preparation & Generated Questions for a meeting (Pathway 3)
  getPreparation: async (id, options = {}) => {
    const query = new URLSearchParams(options).toString();
    return await apiFetch(`/meetings/${encodeURIComponent(id)}/preparation/${query ? `?${query}` : ''}`);
  },

  // Force regenerate AI questions with OpenAI
  regeneratePreparation: async (id, data = {}) => {
    const res = await apiFetch(`/meetings/${encodeURIComponent(id)}/preparation/`, {
      method: 'POST',
      body: JSON.stringify({ regenerate: true, ...data }),
    });
    return res;
  },

  // Get Live Interactive Meeting State (Pathway 1 / Interactive workspace)
  getLiveState: async (id) => {
    try {
      const prep = await apiFetch(`/meetings/${encodeURIComponent(id)}/preparation/`);
      const queue = (prep?.recommendedQuestions || []).map((q, idx) => ({
        id: q.id || `q-${idx}`,
        question: q.question,
        topic: q.topic || 'Core Scope',
        priority: q.priority || 'Critical',
        confidence: q.confidence || 94,
        reason: (q.reasons && q.reasons[0]) || 'Identified as key requirement checkpoint',
      }));

      return {
        meetingId: id,
        meetingName: prep?.meetingName || 'Live Session',
        currentTopic: (prep?.topics && prep.topics[0]) || 'Requirements & Architecture',
        status: 'In Progress',
        coverage: 40,
        questionsAsked: 2,
        questionsAnswered: 2,
        questionsOpen: queue.length,
        queue: queue.length > 0 ? queue : [
          {
            id: 'q-live-1',
            question: 'What are the target architecture benchmarks and delivery milestones?',
            topic: 'Architecture & Scope',
            priority: 'Critical',
            confidence: 95,
            reason: 'Essential prerequisite for baseline alignment',
          }
        ]
      };
    } catch (err) {
      return {
        meetingId: id,
        meetingName: 'Live Session',
        currentTopic: 'Requirements & Scope',
        status: 'In Progress',
        coverage: 20,
        questionsAsked: 0,
        questionsAnswered: 0,
        questionsOpen: 5,
        queue: []
      };
    }
  },

  // Get Post-Meeting Intelligence & Analysis (Pathway 4)
  getAnalysis: async (id, options = {}) => {
    const query = new URLSearchParams(options).toString();
    return await apiFetch(`/meetings/${encodeURIComponent(id)}/analysis/${query ? `?${query}` : ''}`);
  },

  // Force regenerate AI post-meeting analysis with OpenAI
  regenerateAnalysis: async (id, data = {}) => {
    const res = await apiFetch(`/meetings/${encodeURIComponent(id)}/analysis/`, {
      method: 'POST',
      body: JSON.stringify({ regenerate: true, ...data }),
    });
    return res;
  },

  // Manual Media Ingestion & Transcription (Pathway 2)
  uploadMedia: async (id, file, meta = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (meta.topic) formData.append('topic', meta.topic);
    if (meta.module) formData.append('module', meta.module);
    if (meta.industry) formData.append('industry', meta.industry);

    const url = `${API_BASE_URL}/meetings/${encodeURIComponent(id)}/upload-media/`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed: ${errText || response.statusText}`);
    }
    return response.json();
  },

  // Sync Teams Meeting Transcript & Process (Pathway 1)
  syncTeamsTranscript: async (id, joinUrl) => {
    try {
      return await apiFetch(`/meetings/${encodeURIComponent(id)}/sync-teams-transcript/`, {
        method: 'POST',
        body: JSON.stringify({ joinUrl }),
      });
    } catch (err) {
      console.warn('Sync Teams transcript error:', err);
      return null;
    }
  },

  // Create new meeting
  create: (data) => apiFetch('/meetings/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update existing meeting
  update: (id, data) => apiFetch(`/meetings/${encodeURIComponent(id)}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Delete meeting
  delete: (id) => apiFetch(`/meetings/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  }),
};
