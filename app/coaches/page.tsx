import type { Metadata } from "next";
import Link from "next/link";
import { getCityByName } from "@/constants/dutch-cities";
import { citySlug, uniqueCities } from "@/lib/site";
import { CITY_PAGE_RADIUS_KM, getApprovedCoachesWithRatings } from "@/lib/coachDirectory";
import { haversineDistance } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Football coaches by city",
  description: "Find verified football coaches in cities across the Netherlands, from Amsterdam and Rotterdam to Groningen and Maastricht.",
  alternates: { canonical: "/coaches" },
};

export default async function CoachesByCityPage() {
  const coaches = await getApprovedCoachesWithRatings();
  const cities = uniqueCities()
    .map((city) => {
      const count = coaches.filter(({ coach }) => {
        const coachCity = getCityByName(coach.city);
        return coachCity && haversineDistance(city.lat, city.lng, coachCity.lat, coachCity.lng) <= CITY_PAGE_RADIUS_KM;
      }).length;
      return { city, count };
    })
    .sort((a, b) => a.city.name.localeCompare(b.city.name));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-3">Football coaches by city</h1>
      <p className="text-gray-600 text-lg mb-8">Pick a city to see verified coaches within {CITY_PAGE_RADIUS_KM} km.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cities.map(({ city, count }) => (
          <Link
            key={city.name}
            href={`/coaches/${citySlug(city.name)}`}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-primary-600 hover:shadow-sm transition"
          >
            <span className="font-medium text-primary-900">{city.name}</span>
            <span className="block text-sm text-gray-500">
              {count} coach{count !== 1 ? "es" : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
