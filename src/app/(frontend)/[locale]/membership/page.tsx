import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { RichText } from "@/components/RichText";
import { getPage } from "@/lib/queries";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

const BENEFIT_KEYS = [
  "advocacy",
  "networking",
  "intelligence",
  "matchmaking",
  "visa",
  "directory",
  "events",
  "promotion",
] as const;

const BENEFIT_ICONS: Record<(typeof BENEFIT_KEYS)[number], React.ReactNode> = {
  advocacy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><path d="M12 3v18M5 7l7-4 7 4M4 21h16M7 7v6a3 3 0 0 0 6 0V7m-2 6a3 3 0 0 0 6 0V7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  networking: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  intelligence: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><path d="M3 3v18h18M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  matchmaking: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><path d="M8 12h8m-8 0a4 4 0 1 1-4-4m4 4a4 4 0 1 0 4 4m4-4a4 4 0 1 0-4-4m4 4a4 4 0 1 1 4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  visa: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h4m-4 4h10m-10 4h6" strokeLinecap="round" /></svg>,
  directory: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  events: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  promotion: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6"><path d="m3 11 18-8-4 18-6.5-6L3 11Zm7.5 4L9 21l2.5-3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("benefitsTitle") };
}

export default async function MembershipPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const page = await getPage(locale as AppLocale, "membership-benefits");

  return (
    <>
      <PageHero title={t("benefitsTitle")} intro={page?.intro || t("benefitsIntro")}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/membership/apply"
            className="rounded-md bg-red px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-red-dark"
          >
            {tCommon("becomeMember")}
          </Link>
          <Link
            href="/membership/categories"
            className="rounded-md border-2 border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white hover:text-navy"
          >
            {t("categoriesTitle")}
          </Link>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFIT_KEYS.map((key, i) => (
            <Reveal key={key} delay={(i % 4) * 80}>
              <div className="h-full rounded-xl border border-surface-alt bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red/8 text-red">
                  {BENEFIT_ICONS[key]}
                </div>
                <h3 className="text-base font-bold text-navy">{t(`benefits.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(`benefits.${key}.text`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {page?.body && (
        <Section alt>
          <div className="mx-auto max-w-3xl">
            <RichText data={page.body} />
          </div>
        </Section>
      )}
    </>
  );
}
