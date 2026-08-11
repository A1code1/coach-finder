"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DUTCH_CITIES, searchCities } from "@/constants/dutch-cities";
import { SPECIALTIES } from "@/constants/specialties";
import { useRequireAuth } from "@/lib/useRequireAuth";

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
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-dark-textSecondary text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-primary-500 bg-opacity-20 border border-primary-500 border-opacity-40 rounded-full">
            <span className="text-primary-500 font-bold text-sm uppercase tracking-widest">💪 Peak Performance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent">
            Unlock Your Athletic Potential
          </h1>
          <p className="text-xl text-dark-textSecondary">
            Train with elite coaches. Master your game. Achieve championship performance.
          </p>
        </div>

        <div className="bg-dark-card border border-primary-600 border-opacity-30 rounded-lg shadow-2xl p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-primary-400 mb-2 uppercase tracking-wider">
                City or Town
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => handleCityInput(e.target.value)}
                  onFocus={() => city && setCityDropdown(true)}
                  placeholder="Search cities..."
                  disabled={showAllCities}
                  className="w-full px-4 py-2 bg-dark-surface border border-primary-600 border-opacity-30 text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:opacity-50 disabled:bg-dark-surface placeholder-dark-textSecondary"
                />
                {cityDropdown && !showAllCities && (
                  <div className="absolute top-full left-0 right-0 bg-dark-surface border border-primary-600 border-opacity-30 rounded-lg shadow-2xl mt-1 max-h-64 overflow-y-auto z-10">
                    {filteredCities.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => selectCity(c.name)}
                        className="w-full text-left px-4 py-2 hover:bg-primary-600 hover:bg-opacity-20 transition text-dark-text hover:text-primary-400"
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
                  className="rounded accent-primary-500"
                />
                <span className="ml-2 text-sm text-dark-textSecondary">Show all coaches (nationwide)</span>
              </label>
            </div>

            {!showAllCities && (
              <div>
                <label className="block text-sm font-bold text-primary-400 mb-2 uppercase tracking-wider">
                  Search Radius (km)
                </label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-primary-600 border-opacity-30 text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
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
                <label className="block text-sm font-bold text-primary-400 mb-2 uppercase tracking-wider">
                  Gender (optional)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-primary-600 border-opacity-30 text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary-400 mb-2 uppercase tracking-wider">
                  Specialty (optional)
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-surface border border-primary-600 border-opacity-30 text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
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
              <label className="block text-sm font-bold text-primary-400 mb-2 uppercase tracking-wider">
                Age Group (optional)
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-4 py-2 bg-dark-surface border border-primary-600 border-opacity-30 text-dark-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
              >
                <option value="">Any</option>
                <option value="kids">Kids</option>
                <option value="teens">Teens</option>
                <option value="adults">Adults</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-black font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 uppercase tracking-widest shadow-lg"
            >
              🔥 Start Your Peak Performance
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">500+</div>
            <div className="text-sm text-dark-textSecondary">Elite Coaches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">50</div>
            <div className="text-sm text-dark-textSecondary">Dutch Cities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">4.9★</div>
            <div className="text-sm text-dark-textSecondary">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
