import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";

type Props = { params: Promise<{ locale: string }> };

const CATS = ["patron", "sponsor", "corporate", "sme", "individual"] as const;

// Feature matrix: which membership tier includes which benefit.
const FEATURES: { key: string; tiers: Record<(typeof CATS)[number], boolean> }[] = [
  { key: "directoryListing", tiers: { patron: true, sponsor: true, corporate: true, sme: true, individual: true } },
  { key: "eventAccess", tiers: { patron: true, sponsor: true, corporate: true, sme: true, individual: true } },
  { key: "committees", tiers: { patron: true, sponsor: true, corporate: true, sme: true, individual: true } },
  { key: "votingRights", tiers: { patron: true, sponsor: true, corporate: true, sme: true, individual: false } },
  { key: "boardEligibility", tiers: { patron: true, sponsor: true, corporate: true, sme: false, individual: false } },
  { key: "logoHomepage", tiers: { patron: true, sponsor: true, corporate: false, sme: false, individual: false } },
  { key: "sponsorVisibility", tiers: { patron: true, sponsor: false, corporate: false, sme: false, individual: false } },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("categoriesTitle") };
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "membership" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const highlight: Record<string, boolean> = { patron: true };

  return (
    <>
      <PageHero title={t("categoriesTitle")} intro={t("categoriesIntro")} />

      <Section>
        <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-5">
          {CATS.map((cat, i) => (
            <Reveal key={cat} delay={i * 70}>
              <div
                className={`flex h-full flex-col rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-lg ${
                  highlight[cat]
                    ? "border-gold bg-navy text-white"
                    : "border-surface-alt bg-white"
                }`}
              >
                {highlight[cat] && (
                  <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-navy">
                    ★ Premium
                  </span>
                )}
                <h2 className={`text-xl font-extrabold ${highlight[cat] ? "text-white" : "text-navy"}`}>
                  {t(`cats.${cat}.name`)}
                </h2>
                <p className={`mt-2 text-sm leading-relaxed ${highlight[cat] ? "text-white/75" : "text-ink-soft"}`}>
                  {t(`cats.${cat}.blurb`)}
                </p>
                <p className={`mt-4 text-sm font-bold ${highlight[cat] ? "text-white" : "text-red"}`}>
                  {t("duesOnRequest")}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {FEATURES.filter((f) => f.tiers[cat]).map((f) => (
                    <li key={f.key} className="flex items-start gap-2 text-[13px]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${highlight[cat] ? "text-white" : "text-green"}`}
                        aria-hidden
                      >
                        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className={highlight[cat] ? "text-white/85" : "text-ink-soft"}>
                        {t(`catFeatures.${f.key}`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/membership/apply?category=${cat}`}
                  className={`mt-6 rounded-md px-4 py-2.5 text-center text-sm font-bold transition-colors ${
                    highlight[cat]
                      ? "bg-red text-white hover:bg-red-dark"
                      : "border-2 border-navy text-navy hover:bg-navy hover:text-white"
                  }`}
                >
                  {tCommon("becomeMember")}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
