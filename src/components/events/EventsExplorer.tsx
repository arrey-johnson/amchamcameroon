"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { pushQuery, useUrlQuery } from "@/components/useUrlQuery";
import { coverFirst } from "@/lib/utils";

export type EventItem = {
  id: number;
  category: string;
  month: string;
  hasCover: boolean;
  node: ReactNode;
};

type View = "upcoming" | "past" | "calendar";

function groupByMonth(items: EventItem[]): [string, EventItem[]][] {
  const groups = new Map<string, EventItem[]>();
  for (const item of items) {
    if (!groups.has(item.month)) groups.set(item.month, []);
    groups.get(item.month)!.push(item);
  }
  return Array.from(groups.entries());
}

export function EventsExplorer({
  labels,
  upcoming,
  past,
}: {
  labels: {
    title: string;
    tradeMissions: string;
    intro: string;
    upcoming: string;
    past: string;
    calendar: string;
  };
  upcoming: EventItem[];
  past: EventItem[];
}) {
  const pathname = usePathname();
  const [query, sync] = useUrlQuery();
  const viewParam = query.get("view");
  const view: View = viewParam === "past" ? "past" : viewParam === "calendar" ? "calendar" : "upcoming";
  const category = query.get("category");

  const byCategory = (list: EventItem[]) =>
    category ? list.filter((e) => e.category === category) : list;
  // Calendar stays chronological; list views lead with events that have a photo.
  const shown = coverFirst(view === "past" ? byCategory(past) : byCategory(upcoming), (e) => e.hasCover);

  const tabs: { key: View; label: string; href: string }[] = [
    { key: "upcoming", label: labels.upcoming, href: pathname },
    { key: "past", label: labels.past, href: `${pathname}?view=past` },
    { key: "calendar", label: labels.calendar, href: `${pathname}?view=calendar` },
  ];

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
      active ? "bg-white text-navy" : "border border-white/30 text-white hover:bg-white/10"
    }`;

  return (
    <>
      {sync}
      <PageHero
        title={category === "trade-mission" ? labels.tradeMissions : labels.title}
        intro={labels.intro}
      >
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <a
              key={tab.key}
              href={tab.href}
              onClick={pushQuery}
              className={tabClass(view === tab.key && !category)}
            >
              {tab.label}
            </a>
          ))}
          <a
            href={`${pathname}?category=trade-mission`}
            onClick={pushQuery}
            className={tabClass(category === "trade-mission")}
          >
            {labels.tradeMissions}
          </a>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {view === "calendar" ? (
          <div className="space-y-12">
            {groupByMonth([...byCategory(upcoming), ...byCategory(past)]).map(([month, items]) => (
              <div key={month}>
                <h2 className="mb-5 border-b-2 border-surface-alt pb-2 text-xl font-extrabold capitalize text-navy">
                  {month}
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {items.map((item) => (
                    <div key={item.id}>{item.node}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : shown.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((item, i) => (
              <Reveal key={item.id} delay={(i % 3) * 80}>
                {item.node}
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">
            {labels.intro}
          </p>
        )}
      </div>
    </>
  );
}
