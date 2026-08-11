"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SPECIALTIES, AGE_GROUPS } from "@/constants/specialties";
import { DUTCH_CITIES, searchCities } from "@/constants/dutch-cities";
import { TIME_SLOTS, DAYS } from "@/constants/time-slots";
import type { Coach } from "@/types/database";

const MAX_PHOTOS = 6;

type FormState = {
  name: string;
  bio: string;
  years_experience: string;
  hourly_rate: string;
  age_groups: string[];
  specialties: string[];
  city: string;
  training_locations: string[];
  availability: Record<string, string[]>;
};

export function CoachProfileForm({
  mode,
  initialCoach,
}: {
  mode: "create" | "edit";
  initialCoach?: Coach;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cityInput, setCityInput] = useState(initialCoach?.city || "");
  const [cityDropdown, setCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(DUTCH_CITIES);

  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(
    initialCoach?.photo_urls?.length
      ? initialCoach.photo_urls
      : initialCoach?.photo_url
        ? [initialCoach.photo_url]
        : []
  );
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([]);

  const [form, setForm] = useState<FormState>({
    name: initialCoach?.name || "",
    bio: initialCoach?.bio || "",
    years_experience: initialCoach?.years_experience?.toString() || "",
    hourly_rate: initialCoach?.hourly_rate?.toString() || "",
    age_groups: initialCoach?.age_groups || [],
    specialties: initialCoach?.specialties || [],
    city: initialCoach?.city || "",
    training_locations: initialCoach?.training_locations?.length
      ? initialCoach.training_locations
      : [""],
    availability:
      initialCoach?.availability && Object.keys(initialCoach.availability).length
        ? initialCoach.availability
        : (Object.fromEntries(DAYS.map((day) => [day, []])) as Record<string, string[]>),
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

  const toggleSelection = (value: string, array: string[]) =>
    array.includes(value) ? array.filter((v) => v !== value) : [...array, value];

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalCount = existingPhotoUrls.length + newPhotoFiles.length + files.length;
    if (totalCount > MAX_PHOTOS) {
      setError(`You can have up to ${MAX_PHOTOS} photos`);
      e.target.value = "";
      return;
    }

    const oversized = files.find((f) => f.size > 2 * 1024 * 1024);
    if (oversized) {
      setError("Each photo must be under 2MB");
      e.target.value = "";
      return;
    }

    setError("");
    setNewPhotoFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotoUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (userId: string): Promise<string[]> => {
    const uploaded: string[] = [];

    for (const file of newPhotoFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("coach-photos")
        .upload(`photos/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("coach-photos").getPublicUrl(`photos/${fileName}`);
      uploaded.push(data.publicUrl);
    }

    return uploaded;
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

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("Not authenticated");

      const uploadedUrls = await uploadPhotos(userData.user.id);
      const photoUrls = [...existingPhotoUrls, ...uploadedUrls];

      const coachData = {
        name: form.name,
        bio: form.bio,
        years_experience: parseInt(form.years_experience),
        hourly_rate: parseFloat(form.hourly_rate),
        age_groups: form.age_groups,
        specialties: form.specialties,
        city: form.city,
        training_locations: form.training_locations.filter((l) => l.trim()),
        availability: form.availability,
        photo_url: photoUrls[0] || null,
        photo_urls: photoUrls,
      };

      if (mode === "create") {
        const { error: insertError } = await supabase
          .from("coaches")
          .insert([{ ...coachData, user_id: userData.user.id, status: "pending" }]);

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("coaches")
          .update(coachData)
          .eq("id", initialCoach!.id);

        if (updateError) throw updateError;
      }

      router.push("/coach/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {mode === "create" ? "Create Your Coach Profile" : "Edit Your Coach Profile"}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos (up to {MAX_PHOTOS}, max 2MB each)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {existingPhotoUrls.map((url) => (
              <div key={url} className="relative aspect-square">
                <img
                  src={url}
                  alt="Coach photo"
                  className="w-full h-full object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(url)}
                  aria-label="Remove photo"
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            {newPhotoPreviews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square">
                <img
                  src={preview}
                  alt="New photo preview"
                  className="w-full h-full object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeNewPhoto(idx)}
                  aria-label="Remove photo"
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {existingPhotoUrls.length + newPhotoFiles.length < MAX_PHOTOS && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          )}
          <p className="text-xs text-gray-500 mt-1">
            The first photo is used as your main profile picture. JPG, PNG up to 2MB each.
          </p>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Age Groups</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Training Locations</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-3">Weekly Availability</label>
          <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(4,1fr)] bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-200 min-w-[520px]">
              <div className="p-2"></div>
              {TIME_SLOTS.map((slot) => (
                <div key={slot} className="p-2 text-center">
                  {slot.split(" (")[0]}
                </div>
              ))}
            </div>
            {DAYS.map((day) => {
              const dayTimes = form.availability[day] || [];
              const legacy = dayTimes.filter((t) => !(TIME_SLOTS as readonly string[]).includes(t));
              return (
                <div
                  key={day}
                  className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-gray-100 last:border-b-0 min-w-[520px]"
                >
                  <div className="p-2 text-sm font-medium text-gray-700 capitalize self-center">{day}</div>
                  {TIME_SLOTS.map((slot) => {
                    const active = dayTimes.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          const times = active
                            ? dayTimes.filter((t) => t !== slot)
                            : [...dayTimes, slot];
                          setForm({
                            ...form,
                            availability: { ...form.availability, [day]: times },
                          });
                        }}
                        className={`m-1 py-2 rounded text-xs font-medium transition ${
                          active
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {active ? "✓" : ""}
                      </button>
                    );
                  })}
                  {legacy.length > 0 && (
                    <div className="col-start-2 col-span-4 px-1 pb-2 flex flex-wrap gap-1">
                      {legacy.map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded flex items-center gap-1"
                        >
                          {t}
                          <button
                            type="button"
                            aria-label={`Remove ${t}`}
                            onClick={() =>
                              setForm({
                                ...form,
                                availability: {
                                  ...form.availability,
                                  [day]: dayTimes.filter((x) => x !== t),
                                },
                              })
                            }
                            className="font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">Tap a time slot to toggle your availability for that day.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {loading
            ? mode === "create"
              ? "Creating Profile..."
              : "Saving Changes..."
            : mode === "create"
              ? "Create Profile"
              : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
