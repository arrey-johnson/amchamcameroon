import Image from "next/image";
import type { ReactNode } from "react";
import { PageHero } from "@/components/PageHero";
import { RichText } from "@/components/RichText";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { mediaObj, mediaUrl } from "@/lib/utils";
import type { Page } from "@/payload-types";

/** About page layout: body text beside a portrait (placeholder until a cover image is set). */
export function PortraitPage({
  page,
  placeholderLabel,
  footer,
}: {
  page: Page;
  placeholderLabel: string;
  footer?: ReactNode;
}) {
  const portrait = mediaUrl(page.coverImage, "card") || mediaUrl(page.coverImage, "hero");

  return (
    <>
      <PageHero title={page.title} />
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
          <Reveal>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden rounded-xl bg-navy/5 lg:mx-0 lg:sticky lg:top-28">
              {portrait ? (
                <Image
                  src={portrait}
                  alt={mediaObj(page.coverImage)?.alt || page.title}
                  fill
                  sizes="280px"
                  className="object-cover object-[center_18%]"
                  priority
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-navy/40">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16" aria-hidden>
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 6v2h18v-2c0-3.5-4-6-9-6Z" />
                  </svg>
                  <p className="text-sm font-medium">{placeholderLabel}</p>
                </div>
              )}
            </div>
          </Reveal>
          <Reveal delay={80}>
            {page.intro && (
              <p className="mb-6 text-lg font-medium leading-relaxed text-ink-soft">{page.intro}</p>
            )}
            <RichText data={page.body} />
          </Reveal>
        </div>
      </Section>
      {footer}
    </>
  );
}
