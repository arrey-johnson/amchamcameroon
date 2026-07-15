import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { SearchBox } from "@/components/SearchBox";
import { searchContent } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: t("title") };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const { q } = await searchParams;
  const t = await getTranslations({ locale, namespace: "search" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const results = q ? await searchContent(locale, q) : null;
  const total = results ? results.news.length + results.events.length + results.members.length : 0;

  return (
    <>
      <PageHero title={t("title")}>
        <div className="mt-6 max-w-xl">
          <SearchBox initial={q} />
        </div>
      </PageHero>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {q && (
          <p className="mb-8 text-sm text-ink-soft">{t("resultsFor", { query: q })}</p>
        )}

        {q && total === 0 && (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">{tCommon("noResults")}</p>
        )}

        {results && results.news.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-extrabold text-navy">{t("sections.news")}</h2>
            <ul className="space-y-2">
              {results.news.map((n) => (
                <li key={n.id}>
                  <Link href={`/news/${n.slug}`} className="flex items-baseline justify-between gap-4 rounded-lg border border-surface-alt bg-white p-4 transition-colors hover:border-navy/20">
                    <span className="font-semibold text-ink">{n.title}</span>
                    <time className="shrink-0 text-xs text-ink-soft">{formatDate(n.publishedAt, locale)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {results && results.events.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-extrabold text-navy">{t("sections.events")}</h2>
            <ul className="space-y-2">
              {results.events.map((e) => (
                <li key={e.id}>
                  <Link href={`/events/${e.slug}`} className="flex items-baseline justify-between gap-4 rounded-lg border border-surface-alt bg-white p-4 transition-colors hover:border-navy/20">
                    <span className="font-semibold text-ink">{e.title}</span>
                    <time className="shrink-0 text-xs text-ink-soft">{formatDate(e.startAt, locale)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {results && results.members.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-extrabold text-navy">{t("sections.members")}</h2>
            <ul className="space-y-2">
              {results.members.map((m) => (
                <li key={m.id}>
                  <Link href="/membership/directory" className="flex items-baseline justify-between gap-4 rounded-lg border border-surface-alt bg-white p-4 transition-colors hover:border-navy/20">
                    <span className="font-semibold text-ink">{m.name}</span>
                    {m.sector && <span className="shrink-0 text-xs text-ink-soft">{m.sector}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
