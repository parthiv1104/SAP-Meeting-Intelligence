const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600',
  secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'bg-critical-500 text-white hover:bg-critical-600',
  success: 'bg-success-500 text-white hover:bg-success-600',
};

const SIZES = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-3.5 py-2',
  lg: 'text-sm px-5 py-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  as: As = 'button',
  ...rest
}) {
  return (
    <As
      className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={15} strokeWidth={2} />}
      {children}
    </As>
  );
}
