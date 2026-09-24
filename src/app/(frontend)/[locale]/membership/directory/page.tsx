import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { DirectoryExplorer } from "@/components/members/DirectoryExplorer";
import { getAllMembers } from "@/lib/queries";
import { mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("directoryTitle") };
}

export default async function DirectoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "membership" });
  const members = await getAllMembers(locale as AppLocale);

  return (
    <>
      <PageHero title={t("directoryTitle")} intro={t("directoryIntro")} />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <DirectoryExplorer
          members={members.map((m) => ({
            id: m.id,
            name: m.name,
            logoUrl: mediaUrl(m.logo, "thumbnail"),
            logoAlt: mediaObj(m.logo)?.alt || m.name,
            sector: m.sector,
            category: m.category,
            website: m.website,
            description: m.description,
          }))}
        />
      </div>
    </>
  );
}
