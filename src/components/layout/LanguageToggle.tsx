"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: "en" | "fr") => {
    if (next === locale) return;
    const qs = window.location.search;
    router.replace(`${pathname}${qs}`, { locale: next });
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/25 p-0.5 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors ${
            locale === l ? "bg-white text-navy" : "text-white/80 hover:text-white"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
