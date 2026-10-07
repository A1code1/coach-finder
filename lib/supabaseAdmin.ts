import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client with the service role key. Bypasses RLS, so only use it in
// route handlers / server components after validating the request yourself.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role environment variables");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
