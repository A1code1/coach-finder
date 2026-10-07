import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoachCard } from "@/components/CoachCard";
import { citySlug, getCityBySlug, uniqueCities } from "@/lib/site";
import { CITY_PAGE_RADIUS_KM, getCoachesNear } from "@/lib/coachDirectory";

export const revalidate = 3600;

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return uniqueCities().map((city) => ({ city: citySlug(city.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "City not found" };

  const coaches = await getCoachesNear(city);
  const title = `Football coaches in ${city.name}`;
  const description = `Compare ${coaches.length > 0 ? `${coaches.length} ` : ""}verified football coaches in and around ${city.name}. See prices, specialties, availability and reviews, then contact a coach directly.`;

  return {
    title,
    description,
    alternates: { canonical: `/coaches/${slug}` },
    openGraph: { title, description, url: `/coaches/${slug}` },
  };
}

export default async function CityCoachesPage({ params }: Props) {
  const { city: slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const coaches = await getCoachesNear(city);
  const prices = coaches.map((c) => Number(c.coach.hourly_rate));
  const nearbyCities = uniqueCities()
    .filter((c) => c.name !== city.name)
    .slice(0, 12);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <Link href="/coaches" className="hover:underline">Coaches by city</Link> / {city.name}
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-3">Football coaches in {city.name}</h1>
      <p className="text-gray-600 text-lg mb-8 max-w-3xl">
        {coaches.length > 0
          ? `${coaches.length} verified coach${coaches.length !== 1 ? "es" : ""} within ${CITY_PAGE_RADIUS_KM} km of ${city.name}` +
            (prices.length ? `, from €${Math.min(...prices).toFixed(0)} to €${Math.max(...prices).toFixed(0)} per hour.` : ".")
          : `We don't have coaches within ${CITY_PAGE_RADIUS_KM} km of ${city.name} yet.`}{" "}
        Every profile is checked by our team before it goes live.
      </p>

      {coaches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {coaches.map(({ coach, rating, distanceKm }) => (
            <CoachCard key={coach.id} coach={coach} rating={rating} distanceKm={distanceKm} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center mb-12">
          <p className="text-gray-600 mb-4">Try a wider search, or browse coaches across the Netherlands.</p>
          <Link
            href="/search?showAll=true"
            className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg"
          >
            Show all coaches
          </Link>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-primary-900 mb-3">Football coaches in other cities</h2>
        <div className="flex flex-wrap gap-2">
          {nearbyCities.map((c) => (
            <Link
              key={c.name}
              href={`/coaches/${citySlug(c.name)}`}
              className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/coaches" className="text-sm px-3 py-1.5 text-primary-600 hover:underline">
            All cities →
          </Link>
        </div>
      </div>
    </div>
  );
}
