import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
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

type OutboundMail = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

/** Inbox for every website form / application / subscription. */
export const DEFAULT_ADMIN_EMAIL = "ed@amchamcam.org";

/** Public From address — Hostinger alias of the SMTP_USER mailbox. */
export const DEFAULT_FROM = "AmCham Cameroon <admin@amchamcam.org>";

type AutoReplyCopy = { subject: string; body: string };

/** Type-specific visitor confirmations (EN / FR). Settings can override contact copy. */
const FALLBACK_AUTOREPLY: Record<
  SubmissionType,
  Record<"en" | "fr", AutoReplyCopy>
> = {
  contact: {
    en: {
      subject: "We received your message — AmCham Cameroon",
      body: "Dear {{name}},\n\nThank you for contacting AmCham Cameroon. This is an automated confirmation that we have received your inquiry.\n\nA member of our team will respond within 1–2 business days.\n\nThis mailbox is not monitored for replies. For urgent matters, email ed@amchamcam.org or call +237 677 71 37 05.\n\nBest regards,\nAmCham Cameroon",
    },
    fr: {
      subject: "Nous avons bien reçu votre message — AmCham Cameroun",
      body: "Cher/Chère {{name}},\n\nMerci d'avoir contacté AmCham Cameroun. Ceci est une confirmation automatique : nous avons bien reçu votre demande.\n\nUn membre de notre équipe vous répondra sous 1 à 2 jours ouvrés.\n\nCette adresse n'est pas suivie pour les réponses. Pour une urgence, écrivez à ed@amchamcam.org ou appelez le +237 677 71 37 05.\n\nCordialement,\nAmCham Cameroun",
    },
  },
  membership: {
    en: {
      subject: "We received your membership application — AmCham Cameroon",
      body: "Dear {{name}},\n\nThank you for applying for membership with AmCham Cameroon. This is an automated confirmation that your application has been received.\n\nOur team will review it and contact you with next steps, typically within a few business days.\n\nThis mailbox is not monitored for replies. For questions about your application, email ed@amchamcam.org.\n\nBest regards,\nAmCham Cameroon",
    },
    fr: {
      subject: "Nous avons bien reçu votre candidature — AmCham Cameroun",
      body: "Cher/Chère {{name}},\n\nMerci d'avoir soumis une demande d'adhésion à AmCham Cameroun. Ceci est une confirmation automatique : votre candidature a bien été reçue.\n\nNotre équipe l'examinera et vous contactera pour la suite, généralement sous quelques jours ouvrés.\n\nCette adresse n'est pas suivie pour les réponses. Pour toute question, écrivez à ed@amchamcam.org.\n\nCordialement,\nAmCham Cameroun",
    },
  },
  subscribe: {
    en: {
      subject: "You are on the AmCham Cameroon mailing list",
      body: "Hello,\n\nThank you for subscribing. This is an automated confirmation that your email has been added to the AmCham Cameroon newsletter list.\n\nYou will receive Chamber updates and event announcements from us.\n\nThis mailbox is not monitored for replies. To unsubscribe or update your details, email ed@amchamcam.org.\n\nBest regards,\nAmCham Cameroon",
    },
    fr: {
      subject: "Vous êtes inscrit(e) à la liste AmCham Cameroun",
      body: "Bonjour,\n\nMerci pour votre inscription. Ceci est une confirmation automatique : votre adresse a été ajoutée à la liste de diffusion d'AmCham Cameroun.\n\nVous recevrez nos actualités et annonces d'événements.\n\nCette adresse n'est pas suivie pour les réponses. Pour vous désinscrire ou mettre à jour vos coordonnées, écrivez à ed@amchamcam.org.\n\nCordialement,\nAmCham Cameroun",
    },
  },
};

const TYPE_LABELS: Record<SubmissionType, string> = {
  contact: "Contact message",
  membership: "Membership application",
  subscribe: "Newsletter subscription",
};

