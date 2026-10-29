"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { pushQuery, useUrlQuery } from "@/components/useUrlQuery";
import { coverFirst } from "@/lib/utils";

export type EventItem = {
  id: number;
  category: string;
  month: string;
  startAt: string;
  endAt?: string | null;
  past: boolean;
  hasCover: boolean;
  node: ReactNode;
};

type View = "upcoming" | "past" | "calendar";

export function EventsExplorer({
  locale,
  labels,
  upcoming,
  past,
  latestNews,
}: {
  locale: string;
  labels: {
    title: string;
    tradeMissions: string;
    intro: string;
    upcoming: string;
    past: string;
    calendar: string;
    latestNews: string;
    viewAllNews: string;
    previousMonth: string;
    nextMonth: string;
    eventsOnDay: string;
    noEventsOnDay: string;
    upcomingDot: string;
    pastDot: string;
  };
  upcoming: EventItem[];
  past: EventItem[];
  latestNews: ReactNode[];
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
  const calendarEvents = [...byCategory(upcoming), ...byCategory(past)];

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
          <EventsCalendar
            events={calendarEvents}
            locale={locale}
            labels={{
              previousMonth: labels.previousMonth,
              nextMonth: labels.nextMonth,
              eventsOnDay: labels.eventsOnDay,
              noEventsOnDay: labels.noEventsOnDay,
              upcomingDot: labels.upcomingDot,
              pastDot: labels.pastDot,
            }}
          />
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

        {view === "past" && latestNews.length > 0 && (
          <div className="mt-20 border-t border-surface-alt pt-14">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">{labels.latestNews}</h2>
              <Link href="/news" className="text-sm font-bold text-red transition-colors hover:text-red-dark">
                {labels.viewAllNews}
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {latestNews.map((node, i) => (
                <Reveal key={i} delay={(i % 3) * 80}>
                  {node}
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
