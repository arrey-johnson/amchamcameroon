import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";

type Props = { params: Promise<{ locale: string }> };

const CATS = ["patron", "sponsor"] as const;

const FEATURES: { key: string; tiers: Record<(typeof CATS)[number], boolean> }[] = [
  { key: "directoryListing", tiers: { patron: true, sponsor: true } },
  { key: "eventAccess", tiers: { patron: true, sponsor: true } },
  { key: "committees", tiers: { patron: true, sponsor: true } },
  { key: "votingRights", tiers: { patron: true, sponsor: true } },
  { key: "boardEligibility", tiers: { patron: true, sponsor: true } },
  { key: "logoHomepage", tiers: { patron: true, sponsor: true } },
  { key: "sponsorVisibility", tiers: { patron: true, sponsor: false } },
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

  return (
    <>
      <PageHero title={t("categoriesTitle")} intro={t("categoriesIntro")} />

      <Section>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {CATS.map((cat, i) => {
            const isPatron = cat === "patron";
            return (
              <Reveal key={cat} delay={i * 80}>
                <div
                  className={`flex h-full flex-col rounded-2xl border p-8 shadow-sm transition-shadow hover:shadow-lg ${
                    isPatron ? "border-gold/60 bg-navy text-white" : "border-navy/15 bg-white"
                  }`}
                >
                  {isPatron && (
                    <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-navy">
                      ★ Premium
                    </span>
                  )}
                  <h2 className={`text-2xl font-extrabold ${isPatron ? "text-white" : "text-navy"}`}>
                    {t(`cats.${cat}.name`)}
                  </h2>
                  <p className={`mt-2 text-sm leading-relaxed ${isPatron ? "text-white/75" : "text-ink-soft"}`}>
                    {t(`cats.${cat}.blurb`)}
                  </p>
                  <p className={`mt-4 text-sm font-bold ${isPatron ? "text-gold" : "text-red"}`}>
                    {t("duesOnRequest")}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {FEATURES.filter((f) => f.tiers[cat]).map((f) => (
                      <li key={f.key} className="flex items-start gap-2 text-[13px]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isPatron ? "text-gold" : "text-green"}`}
                          aria-hidden
                        >
                          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={isPatron ? "text-white/85" : "text-ink-soft"}>
                          {t(`catFeatures.${f.key}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-col gap-3">
                    <a
                      href={`/membership/creeds/${cat}-creed.pdf`}
                      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-center text-sm font-bold transition-colors ${
                        isPatron
                          ? "border-2 border-white/40 text-white hover:bg-white hover:text-navy"
                          : "border-2 border-navy/20 text-navy hover:border-navy"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
                        <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t("downloadCreed", { category: t(`cats.${cat}.name`) })}
                    </a>
                    <Link
                      href={`/membership/apply?category=${cat}`}
                      className={`rounded-md px-4 py-2.5 text-center text-sm font-bold transition-colors ${
                        isPatron
                          ? "bg-red text-white hover:bg-red-dark"
                          : "bg-navy text-white hover:bg-navy-dark"
                      }`}
                    >
                      {tCommon("becomeMember")}
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section alt>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-navy/5">
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-navy/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12" aria-hidden>
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-1a5 5 0 0 1 5-5h0M20 21v-1a5 5 0 0 0-5-5h0M8 14h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium">{t("handshakePlaceholder")}</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">{t("categoriesCtaTitle")}</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-soft">{t("categoriesCtaText")}</p>
            <Link
              href="/membership/apply"
              className="mt-7 inline-flex rounded-md bg-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-dark"
            >
              {tCommon("becomeMember")}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
