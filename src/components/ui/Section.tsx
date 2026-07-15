import type { ReactNode } from "react";

export function Section({
  children,
  alt = false,
  className = "",
  id,
}: {
  children: ReactNode;
  alt?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`${alt ? "bg-surface-alt" : "bg-white"} py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  center = false,
  light = false,
}: {
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <div className={`mb-3 flex items-center gap-1.5 ${center ? "justify-center" : ""}`} aria-hidden>
        <span className="h-1 w-10 rounded-full bg-red" />
        <span className={`h-1 w-2.5 rounded-full ${light ? "bg-white/40" : "bg-navy/25"}`} />
      </div>
      <h2 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${light ? "text-white" : "text-navy"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base leading-relaxed ${light ? "text-white/75" : "text-ink-soft"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
