import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Resolves the logged-in user from the "Authorization: Bearer <access token>" header.
export async function getRequestUser(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function getUserEmail(userId: string) {
  const { data } = await getSupabaseAdmin().auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}
