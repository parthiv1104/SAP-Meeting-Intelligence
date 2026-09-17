/**
 * Utility functions to dynamically steer UI labels, badges, roles, and descriptions
 * depending on whether a meeting is SAP ERP, AI / Machine Learning, Software Engineering, or General Business.
 */

export function getMeetingDomain(meeting) {
  const name = meeting?.name || meeting?.title || '';
  const topic = meeting?.topic || '';
  const module = (meeting?.module || '').trim();
  const industry = (meeting?.industry || '').trim();

  const combined = ` ${module} ${topic} ${name} `.toUpperCase();

  const isExplicitSapModule = ['MM', 'FI', 'CO', 'SD', 'PP', 'QM', 'PM', 'EWM', 'HCM', 'PS', 'FICO', 'ABAP', 'RICEFW'].includes(module.toUpperCase());
  const hasSapKeyword = ['S/4HANA', 'S4HANA', 'SAP', 'FICO', 'ABAP', 'RICEFW', 'ECC', 'BTP'].some(kw => combined.includes(kw));
  const isSap = isExplicitSapModule || hasSapKeyword;

  const isAi = !isSap && ['AI', 'ML', 'MODEL', 'LLM', 'GPT', 'INTELLIGENCE', 'ALGORITHM', 'DATA SCIENCE', 'VISION', 'NLP', 'DEEP LEARNING'].some(kw => combined.includes(kw));

  if (isSap) {
    return {
      isSap: true,
      isAi: false,
      domainType: 'SAP ERP',
      eyebrow: industry && industry !== 'Other' && industry !== 'General' ? `${industry} Industry` : 'SAP Enterprise Workshop',
      badges: [
        { label: `SAP Module: ${module || 'Cross-Module'}`, tone: 'brand' },
        ...(industry && industry !== 'Other' && industry !== 'General' ? [{ label: `Industry: ${industry}`, tone: 'neutral' }] : [])
      ],
      prepDescription: `Dynamic AI questions generated for ${module || 'Cross-Module'} in ${industry || 'Manufacturing'}`,
      auditDescription: 'AI transcript audit: Asked vs. Missed SAP Gaps, Decisions & Actions',
      roleConsultant: 'SAP Lead Consultant',
      roleClient: `${industry || 'Domain'} Process Owner`,
      defaultTopics: ['Master Data', 'Configuration', 'Process Flow', 'Integration Touchpoints']
    };
  }

  if (isAi) {
    return {
      isSap: false,
      isAi: true,
      domainType: 'Artificial Intelligence',
      eyebrow: 'AI & Data Intelligence',
      badges: [
        { label: 'Domain: Artificial Intelligence', tone: 'brand' },
        { label: `Focus: ${topic || name || 'Model Architecture & Deployment'}`, tone: 'neutral' }
      ],
      prepDescription: `Dynamic AI questions generated for ${name || 'AI Workshop'}`,
      auditDescription: 'AI transcript audit: Asked vs. Missed AI Technical Gaps, Decisions & Actions',
      roleConsultant: 'AI Solutions Architect',
      roleClient: 'AI / Engineering Lead',
      defaultTopics: ['Model Architecture', 'Training Data & Pipelines', 'Prompt Engineering', 'Evaluation & Benchmarks']
    };
  }

  // General / Software Engineering
  const isTech = ['API', 'CLOUD', 'BACKEND', 'FRONTEND', 'SYSTEM', 'INFRA', 'DATABASE', 'DEVOPS', 'SOFTWARE', 'APP'].some(kw => combined.includes(kw));
  return {
    isSap: false,
    isAi: false,
    domainType: isTech ? 'Software & Cloud Engineering' : 'Project Management',
    eyebrow: isTech ? 'Software & Cloud Workshop' : 'Project Workspace',
    badges: [
      { label: isTech ? 'Domain: Software Engineering' : 'Domain: General Project', tone: 'brand' },
      ...(industry && !['Other', 'General', 'Manufacturing'].includes(industry) ? [{ label: `Sector: ${industry}`, tone: 'neutral' }] : []),
      { label: `Scope: ${topic || name || 'General Scope'}`, tone: 'neutral' }
    ],
    prepDescription: `Dynamic questions generated for ${name || 'this session'}`,
    auditDescription: 'AI transcript audit: Asked vs. Missed Decisions, Requirements & Actions',
    roleConsultant: 'Technical Lead',
    roleClient: 'Project Stakeholder',
    defaultTopics: ['Architecture & Scope', 'Integration & APIs', 'Performance & Security', 'Milestones & Delivery']
  };
}

export function getDynamicMeetingTag(meeting) {
  const name = meeting?.name || meeting?.title || '';
  const topic = meeting?.topic || '';
  const module = (meeting?.module || '').trim();
  const combined = ` ${module} ${topic} ${name} `.toUpperCase();

  // 1. Explicit SAP Modules
  for (const mod of ['MM', 'FI', 'CO', 'SD', 'PP', 'QM', 'PM', 'EWM', 'HCM', 'PS', 'FICO', 'ABAP', 'RICEFW']) {
    if (module.toUpperCase() === mod || module.toUpperCase() === `SAP ${mod}` || combined.includes(` ${mod} `) || combined.includes(`(${mod})`)) {
      return { label: `SAP ${mod}`, tone: 'brand' };
    }
  }

  // 2. Specific SAP Platforms & Workflows
  if (combined.includes('BTP')) return { label: 'SAP BTP', tone: 'brand' };
  if (combined.includes('B1') || combined.includes('BUSINESS ONE')) return { label: 'SAP B1', tone: 'brand' };
  if (combined.includes('S/4HANA') || combined.includes('S4HANA')) return { label: 'SAP S/4HANA', tone: 'brand' };
  if (combined.includes('PROCUREMENT') || combined.includes('PURCHASING') || combined.includes('COSTING')) return { label: 'SAP MM / Costing', tone: 'brand' };
  if (combined.includes('SAP')) return { label: 'SAP Enterprise', tone: 'brand' };

  // 3. AI & Intelligence
  if (['AI', 'INTELLIGENCE', 'LLM', 'GPT', 'ML', 'MACHINE LEARNING', 'MODEL', 'VISION', 'NLP', 'WHISPER'].some(k => combined.includes(k))) {
    return { label: 'Artificial Intelligence', tone: 'brand' };
  }

  // 4. Technology / Compliance / Engineering
  if (combined.includes('COMPLIANCE') || combined.includes('EY') || combined.includes('AUDIT') || combined.includes('GOVERNANCE')) {
    return { label: 'Compliance & Tech', tone: 'neutral' };
  }
  if (combined.includes('VIBE CODING') || combined.includes('CODING') || combined.includes('DEV') || combined.includes('SOFTWARE') || combined.includes('ENGINEERING')) {
    return { label: 'Software Dev', tone: 'neutral' };
  }
  if (combined.includes('CERTIFICATION') || combined.includes('ENABLEMENT') || combined.includes('TRAINING') || combined.includes('DRIVE')) {
    return { label: 'Enablement', tone: 'neutral' };
  }
  if (combined.includes('DEMO') || combined.includes('SOLUTIONS')) {
    return { label: 'Solutions Demo', tone: 'neutral' };
  }

  // 5. Fallbacks
  if (module && module !== 'Cross-Module') {
    return { label: module, tone: 'neutral' };
  }
  if (topic && topic !== 'Cross-Module' && topic !== name) {
    return { label: topic.length > 20 ? `${topic.slice(0, 18)}...` : topic, tone: 'neutral' };
  }

  return { label: 'Strategy & Ops', tone: 'neutral' };
}

