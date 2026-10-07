"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StarRating } from "@/components/StarRating";
import type { Review } from "@/types/database";

type ReviewStatus = Review["status"];
type ReviewRow = Review & { coaches: { name: string } | null };

export default function AdminReviewsPage() {
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<ReviewStatus>("pending");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (ready) fetchReviews();
  }, [ready, filter]);

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      window.location.href = "/admin/login";
      return;
    }
    const { data: adminRow } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (!adminRow) {
      window.location.href = "/admin/login";
      return;
    }
    setReady(true);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, coaches(name)")
      .eq("status", filter)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error(error);
      return;
    }
    setReviews((data as ReviewRow[]) || []);
  };

  const setStatus = async (id: string, status: ReviewStatus) => {
    try {
      setActionLoading(id);
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
      setReviews((current) => current.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to update review");
    } finally {
      setActionLoading(null);
    }
  };

  if (!ready) return <div className="text-center py-12">Loading...</div>;

  const tabs: ReviewStatus[] = ["pending", "approved", "rejected"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Moderation</h1>
        <Link href="/admin/coaches" className="text-primary-600 font-medium hover:underline">
          ← Coaches
        </Link>
      </div>

      <div className="mb-6 flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded font-medium capitalize ${
              filter === tab ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded text-center text-gray-600">No reviews to display</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <p className="text-sm text-gray-500">
                    For{" "}
                    <Link href={`/coach/${review.coach_id}`} className="text-primary-600 hover:underline">
                      {review.coaches?.name ?? "Unknown coach"}
                    </Link>
                  </p>
                  <p className="font-semibold text-gray-900">{review.reviewer_name}</p>
                </div>
                <div className="text-right">
                  <StarRating rating={review.rating} />
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {review.comment && <p className="text-gray-700 mb-4 whitespace-pre-line">{review.comment}</p>}
              {!review.contact_reveal_id && (
                <p className="text-xs text-amber-700 mb-3">Not linked to a contact reveal (seed or legacy review).</p>
              )}
              <div className="flex gap-3">
                {filter !== "approved" && (
                  <button
                    onClick={() => setStatus(review.id, "approved")}
                    disabled={actionLoading === review.id}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                  >
                    Approve
                  </button>
                )}
                {filter !== "rejected" && (
                  <button
                    onClick={() => setStatus(review.id, "rejected")}
                    disabled={actionLoading === review.id}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
                  >
                    {filter === "approved" ? "Remove" : "Reject"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
