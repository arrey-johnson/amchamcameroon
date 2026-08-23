import Image from "next/image";
import { mediaObj, mediaUrl } from "@/lib/utils";
import type { Member } from "@/payload-types";

/** Auto-scrolling grayscale-to-color logo marquee for Patrons & Sponsors. */
export function LogoWall({ members }: { members: Member[] }) {
  const withLogos = members.filter((m) => mediaUrl(m.logo));
  if (withLogos.length === 0) return null;
  const loop = [...withLogos, ...withLogos];

  return (
    <div className="marquee-track overflow-hidden" aria-label="Member logos">
      <div className="marquee-content flex w-max animate-marquee-slow items-center gap-14 px-6">
        {loop.map((member, i) => (
          <div
            key={`${member.id}-${i}`}
            className="flex h-20 w-36 shrink-0 items-center justify-center"
            aria-hidden={i >= withLogos.length}
          >
            <Image
              src={mediaUrl(member.logo)!}
              alt={mediaObj(member.logo)?.alt || member.name}
              width={160}
              height={80}
              className="max-h-14 w-auto object-contain opacity-80 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:max-h-16"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
