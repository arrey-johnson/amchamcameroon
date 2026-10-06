import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortraitPage } from "@/components/about/PortraitPage";
import { getPage } from "@/lib/queries";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };
const SLUG = "word-from-the-us-embassy";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage(locale as AppLocale, SLUG);
  if (!page) return {};
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || page.intro || undefined,
  };
}

export default async function EmbassyWordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const page = await getPage(locale as AppLocale, SLUG);
  if (!page) notFound();

  return <PortraitPage page={page} placeholderLabel={t("portraitPlaceholder")} />;
}
