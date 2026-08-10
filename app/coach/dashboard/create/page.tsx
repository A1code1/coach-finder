"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SPECIALTIES, AGE_GROUPS } from "@/constants/specialties";
import { DUTCH_CITIES, searchCities } from "@/constants/dutch-cities";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function CreateCoachProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(DUTCH_CITIES);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const [form, setForm] = useState<{
    name: string;
    bio: string;
    years_experience: string;
    hourly_rate: string;
    age_groups: string[];
    specialties: string[];
    city: string;
    training_locations: string[];
    availability: Record<string, string[]>;
  }>({
    name: "",
    bio: "",
    years_experience: "",
    hourly_rate: "",
    age_groups: [],
    specialties: [],
    city: "",
    training_locations: [""],
    availability: Object.fromEntries(DAYS.map((day) => [day, []])) as Record<string, string[]>,
  });

  const handleCityInput = (value: string) => {
    setCityInput(value);
    if (value) {
      setFilteredCities(searchCities(value));
      setCityDropdown(true);
    }
  };

  const selectCity = (cityName: string) => {
    setForm((prev) => ({ ...prev, city: cityName }));
    setCityInput(cityName);
    setCityDropdown(false);
  };

  const toggleSelection = (value: string, array: string[]) => {
    return array.includes(value)
      ? array.filter((v) => v !== value)
      : [...array, value];
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Photo must be under 2MB");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null;

    try {
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("coach-photos")
        .upload(`photos/${fileName}`, photoFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("coach-photos")
        .getPublicUrl(`photos/${fileName}`);

      return data.publicUrl;
    } catch (err) {
      console.error("Photo upload failed:", err);
      throw new Error("Failed to upload photo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.city || !form.years_experience || !form.hourly_rate) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) throw new Error("Not authenticated");

      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadPhoto(user.user.id);
      }

      const coachData = {
        user_id: user.user.id,
        name: form.name,
        bio: form.bio,
        years_experience: parseInt(form.years_experience),
        hourly_rate: parseFloat(form.hourly_rate),
        age_groups: form.age_groups,
        specialties: form.specialties,
        city: form.city,
        training_locations: form.training_locations.filter((l) => l.trim()),
        availability: form.availability,
        photo_url: photoUrl,
        status: "pending",
      };

      const { error: insertError } = await supabase
        .from("coaches")
        .insert([coachData]);

      if (insertError) throw insertError;

      router.push("/coach/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Your Coach Profile</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo (max 2MB)
          </label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
            </div>
            {photoPreview && (
              <div className="w-24 h-24">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience *
            </label>
            <input
              type="number"
              value={form.years_experience}
              onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate (€) *
            </label>
            <input
              type="number"
              step="0.01"
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <div className="relative">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => handleCityInput(e.target.value)}
              onFocus={() => cityInput && setCityDropdown(true)}
              placeholder="Search cities..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {cityDropdown && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-10">
                {filteredCities.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => selectCity(c.name)}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Groups
          </label>
          <div className="space-y-2">
            {AGE_GROUPS.map((group) => (
              <label key={group} className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.age_groups.includes(group)}
                  onChange={() => {
                    setForm({
                      ...form,
                      age_groups: toggleSelection(group, form.age_groups),
                    });
                  }}
                  className="rounded"
                />
                <span className="ml-2 text-gray-700 capitalize">{group}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialties
          </label>
          <div className="space-y-2">
            {SPECIALTIES.map((specialty) => (
              <label key={specialty} className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.specialties.includes(specialty)}
                  onChange={() => {
                    setForm({
                      ...form,
                      specialties: toggleSelection(specialty, form.specialties),
                    });
                  }}
                  className="rounded"
                />
                <span className="ml-2 text-gray-700">{specialty}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training Locations
          </label>
          {form.training_locations.map((location, idx) => (
            <input
              key={idx}
              type="text"
              value={location}
              onChange={(e) => {
                const newLocations = [...form.training_locations];
                newLocations[idx] = e.target.value;
                setForm({ ...form, training_locations: newLocations });
              }}
              placeholder="e.g., City Sports Complex"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          ))}
          <button
            type="button"
            onClick={() => {
              setForm({
                ...form,
                training_locations: [...form.training_locations, ""],
              });
            }}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            + Add Location
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Weekly Availability
          </label>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day}>
                <label className="text-gray-700 font-medium capitalize">{day}</label>
                <input
                  type="text"
                  placeholder="e.g., 18:00-20:00, 20:00-21:30"
                  value={(form.availability[day] || []).join(", ")}
                  onChange={(e) => {
                    const times = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t);
                    setForm({
                      ...form,
                      availability: { ...form.availability, [day]: times },
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {loading ? "Creating Profile..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
