"use server";

import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { sendSubmissionEmails } from "@/lib/email";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Naive in-memory rate limit: max N submissions per IP per window.
// Good enough for a single-instance deployment; swap for a shared store when scaling out.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

async function rateLimited(): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function str(form: FormData, key: string, max = 2000): string {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function persistAndNotify(args: {
  type: "contact" | "membership" | "subscribe";
  locale: string;
  data: {
    name?: string;
    email: string;
    phone?: string;
    company?: string;
    message?: string;
    meta?: Record<string, unknown>;
  };
}): Promise<void> {
  const payload = await getPayloadClient();

  await payload.create({
    collection: "submissions",
    data: {
      type: args.type,
      locale: args.locale,
      name: args.data.name,
      email: args.data.email,
      phone: args.data.phone,
      company: args.data.company,
      message: args.data.message,
      meta: args.data.meta,
    },
    overrideAccess: true,
  });

  const settings = await payload.findGlobal({
    slug: "settings",
    locale: args.locale as "en" | "fr",
  });

  // Email failures must never break the visitor flow.
  try {
    await sendSubmissionEmails({
      type: args.type,
      data: args.data,
      locale: args.locale,
      settings,
    });
  } catch (err) {
    console.error("[actions] email error:", err);
  }
}

async function guard(form: FormData): Promise<string | null> {
  // Honeypot: real users never fill this hidden field.
  if (str(form, "website_hp")) return "spam";
  if (await rateLimited()) return "rate";
  return null;
}

export async function submitContact(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  try {
    if (await guard(form)) return { status: "success" }; // silently swallow spam
    const locale = str(form, "locale") === "fr" ? "fr" : "en";
    const name = str(form, "name", 200);
    const email = str(form, "email", 200);
    const message = str(form, "message", 5000);
    if (!name || !EMAIL_RE.test(email) || !message) return { status: "error" };

    await persistAndNotify({
      type: "contact",
      locale,
      data: {
        name,
        email,
        phone: str(form, "phone", 60),
        company: str(form, "company", 200),
        message: str(form, "subject", 200)
          ? `[${str(form, "subject", 200)}]\n\n${message}`
          : message,
      },
    });
    return { status: "success" };
  } catch (err) {
    console.error("[actions] contact error:", err);
    return { status: "error" };
  }
}

export async function submitMembership(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  try {
    if (await guard(form)) return { status: "success" };
    const locale = str(form, "locale") === "fr" ? "fr" : "en";
    const name = str(form, "name", 200);
    const email = str(form, "email", 200);
    const company = str(form, "company", 200);
    if (!name || !EMAIL_RE.test(email) || !company) return { status: "error" };

    await persistAndNotify({
      type: "membership",
      locale,
      data: {
        name,
        email,
        company,
        phone: str(form, "phone", 60),
        message: str(form, "motivation", 5000),
        meta: {
          category: str(form, "category", 60),
          sector: str(form, "sector", 200),
          employees: str(form, "employees", 60),
        },
      },
    });
    return { status: "success" };
  } catch (err) {
    console.error("[actions] membership error:", err);
    return { status: "error" };
  }
}

export async function subscribeNewsletter(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  try {
    if (await guard(form)) return { status: "success" };
    const locale = str(form, "locale") === "fr" ? "fr" : "en";
    const email = str(form, "email", 200);
    if (!EMAIL_RE.test(email)) return { status: "error" };

    await persistAndNotify({
      type: "subscribe",
      locale,
      data: { email },
    });
    return { status: "success" };
  } catch (err) {
    console.error("[actions] subscribe error:", err);
    return { status: "error" };
  }
}
