import { mockResolve } from './apiUtils';
import { questions, questionDetail, missedQuestions, faqData, frequentlyMissedTopics } from '../data/mockData';

export const questionService = {
  list: () => mockResolve(questions),
  get: (id) => mockResolve(questionDetail[id]),
  missed: () => mockResolve(missedQuestions),
  faq: () => mockResolve(faqData),
  frequentlyMissed: () => mockResolve(frequentlyMissedTopics),
};
