import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { getCommittees } from "@/lib/queries";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "committees" });
  return { title: t("title") };
}

export default async function CommitteesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "committees" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const committees = await getCommittees(locale as AppLocale);

  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {committees.map((committee, i) => (
            <Reveal key={committee.id} delay={(i % 3) * 90}>
              <Link
                href={`/committees/${committee.slug}`}
                className="group flex h-full flex-col rounded-xl border-t-4 border-navy bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-navy">{committee.name}</h2>
                {committee.summary && (
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-soft">{committee.summary}</p>
                )}
                {committee.chair && (
                  <p className="mt-3 text-[13px] text-ink-soft">
                    <span className="font-bold text-ink">{t("chair")}:</span> {committee.chair}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-red">
                  {tCommon("learnMore")}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden>
                    <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
