import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL, citySlug, uniqueCities } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: coaches } = await supabase
    .from("coaches")
    .select("id, updated_at")
    .eq("status", "approved");

  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/coaches`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/donations`, changeFrequency: "weekly", priority: 0.5 },
    ...uniqueCities().map((city) => ({
      url: `${SITE_URL}/coaches/${citySlug(city.name)}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...(coaches || []).map((coach) => ({
      url: `${SITE_URL}/coach/${coach.id}`,
      lastModified: coach.updated_at ? new Date(coach.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
