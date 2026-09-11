const TONES = {
  neutral: 'bg-ink-100 text-ink-700',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  critical: 'bg-critical-50 text-critical-600',
  info: 'bg-info-50 text-info-600',
};

const PRIORITY_TONE = {
  Critical: 'critical',
  High: 'warning',
  Medium: 'info',
  Low: 'neutral',
};

const STATUS_TONE = {
  'On Track': 'success',
  'At Risk': 'critical',
  'In Progress': 'info',
  'Planning': 'neutral',
  'Completed': 'success',
  'Verified': 'success',
  'Open': 'critical',
  'Under Review': 'warning',
  'New': 'info',
  'Suggested': 'neutral',
  'Asked': 'info',
  'Answered': 'success',
  'Partially Answered': 'warning',
  'Follow-up Required': 'critical',
  'Not Applicable': 'neutral',
  'Closed': 'neutral',
  'Approved': 'success',
  'Rejected': 'critical',
  'Analyzed': 'success',
  'Pending': 'neutral',
  'Scheduled': 'info',
  'Processed': 'success',
  'Processing': 'warning',
  'Extracted': 'success',
};

export default function Badge({ children, tone, className = '' }) {
  const resolvedTone = tone || PRIORITY_TONE[children] || STATUS_TONE[children] || 'neutral';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${TONES[resolvedTone]} ${className}`}
    >
      {children}
    </span>
  );
}
