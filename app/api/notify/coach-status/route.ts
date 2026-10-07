import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser, getUserEmail } from "@/lib/serverAuth";
import { renderEmail, sendEmail, siteUrl } from "@/lib/email";

// Called by the admin dashboard after approving or rejecting a coach.
export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  const { data: isAdmin } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { coachId } = await request.json().catch(() => ({}));
  if (!coachId) return NextResponse.json({ error: "Missing coach" }, { status: 400 });

  const { data: coach } = await admin
    .from("coaches")
    .select("id, name, email, user_id, status, rejection_reason")
    .eq("id", coachId)
    .maybeSingle();
  if (!coach) return NextResponse.json({ error: "Coach not found" }, { status: 404 });

  const to = coach.email || (coach.user_id ? await getUserEmail(coach.user_id) : null);
  if (!to) return NextResponse.json({ ok: true, sent: false });

  const base = siteUrl(request);
  let sent = false;

  if (coach.status === "approved") {
    sent = await sendEmail({
      to,
      subject: "Your Coach Finder profile is live",
      html: renderEmail({
        heading: `You're live, ${coach.name}!`,
        paragraphs: [
          "Good news: our team reviewed your coaching profile and it is now visible to players and parents searching on Coach Finder.",
          "Keep your availability and prices up to date so players can find the right sessions.",
        ],
        cta: { label: "View your profile", url: `${base}/coach/${coach.id}` },
      }),
    });
  } else if (coach.status === "rejected") {
    sent = await sendEmail({
      to,
      subject: "Update on your Coach Finder profile",
      html: renderEmail({
        heading: "Your profile needs some changes",
        paragraphs: [
          `Hi ${coach.name}, thanks for signing up. We couldn't approve your profile yet.`,
          coach.rejection_reason ? `Reason: ${coach.rejection_reason}` : "",
          "You can update your profile from your dashboard and we'll take another look.",
        ].filter(Boolean),
        cta: { label: "Go to your dashboard", url: `${base}/coach/dashboard` },
      }),
    });
  }

  return NextResponse.json({ ok: true, sent });
}
