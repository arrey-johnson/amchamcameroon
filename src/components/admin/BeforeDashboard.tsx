/* eslint-disable @next/next/no-html-link-for-pages */
// Plain <a> is intentional: these target Payload admin routes (outside the
// Next.js app-router page tree), where a full navigation is the correct behavior.
import { getPayload } from "payload";
import config from "@payload-config";
import ThemeToggle from "./ThemeToggle";
import AddMemberButton from "./AddMemberButton";
import LogoutButton from "./LogoutButton";

type Coll = Parameters<Awaited<ReturnType<typeof getPayload>>["count"]>[0]["collection"];
type PL = Awaited<ReturnType<typeof getPayload>>;

async function total(payload: PL, collection: Coll): Promise<number> {
  try {
    return (await payload.count({ collection })).totalDocs;
  } catch {
    return 0;
  }
}

const SUB_LABEL: Record<string, string> = {
  contact: "Contact message",
  membership: "Membership application",
  subscribe: "Newsletter subscription",
};

// Simple inline icons for the management cards.
const I = {
  hero: <path d="M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />,
  ticker: <path d="M3 8h18M3 12h12M3 16h18" strokeLinecap="round" />,
  news: <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" strokeLinecap="round" strokeLinejoin="round" />,
  events: <path d="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />,
  newsletter: <path d="M4 4h16v16H4zM4 8h16M9 12h6M9 16h6" strokeLinecap="round" strokeLinejoin="round" />,
  gallery: <path d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M8 9a1 1 0 100-2 1 1 0 000 2" strokeLinecap="round" strokeLinejoin="round" />,
  us: <path d="M3 4h18v16H3zM3 9h18" strokeLinecap="round" strokeLinejoin="round" />,
  committees: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />,
  members: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />,
  pages: <path d="M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h6" strokeLinecap="round" strokeLinejoin="round" />,
  settings: <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 00-1.7-1l-.3-2.5H9.5l-.3 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 000 2l-2 1.6 2 3.4 2.4-1a7 7 0 001.7 1l.3 2.5h5l.3-2.5a7 7 0 001.7-1l2.4 1 2-3.4-2-1.6a7 7 0 00.1-1z" strokeLinecap="round" strokeLinejoin="round" />,
  media: <path d="M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />,
};

export default async function BeforeDashboard() {
  const payload = await getPayload({ config });

  const [
    heroSlides, ticker, news, events, newsletters, gallery, usNews, committees, members, board, pages, submissions, recent,
  ] = await Promise.all([
    total(payload, "hero-slides"),
    total(payload, "ticker-items"),
    total(payload, "news"),
    total(payload, "events"),
    total(payload, "newsletters"),
    total(payload, "gallery-albums"),
    total(payload, "us-news"),
    total(payload, "committees"),
    total(payload, "members"),
    total(payload, "board-members"),
    total(payload, "pages"),
    total(payload, "submissions"),
    payload.find({ collection: "submissions", sort: "-createdAt", limit: 5, depth: 0 }).catch(() => ({ docs: [] as Record<string, unknown>[] })),
  ]);

  const sections = [
    {
      group: "Homepage",
      items: [
        { label: "Hero section", hint: "Banner headline, image & button", count: heroSlides, href: "/admin/collections/hero-slides", icon: I.hero },
        { label: "News ticker", hint: "Sliding headlines", count: ticker, href: "/admin/collections/ticker-items", icon: I.ticker },
      ],
    },
    {
      group: "Pressroom",
      items: [
        { label: "News", hint: "Articles & press releases", count: news, href: "/admin/collections/news", icon: I.news },
        { label: "Newsletters", hint: "PDF archive", count: newsletters, href: "/admin/collections/newsletters", icon: I.newsletter },
        { label: "Photo gallery", hint: "Event albums", count: gallery, href: "/admin/collections/gallery-albums", icon: I.gallery },
        { label: "U.S. business news", hint: "Curated headlines", count: usNews, href: "/admin/collections/us-news", icon: I.us },
      ],
    },
    {
      group: "Programs & people",
      items: [
        { label: "Events", hint: "Upcoming & past", count: events, href: "/admin/collections/events", icon: I.events },
        { label: "Committees", hint: "Working groups", count: committees, href: "/admin/collections/committees", icon: I.committees },
        { label: "Members", hint: "Directory & logo wall", count: members, href: "/admin/collections/members", icon: I.members },
        { label: "Leadership", hint: "Board & executive", count: board, href: "/admin/collections/board-members", icon: I.committees },
      ],
    },
    {
      group: "Site",
      items: [
        { label: "Pages", hint: "About, Mission, Benefits…", count: pages, href: "/admin/collections/pages", icon: I.pages },
        { label: "Settings", hint: "Contacts, socials, email, SEO", href: "/admin/globals/settings", icon: I.settings },
        { label: "Media library", hint: "Images & PDFs", href: "/admin/collections/media", icon: I.media },
      ],
    },
  ];

  return (
    <div className="amcham-dash">
      {/* Header */}
      <header className="amcham-dash__head">
        <div>
          <h1 className="amcham-dash__hello">Dashboard</h1>
          <p className="amcham-dash__date">Manage the AmCham Cameroon website · bilingual EN / FR · changes go live instantly</p>
        </div>
        <div className="amcham-dash__head-actions">
          <ThemeToggle />
          <a href="/" target="_blank" rel="noreferrer" className="amcham-btn amcham-btn--ghost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="15" height="15"><path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" /></svg>
            View website
          </a>
          <AddMemberButton />
          <LogoutButton />
        </div>
      </header>

      {/* Management launchpad — the CRUD entry point for every part of the site */}
      {sections.map((section) => (
        <section key={section.group} className="amcham-sec">
          <h2 className="amcham-sec__title">{section.group}</h2>
          <div className="amcham-cards">
            {section.items.map((item) => (
              <a key={item.href} href={item.href} className="amcham-tile">
                <span className="amcham-tile__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width="20" height="20">{item.icon}</svg>
                </span>
                <span className="amcham-tile__body">
                  <span className="amcham-tile__label">
                    {item.label}
                    {typeof item.count === "number" && <span className="amcham-tile__count">{item.count}</span>}
                  </span>
                  <span className="amcham-tile__hint">{item.hint}</span>
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16" className="amcham-tile__arrow"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            ))}
          </div>
        </section>
      ))}

      {/* Recent form submissions — keeps track of frontend activity */}
      <section className="amcham-sec">
        <div className="amcham-sec__head">
          <h2 className="amcham-sec__title">Recent submissions</h2>
          <a href="/admin/collections/submissions" className="amcham-sec__link">View inbox ({submissions})</a>
        </div>
        <div className="amcham-inbox">
          {recent.docs.length === 0 && <p className="amcham-inbox__empty">No submissions yet.</p>}
          {recent.docs.map((s) => {
            const d = s as { id: number | string; type?: string; name?: string; email?: string; createdAt?: string; status?: string };
            return (
              <a key={String(d.id)} href={`/admin/collections/submissions/${d.id}`} className="amcham-inbox__row">
                <span className={`amcham-inbox__dot amcham-inbox__dot--${d.type ?? "contact"}`} />
                <span className="amcham-inbox__main">
                  <span className="amcham-inbox__name">{d.name || d.email || "—"}</span>
                  <span className="amcham-inbox__sub">{SUB_LABEL[d.type ?? "contact"] ?? d.type}</span>
                </span>
                <span className="amcham-inbox__meta">
                  {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : ""}
                  <span className={`amcham-status amcham-status--${d.status ?? "new"}`}>{d.status ?? "new"}</span>
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
