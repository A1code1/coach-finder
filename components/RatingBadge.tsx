export function RatingBadge({
  avg,
  count,
  className = "",
}: {
  avg: number;
  count: number;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <div className={`flex items-center gap-1 text-sm ${className}`}>
      <svg className="w-4 h-4 text-primary-500 fill-current shrink-0" viewBox="0 0 20 20">
        <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
      </svg>
      <span className="font-semibold">{avg.toFixed(1)}</span>
      <span className="opacity-70">({count})</span>
    </div>
  );
}
