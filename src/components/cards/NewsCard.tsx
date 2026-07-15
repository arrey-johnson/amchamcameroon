import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatDate, mediaObj, mediaUrl } from "@/lib/utils";
import type { News } from "@/payload-types";

const CATEGORY_COLORS: Record<string, string> = {
  news: "bg-navy",
  "press-release": "bg-red",
  "op-ed": "bg-green",
  policy: "bg-ink",
};

export function NewsCard({
  article,
  locale,
  categoryLabel,
}: {
  article: News;
  locale: string;
  categoryLabel: string;
}) {
  const cover = mediaUrl(article.coverImage, "card");
  const alt = mediaObj(article.coverImage)?.alt || article.title;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-surface-alt bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/news/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-navy/5">
        {cover ? (
          <Image
            src={cover}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-navy/20">★</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white ${CATEGORY_COLORS[article.category] ?? "bg-navy"}`}
          >
            {categoryLabel}
          </span>
          <time className="text-xs font-medium text-ink-soft" dateTime={article.publishedAt}>
            {formatDate(article.publishedAt, locale)}
          </time>
        </div>
        <h3 className="text-lg font-bold leading-snug text-ink transition-colors group-hover:text-navy">
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{article.excerpt}</p>
        )}
      </div>
    </article>
  );
}
