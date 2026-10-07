"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { RatingBadge } from "@/components/RatingBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { AvailabilityGrid } from "@/components/AvailabilityGrid";
import { Skeleton } from "@/components/Skeleton";
import { StarRating } from "@/components/StarRating";
import { useCurrentUser } from "@/lib/useCurrentUser";
import type { Coach, Review } from "@/types/database";
import { whatsappLink } from "@/lib/utils";

export function CoachProfileClient() {
  const params = useParams();
  const coachId = params.id as string;
  const { user, checking } = useCurrentUser();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [reviews, setReviews] = useState<Pick<Review, "id" | "reviewer_name" | "rating" | "comment" | "created_at">[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [playerEmail, setPlayerEmail] = useState("");
  const [emailStep, setEmailStep] = useState(false);
  const [revealError, setRevealError] = useState("");

  useEffect(() => {
    if (!checking) fetchCoach();
  }, [checking, user, coachId]);

  const fetchCoach = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("coaches")
        .select("*")
        .eq("id", coachId)
        .eq("status", "approved")
        .single();

      if (fetchError) throw new Error("Coach not found");
      setCoach(data);
      await Promise.all([fetchReviewStats(coachId), fetchFavoriteStatus(coachId), trackView(data)]);
    } catch (err) {
      setError("Failed to load coach profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async (id: string) => {
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, reviewer_name, rating, comment, created_at")
      .eq("coach_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error(reviewsError);
      return;
    }

    setReviews(reviews || []);
    if (!reviews || reviews.length === 0) {
      setReviewStats({ avg: 0, count: 0 });
      return;
    }

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    setReviewStats({ avg: sum / reviews.length, count: reviews.length });
  };

  const fetchFavoriteStatus = async (id: string) => {
    if (!user) return;

    const { data, error: favError } = await supabase
      .from("favorites")
      .select("id")
      .eq("coach_id", id)
      .eq("player_id", user.id)
      .maybeSingle();

    if (favError) {
      console.error(favError);
      return;
    }

    setIsFavorited(!!data);
  };

  const trackView = async (coachRow: Coach) => {
    if (user && user.id === coachRow.user_id) return;
    try {
      await supabase.from("profile_views").insert({ coach_id: coachRow.id, viewer_id: user?.id ?? null });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevealContact = async () => {
    setRevealError("");
    try {
      const res = await fetch("/api/contact-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coachId, email: playerEmail || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRevealError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setShowContact(true);
    } catch (err) {
      console.error(err);
      setRevealError("Something went wrong. Please try again.");
    }
  };

  if (checking || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8">
          <Skeleton className="h-96 w-full mb-8 rounded-lg" />
          <Skeleton className="h-8 w-64 mb-3" />
          <Skeleton className="h-4 w-32 mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }
  if (error || !coach)
    return (
      <div className="text-center py-12 text-red-600">{error || "Coach not found"}</div>
    );

  const photos = coach.photo_urls?.length ? coach.photo_urls : coach.photo_url ? [coach.photo_url] : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {photos.length > 0 && (
          <div>
            <div className="h-96 bg-gray-200 overflow-hidden">
              <img
                src={photos[selectedPhoto] || photos[0]}
                alt={coach.name}
                className="w-full h-full object-cover"
              />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                {photos.map((url, idx) => (
                  <button
                    key={url}
                    onClick={() => setSelectedPhoto(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      idx === selectedPhoto ? "border-primary-600" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt={`${coach.name} photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-bold text-gray-900">{coach.name}</h1>
                <VerifiedBadge className="mt-1" />
              </div>
              <p className="text-gray-600 text-lg">{coach.city}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <FavoriteButton
                  coachId={coachId}
                  initialFavorited={isFavorited}
                  className="text-gray-400 hover:text-accent-500"
                />
                <RatingBadge avg={reviewStats.avg} count={reviewStats.count} className="text-gray-600" />
              </div>
              <p className="text-3xl font-bold text-primary-600">
                €{coach.hourly_rate.toFixed(2)}<span className="text-sm text-gray-600">/hour</span>
              </p>
            </div>
          </div>

          <Link
            href={`/coach/${coachId}/message`}
            className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition mb-8"
          >
            Message Coach
          </Link>

          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 text-lg mb-4">{coach.bio}</p>
            <p className="text-gray-600">
              <strong>Experience:</strong> {coach.years_experience} years
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Age Groups</h3>
              <div className="flex flex-wrap gap-2">
                {coach.age_groups.map((group) => (
                  <span
                    key={group}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {coach.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Training Locations</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {coach.training_locations.map((location) => (
                <li key={location}>{location}</li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Availability</h3>
            <AvailabilityGrid availability={coach.availability} />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
              {reviewStats.count > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <StarRating rating={Math.round(reviewStats.avg)} />
                  <span>
                    {reviewStats.avg.toFixed(1)} · {reviewStats.count} review{reviewStats.count !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">{review.reviewer_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.comment && <p className="text-gray-700 mt-2 whitespace-pre-line">{review.comment}</p>}
                  </div>
                ))}
                {reviews.length > 5 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    {showAllReviews ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
                  </button>
                )}
              </div>
            )}
          </div>

          {!showContact ? (
            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Interested? Reveal Contact Info
              </h3>

              {!emailStep ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Would you like to receive a review link to leave feedback after your session?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEmailStep(true)}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Yes, send me the link
                    </button>
                    <button
                      onClick={() => handleRevealContact()}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded"
                    >
                      Just show contact info
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="email"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => handleRevealContact()}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Reveal Contact & Send Review Link
                  </button>
                </>
              )}
              {revealError && <p className="text-red-600 text-sm mt-3">{revealError}</p>}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-green-900 mb-4">Contact Information</h3>
              <div className="space-y-2">
                {coach.email && (
                  <p className="text-gray-700">
                    <strong>Email:</strong> <a href={`mailto:${coach.email}`} className="text-primary-600 hover:underline">{coach.email}</a>
                  </p>
                )}
                {coach.phone && (
                  <p className="text-gray-700">
                    <strong>Phone:</strong> <a href={`tel:${coach.phone}`} className="text-primary-600 hover:underline">{coach.phone}</a>
                  </p>
                )}
              </div>
              {coach.phone && whatsappLink(coach.phone) && (
                <a
                  href={whatsappLink(coach.phone, `Hi ${coach.name}, I found you on Coach Finder and I'm interested in training sessions.`)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5b] text-white font-semibold py-2 px-4 rounded-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z" />
                  </svg>
                  Message on WhatsApp
                </a>
              )}
              <p className="text-green-700 text-sm mt-4">
                {playerEmail
                  ? "We've emailed you a link to leave a review after your session."
                  : "You can now contact the coach directly."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
