"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          No conversations yet.
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
