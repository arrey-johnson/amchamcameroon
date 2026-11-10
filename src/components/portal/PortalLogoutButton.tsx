"use client";

import { useState } from "react";

type Props = {
  label: string;
  locale: string;
};

/** Ends the member-portal session and hard-navigates to login. */
export function PortalLogoutButton({ label, locale }: Props) {
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Payload REST logout revokes the session and sends Set-Cookie: expired.
      await fetch("/api/member-accounts/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      /* continue — force-clear below */
    }
    try {
      // Always expire payload-token even if the collection logout returned 400.
      await fetch("/api/auth/clear-session", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      /* still leave the portal */
    }
    // Full navigation avoids a stale RSC tree still showing the dashboard.
    window.location.assign(`/${locale}/portal/login`);
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="rounded-md bg-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-navy-dark disabled:opacity-60"
    >
      {busy ? "…" : label}
    </button>
  );
}
