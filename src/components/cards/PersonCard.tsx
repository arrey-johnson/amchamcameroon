import Image from "next/image";
import { mediaObj, mediaUrl } from "@/lib/utils";
import type { BoardMember } from "@/payload-types";

export function PersonCard({ person }: { person: BoardMember }) {
  const photo = mediaUrl(person.photo, "card");
  const alt = mediaObj(person.photo)?.alt || person.name;

  return (
    <article className="group overflow-hidden rounded-xl border border-surface-alt bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/4.4] overflow-hidden bg-navy/5">
        {photo ? (
          <Image
            src={photo}
            alt={alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-20 w-20 text-navy/15" aria-hidden>
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-navy">{person.name}</h3>
        <p className="mt-0.5 text-sm font-semibold text-red">{person.role}</p>
        {person.company && <p className="mt-0.5 text-sm text-ink-soft">{person.company}</p>}
        {person.bio && <p className="mt-2.5 line-clamp-4 text-[13px] leading-relaxed text-ink-soft">{person.bio}</p>}
        {person.linkedin && (
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${person.name} on LinkedIn`}
            className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy/5 text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
