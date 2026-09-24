import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventCard } from "@/components/cards/EventCard";
import { EventsExplorer, type EventItem } from "@/components/events/EventsExplorer";
import { getPastEvents, getUpcomingEvents } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";
import type { Event } from "@/payload-types";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: t("title") };
}

export default async function EventsPage({ params }: Props) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as AppLocale;

  const t = await getTranslations({ locale, namespace: "events" });

  const [upcoming, past] = await Promise.all([
    getUpcomingEvents(locale, 30),
    getPastEvents(locale, 30),
  ]);

  const toItem = (event: Event, isPast: boolean): EventItem => ({
    id: event.id,
    category: event.category,
    month: formatDate(event.startAt, locale, { month: "long", year: "numeric" }),
    node: <EventCard event={event} past={isPast} />,
  });

  return (
    <EventsExplorer
      labels={{
        title: t("title"),
        tradeMissions: t("tradeMissions"),
        intro: t("intro"),
        upcoming: t("upcoming"),
        past: t("past"),
        calendar: t("calendar"),
      }}
      upcoming={upcoming.map((e) => toItem(e, false))}
      past={past.map((e) => toItem(e, true))}
    />
  );
}
