"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getPayloadClient } from "@/lib/payload";
import { clearAuthCookie, getPortalSession, setAuthCookie } from "@/lib/memberAuth";

export type PortalAuthState = {
  status: "idle" | "success" | "error";
  message?: string;
};

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

export async function memberLogout(): Promise<void> {
  try {
    const payload = await getPayloadClient();
    const { user } = await payload.auth({ headers: await headers() });
    if ((user as { collection?: string } | null)?.collection === "member-accounts") {
      // Best-effort server logout; cookie clear is what ends the portal session.
      await payload
        .logout({ collection: "member-accounts" } as never)
        .catch(() => undefined);
    }
  } catch {
    /* still clear cookie */
  }
  await clearAuthCookie();
  const locale = await getLocale();
  redirect({ href: "/portal/login", locale });
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
