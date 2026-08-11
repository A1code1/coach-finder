export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function generateReviewToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

export function scoreCoachMatch(
  coach: { specialties: string[]; age_groups: string[]; gender: string | null; hourly_rate: number },
  prefs: {
    specialties: string[];
    age_group: string | null;
    gender_preference: string | null;
    budget_max: number | null;
  },
  distanceKm: number | null,
  reviewAvg: number
): number {
  let score = 0;

  if (distanceKm != null) {
    score += Math.max(0, 30 - distanceKm);
  }

  const specialtyOverlap = coach.specialties.filter((s) => prefs.specialties.includes(s)).length;
  score += specialtyOverlap * 15;

  if (prefs.age_group && coach.age_groups.includes(prefs.age_group)) {
    score += 20;
  }

  if (prefs.gender_preference && coach.gender === prefs.gender_preference) {
    score += 10;
  }

  if (prefs.budget_max) {
    if (coach.hourly_rate <= prefs.budget_max) {
      score += 15;
    } else {
      score -= (coach.hourly_rate - prefs.budget_max) * 2;
    }
  }

  score += reviewAvg * 4;

  return score;
}
