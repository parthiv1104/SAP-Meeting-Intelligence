import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] focus-visible:outline-brand-600 shadow-xs',
  secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 active:scale-[0.98] shadow-2xs',
  ghost: 'text-ink-600 hover:bg-ink-100 active:scale-[0.98]',
  danger: 'bg-critical-500 text-white hover:bg-critical-600 active:scale-[0.98]',
  success: 'bg-success-500 text-white hover:bg-success-600 active:scale-[0.98]',
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
  iconClassName = '',
  loading = false,
  disabled = false,
  className = '',
  as: As = 'button',
  ...rest
}) {
  const isSpinner = loading || Icon === Loader2;
  const EffectiveIcon = loading ? (Icon || Loader2) : Icon;

  return (
    <As
      disabled={disabled || loading}
      className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {EffectiveIcon && (
        <EffectiveIcon
          size={15}
          strokeWidth={2}
          className={`${isSpinner ? 'animate-spin' : ''} ${iconClassName}`}
        />
      )}
      {children}
    </As>
  );
}
