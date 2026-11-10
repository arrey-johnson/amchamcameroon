import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { memberLogout } from "@/app/portal-actions";

type Props = {
  locale: string;
  name: string;
  company?: string;
  children: React.ReactNode;
  labels: {
    badge: string;
    dashboard: string;
    profile: string;
    events: string;
    directory: string;
    contact: string;
    logout: string;
    liveSite: string;
  };
};

export function PortalShell({ name, company, children, labels }: Props) {
  return (
    <div className="min-h-screen bg-[#f4f6fb] text-ink">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/portal" aria-label={labels.dashboard}>
              <BrandLogo className="h-10" />
            </Link>
            <div className="hidden sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy/60">
                {labels.badge}
              </p>
              <p className="text-sm font-semibold text-ink">
                {name}
                {company ? <span className="font-normal text-ink-soft"> · {company}</span> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md border border-ink/10 px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-navy/30 hover:text-navy"
            >
              {labels.liveSite}
            </Link>
            <form action={memberLogout}>
              <button
                type="submit"
                className="rounded-md bg-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-navy-dark"
              >
                {labels.logout}
              </button>
            </form>
          </div>
        </div>
        <nav className="border-t border-ink/5 bg-white">
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            {[
              { href: "/portal", label: labels.dashboard },
              { href: "/portal/profile", label: labels.profile },
              { href: "/events", label: labels.events },
              { href: "/membership/directory", label: labels.directory },
              { href: "/contact", label: labels.contact },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-surface-alt hover:text-navy"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
