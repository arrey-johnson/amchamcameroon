import Image from "next/image";
import { mediaObj, mediaUrl } from "@/lib/utils";
import type { Member } from "@/payload-types";

type Group = { label: string; members: Member[] };

/** Auto-scrolling logo marquees in original brand colors, one row per group. */
export function LogoWall({ groups }: { groups: Group[] }) {
  const rows = groups
    .map((group) => ({ ...group, members: group.members.filter((m) => mediaUrl(m.logo)) }))
    .filter((group) => group.members.length > 0);
  if (rows.length === 0) return null;

  return (
    <div className="space-y-10">
      {rows.map((row, rowIndex) => (
        <div key={row.label}>
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-navy/15" aria-hidden />
            <span className="rounded-full bg-navy/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-navy">
              {row.label}
            </span>
            <span className="h-px w-10 bg-navy/15" aria-hidden />
          </div>
          <LogoRow members={row.members} label={row.label} reverse={rowIndex % 2 === 1} />
        </div>
      ))}
    </div>
  );
}

function LogoRow({ members, label, reverse }: { members: Member[]; label: string; reverse: boolean }) {
  const loop = [...members, ...members];

  return (
    <div className="marquee-track overflow-hidden" aria-label={label}>
      <div
        className={`marquee-content flex w-max items-center gap-14 px-6 ${reverse ? "animate-marquee-slow-reverse" : "animate-marquee-slow"}`}
      >
        {loop.map((member, i) => (
          <div
            key={`${member.id}-${i}`}
            className="flex h-20 w-36 shrink-0 items-center justify-center"
            aria-hidden={i >= members.length}
          >
            <Image
              src={mediaUrl(member.logo)!}
              alt={mediaObj(member.logo)?.alt || member.name}
              width={160}
              height={80}
              className="max-h-14 w-auto object-contain opacity-90 sm:max-h-16"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
