"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DUTCH_CITIES, searchCities } from "@/constants/dutch-cities";
import { SPECIALTIES } from "@/constants/specialties";
import { useRequireAuth } from "@/lib/useRequireAuth";

function ShieldCheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

function MapPinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-7-6.5-7-11.5A7 7 0 0 1 19 9.5C19 14.5 12 21 12 21z"
      />
      <circle cx="12" cy="9.5" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.5 12.5l-8-8H4v8.5l8 8a1.5 1.5 0 0 0 2 0l6.5-6.5a1.5 1.5 0 0 0 0-2z"
      />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, checking } = useRequireAuth("/");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("10");
  const [specialty, setSpecialty] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(DUTCH_CITIES);
  const [showAllCities, setShowAllCities] = useState(false);

  const handleCityInput = (value: string) => {
    setCity(value);
    if (value) {
      setFilteredCities(searchCities(value));
      setCityDropdown(true);
    } else {
      setFilteredCities(DUTCH_CITIES);
      setCityDropdown(false);
    }
  };

  const selectCity = (cityName: string) => {
    setCity(cityName);
    setCityDropdown(false);
    setShowAllCities(false);
  };

  const handleSearch = () => {
    if (!city && !showAllCities) {
      alert("Please select a city or choose 'Show all'");
      return;
    }

    const params = new URLSearchParams({
      ...(showAllCities ? { showAll: "true" } : { city }),
      ...(showAllCities ? {} : { radius }),
      ...(specialty && { specialty }),
      ...(ageGroup && { ageGroup }),
      ...(gender && { gender }),
    });

    router.push(`/search?${params.toString()}`);
  };

  if (checking || !user) {
    return (
      <div className="flex items-center justify-center px-4 py-24">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2 lg:pt-6">
            <span className="inline-block mb-4 px-3 py-1 bg-primary-50 text-primary-600 text-xs font-semibold uppercase tracking-wide rounded-full">
              Netherlands-wide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4 leading-tight">
              Find a football coach you can trust
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Search by location, training needs, and availability. Compare profiles, message
              coaches directly, and read reviews from real players before you commit.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Every coach is reviewed by our team before their profile goes live.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Covers cities across the Netherlands, with distance-based search.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <TagIcon className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Free to browse and message. No booking fees, no middleman.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-lg font-semibold text-primary-900 mb-6">Search for a coach</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City or town</label>
                <div className="relative">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => city && setCityDropdown(true)}
                    placeholder="Search cities..."
                    disabled={showAllCities}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 disabled:opacity-50 disabled:bg-gray-50 placeholder-gray-400"
                  />
                  {cityDropdown && !showAllCities && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-10">
                      {filteredCities.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => selectCity(c.name)}
                          className="w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-700"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={showAllCities}
                    onChange={(e) => {
                      setShowAllCities(e.target.checked);
                      if (e.target.checked) setCity("");
                    }}
                    className="rounded accent-primary-600"
                  />
                  <span className="ml-2 text-sm text-gray-600">Show all coaches (nationwide)</span>
                </label>
              </div>

              {!showAllCities && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search radius</label>
                  <select
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender (optional)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty (optional)</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                  >
                    <option value="">Any</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age group (optional)</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                >
                  <option value="">Any</option>
                  <option value="kids">Kids</option>
                  <option value="teens">Teens</option>
                  <option value="adults">Adults</option>
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Search Coaches
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <ShieldCheckIcon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-primary-900 mb-1">Verified profiles</h3>
              <p className="text-sm text-gray-500">Every coach is reviewed before appearing in search.</p>
            </div>
            <div className="text-center">
              <MapPinIcon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-primary-900 mb-1">Nationwide coverage</h3>
              <p className="text-sm text-gray-500">Search by city, distance, or browse the whole country.</p>
            </div>
            <div className="text-center">
              <TagIcon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
              <h3 className="font-semibold text-primary-900 mb-1">No hidden fees</h3>
              <p className="text-sm text-gray-500">Browsing and messaging coaches is always free.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
