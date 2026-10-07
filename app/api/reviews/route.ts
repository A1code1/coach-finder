import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function findReveal(token: string | null | undefined) {
  if (!token || token.length < 20) return null;
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("contact_reveals")
    .select("id, coach_id, coaches(name, photo_url)")
    .eq("review_token", token)
    .maybeSingle();
  return data;
}

async function alreadyReviewed(revealId: string) {
  const admin = getSupabaseAdmin();
  const { count } = await admin
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("contact_reveal_id", revealId);
  return (count ?? 0) > 0;
}

// GET /api/reviews?token=... -> which coach this review link is for
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const reveal = await findReveal(token);
  if (!reveal) {
    return NextResponse.json({ error: "This review link is not valid." }, { status: 404 });
  }

  const coach = Array.isArray(reveal.coaches) ? reveal.coaches[0] : reveal.coaches;
  return NextResponse.json({
    coachId: reveal.coach_id,
    coachName: coach?.name ?? "your coach",
    coachPhoto: coach?.photo_url ?? null,
    alreadyReviewed: await alreadyReviewed(reveal.id),
  });
}

// POST /api/reviews { token, name, rating, comment } -> pending review
export async function POST(request: Request) {
  let body: { token?: string; name?: string; rating?: number; comment?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const reveal = await findReveal(body.token);
  if (!reveal) {
    return NextResponse.json({ error: "This review link is not valid." }, { status: 404 });
  }

  const name = (body.name || "").trim().slice(0, 80);
  const rating = Number(body.rating);
  const comment = (body.comment || "").trim().slice(0, 2000);

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5 stars." }, { status: 400 });
  }

  if (await alreadyReviewed(reveal.id)) {
    return NextResponse.json({ error: "A review was already submitted with this link." }, { status: 409 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("reviews").insert({
    coach_id: reveal.coach_id,
    contact_reveal_id: reveal.id,
    reviewer_name: name,
    rating,
    comment,
    status: "pending",
  });

  if (error) {
    console.error(error);
    const duplicate = error.code === "23505";
    return NextResponse.json(
      { error: duplicate ? "A review was already submitted with this link." : "Could not save your review." },
      { status: duplicate ? 409 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
