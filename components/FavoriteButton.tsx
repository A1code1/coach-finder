"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function FavoriteButton({
  coachId,
  initialFavorited,
  onToggle,
  className = "",
}: {
  coachId: string;
  initialFavorited: boolean;
  onToggle?: (favorited: boolean) => void;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      if (favorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("coach_id", coachId)
          .eq("player_id", user.id);

        if (error) throw error;
        setFavorited(false);
        onToggle?.(false);
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ coach_id: coachId, player_id: user.id });

        if (error) throw error;
        setFavorited(true);
        onToggle?.(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      className={`transition disabled:opacity-50 ${favorited ? "text-accent-500" : ""} ${className}`}
    >
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s-6.716-4.35-9.428-8.24C.665 9.73 1.42 6.2 4.2 4.8c2.13-1.07 4.61-.45 5.8 1.36C11.19 4.35 13.67 3.73 15.8 4.8c2.78 1.4 3.535 4.93 1.628 7.96C18.716 16.65 12 21 12 21z"
        />
      </svg>
    </button>
  );
}
