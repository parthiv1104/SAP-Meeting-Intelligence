import { apiFetch } from './apiClient';

export const notificationService = {
  list: async () => {
    try {
      const meetings = await apiFetch('/meetings/');
      if (Array.isArray(meetings) && meetings.length > 0) {
        return meetings.slice(0, 4).map((m, idx) => ({
          id: `notif-${m.id || idx}`,
          title: m.status === 'Completed' ? 'Meeting Transcript Audited' : 'Upcoming Session Ready',
          body: `Meeting "${m.name || 'Workshop'}" (${m.module || 'Cross-Module'}) is ${m.status.toLowerCase()}.`,
          date: m.date || 'Recent',
          read: idx > 1,
          link: `/meetings/${m.id}`
        }));
      }
      return [
        {
          id: 'notif-sys-1',
          title: 'System Intelligence Active',
          body: 'OpenAI GPT-4o-mini & Whisper pipeline connected.',
          date: 'Just now',
          read: false,
          link: '/meetings'
        }
      ];
    } catch (err) {
      return [];
    }
  },
};
