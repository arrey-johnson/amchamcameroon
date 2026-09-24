import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { RichText } from "@/components/RichText";
import { getPage } from "@/lib/queries";
import { mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";
import { slugParams } from "@/lib/staticParams";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return slugParams("pages");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(locale as AppLocale, slug);
  if (!page) return {};
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || page.intro || undefined,
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await getPage(locale as AppLocale, slug);
  if (!page) notFound();

  const cover = mediaUrl(page.coverImage, "hero");

  return (
    <>
      <PageHero title={page.title} intro={page.intro} />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {cover && (
          <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-xl">
            <Image
              src={cover}
              alt={mediaObj(page.coverImage)?.alt || page.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}
        <RichText data={page.body} />
      </div>
    </>
  );
}
