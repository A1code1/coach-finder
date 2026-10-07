import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser, getUserEmail } from "@/lib/serverAuth";
import { renderEmail, sendEmail, siteUrl } from "@/lib/email";

const QUIET_MINUTES = 15;

// Called after a message is sent. Emails the other participant, at most once per
// burst: if the sender already sent a message in the last QUIET_MINUTES, skip.
export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await request.json().catch(() => ({}));
  if (!conversationId) return NextResponse.json({ error: "Missing conversation" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const { data: convo } = await admin
    .from("conversations")
    .select("id, player_id, player_name, coaches(id, name, email, user_id)")
    .eq("id", conversationId)
    .maybeSingle();
  if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const coach = Array.isArray(convo.coaches) ? convo.coaches[0] : convo.coaches;
  const senderIsPlayer = convo.player_id === user.id;
  const senderIsCoach = coach?.user_id === user.id;
  if (!senderIsPlayer && !senderIsCoach) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const since = new Date(Date.now() - QUIET_MINUTES * 60 * 1000).toISOString();
  const { data: recent } = await admin
    .from("messages")
    .select("body, created_at")
    .eq("conversation_id", conversationId)
    .eq("sender_id", user.id)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2);

  if (!recent || recent.length === 0) return NextResponse.json({ ok: true, sent: false });
  if (recent.length > 1) return NextResponse.json({ ok: true, sent: false, throttled: true });

  const to = senderIsPlayer
    ? coach?.email || (coach?.user_id ? await getUserEmail(coach.user_id) : null)
    : await getUserEmail(convo.player_id);
  if (!to) return NextResponse.json({ ok: true, sent: false });

  const senderName = senderIsPlayer ? convo.player_name : coach?.name || "Your coach";
  const preview = recent[0].body.length > 280 ? `${recent[0].body.slice(0, 280)}…` : recent[0].body;

  const sent = await sendEmail({
    to,
    subject: `New message from ${senderName}`,
    html: renderEmail({
      heading: `${senderName} sent you a message`,
      paragraphs: [`"${preview}"`],
      cta: { label: "Reply on Coach Finder", url: `${siteUrl(request)}/messages/${conversationId}` },
    }),
  });

  return NextResponse.json({ ok: true, sent });
}
