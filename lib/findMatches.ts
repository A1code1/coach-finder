import { supabase } from "@/lib/supabase";
import { getCityByName } from "@/constants/dutch-cities";
import { haversineDistance, scoreCoachMatch } from "@/lib/utils";
import type { Coach } from "@/types/database";

export type MatchPrefs = {
  city: string | null;
  specialties: string[];
  age_group: string | null;
  gender_preference: string | null;
  budget_max: number | null;
};

export type MatchResult = {
  coach: Coach;
  score: number;
  distanceKm: number | null;
  reviewAvg: number;
  reviewCount: number;
};

export async function findTopMatches(prefs: MatchPrefs, limit = 3): Promise<MatchResult[]> {
  const { data: coaches, error } = await supabase.from("coaches").select("*").eq("status", "approved");
  if (error || !coaches || coaches.length === 0) return [];

  const coachIds = coaches.map((c) => c.id);
  const { data: reviews } = await supabase
    .from("reviews")
    .select("coach_id, rating")
    .eq("status", "approved")
    .in("coach_id", coachIds);

  const reviewTotals: Record<string, { sum: number; count: number }> = {};
  (reviews || []).forEach((r) => {
    const entry = reviewTotals[r.coach_id] || { sum: 0, count: 0 };
    entry.sum += r.rating;
    entry.count += 1;
    reviewTotals[r.coach_id] = entry;
  });

  const searchCity = prefs.city ? getCityByName(prefs.city) : null;

  const results: MatchResult[] = coaches.map((coach) => {
    const coachCity = getCityByName(coach.city);
    const distanceKm =
      searchCity && coachCity
        ? haversineDistance(searchCity.lat, searchCity.lng, coachCity.lat, coachCity.lng)
        : null;
    const totals = reviewTotals[coach.id];
    const reviewAvg = totals ? totals.sum / totals.count : 0;
    const reviewCount = totals?.count || 0;
    const score = scoreCoachMatch(coach, prefs, distanceKm, reviewAvg);
    return { coach, score, distanceKm, reviewAvg, reviewCount };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
