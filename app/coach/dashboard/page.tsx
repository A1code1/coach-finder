"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Coach } from "@/types/database";

export default function CoachDashboardPage() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        window.location.href = "/coach/login";
        return;
      }

      await fetchCoachProfile(data.user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachProfile = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      setCoach(data || null);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!coach ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 mb-4">
            You haven't created a profile yet.
          </p>
          <Link
            href="/coach/dashboard/create"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded"
          >
            Create Profile
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            const checks = [
              { label: "Add at least one photo", done: (coach.photo_urls?.length ?? 0) > 0 || !!coach.photo_url },
              { label: "Write a bio", done: !!coach.bio?.trim() },
              { label: "Set your years of experience", done: coach.years_experience > 0 },
              { label: "Pick at least one age group", done: coach.age_groups.length > 0 },
              { label: "Pick at least one specialty", done: coach.specialties.length > 0 },
              {
                label: "Add weekly availability",
                done: Object.values(coach.availability || {}).some((times) => times.length > 0),
              },
            ];
            const doneCount = checks.filter((c) => c.done).length;
            const percent = Math.round((doneCount / checks.length) * 100);

            if (percent === 100) return null;

            return (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Complete your profile</h3>
                  <span className="text-sm font-medium text-gray-600">{percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <ul className="space-y-1 mb-4">
                  {checks
                    .filter((c) => !c.done)
                    .map((c) => (
                      <li key={c.label} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">○</span> {c.label}
                      </li>
                    ))}
                </ul>
                <Link
                  href="/coach/dashboard/edit"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Complete Profile
                </Link>
              </div>
            );
          })()}

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{coach.name}</h2>
                <p className="text-gray-600">{coach.city}</p>
                <p className="text-primary-600 font-bold">
                  €{coach.hourly_rate.toFixed(2)}/hour
                </p>
              </div>
              <Link
                href="/coach/dashboard/edit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit Profile
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Status:</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-white font-bold ${
                  coach.status === "approved"
                    ? "bg-green-600"
                    : coach.status === "pending"
                      ? "bg-yellow-600"
                      : "bg-red-600"
                }`}
              >
                {coach.status.charAt(0).toUpperCase() + coach.status.slice(1)}
              </span>

              {coach.status === "pending" && (
                <p className="text-sm text-yellow-700 mt-2">
                  Your profile is awaiting admin approval. You'll receive an email once it's reviewed.
                </p>
              )}

              {coach.status === "rejected" && coach.rejection_reason && (
                <div className="mt-2 p-3 bg-red-50 rounded">
                  <p className="text-sm text-red-700">
                    <strong>Rejection reason:</strong> {coach.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
