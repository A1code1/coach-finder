import Link from "next/link";
import { RatingBadge } from "@/components/RatingBadge";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import type { Coach } from "@/types/database";

// Server-friendly coach card (no favorites / client handlers), used on city pages.
export function CoachCard({
  coach,
  rating,
  distanceKm,
}: {
  coach: Pick<Coach, "id" | "name" | "city" | "bio" | "photo_url" | "hourly_rate" | "specialties">;
  rating?: { avg: number; count: number };
  distanceKm?: number | null;
}) {
  return (
    <Link
      href={`/coach/${coach.id}`}
      className="bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:-translate-y-0.5 shadow-sm transition-all p-6 h-full flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
    >
      {coach.photo_url && (
        <div className="mb-4 h-48 bg-gray-100 rounded-lg overflow-hidden">
          <img src={coach.photo_url} alt={coach.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex justify-between items-start gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-lg font-semibold text-primary-900 truncate">{coach.name}</h3>
          <VerifiedBadge />
        </div>
        <RatingBadge avg={rating?.avg ?? 0} count={rating?.count ?? 0} className="text-gray-500 shrink-0" />
      </div>
      <p className="text-gray-500 text-sm mb-3">
        {coach.city}
        {distanceKm != null && distanceKm >= 1 && ` · ${Math.round(distanceKm)} km away`}
      </p>
      <p className="text-primary-600 font-bold mb-3 text-lg">€{Number(coach.hourly_rate).toFixed(2)}/hour</p>
      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{coach.bio}</p>
      <div className="flex flex-wrap gap-2 mt-auto">
        {coach.specialties.slice(0, 3).map((spec) => (
          <span key={spec} className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-medium">
            {spec}
          </span>
        ))}
      </div>
    </Link>
  );
}
