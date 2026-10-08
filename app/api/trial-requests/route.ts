import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser, getUserEmail } from "@/lib/serverAuth";
import { renderEmail, sendEmail, siteUrl } from "@/lib/email";
import { TRIAL_DAYS_AHEAD, formatTrialDate, slotsForDate, toIsoDate } from "@/lib/trialDates";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// A logged-in player asks a coach for a trial session.
export async function POST(request: Request) {
  let body: {
    coachId?: string;
    name?: string;
    email?: string;
    phone?: string;
    date?: string;
    timeSlot?: string;
    message?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Please log in or sign up to request a trial session" }, { status: 401 });
  }

  const name = body.name?.trim().slice(0, 100) || "";
  const email = body.email?.trim().toLowerCase() || "";
  const phone = body.phone?.trim().slice(0, 30) || null;
  const message = body.message?.trim().slice(0, 1000) || null;
  const date = body.date || "";
  const timeSlot = body.timeSlot || "";

  if (!body.coachId) return NextResponse.json({ error: "Missing coach" }, { status: 400 });
  if (!name) return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const today = new Date();
  const first = toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  const last = toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + TRIAL_DAYS_AHEAD));
  if (!DATE_RE.test(date) || date < first || date > last) {
    return NextResponse.json({ error: "Please pick a date in the next three weeks" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: coach } = await admin
    .from("coaches")
    .select("id, name, email, user_id, availability")
    .eq("id", body.coachId)
    .eq("status", "approved")
    .maybeSingle();
  if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

  if (!slotsForDate(coach.availability, date).includes(timeSlot)) {
    return NextResponse.json({ error: "The coach isn't available at that time" }, { status: 400 });
  }

  // Basic spam guard: at most 3 open requests per email per coach.
  const { count } = await admin
    .from("trial_requests")
    .select("id", { count: "exact", head: true })
    .eq("coach_id", coach.id)
    .eq("player_email", email)
    .eq("status", "pending");
  if ((count || 0) >= 3) {
    return NextResponse.json(
      { error: "You already have open requests with this coach. Please wait for a reply." },
      { status: 429 }
    );
  }

  const { error } = await admin.from("trial_requests").insert({
    coach_id: coach.id,
    player_id: user.id,
    player_name: name,
    player_email: email,
    player_phone: phone,
    session_date: date,
    time_slot: timeSlot,
    message,
  });
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not send your request" }, { status: 500 });
  }

  const base = siteUrl(request);
  const when = `${formatTrialDate(date)}, ${timeSlot}`;
  const coachEmail = coach.email || (coach.user_id ? await getUserEmail(coach.user_id) : null);

  await Promise.all([
    coachEmail
      ? sendEmail({
          to: coachEmail,
          subject: `New trial session request from ${name}`,
          html: renderEmail({
            heading: "You have a new trial session request",
            paragraphs: [
              `${name} would like a trial session on ${when}.`,
              message ? `Their message: "${message}"` : "",
              "Accept or decline it from your dashboard. We'll let them know your answer.",
            ].filter(Boolean),
            cta: { label: "Open your dashboard", url: `${base}/coach/dashboard` },
          }),
        })
      : Promise.resolve(false),
    sendEmail({
      to: email,
      subject: `Your trial session request with ${coach.name}`,
      html: renderEmail({
        heading: "Request sent",
        paragraphs: [
          `We've sent your request for a trial session with ${coach.name} on ${when}.`,
          "You'll get an email as soon as the coach accepts or declines.",
        ],
        cta: { label: "View the coach's profile", url: `${base}/coach/${coach.id}` },
      }),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
