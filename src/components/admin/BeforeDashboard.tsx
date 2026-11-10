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
  contact: "Contact",
  membership: "Membership",
  subscribe: "Newsletter",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  "in-review": "In review",
  handled: "Done",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** UTC short date — stable across server/client timezones (avoids hydration mismatch). */
function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export default async function BeforeDashboard() {
  const payload = await getPayload({ config });

  const [
    heroSlides,
    ticker,
    news,
    events,
    newsletters,
    gallery,
    usNews,
    committees,
    members,
    board,
    pages,
    submissions,
    newMessages,
    recent,
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
    payload
      .count({ collection: "submissions", where: { status: { equals: "new" } } })
      .then((r) => r.totalDocs)
      .catch(() => 0),
    payload
      .find({ collection: "submissions", sort: "-createdAt", limit: 6, depth: 0 })
      .catch(() => ({ docs: [] as Record<string, unknown>[] })),
  ]);

  const tasks = [
    {
      label: "Publish news",
      hint: "Article or press release",
      href: "/admin/collections/news/create",
    },
    {
      label: "Add event",
      hint: "Conference, networking, workshop",
      href: "/admin/collections/events/create",
    },
    {
      label: "Review messages",
      hint: newMessages > 0 ? `${newMessages} waiting` : "Forms & applications",
      href: "/admin/collections/submissions",
      badge: newMessages > 0 ? newMessages : undefined,
      urgent: newMessages > 0,
    },
    {
      label: "Homepage banner",
      hint: "Hero photos & headlines",
      href: "/admin/collections/hero-slides",
    },
    {
      label: "Add member",
      hint: "Directory & logo wall",
      href: "/admin/collections/members/create",
    },
    {
      label: "Site settings",
      hint: "Contact, socials, email",
      href: "/admin/globals/settings",
    },
  ];

  const stats = [
    { label: "New messages", value: newMessages, href: "/admin/collections/submissions", accent: newMessages > 0 },
    { label: "Members", value: members, href: "/admin/collections/members" },
    { label: "Events", value: events, href: "/admin/collections/events" },
    { label: "News", value: news, href: "/admin/collections/news" },
  ];

  // Keep labels/groups identical to the Payload sidebar.
  const browse = [
    {
      group: "Messages",
      items: [{ label: "Inbox", count: submissions, href: "/admin/collections/submissions" }],
    },
    {
      group: "Homepage",
      items: [
        { label: "Banners", count: heroSlides, href: "/admin/collections/hero-slides" },
        { label: "Headlines", count: ticker, href: "/admin/collections/ticker-items" },
      ],
    },
    {
      group: "News & media",
      items: [
        { label: "News", count: news, href: "/admin/collections/news" },
        { label: "Newsletters", count: newsletters, href: "/admin/collections/newsletters" },
        { label: "Gallery", count: gallery, href: "/admin/collections/gallery-albums" },
        { label: "U.S. news", count: usNews, href: "/admin/collections/us-news" },
      ],
    },
    {
      group: "People",
      items: [
        { label: "Events", count: events, href: "/admin/collections/events" },
        { label: "Members", count: members, href: "/admin/collections/members" },
        { label: "Member accounts", href: "/admin/collections/member-accounts" },
        { label: "Leadership", count: board, href: "/admin/collections/board-members" },
        { label: "Committees", count: committees, href: "/admin/collections/committees" },
      ],
    },
    {
      group: "Site",
      items: [
        { label: "Pages", count: pages, href: "/admin/collections/pages" },
        { label: "Settings", href: "/admin/globals/settings" },
        { label: "Media", href: "/admin/collections/media" },
        { label: "Users", href: "/admin/collections/users" },
      ],
    },
  ];

  return (
    <div className="amcham-dash">
      <header className="amcham-top">
        <div className="amcham-top__brand">
          <span className="amcham-top__logo" aria-hidden>
            A
          </span>
          <div>
            <p className="amcham-top__kicker">AmCham Cameroon</p>
            <h1 className="amcham-top__title">Website desk</h1>
          </div>
        </div>
        <div className="amcham-top__actions">
          <ThemeToggle />
          <a href="/" target="_blank" rel="noreferrer" className="amcham-btn amcham-btn--ghost">
            Live site
          </a>
          <AddMemberButton />
          <LogoutButton />
        </div>
      </header>

      <section className="amcham-stats" aria-label="At a glance">
        {stats.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className={`amcham-stat${s.accent ? " amcham-stat--accent" : ""}`}
          >
            <span className="amcham-stat__value">{s.value}</span>
            <span className="amcham-stat__label">{s.label}</span>
          </a>
        ))}
      </section>

      <div className="amcham-split">
        <section className="amcham-card">
          <div className="amcham-card__head">
            <h3 className="amcham-card__title">Quick actions</h3>
          </div>
          <div className="amcham-actions">
            {tasks.map((task) => (
              <a
                key={task.href + task.label}
                href={task.href}
                className={`amcham-action${task.urgent ? " amcham-action--urgent" : ""}`}
              >
                <span className="amcham-action__text">
                  <span className="amcham-action__label">
                    {task.label}
                    {typeof task.badge === "number" && (
                      <span className="amcham-action__badge">{task.badge}</span>
                    )}
                  </span>
                  <span className="amcham-action__hint">{task.hint}</span>
                </span>
                <span className="amcham-action__chev" aria-hidden>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="amcham-card">
          <div className="amcham-card__head">
            <h3 className="amcham-card__title">Inbox</h3>
            <a href="/admin/collections/submissions" className="amcham-card__link">
              View all
            </a>
          </div>
          <div className="amcham-inbox">
            {recent.docs.length === 0 ? (
              <p className="amcham-inbox__empty">Inbox is clear. New form submissions will show up here.</p>
            ) : (
              recent.docs.map((s) => {
                const d = s as {
                  id: number | string;
                  type?: string;
                  name?: string;
                  email?: string;
                  createdAt?: string;
                  status?: string;
                };
                const status = d.status ?? "new";
                return (
                  <a
                    key={String(d.id)}
                    href={`/admin/collections/submissions/${d.id}`}
                    className={`amcham-inbox__row${status === "new" ? " amcham-inbox__row--new" : ""}`}
                  >
                    <div className="amcham-inbox__main">
                      <span className="amcham-inbox__name">{d.name || d.email || "—"}</span>
                      <span className="amcham-inbox__type">
                        {SUB_LABEL[d.type ?? "contact"] ?? d.type}
                      </span>
                    </div>
                    <div className="amcham-inbox__side">
                      <span className={`amcham-pill amcham-pill--${status}`}>
                        {STATUS_LABEL[status] ?? status}
                      </span>
                      <span className="amcham-inbox__date">
                        {d.createdAt ? formatShortDate(d.createdAt) : ""}
                      </span>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="amcham-tips">
        <span className="amcham-tips__item">
          <strong>EN / FR</strong> Switch language on each edit screen
        </span>
        <span className="amcham-tips__item">
          <strong>Draft → Publish</strong> Publish only when ready to go live
        </span>
        <span className="amcham-tips__item">
          <strong>Live site</strong> Preview changes after saving
        </span>
      </section>

      <section className="amcham-browse">
        <div className="amcham-browse__head">
          <h3 className="amcham-browse__title">Browse everything</h3>
        </div>
        <div className="amcham-browse__grid">
          {browse.map((section) => (
            <div key={section.group} className="amcham-browse__col">
              <h4 className="amcham-browse__group">{section.group}</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a href={item.href}>
                      <span>{item.label}</span>
                      {typeof item.count === "number" && <em>{item.count}</em>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
