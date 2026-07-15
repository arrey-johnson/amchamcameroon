"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";

export type NewsItemData = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  coverAlt?: string;
  publishedAt: string;
};

const TABS = ["all", "press-release", "news", "policy"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  news: "bg-navy",
  "press-release": "bg-red",
  "op-ed": "bg-green",
  policy: "bg-ink",
};

export function NewsTabs({ items }: { items: NewsItemData[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const t = useTranslations("news");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const filtered = (tab === "all" ? items : items.filter((i) => i.category === tab)).slice(0, 3);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label={t("title")}>
        {TABS.map((value) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              tab === value
                ? "bg-navy text-white shadow-sm"
                : "bg-white text-ink-soft hover:bg-navy/5 hover:text-navy"
            }`}
          >
            {value === "all" ? tCommon("all") : t(`categories.${value}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {filtered.map((article) => (
          <article
            key={article.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-surface-alt bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <Link href={`/news/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-navy/5">
              {article.coverUrl ? (
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt || article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-navy/20">★</div>
              )}
            </Link>
            <div className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white ${CATEGORY_COLORS[article.category] ?? "bg-navy"}`}
                >
                  {t(`categories.${article.category}`)}
                </span>
                <time className="text-xs font-medium text-ink-soft" dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt, locale)}
                </time>
              </div>
              <h3 className="text-lg font-bold leading-snug text-ink transition-colors group-hover:text-navy">
                <Link href={`/news/${article.slug}`}>{article.title}</Link>
              </h3>
              {article.excerpt && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{article.excerpt}</p>
              )}
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-lg bg-white p-8 text-center text-sm text-ink-soft">{tCommon("noResults")}</p>
      )}
    </div>
  );
}
