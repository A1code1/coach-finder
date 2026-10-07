import { supabase } from "@/lib/supabase";
import { getCityByName, type City } from "@/constants/dutch-cities";
import { haversineDistance } from "@/lib/utils";

export const CITY_PAGE_RADIUS_KM = 25;

export async function getApprovedCoachesWithRatings() {
  const [{ data: coaches }, { data: reviews }] = await Promise.all([
    supabase
      .from("coaches")
      .select("id, name, city, bio, photo_url, hourly_rate, specialties, age_groups, packages")
      .eq("status", "approved"),
    supabase.from("reviews").select("coach_id, rating").eq("status", "approved"),
  ]);

  const totals: Record<string, { sum: number; count: number }> = {};
  (reviews || []).forEach((r) => {
    const entry = totals[r.coach_id] || { sum: 0, count: 0 };
    entry.sum += r.rating;
    entry.count += 1;
    totals[r.coach_id] = entry;
  });

  return (coaches || []).map((coach) => {
    const t = totals[coach.id];
    return { coach, rating: t ? { avg: t.sum / t.count, count: t.count } : undefined };
  });
}

export async function getCoachesNear(city: City, radiusKm = CITY_PAGE_RADIUS_KM) {
  const all = await getApprovedCoachesWithRatings();
  return all
    .map((entry) => {
      const coachCity = getCityByName(entry.coach.city);
      const distanceKm = coachCity ? haversineDistance(city.lat, city.lng, coachCity.lat, coachCity.lng) : null;
      return { ...entry, distanceKm };
    })
    .filter((entry) => entry.distanceKm != null && entry.distanceKm <= radiusKm)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}
