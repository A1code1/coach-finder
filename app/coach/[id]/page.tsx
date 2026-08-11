"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { RatingBadge } from "@/components/RatingBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Skeleton } from "@/components/Skeleton";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { Coach } from "@/types/database";

export default function CoachProfilePage() {
  const params = useParams();
  const coachId = params.id as string;
  const { user, checking } = useRequireAuth(`/coach/${coachId}`);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [playerEmail, setPlayerEmail] = useState("");
  const [emailStep, setEmailStep] = useState(false);

  useEffect(() => {
    if (user) fetchCoach();
  }, [user, coachId]);

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
      await Promise.all([fetchReviewStats(coachId), fetchFavoriteStatus(coachId)]);
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
      .select("rating")
      .eq("coach_id", id)
      .eq("status", "approved");

    if (reviewsError) {
      console.error(reviewsError);
      return;
    }

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

  const handleRevealContact = async () => {
    if (playerEmail) {
      try {
        // Create contact reveal record with email
        const { error } = await supabase
          .from("contact_reveals")
          .insert({
            coach_id: coachId,
            player_email: playerEmail,
            review_token: Math.random().toString(36).substring(2, 15),
          })
          .select()
          .single();

        if (error) throw error;
        setShowContact(true);
        // TODO: Send review link email via Resend
      } catch (err) {
        console.error(err);
      }
    } else {
      // Reveal without email
      try {
        await supabase.from("contact_reveals").insert({
          coach_id: coachId,
          player_email: null,
          review_token: null,
        });
        setShowContact(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (checking || !user || loading) {
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
              <h1 className="text-4xl font-bold text-gray-900">{coach.name}</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(coach.availability).map(([day, times]) => (
                <div key={day} className="bg-gray-50 p-4 rounded">
                  <p className="font-semibold text-gray-900 capitalize">{day}</p>
                  {times.length > 0 ? (
                    <ul className="text-gray-600 text-sm mt-1">
                      {times.map((time) => (
                        <li key={time}>{time}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">Not available</p>
                  )}
                </div>
              ))}
            </div>
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
              <p className="text-green-700 text-sm mt-4">
                {playerEmail
                  ? "A review link has been sent to your email!"
                  : "You can now contact the coach directly."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
