import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser } from "@/lib/serverAuth";
import { renderEmail, sendEmail, siteUrl } from "@/lib/email";
import { formatTrialDate } from "@/lib/trialDates";

// The coach accepts or declines a trial session request.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Please log in again" }, { status: 401 });

  const { action } = await request.json().catch(() => ({}));
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data: trial } = await admin
    .from("trial_requests")
    .select("id, status, player_name, player_email, session_date, time_slot, coaches!inner(id, name, user_id, email, phone)")
    .eq("id", id)
    .maybeSingle();

  const coach = trial?.coaches as unknown as
    | { id: string; name: string; user_id: string; email: string | null; phone: string | null }
    | undefined;
  if (!trial || !coach || coach.user_id !== user.id) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }
  if (trial.status !== "pending") {
    return NextResponse.json({ error: "You've already answered this request" }, { status: 409 });
  }

  const status = action === "accept" ? "accepted" : "declined";
  const { error } = await admin
    .from("trial_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save your answer" }, { status: 500 });
  }

  // Every accepted session adds €1 to the Kids Fund (unique per request, so never twice).
  if (status === "accepted") {
    const { error: donationError } = await admin
      .from("donations")
      .insert({ amount_eur: 1, source: "trial_session", trial_request_id: trial.id });
    if (donationError) console.error(donationError);
  }

  const base = siteUrl(request);
  const when = `${formatTrialDate(trial.session_date)}, ${trial.time_slot}`;

  if (status === "accepted") {
    const contact = [
      coach.email ? `Email: ${coach.email}` : "",
      coach.phone ? `Phone: ${coach.phone}` : "",
    ].filter(Boolean);
    await sendEmail({
      to: trial.player_email,
      subject: `${coach.name} accepted your trial session`,
      html: renderEmail({
        heading: "Your trial session is confirmed",
        paragraphs: [
          `Good news, ${trial.player_name}: ${coach.name} accepted your trial session on ${when}.`,
          contact.length
            ? `Get in touch to agree on the exact time and place. ${contact.join(" · ")}`
            : "The coach will get in touch to agree on the exact time and place.",
        ],
        cta: { label: "View the coach's profile", url: `${base}/coach/${coach.id}` },
      }),
    });
  } else {
    await sendEmail({
      to: trial.player_email,
      subject: `Update on your trial session with ${coach.name}`,
      html: renderEmail({
        heading: "That time didn't work out",
        paragraphs: [
          `Hi ${trial.player_name}, ${coach.name} can't do a trial session on ${when}.`,
          "You can pick another time on their profile, or find another coach nearby.",
        ],
        cta: { label: "Find a coach", url: `${base}/search?showAll=true` },
      }),
    });
  }

  return NextResponse.json({ ok: true, status });
}
