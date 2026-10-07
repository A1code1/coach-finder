"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StarInput } from "@/components/StarRating";

type ReviewContext = {
  coachId: string;
  coachName: string;
  coachPhoto: string | null;
  alreadyReviewed: boolean;
};

export default function LeaveReviewPage() {
  const params = useParams();
  const token = params.token as string;
  const [context, setContext] = useState<ReviewContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "This review link is not valid.");
        setContext(data);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!rating) {
      setError("Please choose a star rating.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save your review.");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;

  if (loadError || !context) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary-900 mb-3">Review link not found</h1>
        <p className="text-gray-600 mb-6">{loadError || "This review link is not valid."}</p>
        <Link href="/" className="text-primary-600 font-semibold hover:underline">
          Back to Coach Finder
        </Link>
      </div>
    );
  }

  if (done || context.alreadyReviewed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary-900 mb-3">
          {done ? "Thanks for your review!" : "You already reviewed this coach"}
        </h1>
        <p className="text-gray-600 mb-6">
          {done
            ? "Our team checks every review before it appears on the coach's profile."
            : "Each review link can be used once."}
        </p>
        <Link
          href={`/coach/${context.coachId}`}
          className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg"
        >
          View {context.coachName}&apos;s profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          {context.coachPhoto && (
            <img src={context.coachPhoto} alt="" className="w-16 h-16 rounded-full object-cover" />
          )}
          <div>
            <p className="text-sm text-gray-500">Leave a review for</p>
            <h1 className="text-2xl font-bold text-primary-900">{context.coachName}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              placeholder="e.g. Sanne (parent of Daan, 11)"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your experience (optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="How were the sessions? What improved?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg"
          >
            {submitting ? "Sending..." : "Submit review"}
          </button>
          <p className="text-xs text-gray-500 text-center">
            Reviews are checked by our team before they appear publicly.
          </p>
        </form>
      </div>
    </div>
  );
}
