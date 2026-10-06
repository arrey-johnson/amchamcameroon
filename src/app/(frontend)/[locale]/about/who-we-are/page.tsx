import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { RichText } from "@/components/RichText";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { getPage } from "@/lib/queries";
import { mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage(locale as AppLocale, "who-we-are");
  return {
    title: page?.seo?.metaTitle || page?.title || "Who We Are",
    description: page?.seo?.metaDescription || page?.intro || undefined,
  };
}

export default async function WhoWeArePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const [who, vision] = await Promise.all([
    getPage(locale as AppLocale, "who-we-are"),
    getPage(locale as AppLocale, "vision-mission"),
  ]);

  const cover = mediaUrl(who?.coverImage, "hero");

  return (
    <>
      {/* Short hero — no long intro (avoids repeating body content). */}
      <PageHero title={who?.title || t("whoWeAreTitle")} />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            {who?.intro && (
              <p className="mb-6 text-lg font-medium leading-relaxed text-ink-soft">{who.intro}</p>
            )}
            <RichText data={who?.body} />
          </Reveal>
          <Reveal delay={100}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-navy/5 lg:sticky lg:top-28">
              {cover ? (
                <Image
                  src={cover}
                  alt={mediaObj(who?.coverImage)?.alt || who?.title || "Who We Are"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-navy/40">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.5-3.5L9 20" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-medium">{t("imagePlaceholder")}</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </Section>

      <Section alt id="mission-vision">
        <Reveal>
          <SectionHeading title={vision?.title || t("visionMissionTitle")} />
        </Reveal>
        <div className="mx-auto max-w-3xl">
          {vision?.intro && (
            <p className="mb-8 text-base leading-relaxed text-ink-soft">{vision.intro}</p>
          )}
          <RichText data={vision?.body} />
        </div>
      </Section>
    </>
  );
}
