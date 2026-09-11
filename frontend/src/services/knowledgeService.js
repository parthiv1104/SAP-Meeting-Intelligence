import { mockResolve } from './apiUtils';
import { knowledgeItems, knowledgeTimeline } from '../data/mockData';

export const knowledgeService = {
  list: () => mockResolve(knowledgeItems),
  timeline: () => mockResolve(knowledgeTimeline),
};
