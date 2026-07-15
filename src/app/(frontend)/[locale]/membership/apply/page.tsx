import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { MembershipForm } from "@/components/forms/MembershipForm";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("applyTitle") };
}

export default async function ApplyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale, namespace: "membership" });

  return (
    <>
      <PageHero title={t("applyTitle")} intro={t("applyIntro")} />
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <MembershipForm defaultCategory={category} />
      </div>
    </>
  );
}
