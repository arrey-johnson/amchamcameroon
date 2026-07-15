import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RichText } from "@/components/RichText";
import { getEvent } from "@/lib/queries";
import { formatDate, formatTime, mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEvent(locale as AppLocale, slug);
  if (!event) return {};
  return { title: event.title };
}

export default async function EventPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = raw as AppLocale;
  const event = await getEvent(locale, slug);
  if (!event) notFound();

  const t = await getTranslations({ locale, namespace: "events" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const cover = mediaUrl(event.coverImage, "hero");
  const isPast = new Date(event.startAt) < new Date();

  return (
    <>
      {/* Event hero */}
      <div className="relative overflow-hidden bg-navy">
        {cover && (
          <>
            <Image
              src={cover}
              alt={mediaObj(event.coverImage)?.alt || event.title}
              fill
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/40" aria-hidden />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="rounded-full bg-red px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
            {t(`categories.${event.category}`)}
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {event.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/85">
            <p className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4.5 w-4.5 text-white/70" aria-hidden>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {formatDate(event.startAt, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              {formatTime(event.startAt, locale)}
              {event.endAt && ` – ${formatTime(event.endAt, locale)}`}
            </p>
            {event.venue && (
              <p className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4.5 w-4.5 text-white/70" aria-hidden>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {event.venue}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RichText data={event.description} />

          {/* Past-event gallery */}
          {isPast && (event.gallery?.length ?? 0) > 0 && (
            <div className="mt-12">
              <h2 className="mb-5 text-2xl font-extrabold text-navy">{t("gallery")}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {event.gallery!.map((g) => {
                  const url = mediaUrl(g.image, "card");
                  if (!url) return null;
                  return (
                    <div key={g.id} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={url}
                        alt={mediaObj(g.image)?.alt || event.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 300px"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {(event.priceMember || event.priceNonMember) && (
            <div className="rounded-xl bg-surface-alt p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-soft">{t("pricing")}</h2>
              <div className="mt-3 space-y-2 text-sm">
                {event.priceMember && (
                  <p className="flex justify-between">
                    <span className="text-ink-soft">{tCommon("members")}</span>
                    <span className="font-bold text-green">{event.priceMember}</span>
                  </p>
                )}
                {event.priceNonMember && (
                  <p className="flex justify-between">
                    <span className="text-ink-soft">{tCommon("nonMembers")}</span>
                    <span className="font-bold text-navy">{event.priceNonMember}</span>
                  </p>
                )}
              </div>
            </div>
          )}
          {!isPast &&
            (event.registrationUrl ? (
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-red p-5 text-center text-base font-bold text-white shadow-lg shadow-red/20 transition-all hover:-translate-y-0.5 hover:bg-red-dark"
              >
                {t("registerNow")} →
              </a>
            ) : (
              <Link
                href="/contact"
                className="block rounded-xl bg-navy p-5 text-center text-base font-bold text-white transition-colors hover:bg-navy-dark"
              >
                {t("interested")} →
              </Link>
            ))}
        </aside>
      </div>
    </>
  );
}
