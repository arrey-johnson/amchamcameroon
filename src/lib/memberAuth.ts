import { cookies, headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import type { Member } from "@/payload-types";

const TOKEN_COOKIE = "payload-token";

export type PortalAccount = {
  id: number | string;
  email: string;
  name?: string | null;
  phone?: string | null;
  status?: "active" | "invited" | "disabled" | null;
  member?: number | string | Member | null;
  collection?: string;
};

export type PortalSession = {
  account: PortalAccount;
  member: Member | null;
};

/** Current member-portal session, or null if not signed in as a member account. */
export async function getPortalSession(): Promise<PortalSession | null> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });

  if (!user || (user as { collection?: string }).collection !== "member-accounts") {
    return null;
  }

  const account = user as PortalAccount;
  if (account.status && account.status !== "active") return null;

  let member: Member | null = null;
  const memberRef = account.member;
  if (memberRef) {
    const memberId = typeof memberRef === "object" ? memberRef.id : memberRef;
    try {
      member = (await payload.findByID({
        collection: "members",
        id: memberId,
        depth: 1,
        overrideAccess: true,
      })) as Member;
    } catch {
      member = null;
    }
  }

  return { account, member };
}

function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}

export async function setAuthCookie(token: string, tokenExpirationSeconds = 7200): Promise<void> {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, token, authCookieOptions(tokenExpirationSeconds));
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  // Next.js only clears a cookie reliably when options match how it was set.
  jar.set(TOKEN_COOKIE, "", {
    ...authCookieOptions(0),
    expires: new Date(0),
  });
}
