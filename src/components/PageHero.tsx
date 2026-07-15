import type { ReactNode } from "react";

/** Navy title band used at the top of every inner page. */
export function PageHero({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string | null;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-navy">
      {/* Single-tone accent — a thin red edge, no multi-color wash */}
      <div className="absolute inset-x-0 top-0 h-1 bg-red" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-4 flex items-center gap-1.5" aria-hidden>
          <span className="h-1 w-10 rounded-full bg-red" />
          <span className="h-1 w-2.5 rounded-full bg-white/40" />
        </div>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{intro}</p>}
        {children}
      </div>
    </div>
  );
}
