function initialsOf(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

const COLORS = ['bg-brand-100 text-brand-700', 'bg-info-50 text-info-600', 'bg-success-50 text-success-600', 'bg-warning-50 text-warning-600'];

export default function Avatar({ name, size = 32 }) {
  const idx = name ? name.charCodeAt(0) % COLORS.length : 0;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${COLORS[idx]}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsOf(name)}
    </div>
  );
}
