"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { haversineDistance } from "@/lib/utils";
import { getCityByName } from "@/constants/dutch-cities";
import { RatingBadge } from "@/components/RatingBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
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
    return (
      <div className="athletic-theme text-center py-12 text-dark-textSecondary text-lg">
        Loading...
      </div>
    );

  if (loading)
    return (
      <div className="athletic-theme">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <div className="h-8 w-64 bg-dark-surface rounded animate-pulse mb-2" />
            <div className="h-5 w-40 bg-dark-surface rounded animate-pulse" />
          </div>
          <CoachCardSkeletonGrid />
        </div>
      </div>
    );

  return (
    <div className="athletic-theme">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent mb-2">
            {showAll ? "All Elite Coaches" : `Champions in ${city}`}
          </h1>
          <p className="text-dark-textSecondary text-lg">
            Found {coaches.length} coach{coaches.length !== 1 ? "es" : ""}
            {!showAll && ` within ${radius} km`}
            {gender && ` (${gender})`}
            {specialty && ` specializing in ${specialty}`}
          </p>
        </div>

        {error && (
          <div className="bg-accent-500 bg-opacity-20 border border-accent-500 border-opacity-50 text-accent-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {coaches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-textSecondary mb-6">
              No coaches found matching your criteria. Try adjusting your search.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-black font-bold rounded-lg transition transform hover:scale-105"
            >
              ← Back to search
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                onClick={() => router.push(`/coach/${coach.id}`)}
                className="bg-dark-card border border-primary-600 border-opacity-30 rounded-lg hover:border-primary-500 hover:border-opacity-50 shadow-lg hover:shadow-2xl transition transform hover:scale-105 p-6 cursor-pointer h-full flex flex-col"
              >
                {coach.photo_url && (
                  <div className="mb-4 h-48 bg-dark-surface rounded-lg overflow-hidden border border-primary-600 border-opacity-20">
                    <img
                      src={coach.photo_url}
                      alt={coach.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="text-lg font-bold text-primary-400">{coach.name}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <FavoriteButton
                      coachId={coach.id}
                      initialFavorited={favoriteIds.has(coach.id)}
                      className="text-dark-textSecondary hover:text-accent-500"
                    />
                    <RatingBadge
                      avg={reviewStats[coach.id]?.avg ?? 0}
                      count={reviewStats[coach.id]?.count ?? 0}
                      className="text-dark-textSecondary"
                    />
                  </div>
                </div>
                <p className="text-dark-textSecondary text-sm mb-3">{coach.city}</p>
                <p className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent font-bold mb-3 text-lg">
                  €{coach.hourly_rate.toFixed(2)}/hour
                </p>
                <p className="text-dark-textSecondary text-sm line-clamp-2 mb-4">
                  {coach.bio}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {coach.specialties.slice(0, 2).map((spec) => (
                    <span
                      key={spec}
                      className="bg-primary-500 bg-opacity-20 text-primary-400 text-xs px-3 py-1 rounded border border-primary-600 border-opacity-30"
                    >
                      {spec}
                    </span>
                  ))}
                  {coach.specialties.length > 2 && (
                    <span className="text-dark-textSecondary text-xs px-2 py-1">
                      +{coach.specialties.length - 2} more
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/coach/${coach.id}/message`);
                  }}
                  className="mt-auto w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Message Coach
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="athletic-theme text-center py-12 text-dark-textSecondary text-lg">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
