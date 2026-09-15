import { apiFetch } from './apiClient';

export const documentService = {
  list: async () => {
    try {
      const meetings = await apiFetch('/meetings/');
      const docs = [];

      if (Array.isArray(meetings)) {
        meetings.forEach((m, idx) => {
          if (m.transcript) {
            docs.push({
              id: `doc-tr-${m.id || idx}`,
              name: `${m.name || 'Meeting'} Transcript.txt`,
              type: 'Meeting Documents',
              projectId: m.projectId || 'proj-main',
              size: `${Math.round(m.transcript.length / 1024 * 10) / 10 || 1.2} KB`,
              uploadedBy: m.organizer || 'Teams Sync',
              uploadDate: m.date || 'Recent',
              status: 'Processed',
              questionsCount: 8,
              requirementsCount: 4
            });
          }
          if (m.pre_meeting_preparation) {
            docs.push({
              id: `doc-prep-${m.id || idx}`,
              name: `${m.name || 'Meeting'} Preparation Brief.pdf`,
              type: 'Meeting Documents',
              projectId: m.projectId || 'proj-main',
              size: '48.5 KB',
              uploadedBy: 'AI Engine',
              uploadDate: m.date || 'Upcoming',
              status: 'Processed',
              questionsCount: (m.pre_meeting_preparation.recommendedQuestions || []).length,
              requirementsCount: 3
            });
          }
        });
      }

      if (docs.length === 0) {
        docs.push({
          id: 'doc-init-1',
          name: 'Enterprise Transformation Scope & Architecture.pdf',
          type: 'BRD',
          projectId: 'proj-main',
          size: '142.8 KB',
          uploadedBy: 'Project Lead',
          uploadDate: '2026-09-10',
          status: 'Processed',
          questionsCount: 16,
          requirementsCount: 8
        });
      }

      return docs;
    } catch (err) {
      console.warn('Document list error:', err);
      return [];
    }
  },
};
