"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PreferencesFields, type PrefsFormState } from "@/components/PreferencesFields";
import { MatchList } from "@/components/MatchList";
import { findTopMatches, type MatchResult } from "@/lib/findMatches";
import { Skeleton } from "@/components/Skeleton";

const EMPTY_FORM: PrefsFormState = {
  city: "",
  radius_km: "25",
  budget_max: "",
  age_group: "",
  specialties: [],
  gender_preference: "",
};

export default function PlayerProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [form, setForm] = useState<PrefsFormState>(EMPTY_FORM);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/player/login?next=/player/profile");
      return;
    }
    setUserId(userData.user.id);

    const { data: prefs } = await supabase
      .from("player_preferences")
      .select("*")
      .eq("player_id", userData.user.id)
      .maybeSingle();

    const loadedForm: PrefsFormState = prefs
      ? {
          city: prefs.city || "",
          radius_km: String(prefs.radius_km || 25),
          budget_max: prefs.budget_max?.toString() || "",
          age_group: prefs.age_group || "",
          specialties: prefs.specialties || [],
          gender_preference: prefs.gender_preference || "",
        }
      : EMPTY_FORM;

    setForm(loadedForm);
    if (prefs) await refreshMatches(loadedForm);
    setLoading(false);
  };

  const refreshMatches = async (f: PrefsFormState) => {
    const results = await findTopMatches({
      city: f.city || null,
      specialties: f.specialties,
      age_group: f.age_group || null,
      gender_preference: f.gender_preference || null,
      budget_max: f.budget_max ? parseFloat(f.budget_max) : null,
    });
    setMatches(results);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError("");
    setSaved(false);
    setSaving(true);

    try {
      const prefs = {
        player_id: userId,
        city: form.city || null,
        radius_km: parseInt(form.radius_km) || 25,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : null,
        age_group: form.age_group || null,
        specialties: form.specialties,
        gender_preference: form.gender_preference || null,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase.from("player_preferences").upsert(prefs);
      if (upsertError) throw upsertError;

      await refreshMatches(form);
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900">Training preferences</h2>
          <PreferencesFields form={form} setForm={setForm} />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
          {saved && <p className="text-green-600 text-sm text-center">Saved!</p>}
        </form>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your top matches</h2>
          <MatchList matches={matches} columns={1} />
        </div>
      </div>
    </div>
  );
}
