"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { pushQuery, useUrlQuery } from "@/components/useUrlQuery";

export type NewsItem = { id: number; category: string; node: ReactNode };

const PAGE_SIZE = 30;

export function NewsExplorer({
  title,
  intro,
  allLabel,
  emptyLabel,
  categories,
  items,
}: {
  title: string;
  intro: string;
  allLabel: string;
  emptyLabel: string;
  categories: { value: string; label: string }[];
  items: NewsItem[];
}) {
  const pathname = usePathname();
  const [query, sync] = useUrlQuery();
  const requested = query.get("category");
  const category = categories.some((c) => c.value === requested) ? requested : null;
  const shown = (category ? items.filter((i) => i.category === category) : items).slice(0, PAGE_SIZE);

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
      active ? "bg-white text-navy" : "border border-white/30 text-white hover:bg-white/10"
    }`;

  return (
    <>
      {sync}
      <PageHero title={title} intro={intro}>
        <div className="mt-8 flex flex-wrap gap-2">
          <a href={pathname} onClick={pushQuery} className={tabClass(!category)}>
            {allLabel}
          </a>
          {categories.map((cat) => (
            <a
              key={cat.value}
              href={`${pathname}?category=${cat.value}`}
              onClick={pushQuery}
              className={tabClass(category === cat.value)}
            >
              {cat.label}
            </a>
          ))}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {shown.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 80}>
                {item.node}
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">{emptyLabel}</p>
        )}
      </div>
    </>
  );
}
