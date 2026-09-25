import { apiFetch } from './apiClient';

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

  // Skip a single question and replace with a fresh AI question
  skipQuestion: async (id, data = {}) => {
    const res = await apiFetch(`/meetings/${encodeURIComponent(id)}/skip-question/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  // Get Post-Meeting Intelligence & Analysis
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

  // Get all documents attached specifically to this meeting
  getDocuments: async (meetingId) => {
    try {
      const data = await apiFetch(`/meetings/${encodeURIComponent(meetingId)}/documents/`);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Failed to fetch meeting documents:', err);
      return [];
    }
  },

  // Upload scope document (PDF, Word, Excel, TXT) attached to this meeting
  uploadDocument: async (meetingId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const authHeaders = token ? { 'Authorization': `Token ${token}` } : {};

    const url = `${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/documents/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeaders,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Document upload failed: ${errText || response.statusText}`);
    }
    return response.json();
  },

  // Delete attached document from this meeting
  deleteDocument: async (meetingId, docId) => {
    return apiFetch(`/meetings/${encodeURIComponent(meetingId)}/documents/${encodeURIComponent(docId)}/`, {
      method: 'DELETE',
    });
  },
};
