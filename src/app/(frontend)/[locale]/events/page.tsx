import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventCard } from "@/components/cards/EventCard";
import { NewsCard } from "@/components/cards/NewsCard";
import { EventsExplorer, type EventItem } from "@/components/events/EventsExplorer";
import { getLatestNews, getPastEvents, getUpcomingEvents } from "@/lib/queries";
import { coverFirst, formatDate, mediaUrl } from "@/lib/utils";
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
  const tNews = await getTranslations({ locale, namespace: "news" });

  const [upcoming, past, news] = await Promise.all([
    getUpcomingEvents(locale, 30),
    getPastEvents(locale, 30),
    getLatestNews(locale, 12),
  ]);

  const toItem = (event: Event, isPast: boolean): EventItem => ({
    id: event.id,
    category: event.category,
    month: formatDate(event.startAt, locale, { month: "long", year: "numeric" }),
    hasCover: Boolean(mediaUrl(event.coverImage, "card")),
    node: <EventCard event={event} past={isPast} />,
  });

  const latestNews = coverFirst(
    news,
    (a) => Boolean(mediaUrl(a.coverImage, "card")),
  )
    .slice(0, 3)
    .map((article) => (
      <NewsCard
        key={article.id}
        article={article}
        locale={locale}
        categoryLabel={tNews(`categories.${article.category}`)}
      />
    ));

  return (
    <EventsExplorer
      labels={{
        title: t("title"),
        tradeMissions: t("tradeMissions"),
        intro: t("intro"),
        upcoming: t("upcoming"),
        past: t("past"),
        calendar: t("calendar"),
        latestNews: t("latestNews"),
        viewAllNews: t("viewAllNews"),
      }}
      upcoming={upcoming.map((e) => toItem(e, false))}
      past={past.map((e) => toItem(e, true))}
      latestNews={latestNews}
    />
  );
}
