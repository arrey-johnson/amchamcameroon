"use client";

import { useState } from "react";

/** Dashboard logout: clears the Payload session cookie and returns to login. */
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      /* still send the user to login */
    }
    window.location.assign("/admin/login");
  };

  return (
    <button
      type="button"
      className="amcham-btn amcham-btn--ghost"
      onClick={logout}
      disabled={busy}
      aria-label="Log out"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="15" height="15" aria-hidden>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {busy ? "Logging out…" : "Log out"}
    </button>
  );
}
