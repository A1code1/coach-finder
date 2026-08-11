"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { haversineDistance } from "@/lib/utils";
import { getCityByName } from "@/constants/dutch-cities";
import { RatingBadge } from "@/components/RatingBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { CoachCardSkeletonGrid } from "@/components/Skeleton";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Coach } from "@/types/database";

type ReviewStats = Record<string, { avg: number; count: number }>;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const { user, checking } = useRequireAuth(redirectTo);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const city = searchParams.get("city") || "";
  const showAll = searchParams.get("showAll") === "true";
  const radius = parseInt(searchParams.get("radius") || "10");
  const specialty = searchParams.get("specialty") || "";
  const ageGroup = searchParams.get("ageGroup") || "";
  const gender = searchParams.get("gender") || "";

  useEffect(() => {
    if (user) fetchCoaches();
  }, [user, city, showAll, radius, specialty, ageGroup, gender]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all approved coaches
      let query = supabase
        .from("coaches")
        .select("*")
        .eq("status", "approved");

      const { data: allCoaches, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filtered = allCoaches || [];

      // Filter by distance if not showing all
      if (!showAll) {
        const searchCity = getCityByName(city);
        if (!searchCity) {
          setError("City not found");
          return;
        }

        filtered = filtered.filter((coach) => {
          const coachCity = getCityByName(coach.city);
          if (!coachCity) return false;

          const distance = haversineDistance(
            searchCity.lat,
            searchCity.lng,
            coachCity.lat,
            coachCity.lng
          );

          return distance <= radius;
        });
      }

      // Filter by specialty
      const bySpecialty = specialty
        ? filtered.filter((coach) =>
            coach.specialties.some(
              (s: string) => s.toLowerCase() === specialty.toLowerCase()
            )
          )
        : filtered;

      // Filter by age group
      const byAgeGroup = ageGroup
        ? bySpecialty.filter((coach) =>
            coach.age_groups.some(
              (ag: string) => ag.toLowerCase() === ageGroup.toLowerCase()
            )
          )
        : bySpecialty;

      // Filter by gender
      const byGender = gender
        ? byAgeGroup.filter((coach) => coach.gender === gender)
        : byAgeGroup;

      setCoaches(byGender);
      await Promise.all([
        fetchReviewStats(byGender.map((coach) => coach.id)),
        fetchFavorites(),
      ]);
    } catch (err) {
      setError("Failed to fetch coaches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    const { data, error: favError } = await supabase
      .from("favorites")
      .select("coach_id")
      .eq("player_id", user.id);

    if (favError) {
      console.error(favError);
      return;
    }

    setFavoriteIds(new Set((data || []).map((row) => row.coach_id)));
  };

  const fetchReviewStats = async (coachIds: string[]) => {
    if (coachIds.length === 0) {
      setReviewStats({});
      return;
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("coach_id, rating")
      .eq("status", "approved")
      .in("coach_id", coachIds);

    if (reviewsError) {
      console.error(reviewsError);
      return;
    }

    const totals: Record<string, { sum: number; count: number }> = {};
    (reviews || []).forEach((review) => {
      const entry = totals[review.coach_id] || { sum: 0, count: 0 };
      entry.sum += review.rating;
      entry.count += 1;
      totals[review.coach_id] = entry;
    });

    const stats: ReviewStats = {};
    Object.entries(totals).forEach(([coachId, { sum, count }]) => {
      stats[coachId] = { avg: sum / count, count };
    });

    setReviewStats(stats);
  };

  if (checking || !user)
    return <div className="text-center py-12 text-gray-500 text-lg">Loading...</div>;

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <CoachCardSkeletonGrid />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          {showAll ? "All Coaches" : `Coaches near ${city}`}
        </h1>
        <p className="text-gray-500 text-lg">
          Found {coaches.length} coach{coaches.length !== 1 ? "es" : ""}
          {!showAll && ` within ${radius} km`}
          {gender && ` (${gender})`}
          {specialty && ` specializing in ${specialty}`}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {coaches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-6">
            No coaches found matching your criteria. Try adjusting your search.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            ← Back to search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              role="button"
              tabIndex={0}
              aria-label={`View ${coach.name}'s profile`}
              onClick={() => router.push(`/coach/${coach.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/coach/${coach.id}`);
                }
              }}
              className="bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:-translate-y-0.5 shadow-sm transition-all p-6 cursor-pointer h-full flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              {coach.photo_url && (
                <div className="mb-4 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={coach.photo_url}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex justify-between items-start gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-lg font-semibold text-primary-900 truncate">{coach.name}</h3>
                  <VerifiedBadge />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <FavoriteButton
                    coachId={coach.id}
                    initialFavorited={favoriteIds.has(coach.id)}
                    className="text-gray-300 hover:text-accent-500"
                  />
                  <RatingBadge
                    avg={reviewStats[coach.id]?.avg ?? 0}
                    count={reviewStats[coach.id]?.count ?? 0}
                    className="text-gray-500"
                  />
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-3">{coach.city}</p>
              <p className="text-primary-600 font-bold mb-3 text-lg">
                €{coach.hourly_rate.toFixed(2)}/hour
              </p>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {coach.bio}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {coach.specialties.slice(0, 2).map((spec) => (
                  <span
                    key={spec}
                    className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {spec}
                  </span>
                ))}
                {coach.specialties.length > 2 && (
                  <span className="text-gray-400 text-xs px-2 py-1">
                    +{coach.specialties.length - 2} more
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/coach/${coach.id}/message`);
                }}
                className="mt-auto w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Message Coach
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="text-center py-12 text-gray-500 text-lg">Loading...</div>}
    >
      <SearchContent />
    </Suspense>
  );
}
