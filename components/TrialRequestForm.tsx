"use client";

import { useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { TRIAL_DAYS_AHEAD, formatTrialDate, slotsForDate, toIsoDate } from "@/lib/trialDates";

type Props = {
  coachId: string;
  coachName: string;
  availability: Record<string, string[]>;
  user: User | null;
  onClose: () => void;
};

export function TrialRequestForm({ coachId, coachName, availability, user, onClose }: Props) {
  const days = useMemo(() => {
    const today = new Date();
    const list: { iso: string; slots: string[] }[] = [];
    for (let i = 1; i <= TRIAL_DAYS_AHEAD; i++) {
      const iso = toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
      const slots = slotsForDate(availability, iso);
      if (slots.length) list.push({ iso, slots });
    }
    return list;
  }, [availability]);

  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState((user?.user_metadata?.full_name as string) || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const slots = days.find((d) => d.iso === date)?.slots || [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!date || !slot) {
      setError("Please pick a day and a time");
      return;
    }
    setSending(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch("/api/trial-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ coachId, name, email, phone, date, timeSlot: slot, message }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-green-900 mb-2">Request sent</h3>
        <p className="text-green-800">
          {coachName} will get your request for {formatTrialDate(date)}, {slot.split(" (")[0].toLowerCase()}.
          We&apos;ll email you at {email} as soon as they answer.
        </p>
        <button onClick={onClose} className="mt-4 text-sm font-medium text-green-900 underline">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-primary-200 bg-primary-50/40 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Request a trial session</h3>
          <p className="text-sm text-gray-600">
            Pick a time that suits you. {coachName} will accept or decline, and we&apos;ll email you the answer.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 text-xl leading-none">
          ×
        </button>
      </div>

      {days.length === 0 ? (
        <p className="text-gray-600">This coach has no open times in the next three weeks. Try sending a message instead.</p>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700 mb-2">Day</p>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {days.map((d) => {
              const dt = new Date(`${d.iso}T12:00:00Z`);
              const active = d.iso === date;
              return (
                <button
                  type="button"
                  key={d.iso}
                  onClick={() => {
                    setDate(d.iso);
                    if (!d.slots.includes(slot)) setSlot("");
                  }}
                  className={`shrink-0 w-16 py-2 rounded-lg border text-center transition ${
                    active
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-primary-400"
                  }`}
                >
                  <span className="block text-xs uppercase">
                    {dt.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}
                  </span>
                  <span className="block text-lg font-semibold">{dt.getUTCDate()}</span>
                  <span className="block text-xs">
                    {dt.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}
                  </span>
                </button>
              );
            })}
          </div>

          {date && (
            <>
              <p className="text-sm font-medium text-gray-700 mb-2">Time</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {slots.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`px-3 py-2 rounded-lg border text-sm transition ${
                      s === slot
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "bg-white border-gray-200 text-gray-700 hover:border-primary-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Anything the coach should know? Age, level, what you want to work on (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {sending ? "Sending..." : "Send request"}
          </button>
        </>
      )}
    </form>
  );
}
