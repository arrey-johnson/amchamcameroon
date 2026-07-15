import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { getNewsletters } from "@/lib/queries";
import { formatDate, mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newsletters" });
  return { title: t("title") };
}

export default async function NewslettersPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: "newsletters" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const newsletters = await getNewsletters(locale);

  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newsletters.map((issue, i) => {
            const cover = mediaUrl(issue.coverImage, "card");
            const pdf = mediaUrl(issue.pdf);
            return (
              <Reveal key={issue.id} delay={(i % 4) * 70}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-surface-alt bg-white shadow-sm transition-shadow hover:shadow-lg">
                  <div className="relative aspect-[3/4] overflow-hidden bg-navy/5">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={mediaObj(issue.coverImage)?.alt || issue.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-navy/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-14 w-14" aria-hidden>
                          <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {issue.issueNumber && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-red">
                        {t("issue")} {issue.issueNumber}
                      </span>
                    )}
                    <h3 className="mt-1 text-sm font-bold leading-snug text-ink">{issue.title}</h3>
                    <time className="mt-1 text-xs text-ink-soft" dateTime={issue.date}>
                      {formatDate(issue.date, locale, { month: "long", year: "numeric" })}
                    </time>
                    {pdf && (
                      <a
                        href={pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-bold text-navy transition-colors hover:text-red"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                          <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {tCommon("download")}
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
        {newsletters.length === 0 && (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">{t("intro")}</p>
        )}
      </div>
    </>
  );
}
