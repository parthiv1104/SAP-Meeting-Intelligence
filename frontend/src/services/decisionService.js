import { mockResolve } from './apiUtils';
import { decisions } from '../data/mockData';

export const decisionService = {
  list: () => mockResolve(decisions),
};
