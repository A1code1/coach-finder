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
