import Link from "next/link";
import { RatingBadge } from "@/components/RatingBadge";
import type { MatchResult } from "@/lib/findMatches";

export function MatchList({ matches, columns = 3 }: { matches: MatchResult[]; columns?: 1 | 2 | 3 }) {
  if (matches.length === 0) {
    return <p className="text-gray-500">No matches yet — try widening your preferences or check back once more coaches join.</p>;
  }

  const gridClass =
    columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 md:grid-cols-3";

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {matches.map(({ coach, distanceKm, reviewAvg, reviewCount }, idx) => (
        <Link
          key={coach.id}
          href={`/coach/${coach.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-lg transition p-5 border border-gray-100 relative"
        >
          {idx === 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              Best match
            </span>
          )}
          {coach.photo_url && (
            <div className="h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
              <img src={coach.photo_url} alt={coach.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-gray-900">{coach.name}</h3>
            <RatingBadge avg={reviewAvg} count={reviewCount} className="text-gray-500" />
          </div>
          <p className="text-gray-500 text-sm">
            {coach.city}
            {distanceKm != null ? ` · ${Math.round(distanceKm)} km` : ""}
          </p>
          <p className="text-primary-600 font-bold mt-1">€{coach.hourly_rate.toFixed(2)}/hour</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {coach.specialties.slice(0, 2).map((s) => (
              <span key={s} className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
