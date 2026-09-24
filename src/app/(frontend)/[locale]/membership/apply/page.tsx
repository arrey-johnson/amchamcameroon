import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { MembershipForm } from "@/components/forms/MembershipForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("applyTitle") };
}

export default async function ApplyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "membership" });

  return (
    <>
      <PageHero title={t("applyTitle")} intro={t("applyIntro")} />
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <MembershipForm />
      </div>
    </>
  );
}
