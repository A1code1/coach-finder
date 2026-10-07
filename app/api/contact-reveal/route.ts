import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { coachId?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const coachId = body.coachId;
  const email = body.email?.trim().toLowerCase() || null;

  if (!coachId) {
    return NextResponse.json({ error: "Missing coach" }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: coach } = await admin
    .from("coaches")
    .select("id")
    .eq("id", coachId)
    .eq("status", "approved")
    .maybeSingle();

  if (!coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  const reviewToken = email ? randomBytes(24).toString("base64url") : null;

  const { error } = await admin.from("contact_reveals").insert({
    coach_id: coachId,
    player_email: email,
    review_token: reviewToken,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save your request" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
