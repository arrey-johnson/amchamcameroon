"use client";

import { useState } from "react";

type Status = "idle" | "saving" | "success" | "error";

const CATEGORIES = [
  { value: "patron", label: "Patron" },
  { value: "sponsor", label: "Sponsor" },
  { value: "corporate", label: "Corporate" },
  { value: "sme", label: "SME" },
  { value: "individual", label: "Individual" },
];

/**
 * Dashboard quick-action: add a member (with logo) in a popup, without leaving
 * the dashboard. Uploads the logo to /api/media then creates the member via
 * /api/members (same-origin cookie auth). New member appears in the directory,
 * and — if "featured" — on the homepage logo wall.
 */
export default function AddMemberButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "corporate",
    sector: "",
    website: "",
    featured: true,
  });
  const [logo, setLogo] = useState<File | null>(null);

  const reset = () => {
    setForm({ name: "", category: "corporate", sector: "", website: "", featured: true });
    setLogo(null);
    setStatus("idle");
    setError("");
  };

  const close = () => {
    setOpen(false);
    if (status === "success") window.location.reload();
    else reset();
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setStatus("saving");
    setError("");
    try {
      // 1. Upload the logo (optional) to the media library.
      let logoId: number | string | undefined;
      if (logo) {
        const fd = new FormData();
        fd.append("file", logo);
        fd.append("_payload", JSON.stringify({ alt: `${form.name} logo` }));
        const up = await fetch("/api/media", { method: "POST", body: fd, credentials: "include" });
        if (!up.ok) throw new Error("Logo upload failed");
        const upJson = await up.json();
        logoId = upJson?.doc?.id;
      }

      // 2. Create the member.
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          sector: form.sector.trim() || undefined,
          website: form.website.trim() || undefined,
          featured: form.featured,
          logo: logoId,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.errors?.[0]?.message || "Could not create member");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <>
      <button type="button" className="amcham-btn amcham-btn--primary" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} width="15" height="15">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        Add member
      </button>

      {open && (
        <div className="amcham-modal" role="dialog" aria-modal="true" onClick={close}>
          <div className="amcham-modal__card" onClick={(e) => e.stopPropagation()}>
            <div className="amcham-modal__head">
              <h2 className="amcham-modal__title">Add a member</h2>
              <button type="button" className="amcham-modal__close" aria-label="Close" onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="18" height="18">
                  <path d="M6 6l12 12M6 18 18 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {status === "success" ? (
              <div className="amcham-modal__success">
                <div className="amcham-modal__check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} width="26" height="26">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="amcham-modal__success-title">“{form.name}” added</p>
                <p className="amcham-modal__success-text">
                  It now appears in the members directory{form.featured ? " and the homepage logo wall" : ""}.
                </p>
                <div className="amcham-modal__actions">
                  <button type="button" className="amcham-btn amcham-btn--ghost" onClick={reset}>
                    Add another
                  </button>
                  <button type="button" className="amcham-btn amcham-btn--primary" onClick={close}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="amcham-modal__body">
                <label className="amcham-field">
                  <span>Company / member name *</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                  />
                </label>
                <div className="amcham-field-row">
                  <label className="amcham-field">
                    <span>Category</span>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="amcham-field">
                    <span>Sector</span>
                    <input
                      value={form.sector}
                      onChange={(e) => setForm({ ...form, sector: e.target.value })}
                      placeholder="e.g. Banking"
                    />
                  </label>
                </div>
                <label className="amcham-field">
                  <span>Website</span>
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://…"
                  />
                </label>
                <label className="amcham-field">
                  <span>Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                  />
                </label>
                <label className="amcham-check">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  <span>Show logo on the homepage logo wall</span>
                </label>

                {status === "error" && <p className="amcham-modal__error">{error}</p>}

                <div className="amcham-modal__actions">
                  <button type="button" className="amcham-btn amcham-btn--ghost" onClick={close}>
                    Cancel
                  </button>
                  <button type="submit" className="amcham-btn amcham-btn--primary" disabled={status === "saving"}>
                    {status === "saving" ? "Adding…" : "Add member"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
