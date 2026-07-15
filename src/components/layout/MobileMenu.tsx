"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { NavItem } from "./nav";
import { useEffect } from "react";

type Props = {
  nav: NavItem[];
  becomeMemberLabel: string;
  menuLabel: string;
  closeLabel: string;
};

export function MobileMenu({ nav, becomeMemberLabel, menuLabel, closeLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  // Close the panel on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? closeLabel : menuLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 text-navy hover:bg-surface-alt"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[108px] bottom-0 z-50 overflow-y-auto bg-white px-4 pb-24 pt-4 shadow-inner">
          <nav aria-label="Mobile">
            {nav.map((item) => (
              <div key={item.href} className="border-b border-surface-alt">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                      aria-expanded={expanded === item.href}
                      className="flex w-full items-center justify-between py-3.5 text-left text-[15px] font-semibold text-ink"
                    >
                      {item.label}
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`h-4 w-4 text-ink-soft transition-transform ${expanded === item.href ? "rotate-180" : ""}`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {expanded === item.href && (
                      <div className="pb-3 pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block py-2 text-sm font-medium text-ink-soft hover:text-navy"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-3.5 text-[15px] font-semibold text-ink hover:text-navy"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <Link
            href="/membership/apply"
            className="mt-6 block rounded-md bg-red px-4 py-3 text-center text-sm font-bold text-white"
          >
            {becomeMemberLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
