"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export type AlbumData = {
  id: number;
  title: string;
  date: string;
  photosLabel: string;
  images: { id: string; url: string; caption?: string | null }[];
};

export function GalleryGrid({ albums }: { albums: AlbumData[] }) {
  const [lightbox, setLightbox] = useState<{ images: AlbumData["images"]; index: number } | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const move = useCallback(
    (dir: number) =>
      setLightbox((lb) =>
        lb ? { ...lb, index: (lb.index + dir + lb.images.length) % lb.images.length } : lb,
      ),
    [],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, move]);

  return (
    <>
      <div className="space-y-12">
        {albums.map((album) => (
          <section key={album.id}>
            <h2 className="mb-4 text-xl font-extrabold text-navy">
              {album.title}{" "}
              <span className="text-sm font-medium text-ink-soft">— {album.photosLabel}</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {album.images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setLightbox({ images: album.images, index: i })}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-navy/5"
                >
                  <Image
                    src={img.url}
                    alt={img.caption || album.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={close}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6"><path d="M6 6l12 12M6 18 18 6" strokeLinecap="round" /></svg>
          </button>
          <button
            type="button"
            aria-label="Previous"
            className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); move(-1); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6"><path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <figure className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-[70vh] w-[85vw] max-w-4xl">
              <Image
                src={lightbox.images[lightbox.index].url}
                alt={lightbox.images[lightbox.index].caption || ""}
                fill
                sizes="85vw"
                className="object-contain"
              />
            </div>
            {lightbox.images[lightbox.index].caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {lightbox.images[lightbox.index].caption}
              </figcaption>
            )}
          </figure>
          <button
            type="button"
            aria-label="Next"
            className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); move(1); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6"><path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
