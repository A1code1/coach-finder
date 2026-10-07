"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { haversineDistance } from "@/lib/utils";
import { getCityByName } from "@/constants/dutch-cities";
import { RatingBadge } from "@/components/RatingBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { CoachCardSkeletonGrid } from "@/components/Skeleton";
import { CoachMap } from "@/components/CoachMap";
import { PackageHint } from "@/components/CoachCard";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { Coach } from "@/types/database";

type ReviewStats = Record<string, { avg: number; count: number }>;
type SortKey = "distance" | "price_asc" | "price_desc" | "rating";

const SORT_LABELS: Record<SortKey, string> = {
  distance: "Nearest first",
  rating: "Highest rated",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, checking } = useCurrentUser();
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
  const searchCity = showAll ? undefined : getCityByName(city);
  const defaultSort: SortKey = showAll ? "rating" : "distance";
  const sortParam = searchParams.get("sort") as SortKey | null;
  const sort: SortKey = sortParam && sortParam in SORT_LABELS ? sortParam : defaultSort;
  const [showMap, setShowMap] = useState(true);

  const distanceTo = (coach: Coach) => {
    if (!searchCity) return null;
    const coachCity = getCityByName(coach.city);
    if (!coachCity) return null;
    return haversineDistance(searchCity.lat, searchCity.lng, coachCity.lat, coachCity.lng);
  };

  const setSort = (value: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (!checking) fetchCoaches();
  }, [checking, user, city, showAll, radius, specialty, ageGroup, gender]);

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

  const sortedCoaches = useMemo(() => {
    const list = [...coaches];
    const rating = (c: Coach) => reviewStats[c.id]?.avg ?? 0;
    switch (sort) {
      case "price_asc":
        return list.sort((a, b) => a.hourly_rate - b.hourly_rate);
      case "price_desc":
        return list.sort((a, b) => b.hourly_rate - a.hourly_rate);
      case "rating":
        return list.sort(
          (a, b) => rating(b) - rating(a) || (reviewStats[b.id]?.count ?? 0) - (reviewStats[a.id]?.count ?? 0)
        );
      default:
        return list.sort((a, b) => (distanceTo(a) ?? 0) - (distanceTo(b) ?? 0) || rating(b) - rating(a));
    }
  }, [coaches, reviewStats, sort, city]);

  if (checking)
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

      {coaches.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {(Object.keys(SORT_LABELS) as SortKey[])
                .filter((key) => key !== "distance" || !showAll)
                .map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
            </select>
          </label>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      )}

      {coaches.length > 0 && showMap && (
        <div className="mb-8">
          <CoachMap
            coaches={coaches}
            center={searchCity ? { lat: searchCity.lat, lng: searchCity.lng } : null}
            radiusKm={showAll ? null : radius}
          />
        </div>
      )}

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
          {sortedCoaches.map((coach) => (
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
              <p className="text-gray-500 text-sm mb-3">
                {coach.city}
                {(() => {
                  const km = distanceTo(coach);
                  return km != null && km >= 1 ? ` · ${Math.round(km)} km away` : "";
                })()}
              </p>
              <p className="text-primary-600 font-bold mb-3 text-lg">
                €{coach.hourly_rate.toFixed(2)}/hour
                <PackageHint packages={coach.packages} hourlyRate={coach.hourly_rate} />
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
