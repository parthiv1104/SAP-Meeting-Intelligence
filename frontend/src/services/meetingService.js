import { apiFetch } from './apiClient';
import { mockResolve } from './apiUtils';
import {
  meetings as mockMeetings,
  meetingPreparation as mockPreparation,
  liveMeetingState as mockLiveState,
  meetingAnalysis as mockAnalysis
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const meetingService = {
  // Fetch list of meetings with optional filters
  list: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const data = await apiFetch(`/meetings/${query ? `?${query}` : ''}`);
      if (Array.isArray(data) && data.length > 0) return data;
      return mockResolve(mockMeetings);
    } catch (err) {
      console.warn('Backend unavailable, using mock meetings:', err);
      return mockResolve(mockMeetings);
    }
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
    try {
      const meeting = await apiFetch(`/meetings/${encodeURIComponent(id)}/`);
      if (meeting && meeting.id) return meeting;
      return mockResolve(mockMeetings.find((m) => m.id === id) || mockMeetings[0]);
    } catch (err) {
      console.warn(`Backend unavailable, using mock meeting ${id}:`, err);
      return mockResolve(mockMeetings.find((m) => m.id === id) || mockMeetings[0]);
    }
  },

  // Get AI Preparation & Generated Questions for a meeting (Pathway 3)
  getPreparation: async (id, options = {}) => {
    try {
      const query = new URLSearchParams(options).toString();
      const res = await apiFetch(`/meetings/${encodeURIComponent(id)}/preparation/${query ? `?${query}` : ''}`);
      if (res && res.recommendedQuestions) return res;
      return mockResolve(mockPreparation[id] || mockPreparation['mtg-005-abc-proc']);
    } catch (err) {
      console.warn('Backend unavailable, using mock preparation:', err);
      return mockResolve(mockPreparation[id] || mockPreparation['mtg-005-abc-proc']);
    }
  },

  // Get Live Interactive Meeting State (Pathway 1 / Interactive workspace)
  getLiveState: async (id) => {
    try {
      return mockResolve(mockLiveState[id] || mockLiveState['mtg-005-abc-proc']);
    } catch (err) {
      return mockResolve(mockLiveState['mtg-005-abc-proc']);
    }
  },

  // Get Post-Meeting Intelligence & Analysis (Pathway 4)
  getAnalysis: async (id) => {
    try {
      const res = await apiFetch(`/meetings/${encodeURIComponent(id)}/analysis/`);
      if (res && res.summary) return res;
      return mockResolve(mockAnalysis[id] || mockAnalysis['mtg-004-abc-proc']);
    } catch (err) {
      console.warn('Backend unavailable, using mock analysis:', err);
      return mockResolve(mockAnalysis[id] || mockAnalysis['mtg-004-abc-proc']);
    }
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
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Delete meeting
  delete: (id) => apiFetch(`/meetings/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  }),
};
