import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/PageHero";
import { NewsCard } from "@/components/cards/NewsCard";
import { Reveal } from "@/components/Reveal";
import { getLatestNews } from "@/lib/queries";
import type { AppLocale } from "@/lib/payload";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

const CATEGORIES = ["news", "press-release", "op-ed", "policy"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return { title: t("title") };
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  const locale = raw as AppLocale;
  const { category } = await searchParams;

  const t = await getTranslations({ locale, namespace: "news" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const articles = await getLatestNews(locale, 30, category);

  return (
    <>
      <PageHero title={t("title")} intro={t("intro")}>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/news"
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              !category ? "bg-white text-navy" : "border border-white/30 text-white hover:bg-white/10"
            }`}
          >
            {tCommon("all")}
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/news?category=${cat}`}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                category === cat ? "bg-white text-navy" : "border border-white/30 text-white hover:bg-white/10"
              }`}
            >
              {t(`categories.${cat}`)}
            </Link>
          ))}
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <Reveal key={article.id} delay={(i % 3) * 80}>
                <NewsCard
                  article={article}
                  locale={locale}
                  categoryLabel={t(`categories.${article.category}`)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">
            {tCommon("noResults")}
          </p>
        )}
      </div>
    </>
  );
}
