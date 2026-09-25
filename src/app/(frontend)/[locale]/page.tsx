import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroSlider } from "@/components/home/HeroSlider";
import { NewsTabs } from "@/components/home/NewsTabs";
import { LogoWall } from "@/components/home/LogoWall";
import { EventCard } from "@/components/cards/EventCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { SubscribeForm } from "@/components/forms/SubscribeForm";
import {
  getFeaturedMembers,
  getHeroSlides,
  getLatestNews,
  getPage,
  getSettings,
  getUpcomingEvents,
  getUSNews,
} from "@/lib/queries";
import { coverFirst, formatDate, mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

const PILLAR_ICONS = [
  // Trade & Investment
  <svg key="trade" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  // Policy & Advocacy
  <svg key="policy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7"><path d="M12 3v18M5 7l7-4 7 4M4 21h16M7 7v6a3 3 0 0 0 6 0V7m-2 6a3 3 0 0 0 6 0V7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  // Membership Value
  <svg key="value" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  // Trade Missions
  <svg key="missions" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>,
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as AppLocale;

  const NEWS_TABS = ["press-release", "news", "policy"];
  const [slides, latestNews, tabNews, events, usNews, members, settings, t, tCommon, whoWeAre] =
    await Promise.all([
      getHeroSlides(locale),
      getLatestNews(locale, 60),
      Promise.all(NEWS_TABS.map((cat) => getLatestNews(locale, 30, cat))),
      getUpcomingEvents(locale, 3),
      getUSNews(locale, 4),
      getFeaturedMembers(locale),
      getSettings(locale),
      getTranslations({ locale, namespace: "home" }),
      getTranslations({ locale, namespace: "common" }),
      getPage(locale, "who-we-are"),
    ]);

  // Each homepage news tab shows 3 cards: prefer articles with a cover photo,
  // and only send the cards the tabs can actually display.
  const hasCover = (n: (typeof latestNews)[number]) => Boolean(mediaUrl(n.coverImage, "card"));
  const picked = new Map<number, (typeof latestNews)[number]>();
  for (const list of [latestNews, ...tabNews]) {
    for (const n of coverFirst(list, hasCover).slice(0, 3)) picked.set(n.id, n);
  }
  const news = coverFirst(
    [...picked.values()].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    ),
    hasCover,
  );

  const pillars = [
    { title: t("pillarTradeTitle"), text: t("pillarTradeText"), href: "/membership" },
    { title: t("pillarPolicyTitle"), text: t("pillarPolicyText"), href: "/committees" },
    { title: t("pillarValueTitle"), text: t("pillarValueText"), href: "/membership" },
    { title: t("pillarMissionsTitle"), text: t("pillarMissionsText"), href: "/events?category=trade-mission" },
  ];

  const benefits = [
    { title: t("benefitAdvocacyTitle"), text: t("benefitAdvocacyText") },
    { title: t("benefitNetworkTitle"), text: t("benefitNetworkText") },
    { title: t("benefitIntelTitle"), text: t("benefitIntelText") },
  ];

  return (
    <>
      {/* 1. Hero banner slider */}
      <HeroSlider
        slides={slides
          .filter((s) => mediaUrl(s.image, "hero"))
          .map((s) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            imageUrl: mediaUrl(s.image, "hero")!,
            imageAlt: mediaObj(s.image)?.alt || s.title,
            ctaLabel: s.ctaLabel,
            ctaUrl: s.ctaUrl,
          }))}
      />

      {/* 2. Intro / Who We Are + stats */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading title={whoWeAre?.title || t("whoWeAreTitle")} />
            <p className="-mt-4 text-base leading-relaxed text-ink-soft">
              {whoWeAre?.intro || settings.siteDescription}
            </p>
            <Link
              href="/about/who-we-are"
              className="mt-6 inline-flex items-center gap-2 rounded-md border-2 border-navy px-5 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {tCommon("learnMore")}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden>
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-4">
              {(settings.stats ?? []).map((stat, i) => {
                const onNavy = i % 2 === 0;
                return (
                  <div
                    key={stat.id ?? i}
                    className={`rounded-xl border p-6 ${
                      onNavy ? "border-navy bg-navy text-white" : "border-surface-alt bg-surface-alt"
                    }`}
                  >
                    <div className={`text-3xl font-extrabold ${onNavy ? "text-white" : "text-navy"}`}>
                      {stat.value}
                    </div>
                    <div className={`mt-1 text-sm font-medium ${onNavy ? "text-white/75" : "text-ink-soft"}`}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* 3. Strategic focus areas */}
      <Section alt>
        <Reveal>
          <SectionHeading title={t("focusTitle")} subtitle={t("focusSubtitle")} center />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 90}>
              <Link
                href={pillar.href}
                className="group block h-full rounded-xl border-t-4 border-red bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                  {PILLAR_ICONS[i]}
                </div>
                <h3 className="text-lg font-bold text-navy">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pillar.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 4. Upcoming events */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <SectionHeading title={t("upcomingEventsTitle")} subtitle={t("upcomingEventsSubtitle")} />
          </Reveal>
          <Link
            href="/events"
            className="mb-10 inline-flex items-center gap-1.5 text-sm font-bold text-red hover:text-red-dark"
          >
            {tCommon("viewAll")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden>
              <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        {events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {events.map((event, i) => (
              <Reveal key={event.id} delay={i * 90}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-surface-alt p-8 text-center text-sm text-ink-soft">
            {t("noUpcomingEvents")}
          </p>
        )}
      </Section>

      {/* 5. Latest news with category tabs */}
      <Section alt>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal>
            <SectionHeading title={t("latestNewsTitle")} subtitle={t("latestNewsSubtitle")} />
          </Reveal>
          <Link
            href="/news"
            className="mb-10 inline-flex items-center gap-1.5 text-sm font-bold text-red hover:text-red-dark"
          >
            {tCommon("viewAll")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden>
              <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <NewsTabs
          items={news.map((n) => ({
            id: n.id,
            title: n.title,
            slug: n.slug,
            category: n.category,
            excerpt: n.excerpt,
            coverUrl: mediaUrl(n.coverImage, "card"),
            coverAlt: mediaObj(n.coverImage)?.alt || n.title,
            publishedAt: n.publishedAt,
          }))}
        />
      </Section>

      {/* 6. U.S. business news strip */}
      {usNews.length > 0 && (
        <Section>
          <Reveal>
            <SectionHeading title={t("usNewsTitle")} subtitle={t("usNewsSubtitle")} />
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usNews.map((item, i) => (
              <Reveal key={item.id} delay={i * 80}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-xl border border-surface-alt bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                    <span className="flex h-5 w-7 items-center justify-center rounded-sm bg-navy text-[9px] text-white">US</span>
                    <span className="text-red">{item.source}</span>
                  </div>
                  <h3 className="text-[15px] font-bold leading-snug text-ink transition-colors group-hover:text-navy">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">{item.summary}</p>
                  )}
                  <time className="mt-auto pt-3 text-xs font-medium text-ink-soft/70" dateTime={item.publishedAt}>
                    {formatDate(item.publishedAt, locale)}
                  </time>
                </a>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* 7. Membership CTA band */}
      <section className="relative overflow-hidden bg-navy py-16 sm:py-20">
        <div className="absolute inset-x-0 top-0 h-1 bg-red" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading title={t("membershipCtaTitle")} subtitle={t("membershipCtaText")} light />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, i) => (
              <Reveal key={benefit.title} delay={i * 90}>
                <div className="h-full rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-red text-white" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{benefit.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-10">
              <Link
                href="/membership"
                className="inline-flex items-center gap-2 rounded-md bg-red px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red/25 transition-all hover:-translate-y-0.5 hover:bg-red-dark"
              >
                {t("exploreMembership")}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden>
                  <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. Members / sponsors logo wall */}
      {members.length > 0 && (
        <Section>
          <Reveal>
            <SectionHeading title={t("logoWallTitle")} center />
          </Reveal>
          <LogoWall
            groups={[
              { label: t("logoWallPatrons"), members: members.filter((m) => m.category === "patron") },
              { label: t("logoWallSponsors"), members: members.filter((m) => m.category === "sponsor") },
            ]}
          />
        </Section>
      )}

      {/* 9. Newsletter subscribe */}
      <Section alt>
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionHeading title={t("newsletterTitle")} subtitle={t("newsletterText")} center />
            <div className="flex justify-center">
              <SubscribeForm />
            </div>
            <Link
              href="/newsletters"
              className="mt-5 inline-block text-sm font-semibold text-navy underline underline-offset-4 hover:text-red"
            >
              {t("newsletterArchive")}
            </Link>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
