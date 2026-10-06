import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { LeadershipExplorer } from "@/components/about/LeadershipExplorer";
import { getBoard } from "@/lib/queries";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("executiveTitle") };
}

export default async function ExecutivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const people = await getBoard(locale as AppLocale, "executive");

  return (
    <>
      <PageHero title={t("executiveTitle")} intro={t("executiveIntro")} />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <LeadershipExplorer people={people} allYearsLabel={t("allYears")} />
      </div>
    </>
  );
}
