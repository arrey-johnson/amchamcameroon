"use client";

import { useEffect, useState } from "react";

export type TickerItemData = { id: number; text: string; url?: string | null };

type Props = {
  items: TickerItemData[];
  latestLabel: string;
  dismissLabel: string;
};

/** Sliding news-ticker bar — continuous marquee, pause on hover, session-dismissible. */
export function Ticker({ items, latestLabel, dismissLabel }: Props) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("amcham-ticker-dismissed") === "1") setDismissed(true);
  }, []);

  if (dismissed || items.length === 0) return null;

  // Duplicate the list so the -50% keyframe loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="relative flex items-stretch bg-red text-white" role="region" aria-label={latestLabel}>
      <span className="z-10 flex shrink-0 items-center gap-1.5 bg-red-dark px-3 py-2 text-[11px] font-bold uppercase tracking-widest sm:px-4">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        {latestLabel}
      </span>
      <div className="marquee-track flex-1 overflow-hidden" tabIndex={0}>
        <div className="marquee-content flex w-max animate-marquee items-center gap-10 px-6 py-2">
          {loop.map((item, i) => (
            <span key={`${item.id}-${i}`} className="text-[13px] font-medium" aria-hidden={i >= items.length}>
              {item.url ? (
                <a
                  href={item.url}
                  className="hover:underline"
                  tabIndex={i >= items.length ? -1 : 0}
                >
                  {item.text}
                </a>
              ) : (
                item.text
              )}
              <span className="ml-10 text-white/50" aria-hidden>
                •
              </span>
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label={dismissLabel}
        onClick={() => {
          sessionStorage.setItem("amcham-ticker-dismissed", "1");
          setDismissed(true);
        }}
        className="z-10 shrink-0 px-3 text-white/80 transition-colors hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
