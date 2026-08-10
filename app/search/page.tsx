"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { haversineDistance } from "@/lib/utils";
import { getCityByName } from "@/constants/dutch-cities";
import type { Coach } from "@/types/database";

function SearchContent() {
  const searchParams = useSearchParams();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const city = searchParams.get("city") || "";
  const showAll = searchParams.get("showAll") === "true";
  const radius = parseInt(searchParams.get("radius") || "10");
  const specialty = searchParams.get("specialty") || "";
  const ageGroup = searchParams.get("ageGroup") || "";
  const gender = searchParams.get("gender") || "";

  useEffect(() => {
    fetchCoaches();
  }, [city, showAll, radius, specialty, ageGroup, gender]);

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
    } catch (err) {
      setError("Failed to fetch coaches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-12 text-dark-textSecondary text-lg">Loading elite coaches...</div>;

  return (
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
            <Link key={coach.id} href={`/coach/${coach.id}`}>
              <div className="bg-dark-card border border-primary-600 border-opacity-30 rounded-lg hover:border-primary-500 hover:border-opacity-50 shadow-lg hover:shadow-2xl transition transform hover:scale-105 p-6 cursor-pointer h-full">
                {coach.photo_url && (
                  <div className="mb-4 h-48 bg-dark-surface rounded-lg overflow-hidden border border-primary-600 border-opacity-20">
                    <img
                      src={coach.photo_url}
                      alt={coach.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-lg font-bold text-primary-400 mb-1">{coach.name}</h3>
                <p className="text-dark-textSecondary text-sm mb-3">{coach.city}</p>
                <p className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent font-bold mb-3 text-lg">
                  €{coach.hourly_rate.toFixed(2)}/hour
                </p>
                <p className="text-dark-textSecondary text-sm line-clamp-2 mb-4">
                  {coach.bio}
                </p>
                <div className="flex flex-wrap gap-2">
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
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
