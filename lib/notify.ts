"use client";

import { supabase } from "@/lib/supabase";

// Fire-and-forget call to a notification route, authenticated as the current user.
export async function notify(path: string, payload: Record<string, unknown>) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error(err);
  }
}
