import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { RichText } from "@/components/RichText";
import { getCommittee } from "@/lib/queries";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const committee = await getCommittee(locale as AppLocale, slug);
  if (!committee) return {};
  return { title: committee.name, description: committee.summary || undefined };
}

export default async function CommitteePage({ params }: Props) {
  const { locale, slug } = await params;
  const committee = await getCommittee(locale as AppLocale, slug);
  if (!committee) notFound();

  const t = await getTranslations({ locale, namespace: "committees" });

  return (
    <>
      <PageHero title={committee.name} intro={committee.summary} />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RichText data={committee.description} />
        </div>
        <aside className="space-y-6">
          {committee.chair && (
            <div className="rounded-xl bg-surface-alt p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-soft">{t("chair")}</h2>
              <p className="mt-2 text-lg font-bold text-navy">{committee.chair}</p>
            </div>
          )}
          {(committee.focusAreas?.length ?? 0) > 0 && (
            <div className="rounded-xl bg-surface-alt p-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-soft">{t("focusAreas")}</h2>
              <ul className="mt-3 space-y-2.5">
                {committee.focusAreas!.map((f) => (
                  <li key={f.id} className="flex items-start gap-2 text-sm text-ink">
                    <span className="mt-1 text-red" aria-hidden>★</span>
                    {f.area}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            href="/contact"
            className="block rounded-xl bg-navy p-6 text-white transition-colors hover:bg-navy-dark"
          >
            <p className="text-base font-bold">{t("joinCommittee")}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-white">
              →
            </span>
          </Link>
        </aside>
      </div>
    </>
  );
}
