import { defaultTeamMembers } from '../config/constants';

export const teamService = {
  list: async () => defaultTeamMembers,
  get: async (id) => defaultTeamMembers.find((t) => t.id === id) || defaultTeamMembers[0],
};
