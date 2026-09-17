import { apiFetch, API_BASE_URL } from './apiClient';

export const documentService = {
  list: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const docs = await apiFetch(`/meetings/all-documents/${query ? `?${query}` : ''}`);
      return Array.isArray(docs) ? docs : [];
    } catch (err) {
      console.warn('Document list error:', err);
      return [];
    }
  },

  upload: async (meetingId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/meetings/${encodeURIComponent(meetingId)}/documents/`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload document');
    }
    return res.json();
  },

  delete: async (meetingId, docId) => {
    return await apiFetch(`/meetings/${encodeURIComponent(meetingId)}/documents/${encodeURIComponent(docId)}/`, {
      method: 'DELETE',
    });
  }
};
