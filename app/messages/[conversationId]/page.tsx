"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Message } from "@/types/database";

export default function ConversationThreadPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [otherPartyName, setOtherPartyName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      router.replace(`/player/login?next=${encodeURIComponent(`/messages/${conversationId}`)}`);
      return;
    }

    setUserId(user.id);

    try {
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("id, player_id, player_name, coach_id, coaches(name)")
        .eq("id", conversationId)
        .single();

      if (convError) throw convError;

      const isPlayer = conversation.player_id === user.id;
      setOtherPartyName(
        isPlayer
          ? (conversation as any).coaches?.name || "Coach"
          : conversation.player_name
      );

      const { data: messageRows, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messageRows || []);
    } catch (err) {
      console.error(err);
      setError("Could not load this conversation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !userId) return;

    try {
      setSending(true);
      const { error: sendError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        body: body.trim(),
      });

      if (sendError) throw sendError;

      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      setBody("");
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-140px)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{otherPartyName}</h1>

      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet. Say hello!</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  m.sender_id === userId
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p>{m.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    m.sender_id === userId ? "text-primary-100" : "text-gray-500"
                  }`}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-3 mt-4">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
