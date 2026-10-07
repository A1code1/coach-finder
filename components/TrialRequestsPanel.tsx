"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatTrialDate } from "@/lib/trialDates";
import type { TrialRequest } from "@/types/database";

export function TrialRequestsPanel({ coachId }: { coachId: string }) {
  const [requests, setRequests] = useState<TrialRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("trial_requests")
      .select("*")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error: fetchError }) => {
        if (fetchError) console.error(fetchError);
        setRequests(data || []);
        setLoaded(true);
      });
  }, [coachId]);

  const respond = async (id: string, action: "accept" | "decline") => {
    setError("");
    setBusyId(id);
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch(`/api/trial-requests/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ action }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: result.status, responded_at: new Date().toISOString() } : r
        )
      );
    } finally {
      setBusyId(null);
    }
  };

  if (!loaded) return null;

  const pending = requests.filter((r) => r.status === "pending");
  const answered = requests.filter((r) => r.status !== "pending").slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900">Trial session requests</h3>
        {pending.length > 0 && (
          <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pending.length} new
          </span>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {requests.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No requests yet. Players can ask for a trial session from your profile, based on your availability.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="border border-primary-200 bg-primary-50/40 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{r.player_name}</p>
                  <p className="text-sm text-gray-700">
                    {formatTrialDate(r.session_date)} · {r.time_slot}
                  </p>
                  <p className="text-sm text-gray-500">
                    {r.player_email}
                    {r.player_phone ? ` · ${r.player_phone}` : ""}
                  </p>
                  {r.message && <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">“{r.message}”</p>}
                </div>
                <div className="flex gap-2 sm:flex-col shrink-0">
                  <button
                    disabled={busyId === r.id}
                    onClick={() => respond(r.id, "accept")}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold py-2 px-4 rounded"
                  >
                    Accept
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => respond(r.id, "decline")}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-800 text-sm font-semibold py-2 px-4 rounded"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}

          {answered.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Answered</p>
              <ul className="divide-y divide-gray-100">
                {answered.map((r) => (
                  <li key={r.id} className="py-2 flex justify-between text-sm">
                    <span className="text-gray-700">
                      {r.player_name} · {formatTrialDate(r.session_date)}
                    </span>
                    <span className={r.status === "accepted" ? "text-green-700 font-medium" : "text-gray-500"}>
                      {r.status === "accepted" ? "Accepted" : "Declined"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
