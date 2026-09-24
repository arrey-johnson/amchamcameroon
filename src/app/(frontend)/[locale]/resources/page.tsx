import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

type Props = { params: Promise<{ locale: string }> };

const RESOURCES = [
  {
    name: "U.S. Embassy Cameroon",
    url: "https://cm.usembassy.gov",
    descEn: "Consular services, visas and official U.S.–Cameroon relations.",
    descFr: "Services consulaires, visas et relations officielles É.-U.–Cameroun.",
  },
  {
    name: "U.S. Chamber of Commerce",
    url: "https://www.uschamber.com",
    descEn: "The world's largest business federation — AmCham Cameroon's parent affiliate.",
    descFr: "La plus grande fédération d'entreprises au monde — la maison-mère d'AmCham Cameroun.",
  },
  {
    name: "U.S.–Cameroon Trade & Investment",
    url: "https://ustr.gov/countries-regions/africa/cameroon",
    descEn: "USTR resources on bilateral trade, AGOA eligibility and market access.",
    descFr: "Ressources de l'USTR sur le commerce bilatéral, l'AGOA et l'accès au marché.",
  },
  {
    name: "AGOA.info",
    url: "https://agoa.info",
    descEn: "The African Growth and Opportunity Act portal — duty-free access to the U.S. market.",
    descFr: "Le portail de l'AGOA — accès en franchise de droits au marché américain.",
  },
  {
    name: "AmChams in Africa",
    url: "https://www.amchamsinafrica.org",
    descEn: "Directory of American Chambers of Commerce across the African continent.",
    descFr: "Annuaire des Chambres de Commerce Américaines sur le continent africain.",
  },
  {
    name: "U.S. Commercial Service",
    url: "https://www.trade.gov/cameroon",
    descEn: "Trade data, market research and export assistance for U.S.–Cameroon business.",
    descFr: "Données commerciales, études de marché et aide à l'export É.-U.–Cameroun.",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "resources" });
  return { title: t("title") };
}

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "resources" });

  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((resource, i) => (
            <Reveal key={resource.name} delay={(i % 3) * 80}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-xl border border-surface-alt bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-navy/5 text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-navy">{resource.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {locale === "fr" ? resource.descFr : resource.descEn}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-red">
                  {t("visit")}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden>
                    <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
