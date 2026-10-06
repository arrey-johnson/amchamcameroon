import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";

type Props = { params: Promise<{ locale: string }> };

const PILLARS = [
  {
    key: "trade",
    href: "/membership",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8">
        <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "policy",
    href: "/committees",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8">
        <path d="M12 3v18M5 7l7-4 7 4M4 21h16M7 7v6a3 3 0 0 0 6 0V7m-2 6a3 3 0 0 0 6 0V7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "value",
    href: "/membership",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "missions",
    href: "/events?category=trade-mission",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-8 w-8">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("pillarsTitle") };
}

export default async function OurPillarsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  const copy = {
    trade: { title: tHome("pillarTradeTitle"), text: tHome("pillarTradeText") },
    policy: { title: tHome("pillarPolicyTitle"), text: tHome("pillarPolicyText") },
    value: { title: tHome("pillarValueTitle"), text: tHome("pillarValueText") },
    missions: { title: tHome("pillarMissionsTitle"), text: tHome("pillarMissionsText") },
  };

  return (
    <>
      <PageHero title={t("pillarsTitle")} intro={t("pillarsIntro")} />
      <Section>
        <div className="space-y-16">
          {PILLARS.map((pillar, i) => {
            const { title, text } = copy[pillar.key];
            const imageLeft = i % 2 === 1;
            return (
              <Reveal key={pillar.key}>
                <div className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${imageLeft ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <div>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red/8 text-red">
                      {pillar.icon}
                    </div>
                    <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h2>
                    <p className="mt-3 text-base leading-relaxed text-ink-soft">{text}</p>
                    <Link
                      href={pillar.href}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-red transition-colors hover:text-red-dark"
                    >
                      {t("pillarsLearnMore")}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden>
                        <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-navy/5">
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-navy/40">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10" aria-hidden>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.5-3.5L9 20" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm font-medium">{t("imagePlaceholder")}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
