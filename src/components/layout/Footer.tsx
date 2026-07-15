import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { SubscribeForm } from "@/components/forms/SubscribeForm";
import type { Setting } from "@/payload-types";

export async function Footer({ settings }: { settings: Setting }) {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  const quickLinks = [
    { label: tNav("about"), href: "/about/who-we-are" },
    { label: tNav("membership"), href: "/membership" },
    { label: tNav("committees"), href: "/committees" },
    { label: tNav("events"), href: "/events" },
    { label: tNav("news"), href: "/news" },
    { label: tNav("newsletters"), href: "/newsletters" },
    { label: tNav("resources"), href: "/resources" },
    { label: tNav("contact"), href: "/contact" },
  ];

  const socials = [
    { href: settings.facebook, label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
    { href: settings.twitter, label: "X (Twitter)", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
    { href: settings.linkedin, label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" },
    { href: settings.youtube, label: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-navy text-white">
      {/* Brand divider — red primary */}
      <div className="h-1 w-full bg-red" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <BrandLogo variant="white" className="h-14" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{t("tagline")}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-white/55">
            {t("affiliate")}
          </p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
            {t("quickLinks")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
            {t("contactUs")}
          </h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            {settings.address && <p className="whitespace-pre-line">{settings.address}</p>}
            {settings.phones?.map((p) => (
              <p key={p.id}>
                <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {p.phone}
                </a>
              </p>
            ))}
            {settings.emails?.map((e) => (
              <p key={e.id}>
                <a href={`mailto:${e.email}`} className="hover:text-white">
                  {e.email}
                </a>
              </p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
            {t("newsletter")}
          </h3>
          <p className="mt-4 text-sm text-white/70">{t("newsletterHint")}</p>
          <div className="mt-3">
            <SubscribeForm dark />
          </div>
          {socials.length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-white/90">
                {t("followUs")}
              </h3>
              <div className="mt-3 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-red hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/50 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} American Chamber of Commerce in Cameroon. {t("rights")}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="text-red" aria-hidden>★</span>
            Douala · Cameroon
          </p>
        </div>
      </div>
    </footer>
  );
}
