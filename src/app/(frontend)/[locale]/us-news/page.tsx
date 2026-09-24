import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { getUSNews } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "usNewsPage" });
  return { title: t("title") };
}

export default async function USNewsPage({ params }: Props) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: "usNewsPage" });
  const items = await getUSNews(locale, 40);

  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="space-y-4">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 6) * 60}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 rounded-xl border border-surface-alt bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
                    <span className="flex h-5 w-7 items-center justify-center rounded-sm bg-navy text-[9px] text-white">US</span>
                    <span className="text-red">{item.source}</span>
                    <span className="text-ink-soft/60">· {formatDate(item.publishedAt, locale)}</span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug text-ink transition-colors group-hover:text-navy">
                    {item.title}
                  </h2>
                  {item.summary && (
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.summary}</p>
                  )}
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="hidden h-5 w-5 shrink-0 text-navy sm:block" aria-hidden>
                  <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Reveal>
          ))}
        </div>
        {items.length === 0 && (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">{t("intro")}</p>
        )}
      </div>
    </>
  );
}