function brandWrap(
  bodyHtml: string,
  opts?: { noReplyFooter?: boolean; locale?: string },
): string {
  const noReply =
    opts?.noReplyFooter === true
      ? `<div style="margin-top:8px;color:#8a91a0;">${
          opts.locale === "fr"
            ? "Message automatique — merci de ne pas répondre à cet e-mail."
            : "Automated message — please do not reply to this email."
        }</div>`
      : "";

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
        ${noReply}
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

function resolveFrom(settings: Setting): string {
  return process.env.EMAIL_FROM?.trim() || settings.fromAddress?.trim() || DEFAULT_FROM;
}

function resolveAdminTo(settings: Setting): string {
  return (
    process.env.EMAIL_ADMIN?.trim() ||
    settings.adminNotifyEmail?.trim() ||
    settings.emails?.[0]?.email?.trim() ||
    DEFAULT_ADMIN_EMAIL
  );
}

function resolveAutoReply(
  type: SubmissionType,
  locale: string,
  settings: Setting,
  data: SubmissionData,
): AutoReplyCopy {
  const lang = locale === "fr" ? "fr" : "en";
  const fallback = FALLBACK_AUTOREPLY[type][lang];

  // Admin Settings text is the contact confirmation; membership/subscribe keep typed copy.
  const useSettings = type === "contact";
  const subject =
    (useSettings && settings.autoReplySubject?.trim()) || fallback.subject;
  const bodyTemplate =
    (useSettings && settings.autoReplyBody?.trim()) || fallback.body;

  const nameToken =
    data.name?.trim() || (lang === "fr" ? "Madame, Monsieur" : "there");
  const body = bodyTemplate.replace(/\{\{\s*name\s*\}\}/g, nameToken);

  return { subject, body };
}

let smtpTransporter: Transporter | null = null;

function getSmtpTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  if (smtpTransporter) return smtpTransporter;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (process.env.SMTP_SECURE !== "false" && port === 465);

  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    auth: { user, pass },
    // Hostinger requires modern TLS; avoid silent downgrades.
    tls: { minVersion: "TLSv1.2" },
  };

  smtpTransporter = nodemailer.createTransport(options);
  return smtpTransporter;
}

/**
 * Prefer Hostinger SMTP (same stack as ed@amchamcam.org) for inbox placement.
 * Fall back to Resend only when SMTP is not configured.
 */
async function sendMail(msg: OutboundMail): Promise<void> {
  const smtp = getSmtpTransporter();
  if (smtp) {
    await smtp.sendMail({
      from: msg.from,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      // Transactional — suppress vacation / auto-reply loops.
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        Precedence: "auto_reply",
      },
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: msg.from,
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    });
    if (error) throw new Error(error.message);
    return;
  }

  console.warn(
    "[email] Skipping send — configure SMTP_HOST/SMTP_USER/SMTP_PASS (Hostinger) or RESEND_API_KEY.",
  );
}

/**
 * Sends the visitor auto-reply and the admin notification for a form submission.
 * No-ops gracefully when neither Hostinger SMTP nor Resend is configured.
 */
