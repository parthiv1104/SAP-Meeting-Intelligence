import { mockResolve } from './apiUtils';
import { requirements } from '../data/mockData';

export const requirementService = {
  list: () => mockResolve(requirements),
};
