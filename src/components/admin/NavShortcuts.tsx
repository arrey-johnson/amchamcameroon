/* eslint-disable @next/next/no-html-link-for-pages */
/**
 * Top-of-sidebar shortcuts that mirror the dashboard: home desk + inbox.
 * Plain <a> is intentional for Payload admin routes.
 */
export default function NavShortcuts() {
  return (
    <nav className="amcham-nav-shortcuts" aria-label="Main shortcuts">
      <a href="/admin" className="amcham-nav-shortcuts__link">
        <span className="amcham-nav-shortcuts__icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
          </svg>
        </span>
        Dashboard
      </a>
      <a href="/admin/collections/submissions" className="amcham-nav-shortcuts__link amcham-nav-shortcuts__link--inbox">
        <span className="amcham-nav-shortcuts__icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16v12H4zM4 8l8 5 8-5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </span>
        Inbox
      </a>
    </nav>
  );
}
