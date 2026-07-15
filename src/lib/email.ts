import { Resend } from "resend";
import type { Setting } from "@/payload-types";

type SubmissionType = "contact" | "membership" | "subscribe";

type SubmissionData = {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

const FALLBACK_AUTOREPLY: Record<string, { subject: string; body: string }> = {
  en: {
    subject: "Thank you for contacting AmCham Cameroon",
    body: "Dear {{name}},\n\nThank you for reaching out to AmCham Cameroon — we've received your message and will respond within 1–2 business days.\n\nBest regards,\nThe AmCham Cameroon Team",
  },
  fr: {
    subject: "Merci d'avoir contacté AmCham Cameroun",
    body: "Cher/Chère {{name}},\n\nMerci d'avoir contacté AmCham Cameroun — nous avons bien reçu votre message et vous répondrons sous 1 à 2 jours ouvrés.\n\nCordialement,\nL'équipe AmCham Cameroun",
  },
};

const TYPE_LABELS: Record<SubmissionType, string> = {
  contact: "Contact message",
  membership: "Membership application",
  subscribe: "Newsletter subscription",
};

function brandWrap(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#1a1d24;">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:#232e7d;border-radius:12px 12px 0 0;padding:22px 28px;">
        <span style="font-size:20px;font-weight:800;color:#ffffff;">AmCham</span>
        <span style="font-size:20px;font-weight:800;color:#ff8f96;"> Cameroon</span>
        <div style="font-size:10px;letter-spacing:1.5px;color:rgba(255,255,255,.7);margin-top:4px;">AMERICAN CHAMBER OF COMMERCE IN CAMEROON</div>
      </div>
      <div style="background:#ffffff;padding:28px;border:1px solid #e6e9f0;border-top:none;">
        ${bodyHtml}
      </div>
      <div style="background:#ffffff;border:1px solid #e6e9f0;border-top:3px solid #e30613;border-radius:0 0 12px 12px;padding:16px 28px;font-size:12px;color:#4b5160;">
        AmCham Cameroon · Bonapriso, Douala, Cameroon · <a href="https://amchamcam.org" style="color:#e30613;">amchamcam.org</a>
      </div>
    </div>
  </body>
</html>`;
}

function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;line-height:1.6;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/**
 * Sends the visitor auto-reply and the admin notification for a form submission.
 * No-ops gracefully when RESEND_API_KEY is not configured.
 */
export async function sendSubmissionEmails(args: {
  type: SubmissionType;
  data: SubmissionData;
  locale: string;
  settings: Setting;
}): Promise<void> {
  const { type, data, locale, settings } = args;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const from = settings.fromAddress || "AmCham Cameroon <onboarding@resend.dev>";
  const jobs: Promise<unknown>[] = [];

  // 1. Visitor auto-reply (localized, template editable in admin settings).
  if (settings.autoReplyEnabled !== false) {
    const fallback = FALLBACK_AUTOREPLY[locale] ?? FALLBACK_AUTOREPLY.en;
    const subject = settings.autoReplySubject || fallback.subject;
    const bodyTemplate = settings.autoReplyBody || fallback.body;
    const body = bodyTemplate.replace(/\{\{\s*name\s*\}\}/g, data.name || "");
    jobs.push(
      resend.emails.send({
        from,
        to: data.email,
        subject,
        html: brandWrap(textToHtml(body)),
        text: body,
      }),
    );
  }

  // 2. Admin notification with the submission details.
  const adminTo = settings.adminNotifyEmail || settings.emails?.[0]?.email;
  if (adminTo) {
    const rows = Object.entries({
      Type: TYPE_LABELS[type],
      Name: data.name,
      Email: data.email,
      Phone: data.phone,
      Company: data.company,
      Message: data.message,
      ...(data.meta
        ? Object.fromEntries(
            Object.entries(data.meta).map(([k, v]) => [k, String(v ?? "")]),
          )
        : {}),
      Language: locale.toUpperCase(),
    })
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;">${String(v).replace(/</g, "&lt;")}</td></tr>`,
      )
      .join("");

    jobs.push(
      resend.emails.send({
        from,
        to: adminTo,
        replyTo: data.email,
        subject: `[AmCham Website] New ${TYPE_LABELS[type].toLowerCase()} from ${data.name || data.email}`,
        html: brandWrap(
          `<h2 style="margin:0 0 16px;color:#232e7d;">New ${TYPE_LABELS[type].toLowerCase()}</h2><table style="font-size:14px;border-collapse:collapse;">${rows}</table>`,
        ),
      }),
    );
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[email] send failed:", r.reason);
  });
}
