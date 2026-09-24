import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsCard } from "@/components/cards/NewsCard";
import { NewsExplorer } from "@/components/news/NewsExplorer";
import { getLatestNews, getNewsWithCover } from "@/lib/queries";
import { coverFirst, mediaUrl } from "@/lib/utils";
import type { AppLocale } from "@/lib/payload";
import type { News } from "@/payload-types";

type Props = {
  params: Promise<{ locale: string }>;
};

const CATEGORIES = ["news", "press-release", "op-ed", "policy"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("title") };
}

export default async function NewsPage({ params }: Props) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as AppLocale;

  const t = await getTranslations({ locale, namespace: "news" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  // Latest overall plus latest per category, so each filter tab is full
  // even though filtering happens in the browser.
  const lists = await Promise.all([
    getNewsWithCover(locale),
    getLatestNews(locale, 30),
    ...CATEGORIES.map((cat) => getLatestNews(locale, 30, cat)),
  ]);
  const byId = new Map<number, News>();
  for (const article of lists.flat()) byId.set(article.id, article);
  const articles = coverFirst(
    [...byId.values()].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    ),
    (a) => Boolean(mediaUrl(a.coverImage, "card")),
  );

  return (
    <NewsExplorer
      title={t("title")}
      intro={t("intro")}
      allLabel={tCommon("all")}
      emptyLabel={tCommon("noResults")}
      categories={CATEGORIES.map((cat) => ({ value: cat, label: t(`categories.${cat}`) }))}
      items={articles.map((article) => ({
        id: article.id,
        category: article.category,
        node: (
          <NewsCard
            article={article}
            locale={locale}
            categoryLabel={t(`categories.${article.category}`)}
          />
        ),
      }))}
    />
  );
}
