"use client";

import { useEffect, useState } from "react";

type Props = {
  labels: { backToTop: string };
};

/** Floating back-to-top button (all pages, bottom-right). */
export function FloatingStack({ labels }: Props) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!showTop) return null;

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-center gap-2.5 sm:right-5">
      <button
        type="button"
        aria-label={labels.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-white shadow-lg backdrop-blur transition-transform hover:-translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
          <path d="M12 19V5m-7 7 7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
