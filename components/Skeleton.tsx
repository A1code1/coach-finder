export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function CoachCardSkeleton() {
  return (
    <div className="bg-dark-card border border-primary-600 border-opacity-30 rounded-lg p-6 h-full flex flex-col">
      <div className="mb-4 h-48 rounded-lg bg-dark-surface animate-pulse" />
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="h-5 w-32 rounded bg-dark-surface animate-pulse" />
        <div className="h-5 w-12 rounded bg-dark-surface animate-pulse" />
      </div>
      <div className="h-4 w-20 rounded bg-dark-surface animate-pulse mb-3" />
      <div className="h-5 w-24 rounded bg-dark-surface animate-pulse mb-3" />
      <div className="h-4 w-full rounded bg-dark-surface animate-pulse mb-1" />
      <div className="h-4 w-2/3 rounded bg-dark-surface animate-pulse mb-4" />
      <div className="h-9 w-full rounded-lg bg-dark-surface animate-pulse mt-auto" />
    </div>
  );
}

export function CoachCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CoachCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Skeleton className="h-4 w-40 mb-2" />
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  );
}
