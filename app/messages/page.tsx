"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ListSkeleton } from "@/components/Skeleton";

type ConversationRow = {
  id: string;
  last_message_at: string;
  player_name: string;
  coach_id: string;
  coaches: { name: string; city: string } | null;
};

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"coach" | "player" | null>(null);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.replace("/player/login?next=/messages");
      return;
    }

    try {
      const { data: coachRow } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (coachRow) {
        setRole("coach");
        const { data, error: fetchError } = await supabase
          .from("conversations")
          .select("id, last_message_at, player_name, coach_id")
          .eq("coach_id", coachRow.id)
          .order("last_message_at", { ascending: false });

        if (fetchError) throw fetchError;
        setConversations((data as ConversationRow[]) || []);
      } else {
        setRole("player");
        const { data, error: fetchError } = await supabase
          .from("conversations")
          .select("id, last_message_at, player_name, coach_id, coaches(name, city)")
          .eq("player_id", user.id)
          .order("last_message_at", { ascending: false });

        if (fetchError) throw fetchError;
        setConversations((data as unknown as ConversationRow[]) || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-14 h-14 mx-auto mb-4 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.5 0-2.912-.325-4.146-.895L3 20l1.09-3.267C3.4 15.67 3 14.36 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-gray-600 mb-6">
            {role === "coach"
              ? "No conversations yet. They'll show up here once a player messages you."
              : "No conversations yet. Message a coach to get started."}
          </p>
          {role === "player" && (
            <Link
              href="/search?showAll=true"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Browse Coaches
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition"
            >
              <p className="font-bold text-gray-900">
                {role === "coach" ? c.player_name : c.coaches?.name || "Coach"}
              </p>
              {role === "player" && c.coaches?.city && (
                <p className="text-gray-600 text-sm">{c.coaches.city}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {new Date(c.last_message_at).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
