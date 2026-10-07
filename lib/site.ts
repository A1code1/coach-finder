import { DUTCH_CITIES, type City } from "@/constants/dutch-cities";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://coach-finder-eta.vercel.app").replace(/\/$/, "");

export function citySlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Unique cities (the lookup table has a duplicate entry), in table order.
export function uniqueCities(): City[] {
  const seen = new Set<string>();
  return DUTCH_CITIES.filter((city) => {
    const slug = citySlug(city.name);
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

export function getCityBySlug(slug: string): City | undefined {
  return uniqueCities().find((city) => citySlug(city.name) === slug);
}
