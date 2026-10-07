import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";
import { CoachProfileClient } from "./CoachProfileClient";

type Props = { params: Promise<{ id: string }> };

async function getCoach(id: string) {
  const { data } = await supabase
    .from("coaches")
    .select("id, name, city, bio, photo_url, specialties, hourly_rate, years_experience")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  return data;
}

async function getRating(id: string) {
  const { data } = await supabase.from("reviews").select("rating").eq("coach_id", id).eq("status", "approved");
  if (!data || data.length === 0) return null;
  return { avg: data.reduce((sum, r) => sum + r.rating, 0) / data.length, count: data.length };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const coach = await getCoach(id);
  if (!coach) return { title: "Coach not found" };

  const focus = coach.specialties?.slice(0, 3).join(", ");
  const title = `${coach.name}, football coach in ${coach.city}`;
  const description =
    (coach.bio ? coach.bio.slice(0, 150).trim() + (coach.bio.length > 150 ? "…" : "") + " " : "") +
    `€${Number(coach.hourly_rate).toFixed(0)}/hour${focus ? ` · ${focus}` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: `/coach/${coach.id}` },
    openGraph: {
      title,
      description,
      url: `/coach/${coach.id}`,
      type: "profile",
      images: coach.photo_url ? [{ url: coach.photo_url, alt: coach.name }] : undefined,
    },
    twitter: { card: coach.photo_url ? "summary_large_image" : "summary", title, description },
  };
}

export default async function CoachProfilePage({ params }: Props) {
  const { id } = await params;
  const [coach, rating] = await Promise.all([getCoach(id), getRating(id)]);

  const jsonLd = coach
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: coach.name,
        jobTitle: "Football coach",
        description: coach.bio || undefined,
        image: coach.photo_url || undefined,
        url: `${SITE_URL}/coach/${coach.id}`,
        address: { "@type": "PostalAddress", addressLocality: coach.city, addressCountry: "NL" },
        ...(rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: rating.avg.toFixed(1),
                reviewCount: rating.count,
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <CoachProfileClient />
    </>
  );
}
