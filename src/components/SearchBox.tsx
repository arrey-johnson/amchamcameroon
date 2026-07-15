"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function SearchBox({ initial = "" }: { initial?: string }) {
  const [query, setQuery] = useState(initial);
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }}
      className="relative"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        autoFocus
        className="w-full rounded-full border border-ink/15 bg-white py-3.5 pl-12 pr-4 text-base text-ink outline-none focus:border-navy"
      />
    </form>
  );
}
