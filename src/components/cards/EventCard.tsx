import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTime, mediaUrl, mediaObj } from "@/lib/utils";
import type { Event } from "@/payload-types";

export async function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  const locale = await getLocale();
  const t = await getTranslations("events");
  const tCommon = await getTranslations("common");
  const cover = mediaUrl(event.coverImage, "card");
  const alt = mediaObj(event.coverImage)?.alt || event.title;
  const day = new Date(event.startAt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-surface-alt bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/events/${event.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-navy/5">
        {cover ? (
          <Image
            src={cover}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${past ? "grayscale-[35%]" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-navy/20">★</div>
        )}
        {/* Date badge */}
        <div className="absolute left-4 top-4 overflow-hidden rounded-lg bg-white text-center shadow-md">
          <div className="bg-red px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            {formatDate(day, locale, { month: "short" })}
          </div>
          <div className="px-3 py-1 text-xl font-extrabold text-navy">
            {day.getDate()}
          </div>
        </div>
        <span className="absolute right-3 top-4 rounded-full bg-navy/85 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {t(`categories.${event.category}`)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-ink transition-colors group-hover:text-navy">
          <Link href={`/events/${event.slug}`}>{event.title}</Link>
        </h3>
        <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
          <p className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-red" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatDate(event.startAt, locale)} · {formatTime(event.startAt, locale)}
          </p>
          {event.venue && (
            <p className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-red" aria-hidden>
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {event.venue}
            </p>
          )}
        </div>
        <div className="mt-auto pt-4">
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-red transition-colors hover:text-red-dark"
          >
            {past ? tCommon("readMore") : tCommon("register")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden>
              <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
