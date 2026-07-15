"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type MemberData = {
  id: number;
  name: string;
  logoUrl?: string | null;
  logoAlt?: string;
  sector?: string | null;
  category: string;
  website?: string | null;
  description?: string | null;
};

export function DirectoryExplorer({ members }: { members: MemberData[] }) {
  const t = useTranslations("membership");
  const tCommon = useTranslations("common");
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [category, setCategory] = useState("all");

  const sectors = useMemo(
    () => Array.from(new Set(members.map((m) => m.sector).filter(Boolean))).sort() as string[],
    [members],
  );

  const filtered = members.filter((m) => {
    if (sector !== "all" && m.sector !== sector) return false;
    if (category !== "all" && m.category !== category) return false;
    if (query && !`${m.name} ${m.sector ?? ""} ${m.description ?? ""}`.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  const selectCls =
    "rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-navy";

  return (
    <div>
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <label className="relative block">
          <span className="sr-only">{t("searchMembers")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchMembers")}
            className={`${selectCls} w-full pl-9`}
          />
        </label>
        <label>
          <span className="sr-only">{t("filterSector")}</span>
          <select value={sector} onChange={(e) => setSector(e.target.value)} className={`${selectCls} w-full`}>
            <option value="all">{t("filterSector")} — {tCommon("all")}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">{t("filterCategory")}</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectCls} w-full`}>
            <option value="all">{t("filterCategory")} — {tCommon("all")}</option>
            {(["patron", "sponsor", "corporate", "sme", "individual"] as const).map((c) => (
              <option key={c} value={c}>{t(`cats.${c}.name`)}</option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">
          {tCommon("noResults")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <article
              key={m.id}
              className="flex h-full flex-col rounded-xl border border-surface-alt bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-16 w-28 items-center justify-start">
                  {m.logoUrl ? (
                    <Image
                      src={m.logoUrl}
                      alt={m.logoAlt || m.name}
                      width={112}
                      height={64}
                      className="max-h-14 w-auto object-contain"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-lg font-extrabold text-navy">
                      {m.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="rounded-full bg-navy/5 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-navy">
                  {t(`cats.${m.category}.name`)}
                </span>
              </div>
              <h3 className="text-base font-bold text-ink">{m.name}</h3>
              {m.sector && <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-red">{m.sector}</p>}
              {m.description && (
                <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">{m.description}</p>
              )}
              {m.website && (
                <a
                  href={m.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-bold text-navy hover:text-red"
                >
                  {t("visitWebsite")}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden>
                    <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
