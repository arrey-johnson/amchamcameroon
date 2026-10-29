"use client";

import { useEffect, useMemo, useState } from "react";

type Section = "all" | "board" | "executive";

const TABS: { key: Section; label: string; hint: string }[] = [
  { key: "all", label: "All profiles", hint: "Board + Executive Office" },
  { key: "board", label: "Board of Directors", hint: "President, VP, Treasurer, Board Members…" },
  { key: "executive", label: "Executive Office", hint: "Director, Operations, Communications…" },
];

function sectionFromSearch(search: string): Section {
  const params = new URLSearchParams(search);
  const where = params.get("where") || "";
  // Payload may serialize where as nested qs or JSON.
  if (/["']?group["']?\s*[:=]\s*["']?board["']?/i.test(where) || params.get("where[group][equals]") === "board") {
    return "board";
  }
  if (
    /["']?group["']?\s*[:=]\s*["']?executive["']?/i.test(where) ||
    params.get("where[group][equals]") === "executive"
  ) {
    return "executive";
  }
  // Nested qs without brackets encoding: where[group][equals]=board
  for (const [k, v] of params.entries()) {
    if (k.includes("group") && k.includes("equals") && v === "board") return "board";
    if (k.includes("group") && k.includes("equals") && v === "executive") return "executive";
  }
  return "all";
}

function hrefFor(section: Section): string {
  const base = "/admin/collections/board-members";
  if (section === "all") return `${base}?limit=50&sort=group`;
  return `${base}?limit=50&sort=order&where[group][equals]=${section}`;
}

/**
 * Quick filters above the Leadership list so admins can open Board vs
 * Executive Office without hunting through a mixed table.
 */
export default function LeadershipSectionTabs() {
  const [section, setSection] = useState<Section>("all");

  useEffect(() => {
    setSection(sectionFromSearch(window.location.search));
  }, []);

  const active = useMemo(() => section, [section]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        margin: "0 0 16px",
        padding: "12px 14px",
        borderRadius: 10,
        background: "var(--theme-elevation-50, #f5f7fa)",
        border: "1px solid var(--theme-elevation-150, #e5e7eb)",
      }}
    >
      <span
        style={{
          width: "100%",
          marginBottom: 2,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--theme-elevation-600, #4b5160)",
        }}
      >
        Filter by section
      </span>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <a
            key={tab.key}
            href={hrefFor(tab.key)}
            title={tab.hint}
            onClick={() => setSection(tab.key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              border: isActive ? "1px solid transparent" : "1px solid var(--theme-elevation-200, #d1d5db)",
              background: isActive ? "#232e7d" : "var(--theme-elevation-0, #fff)",
              color: isActive ? "#fff" : "var(--theme-text, #1a1d24)",
            }}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}
