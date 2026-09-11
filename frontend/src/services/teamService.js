import { mockResolve } from './apiUtils';
import { teamMembers } from '../data/mockData';

export const teamService = {
  list: () => mockResolve(teamMembers),
  get: (id) => mockResolve(teamMembers.find((t) => t.id === id)),
};
