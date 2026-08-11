"use client";

import { useState } from "react";
import { DUTCH_CITIES, searchCities } from "@/constants/dutch-cities";
import { SPECIALTIES } from "@/constants/specialties";

export type PrefsFormState = {
  city: string;
  radius_km: string;
  budget_max: string;
  age_group: string;
  specialties: string[];
  gender_preference: string;
};

export function PreferencesFields({
  form,
  setForm,
}: {
  form: PrefsFormState;
  setForm: (form: PrefsFormState) => void;
}) {
  const [cityDropdown, setCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(DUTCH_CITIES);

  const handleCityInput = (value: string) => {
    setForm({ ...form, city: value });
    if (value) {
      setFilteredCities(searchCities(value));
      setCityDropdown(true);
    } else {
      setCityDropdown(false);
    }
  };

  const toggleSpecialty = (s: string) => {
    setForm({
      ...form,
      specialties: form.specialties.includes(s)
        ? form.specialties.filter((x) => x !== s)
        : [...form.specialties, s],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your city</label>
        <div className="relative">
          <input
            type="text"
            value={form.city}
            onChange={(e) => handleCityInput(e.target.value)}
            onFocus={() => form.city && setCityDropdown(true)}
            placeholder="Search cities..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {cityDropdown && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-10">
              {filteredCities.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, city: c.name });
                    setCityDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-primary-50 transition"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search radius (km)</label>
        <select
          value={form.radius_km}
          onChange={(e) => setForm({ ...form, radius_km: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max budget per hour (€, optional)
        </label>
        <input
          type="number"
          value={form.budget_max}
          onChange={(e) => setForm({ ...form, budget_max: e.target.value })}
          placeholder="e.g., 40"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Who&apos;s training?</label>
        <select
          value={form.age_group}
          onChange={(e) => setForm({ ...form, age_group: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Any</option>
          <option value="kids">Kids</option>
          <option value="teens">Teens</option>
          <option value="adults">Adults</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Coach gender preference</label>
        <select
          value={form.gender_preference}
          onChange={(e) => setForm({ ...form, gender_preference: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">No preference</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to work on?</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                form.specialties.includes(s)
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
