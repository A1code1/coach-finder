import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Coach Finder <onboarding@resend.dev>";

export function siteUrl(request?: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "https://coach-finder-eta.vercel.app";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Simple branded layout. `paragraphs` are plain text (escaped); `cta` is an optional button.
export function renderEmail({
  heading,
  paragraphs,
  cta,
}: {
  heading: string;
  paragraphs: string[];
  cta?: { label: string; url: string };
}) {
  const body = paragraphs
    .map((p) => `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6">${escapeHtml(p)}</p>`)
    .join("");
  const button = cta
    ? `<p style="margin:24px 0"><a href="${escapeHtml(cta.url)}" style="background:#0369a1;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">${escapeHtml(cta.label)}</a></p>`
    : "";

  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-weight:700;color:#0f172a;font-size:18px;margin:0 0 24px">Coach Finder</p>
<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px">
<h1 style="margin:0 0 16px;color:#0f172a;font-size:22px">${escapeHtml(heading)}</h1>
${body}${button}
</div>
<p style="color:#94a3b8;font-size:12px;margin-top:20px">Coach Finder · Football coaching in the Netherlands</p>
</div></body></html>`;
}

// Sends an email via Resend. Never throws: email problems must not break the main action.
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping email:", subject);
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}
