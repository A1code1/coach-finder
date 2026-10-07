import { DAYS, TIME_SLOTS } from "@/constants/time-slots";

export const TRIAL_DAYS_AHEAD = 21;

// "YYYY-MM-DD" -> "monday" ... "sunday". Uses noon UTC so time zones can't shift the day.
export function weekdayOf(isoDate: string) {
  const day = new Date(`${isoDate}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return DAYS[(day + 6) % 7];
}

export function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Time slots a coach offers on a given date. A coach with no availability set accepts any slot.
export function slotsForDate(availability: Record<string, string[]> | null | undefined, isoDate: string) {
  const all = TIME_SLOTS as readonly string[];
  const hasAny = Object.values(availability || {}).some((t) => t.length > 0);
  if (!hasAny) return [...all];
  return (availability?.[weekdayOf(isoDate)] || []).filter((t) => all.includes(t));
}

export function formatTrialDate(isoDate: string) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
