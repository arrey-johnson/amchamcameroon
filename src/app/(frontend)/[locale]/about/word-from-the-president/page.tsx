import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PortraitPage } from "@/components/about/PortraitPage";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { getPage } from "@/lib/queries";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };
const SLUG = "word-from-the-president";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage(locale as AppLocale, SLUG);
  if (!page) return {};
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || page.intro || undefined,
  };
}

export default async function PresidentWordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const page = await getPage(locale as AppLocale, SLUG);
  if (!page) notFound();

  return (
    <PortraitPage
      page={page}
      placeholderLabel={t("portraitPlaceholder")}
      footer={
        <Section alt className="!py-16">
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-2xl bg-navy px-8 py-12 text-center text-white sm:px-12">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("presidentCtaTitle")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/75">
                {t("presidentCtaText")}
              </p>
              <Link
                href="/membership/apply"
                className="mt-8 inline-flex rounded-md bg-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-dark"
              >
                {tCommon("becomeMember")}
              </Link>
            </div>
          </Reveal>
        </Section>
      }
    />
  );
}
