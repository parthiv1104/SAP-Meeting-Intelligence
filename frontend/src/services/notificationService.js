import { mockResolve } from './apiUtils';
import { notifications } from '../data/mockData';

export const notificationService = {
  list: () => mockResolve(notifications),
};