export async function sendSubmissionEmails(args: {
  type: SubmissionType;
  data: SubmissionData;
  locale: string;
  settings: Setting;
}): Promise<void> {
  const { type, data, locale, settings } = args;
  const from = resolveFrom(settings);
  const adminTo = resolveAdminTo(settings);
  const jobs: Promise<unknown>[] = [];

  // 1. Immediate visitor confirmation (no-reply style automated mail).
  if (settings.autoReplyEnabled !== false) {
    const { subject, body } = resolveAutoReply(type, locale, settings, data);
    const footer =
      locale === "fr"
        ? "\n\n—\nMessage automatique — merci de ne pas répondre à cet e-mail."
        : "\n\n—\nAutomated message — please do not reply to this email.";
    const text = body + footer;
    jobs.push(
      sendMail({
        from,
        to: data.email,
        // No Reply-To on confirmations: this is a no-reply auto message.
        // Visitors are pointed to ed@ in the body; staff still get the admin alert below.
        subject,
        html: brandWrap(textToHtml(body), {
          noReplyFooter: true,
          locale,
        }),
        text,
      }),
    );
  }

  // 2. Admin notification with the submission details.
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

  const adminSubject = `[AmCham Website] New ${TYPE_LABELS[type].toLowerCase()} from ${data.name || data.email}`;
  const adminText = [
    `New ${TYPE_LABELS[type].toLowerCase()}`,
    "",
    `Name: ${data.name || "—"}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : null,
    data.company ? `Company: ${data.company}` : null,
    data.message ? `Message:\n${data.message}` : null,
    `Language: ${locale.toUpperCase()}`,
  ]
    .filter(Boolean)
    .join("\n");

  jobs.push(
    sendMail({
      from,
      to: adminTo,
      // Never forge From as the visitor — that triggers spam filters.
      // Reply opens a thread to the visitor instead.
      replyTo: data.email,
      subject: adminSubject,
      html: brandWrap(
        `<h2 style="margin:0 0 16px;color:#232e7d;">New ${TYPE_LABELS[type].toLowerCase()}</h2><table style="font-size:14px;border-collapse:collapse;">${rows}</table>`,
      ),
      text: adminText,
    }),
  );

  const results = await Promise.allSettled(jobs);
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[email] send failed:", r.reason);
  });
}

/**
 * Member-portal password reset link. Uses the same Hostinger SMTP / Resend path
 * as form mail so inbox placement stays consistent.
 */
export async function sendPasswordResetEmail(args: {
  to: string;
  name?: string | null;
  resetUrl: string;
  locale: string;
  settings?: Setting | null;
}): Promise<void> {
  const { to, name, resetUrl, locale, settings } = args;
  const lang = locale === "fr" ? "fr" : "en";
  const greet =
    name?.trim() || (lang === "fr" ? "Madame, Monsieur" : "there");

  const subject =
    lang === "fr"
      ? "Réinitialisez votre mot de passe — Espace membre AmCham"
      : "Reset your password — AmCham member portal";

  const bodyText =
    lang === "fr"
      ? [
          `Cher/Chère ${greet},`,
          "",
          "Nous avons reçu une demande de réinitialisation du mot de passe de votre espace membre AmCham Cameroun.",
          "",
          `Ouvrez ce lien pour choisir un nouveau mot de passe (valide 1 heure) :`,
          resetUrl,
          "",
          "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail — votre mot de passe actuel reste inchangé.",
          "",
          "Cordialement,",
          "AmCham Cameroun",
        ].join("\n")
      : [
          `Dear ${greet},`,
          "",
          "We received a request to reset the password for your AmCham Cameroon member portal account.",
          "",
          "Open this link to choose a new password (valid for 1 hour):",
          resetUrl,
          "",
          "If you did not ask for this, you can ignore this email — your current password will stay the same.",
          "",
          "Best regards,",
          "AmCham Cameroon",
        ].join("\n");

  const ctaLabel = lang === "fr" ? "Choisir un nouveau mot de passe" : "Choose a new password";
  const intro =
    lang === "fr"
      ? `Cher/Chère ${greet},<br/><br/>Nous avons reçu une demande de réinitialisation du mot de passe de votre espace membre AmCham Cameroun.`
      : `Dear ${greet},<br/><br/>We received a request to reset the password for your AmCham Cameroon member portal account.`;
  const ignore =
    lang === "fr"
      ? "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail — votre mot de passe actuel reste inchangé."
      : "If you did not ask for this, you can ignore this email — your current password will stay the same.";

  const bodyHtml = `
    <p style="margin:0 0 14px;line-height:1.6;">${intro}</p>
    <p style="margin:0 0 22px;">
      <a href="${resetUrl}" style="display:inline-block;background:#e30613;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:6px;">${ctaLabel}</a>
    </p>
    <p style="margin:0 0 14px;line-height:1.6;font-size:13px;color:#4b5160;">
      ${lang === "fr" ? "Le lien expire dans 1 heure. S'il ne fonctionne pas, copiez-collez cette adresse :" : "The link expires in 1 hour. If the button does not work, copy and paste this address:"}<br/>
      <a href="${resetUrl}" style="color:#232e7d;word-break:break-all;">${resetUrl}</a>
    </p>
    <p style="margin:0;line-height:1.6;font-size:13px;color:#4b5160;">${ignore}</p>
  `;

  const from =
    process.env.EMAIL_FROM?.trim() ||
    settings?.fromAddress?.trim() ||
    DEFAULT_FROM;

  await sendMail({
    from,
    to,
    subject,
    html: brandWrap(bodyHtml, { noReplyFooter: true, locale: lang }),
    text:
      bodyText +
      (lang === "fr"
        ? "\n\n—\nMessage automatique — merci de ne pas répondre à cet e-mail."
        : "\n\n—\nAutomated message — please do not reply to this email."),
  });
}
