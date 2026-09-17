export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface overflow-hidden animate-pulse">
          <div className="aspect-square bg-ink-softer" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 rounded bg-ink-softer" />
            <div className="h-4 w-3/4 rounded bg-ink-softer" />
            <div className="h-5 w-1/2 rounded bg-ink-softer" />
          </div>
        </div>
      ))}
    </div>
  );
}
