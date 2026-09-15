/**
 * Global Configuration & Application Constants for ProjectIQ.
 */

export const organization = {
  name: 'VC ERP Consulting Group',
  plan: 'Enterprise',
  activeProjects: 4,
  totalConsultants: 18,
  clients: 8,
};

export const currentUser = {
  name: 'Parthiv Dudhrejiya',
  role: 'Project Lead',
  email: 'parthiv.dudhrejiya@vc-erp.com',
  initials: 'PD',
};

export const industries = [
  'Manufacturing',
  'Retail',
  'Healthcare',
  'Pharmaceuticals',
  'Automotive',
  'Chemicals',
  'Logistics',
  'Banking',
  'Technology & AI',
  'Software & Cloud',
  'Energy',
  'FMCG',
  'Professional Services',
  'General',
];

export const sapModules = [
  'FI',
  'CO',
  'MM',
  'SD',
  'PP',
  'QM',
  'PM',
  'EWM',
  'HCM',
  'PS',
];

export const defaultTeamMembers = [
  {
    id: 'parthiv-lead',
    name: 'Parthiv Dudhrejiya',
    role: 'Project Lead & AI Solutions Architect',
    email: 'parthiv.dudhrejiya@vc-erp.com',
    modules: ['Cross-Module', 'AI & Data', 'MM'],
    experience: '8+ yrs',
    responsibilities: ['Solution Architecture', 'AI Pipeline Design', 'Client Engagement'],
    meetingsAttended: 18,
    openQuestions: 4,
  },
  {
    id: 'rahul-shah',
    name: 'Rahul Shah',
    role: 'Principal SAP Consultant',
    email: 'rahul.shah@vc-erp.com',
    modules: ['MM', 'PP', 'QM'],
    experience: '10+ yrs',
    responsibilities: ['Procurement Blueprinting', 'Batch Management Config'],
    meetingsAttended: 14,
    openQuestions: 3,
  },
  {
    id: 'meera-iyer',
    name: 'Meera Iyer',
    role: 'Lead Finance & Controlling Architect',
    email: 'meera.iyer@vc-erp.com',
    modules: ['FI', 'CO'],
    experience: '9+ yrs',
    responsibilities: ['General Ledger Revaluation', 'Asset Accounting'],
    meetingsAttended: 12,
    openQuestions: 2,
  },
  {
    id: 'arjun-nair',
    name: 'Arjun Nair',
    role: 'Lead Technical Consultant & Integration Specialist',
    email: 'arjun.nair@vc-erp.com',
    modules: ['SD', 'Integration', 'ABAP'],
    experience: '7+ yrs',
    responsibilities: ['Pricing Access Sequences', 'BTP API Integration'],
    meetingsAttended: 10,
    openQuestions: 3,
  },
];

export const teamMembers = defaultTeamMembers;
export const notifications = [];

