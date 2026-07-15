import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryAlbums } from "@/lib/queries";
import { formatDate, mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return { title: t("title") };
}

export default async function GalleryPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const t = await getTranslations({ locale, namespace: "gallery" });
  const albums = await getGalleryAlbums(locale);

  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {albums.length > 0 ? (
          <GalleryGrid
            albums={albums.map((album) => ({
              id: album.id,
              title: `${album.title} · ${formatDate(album.date, locale, { month: "long", year: "numeric" })}`,
              date: album.date,
              photosLabel: t("photos", { count: (album.images ?? []).length }),
              images: (album.images ?? [])
                .map((img) => ({
                  id: String(img.id),
                  url: mediaUrl(img.image, "card") || "",
                  caption: img.caption || mediaObj(img.image)?.alt,
                }))
                .filter((img) => img.url),
            }))}
          />
        ) : (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">{t("intro")}</p>
        )}
      </div>
    </>
  );
}
