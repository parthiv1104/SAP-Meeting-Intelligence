export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-ink-100 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5 space-y-3">
      <SkeletonLine className="h-3 w-1/3" />
      <SkeletonLine className="h-6 w-2/3" />
      <SkeletonLine className="h-2 w-full" />
      <SkeletonLine className="h-2 w-5/6" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
