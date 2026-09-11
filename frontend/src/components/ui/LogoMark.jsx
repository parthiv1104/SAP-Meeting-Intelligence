// The product's one signature visual: a small knowledge-graph node cluster.
// It stands for the core idea of the platform — every meeting, question and
// decision is a connected node in the project's memory. Used sparingly:
// the sidebar logo, empty states, and the insight/recommendation badge.
export default function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#3a2b9e" />
      <g stroke="#c3bff6" strokeWidth="1.2">
        <line x1="16" y1="10" x2="10" y2="18" />
        <line x1="16" y1="10" x2="22" y2="18" />
        <line x1="10" y1="18" x2="16" y2="23" />
        <line x1="22" y1="18" x2="16" y2="23" />
        <line x1="10" y1="18" x2="22" y2="18" />
      </g>
      <circle cx="16" cy="10" r="2.4" fill="#ffffff" />
      <circle cx="10" cy="18" r="2.1" fill="#9d94ee" />
      <circle cx="22" cy="18" r="2.1" fill="#9d94ee" />
      <circle cx="16" cy="23" r="2.4" fill="#ffffff" />
    </svg>
  );
}
