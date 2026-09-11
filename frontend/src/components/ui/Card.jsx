export default function Card({ children, className = '', padded = true, as: As = 'div', ...rest }) {
  return (
    <As
      className={`rounded-xl border border-ink-100 bg-white ${padded ? 'p-5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </As>
  );
}
