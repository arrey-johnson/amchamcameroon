import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RichText } from "@/components/RichText";
import { NewsCard } from "@/components/cards/NewsCard";
import { getLatestNews, getNewsArticle } from "@/lib/queries";
import { formatDate, mediaObj, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";
import { slugParams } from "@/lib/staticParams";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return slugParams("news");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getNewsArticle(locale as AppLocale, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as AppLocale;
  const article = await getNewsArticle(locale, slug);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "news" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const cover = mediaUrl(article.coverImage, "hero");
  const related = (await getLatestNews(locale, 4, article.category)).filter(
    (a) => a.id !== article.id,
  ).slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const shareUrl = `${siteUrl}/${locale}/news/${article.slug}`;

  return (
    <>
      <div className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
          <span className="rounded-full bg-red px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
            {t(`categories.${article.category}`)}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
            {article.author && (
              <span>
                {t("by")} <span className="font-semibold text-white/90">{article.author}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6" itemScope itemType="https://schema.org/NewsArticle">
        {cover && (
          <div className="relative mb-10 aspect-[21/10] overflow-hidden rounded-xl">
            <Image
              src={cover}
              alt={mediaObj(article.coverImage)?.alt || article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}
        {article.excerpt && (
          <p className="mb-8 border-l-4 border-gold pl-5 text-lg font-medium leading-relaxed text-ink-soft">
            {article.excerpt}
          </p>
        )}
        <RichText data={article.body} />

        {/* Social share */}
        <div className="mt-12 flex items-center gap-3 border-t border-surface-alt pt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">{tCommon("shareOn")}:</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" /></svg>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
          </a>
        </div>
      </article>

      {related.length > 0 && (
        <div className="bg-surface-alt py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-8 text-2xl font-extrabold text-navy">{t("related")}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((a) => (
                <NewsCard
                  key={a.id}
                  article={a}
                  locale={locale}
                  categoryLabel={t(`categories.${a.category}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
