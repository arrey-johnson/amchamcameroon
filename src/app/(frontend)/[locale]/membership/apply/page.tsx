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
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy/5 lg:sticky lg:top-28">
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-navy/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-14 w-14" aria-hidden>
                <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-1a5 5 0 0 1 5-5h0M20 21v-1a5 5 0 0 0-5-5h0M8 14h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-medium">{t("handshakePlaceholder")}</p>
            </div>
          </div>
          <div>
            <MembershipForm />
          </div>
        </div>
      </div>
    </>
  );
}
