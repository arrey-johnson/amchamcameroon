import type { Media } from "@/payload-types";

export function formatDate(
  date: string | Date | null | undefined,
  locale: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", opts).format(
    new Date(date),
  );
}

export function formatTime(date: string | Date | null | undefined, locale: string): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Resolve a Payload media relation (id or populated doc) to a usable object. */
export function mediaObj(media: number | Media | null | undefined): Media | null {
  if (media && typeof media === "object") return media;
  return null;
}

/** Keep remote (Supabase) URLs absolute; strip only this site's origin. */
function toRelative(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) return url;
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (site && url.startsWith(site)) {
    const path = url.slice(site.length);
    return path.startsWith("/") ? path : `/${path}`;
  }
  return url;
}

/** URL of a media doc, preferring a named size when available. */
export function mediaUrl(
  media: number | Media | null | undefined,
  size?: "thumbnail" | "card" | "hero",
): string | null {
  const m = mediaObj(media);
  if (!m) return null;
  if (size && m.sizes?.[size]?.url) return toRelative(m.sizes[size].url);
  return toRelative(m.url);
}

/** Stable reorder: items with a cover image first, original order kept within each group. */
export function coverFirst<T>(items: T[], hasCover: (item: T) => boolean): T[] {
  return [...items.filter(hasCover), ...items.filter((item) => !hasCover(item))];
}

/**
 * Rank for Board / EO titles so President always leads, then VP, Treasurer, etc.
 * Lower number = earlier in the list. Unknown titles fall near the end.
 */
export function leadershipRoleRank(role: string | null | undefined): number {
  const r = (role || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!r) return 90;
  // President before any "vice president" match.
  if (/(^|\b)(president|presidente)\b/.test(r) && !/\bvice\b/.test(r)) return 0;
  if (/\bvice\b.*\bpresident/.test(r) || /\bvice president/.test(r) || /\bvicepresidente/.test(r))
    return 10;
  if (/\b(treasurer|tresorier|tresoriere)\b/.test(r)) return 20;
  if (/\b(secretary|secretaire|secretaire general)\b/.test(r)) return 30;
  if (/\b(executive director|directeur executif|directrice executive)\b/.test(r)) return 40;
  if (/\b(ex officio|ex-officio)\b/.test(r)) return 70;
  if (/\b(board member|administrateur|administratrice|membre)\b/.test(r)) return 60;
  return 50;
}

/** Sort leadership profiles: role rank, then CMS order, then name. */
export function sortByLeadershipRole<T extends { role?: string | null; order?: number | null; name?: string | null }>(
  people: T[],
): T[] {
  return [...people].sort((a, b) => {
    const rank = leadershipRoleRank(a.role) - leadershipRoleRank(b.role);
    if (rank !== 0) return rank;
    const order = (a.order ?? 0) - (b.order ?? 0);
    if (order !== 0) return order;
    return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
  });
}

/** President / Vice President / Treasurer — the board's Executive Bureau. */
export function isExecutiveBureauRole(role: string | null | undefined): boolean {
  return leadershipRoleRank(role) <= 20;
}

type TermFields = { year?: number | null; termEnd?: number | null };

/** Term start year (falls back to the current calendar year). */
export function termStartOf(person: TermFields): number {
  return typeof person.year === "number" ? person.year : new Date().getFullYear();
}

/** Term end year — defaults to start + 2 (two-year tenure). */
export function termEndOf(person: TermFields): number {
  return typeof person.termEnd === "number" ? person.termEnd : termStartOf(person) + 2;
}

/** Public label for a term, e.g. "2024-2026". */
export function termLabelOf(person: TermFields): string {
  return `${termStartOf(person)}-${termEndOf(person)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
