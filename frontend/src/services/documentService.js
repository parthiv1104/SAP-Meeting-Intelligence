import { mockResolve } from './apiUtils';
import { documents } from '../data/mockData';

export const documentService = {
  list: () => mockResolve(documents),
};
