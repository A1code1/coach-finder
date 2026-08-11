"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StartConversationPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = params.id as string;
  const [error, setError] = useState("");

  useEffect(() => {
    resolveConversation();
  }, [coachId]);

  const resolveConversation = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.replace(`/player/login?next=${encodeURIComponent(`/coach/${coachId}/message`)}`);
      return;
    }

    try {
      const { data: existing, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("coach_id", coachId)
        .eq("player_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        router.replace(`/messages/${existing.id}`);
        return;
      }

      const playerName =
        (user.user_metadata?.name as string | undefined) || user.email || "Player";

      const { data: created, error: createError } = await supabase
        .from("conversations")
        .insert({ coach_id: coachId, player_id: user.id, player_name: playerName })
        .select("id")
        .single();

      if (createError) throw createError;

      router.replace(`/messages/${created.id}`);
    } catch (err) {
      console.error(err);
      setError("Could not start the conversation. Please try again.");
    }
  };

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  return <div className="text-center py-12">Starting conversation...</div>;
}
