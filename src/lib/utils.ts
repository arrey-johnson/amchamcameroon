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

/** Strip a same-origin absolute prefix so next/image treats it as local. */
function toRelative(url: string | null | undefined): string | null {
  if (!url) return null;
  // "http://host/api/media/file/x.png" -> "/api/media/file/x.png"
  const match = url.match(/^https?:\/\/[^/]+(\/.*)$/);
  return match ? match[1] : url;
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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
