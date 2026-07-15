import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { EventCard } from "@/components/cards/EventCard";
import { Reveal } from "@/components/Reveal";
import { getPastEvents, getUpcomingEvents } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";
import type { Event } from "@/payload-types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; category?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: t("title") };
}

function groupByMonth(events: Event[], locale: string): [string, Event[]][] {
  const groups = new Map<string, Event[]>();
  for (const event of events) {
    const key = formatDate(event.startAt, locale, { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return Array.from(groups.entries());
}

export default async function EventsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const { view: viewParam, category } = await searchParams;
  const view = viewParam === "past" ? "past" : viewParam === "calendar" ? "calendar" : "upcoming";

  const t = await getTranslations({ locale, namespace: "events" });

  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(locale, 30),
    getPastEvents(locale, 30),
  ]);

  const byCategory = (list: Event[]) =>
    category ? list.filter((e) => e.category === category) : list;

  const tabs = [
    { key: "upcoming", label: t("upcoming"), href: "/events" },
    { key: "past", label: t("past"), href: "/events?view=past" },
    { key: "calendar", label: t("calendar"), href: "/events?view=calendar" },
  ];

  const shown = view === "past" ? byCategory(past) : byCategory(upcoming);

  return (
    <>
      <PageHero title={category === "trade-mission" ? t("tradeMissions") : t("title")} intro={t("intro")}>
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                view === tab.key && !category
                  ? "bg-white text-navy"
                  : "border border-white/30 text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <Link
            href="/events?category=trade-mission"
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              category === "trade-mission"
                ? "bg-white text-navy"
                : "border border-white/30 text-white hover:bg-white/10"
            }`}
          >
            {t("tradeMissions")}
          </Link>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {view === "calendar" ? (
          <div className="space-y-12">
            {groupByMonth([...byCategory(upcoming), ...byCategory(past)], locale).map(
              ([month, events]) => (
                <div key={month}>
                  <h2 className="mb-5 border-b-2 border-surface-alt pb-2 text-xl font-extrabold capitalize text-navy">
                    {month}
                  </h2>
                  <div className="grid gap-6 md:grid-cols-3">
                    {events.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        past={new Date(event.startAt) < new Date()}
                      />
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        ) : shown.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((event, i) => (
              <Reveal key={event.id} delay={(i % 3) * 80}>
                <EventCard event={event} past={view === "past"} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">
            {t("intro")}
          </p>
        )}
      </div>
    </>
  );
}
