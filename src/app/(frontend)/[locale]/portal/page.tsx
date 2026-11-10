import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link, redirect } from "@/i18n/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { getPortalSession } from "@/lib/memberAuth";
import { getUpcomingEvents } from "@/lib/queries";
import { formatDate, mediaUrl } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import type { AppLocale } from "@/lib/payload";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalDashboardPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (!session) redirect({ href: "/portal/login", locale });

  const t = await getTranslations({ locale, namespace: "portal" });
  const events = await getUpcomingEvents(locale as AppLocale, 4);
  const { account, member } = session;
  const logo = member ? mediaUrl(member.logo, "thumbnail") : null;

  return (
    <PortalShell
      locale={locale}
      name={account.name || account.email}
      company={member?.name}
      labels={{
        badge: t("portalBadge"),
        dashboard: t("navDashboard"),
        profile: t("navProfile"),
        events: t("navEvents"),
        directory: t("navDirectory"),
        contact: t("navContact"),
        logout: t("logout"),
        liveSite: t("liveSite"),
      }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          {t("dashboardTitle", { name: account.name || account.email })}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{t("dashboardIntro")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-16 w-16 rounded-lg border border-ink/10 object-contain bg-white p-1" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-navy text-lg font-extrabold text-white">
                {(member?.name || account.name || "A").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy/55">
                {t("yourCompany")}
              </p>
              <h2 className="mt-1 text-xl font-bold text-ink">{member?.name || t("noCompanyLinked")}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                {member?.category && (
                  <span className="rounded-full bg-navy/8 px-2.5 py-1 capitalize text-navy">
                    {member.category}
                  </span>
                )}
                {member?.membershipStatus && (
                  <span className="rounded-full bg-green/10 px-2.5 py-1 capitalize text-green">
                    {member.membershipStatus}
                  </span>
                )}
                {member?.sector && (
                  <span className="rounded-full bg-surface-alt px-2.5 py-1 text-ink-soft">
                    {member.sector}
                  </span>
                )}
              </div>
            </div>
          </div>

          {member?.description && (
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">{member.description}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/portal/profile"
              className="rounded-md bg-navy px-4 py-2.5 text-sm font-bold text-white transition hover:bg-navy-dark"
            >
              {t("editProfile")}
            </Link>
            {member?.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-navy/30 hover:text-navy"
              >
                {t("visitWebsite")}
              </a>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-navy/55">
            {t("quickLinks")}
          </h2>
          <ul className="mt-4 space-y-2">
            {[
              { href: "/events", label: t("linkEvents") },
              { href: "/news", label: t("linkNews") },
              { href: "/membership/directory", label: t("linkDirectory") },
              { href: "/contact", label: t("linkContact") },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-alt hover:text-navy"
                >
                  <span>{item.label}</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-bold text-navy">{t("upcomingEvents")}</h2>
          <Link href="/events" className="text-sm font-semibold text-navy hover:text-red">
            {t("viewAllEvents")}
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-ink-soft">{t("noEvents")}</p>
        ) : (
          <ul className="divide-y divide-ink/8">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.slug}`}
                  className="flex flex-col gap-1 py-3 transition hover:text-navy sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-ink">{event.title}</span>
                  <span className="text-sm text-ink-soft">
                    {event.startAt ? formatDate(event.startAt, locale) : ""}
                    {event.venue ? ` · ${event.venue}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PortalShell>
  );
}
