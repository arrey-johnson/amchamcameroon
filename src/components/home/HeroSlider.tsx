"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export type HeroSlideData = {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  imageAlt: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
};

const AUTOPLAY_MS = 6500;

export function HeroSlider({ slides }: { slides: HeroSlideData[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const paused = useRef(false);

  const go = useCallback(
    (next: number) => setIndex((next + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2) return;
    timer.current = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative h-[540px] overflow-hidden bg-navy sm:h-[600px]"
      aria-roledescription="carousel"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.imageAlt}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          {/* Legibility gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/55 to-navy/15" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/50 to-transparent" aria-hidden />

          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-16 sm:px-6">
              <div
                className={`max-w-2xl transition-all delay-200 duration-700 ${i === index ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              >
                <div className="mb-5 flex items-center gap-1.5" aria-hidden>
                  <span className="h-1 w-12 rounded-full bg-red" />
                  <span className="h-1 w-3 rounded-full bg-white/40" />
                </div>
                <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaLabel && slide.ctaUrl && (
                  <div className="mt-8">
                    <Link
                      href={slide.ctaUrl}
                      className="inline-flex items-center gap-2 rounded-md bg-red px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red/25 transition-all hover:-translate-y-0.5 hover:bg-red-dark"
                    >
                      {slide.ctaLabel}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden>
                        <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          {/* Arrows */}
          <div className="absolute bottom-8 right-4 z-10 flex gap-2 sm:right-6">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(index - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur transition-colors hover:bg-white hover:text-navy"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                <path d="M19 12H5m6 6-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(index + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white backdrop-blur transition-colors hover:bg-white hover:text-navy"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-red" : "w-3 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
