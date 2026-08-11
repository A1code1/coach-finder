"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { FavoriteButton } from "@/components/FavoriteButton";
import type { Coach } from "@/types/database";

type FavoriteCoach = Coach & { avgRating: number; reviewCount: number };

export default function FavoritesPage() {
  const { user, checking } = useRequireAuth("/favorites");
  const [coaches, setCoaches] = useState<FavoriteCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);

      const { data: favRows, error: favError } = await supabase
        .from("favorites")
        .select("coach_id")
        .eq("player_id", user!.id);

      if (favError) throw favError;

      const coachIds = (favRows || []).map((row) => row.coach_id);
      if (coachIds.length === 0) {
        setCoaches([]);
        return;
      }

      const { data: coachRows, error: coachError } = await supabase
        .from("coaches")
        .select("*")
        .in("id", coachIds);

      if (coachError) throw coachError;

      const { data: reviewRows, error: reviewsError } = await supabase
        .from("reviews")
        .select("coach_id, rating")
        .eq("status", "approved")
        .in("coach_id", coachIds);

      if (reviewsError) throw reviewsError;

      const totals: Record<string, { sum: number; count: number }> = {};
      (reviewRows || []).forEach((row) => {
        const entry = totals[row.coach_id] || { sum: 0, count: 0 };
        entry.sum += row.rating;
        entry.count += 1;
        totals[row.coach_id] = entry;
      });

      const enriched: FavoriteCoach[] = (coachRows || []).map((c) => ({
        ...c,
        avgRating: totals[c.id] ? totals[c.id].sum / totals[c.id].count : 0,
        reviewCount: totals[c.id]?.count ?? 0,
      }));

      setCoaches(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (coachId: string) => {
    setCoaches((prev) => prev.filter((c) => c.id !== coachId));
  };

  if (checking || loading) return <div className="text-center py-12">Loading...</div>;

  const cheapestRate = coaches.length ? Math.min(...coaches.map((c) => c.hourly_rate)) : null;
  const reviewedCoaches = coaches.filter((c) => c.reviewCount > 0);
  const highestRating = reviewedCoaches.length
    ? Math.max(...reviewedCoaches.map((c) => c.avgRating))
    : null;
  const mostExperience = coaches.length
    ? Math.max(...coaches.map((c) => c.years_experience))
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Favorites</h1>
      <p className="text-gray-600 mb-8">Compare your saved coaches side by side.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {coaches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          You haven't favorited any coaches yet. Tap the heart icon on a coach card to add one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500 w-40"> </th>
                {coaches.map((c) => (
                  <th key={c.id} className="p-4 text-left align-top min-w-[200px] border-l border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/coach/${c.id}`} className="font-bold text-gray-900 hover:text-primary-600">
                        {c.name}
                      </Link>
                      <FavoriteButton
                        coachId={c.id}
                        initialFavorited={true}
                        onToggle={(favorited) => !favorited && handleRemove(c.id)}
                        className="text-accent-500"
                      />
                    </div>
                    <p className="text-gray-500 text-sm">{c.city}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 text-sm font-medium text-gray-500 border-t border-gray-100">Rate</td>
                {coaches.map((c) => (
                  <td
                    key={c.id}
                    className={`p-4 border-t border-l border-gray-100 ${
                      c.hourly_rate === cheapestRate ? "text-green-600 font-bold" : "text-gray-900"
                    }`}
                  >
                    €{c.hourly_rate.toFixed(2)}/hour
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm font-medium text-gray-500 border-t border-gray-100">Rating</td>
                {coaches.map((c) => (
                  <td
                    key={c.id}
                    className={`p-4 border-t border-l border-gray-100 ${
                      c.reviewCount > 0 && c.avgRating === highestRating
                        ? "text-green-600 font-bold"
                        : "text-gray-900"
                    }`}
                  >
                    {c.reviewCount > 0 ? `★ ${c.avgRating.toFixed(1)} (${c.reviewCount})` : "No reviews yet"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm font-medium text-gray-500 border-t border-gray-100">Experience</td>
                {coaches.map((c) => (
                  <td
                    key={c.id}
                    className={`p-4 border-t border-l border-gray-100 ${
                      c.years_experience === mostExperience ? "text-green-600 font-bold" : "text-gray-900"
                    }`}
                  >
                    {c.years_experience} years
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm font-medium text-gray-500 border-t border-gray-100">Age Groups</td>
                {coaches.map((c) => (
                  <td key={c.id} className="p-4 border-t border-l border-gray-100 text-gray-700 text-sm">
                    {c.age_groups.join(", ") || "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-sm font-medium text-gray-500 border-t border-gray-100">Specialties</td>
                {coaches.map((c) => (
                  <td key={c.id} className="p-4 border-t border-l border-gray-100 text-gray-700 text-sm">
                    {c.specialties.join(", ") || "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-t border-gray-100 rounded-bl-lg"> </td>
                {coaches.map((c) => (
                  <td key={c.id} className="p-4 border-t border-l border-gray-100">
                    <Link
                      href={`/coach/${c.id}/message`}
                      className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      Message
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
