"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PreferencesFields, type PrefsFormState } from "@/components/PreferencesFields";
import { MatchList } from "@/components/MatchList";
import { findTopMatches, type MatchResult } from "@/lib/findMatches";

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [form, setForm] = useState<PrefsFormState>({
    city: "",
    radius_km: "25",
    budget_max: "",
    age_group: "",
    specialties: [],
    gender_preference: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace(
          `/player/login?next=${encodeURIComponent(`/player/quiz?next=${next}`)}`
        );
        return;
      }
      setUserId(data.user.id);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError("");
    setLoading(true);

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

      const results = await findTopMatches({
        city: prefs.city,
        specialties: prefs.specialties,
        age_group: prefs.age_group,
        gender_preference: prefs.gender_preference,
        budget_max: prefs.budget_max,
      });
      setMatches(results);
    } catch (err: any) {
      setError(err.message || "Failed to save your preferences");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (matches) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your top matches</h1>
        <p className="text-gray-600 mb-8">
          Based on what you told us, these coaches look like a great fit.
        </p>
        <MatchList matches={matches} />
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Link
            href={next}
            className="flex-1 text-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Continue to Coach Finder
          </Link>
          <Link
            href="/player/profile"
            className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
          >
            Edit my preferences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tell us what you&apos;re looking for</h1>
      <p className="text-gray-600 mb-8">
        A few quick questions so we can suggest your best-fit coaches.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <PreferencesFields form={form} setForm={setForm} />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          {loading ? "Finding matches..." : "Show my matches"}
        </button>
        <Link href={next} className="block text-center text-gray-500 hover:text-gray-700 text-sm">
          Skip for now
        </Link>
      </form>
    </div>
  );
}

export default function PlayerQuizPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <QuizContent />
    </Suspense>
  );
}
