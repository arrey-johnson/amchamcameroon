import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { PersonCard } from "@/components/cards/PersonCard";
import { Reveal } from "@/components/Reveal";
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {people.map((person, i) => (
            <Reveal key={person.id} delay={(i % 4) * 80}>
              <PersonCard person={person} />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
