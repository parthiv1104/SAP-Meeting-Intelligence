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

  update: (id, data) => apiFetch(`/projects/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  delete: (id) => apiFetch(`/projects/${id}/`, {
    method: 'DELETE',
  }),

  uploadDocument: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiFetch(`/projects/${id}/upload-document/`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteDocument: (id, docId) => apiFetch(`/projects/${id}/documents/${docId}/`, {
    method: 'DELETE',
  }),

  addMeeting: (id, meetingId) => apiFetch(`/projects/${id}/add-meeting/`, {
    method: 'POST',
    body: JSON.stringify({ meetingId }),
  }),

  removeMeeting: (id, meetingId) => apiFetch(`/projects/${id}/remove-meeting/`, {
    method: 'POST',
    body: JSON.stringify({ meetingId }),
  }),

  addTeamMember: (id, member) => apiFetch(`/projects/${id}/add-team-member/`, {
    method: 'POST',
    body: JSON.stringify({ member }),
  }),

  removeTeamMember: (id, { email, name }) => apiFetch(`/projects/${id}/remove-team-member/`, {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  }),
};
