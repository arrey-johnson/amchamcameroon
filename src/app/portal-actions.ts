"use server";

import { getLocale } from "next-intl/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { getPayloadClient, type AppLocale } from "@/lib/payload";
import { clearAuthCookie, getPortalSession, setAuthCookie } from "@/lib/memberAuth";
import { getSettings } from "@/lib/queries";

export type PortalAuthState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const MIN_PASSWORD_LENGTH = 8;

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function memberLogin(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return { status: "error", message: "missing" };
  }

  try {
    const payload = await getPayloadClient();
    const result = await payload.login({
      collection: "member-accounts",
      data: { email, password },
    });

    const account = result.user as { status?: string } | undefined;
    if (!account || account.status !== "active") {
      await clearAuthCookie();
      return { status: "error", message: "disabled" };
    }

    if (!result.token) {
      return { status: "error", message: "failed" };
    }

    await setAuthCookie(result.token);
    return { status: "success" };
  } catch {
    return { status: "error", message: "failed" };
  }
}

export async function updateMemberProfile(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const session = await getPortalSession();
  if (!session) return { status: "error", message: "auth" };

  const name = String(form.get("name") || "").trim().slice(0, 200);
  const phone = String(form.get("phone") || "").trim().slice(0, 60);
  const website = String(form.get("website") || "").trim().slice(0, 300);
  const description = String(form.get("description") || "").trim().slice(0, 4000);

  if (!name) return { status: "error", message: "missing" };

  try {
    const payload = await getPayloadClient();
    await payload.update({
      collection: "member-accounts",
      id: session.account.id,
      data: { name, phone: phone || null },
      overrideAccess: true,
    });

    if (session.member) {
      await payload.update({
        collection: "members",
        id: session.member.id,
        data: {
          website: website || null,
          description: description || null,
        },
        overrideAccess: true,
      });
    }

    return { status: "success" };
  } catch {
    return { status: "error", message: "failed" };
  }
}

/**
 * Always returns success when the email looks valid, so we never reveal
 * whether an address has a portal account.
 */
export async function memberForgotPassword(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { status: "error", message: "missing" };
  }

  const locale = (await getLocale()) as AppLocale;

  try {
    const payload = await getPayloadClient();
    const token = await payload.forgotPassword({
      collection: "member-accounts",
      data: { email },
      disableEmail: true,
      expiration: 60 * 60 * 1000,
    });

    if (token) {
      const found = await payload.find({
        collection: "member-accounts",
        where: { email: { equals: email } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      const account = found.docs[0] as
        | { id: number | string; email: string; name?: string | null; status?: string | null }
        | undefined;

      if (account?.status === "active") {
        const settings = await getSettings(locale);
        const resetUrl = `${siteOrigin()}/${locale}/portal/reset-password?token=${encodeURIComponent(token)}`;
        await sendPasswordResetEmail({
          to: account.email,
          name: account.name,
          resetUrl,
          locale,
          settings,
        });
      } else if (account) {
        // Invited / disabled — invalidate any token so it cannot be used.
        await payload
          .update({
            collection: "member-accounts",
            id: account.id,
            data: {
              resetPasswordToken: null,
              resetPasswordExpiration: null,
            },
            overrideAccess: true,
          })
          .catch(() => undefined);
      }
    }
  } catch (err) {
    console.error("[portal] forgot password failed:", err);
    // Still show the same success screen — avoids account enumeration.
  }

  return { status: "success" };
}

export async function memberResetPassword(
  _prev: PortalAuthState,
  form: FormData,
): Promise<PortalAuthState> {
  const token = String(form.get("token") || "").trim();
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm") || "");

  if (!token) return { status: "error", message: "token" };
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { status: "error", message: "short" };
  }
  if (password !== confirm) return { status: "error", message: "mismatch" };

  try {
    const payload = await getPayloadClient();
    const result = await payload.resetPassword({
      collection: "member-accounts",
      data: { token, password },
      overrideAccess: true,
    });

    const user = result.user as { status?: string } | undefined;
    if (!user || user.status !== "active") {
      await clearAuthCookie();
      return { status: "error", message: "disabled" };
    }

    if (result.token) {
      await setAuthCookie(result.token);
    }

    return { status: "success" };
  } catch {
    return { status: "error", message: "token" };
  }
}
