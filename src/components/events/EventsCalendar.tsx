"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "@/components/events/EventsExplorer";

type Props = {
  events: EventItem[];
  locale: string;
  labels: {
    previousMonth: string;
    nextMonth: string;
    eventsOnDay: string;
    noEventsOnDay: string;
    upcomingDot: string;
    pastDot: string;
  };
};

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDay(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Every calendar day an event covers (start through end, inclusive). */
function daysForEvent(event: EventItem): string[] {
  const start = parseLocalDay(event.startAt);
  const end = event.endAt ? parseLocalDay(event.endAt) : start;
  const keys: string[] = [];
  const cursor = new Date(start);
  // Cap multi-day span so a bad endAt cannot flood the grid.
  for (let i = 0; i < 60 && cursor <= end; i++) {
    keys.push(dateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export function EventsCalendar({ events, locale, labels }: Props) {
  const intlLocale = locale === "fr" ? "fr-FR" : "en-US";

  const byDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const event of events) {
      for (const key of daysForEvent(event)) {
        if (!map.has(key)) map.set(key, []);
        const list = map.get(key)!;
        if (!list.some((e) => e.id === event.id)) list.push(event);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startAt.localeCompare(b.startAt));
    }
    return map;
  }, [events]);

  const initial = useMemo(() => {
    const today = new Date();
    const todayKey = dateKey(today);
    if (byDay.has(todayKey)) {
      return { year: today.getFullYear(), month: today.getMonth(), selected: todayKey };
    }
    // Prefer nearest upcoming event day, else most recent past day.
    const keys = Array.from(byDay.keys()).sort();
    const upcoming = keys.find((k) => k >= todayKey);
    const pick = upcoming ?? keys[keys.length - 1];
    if (pick) {
      const [y, m] = pick.split("-").map(Number);
      return { year: y, month: m - 1, selected: pick };
    }
    return { year: today.getFullYear(), month: today.getMonth(), selected: null as string | null };
  }, [byDay]);

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [selected, setSelected] = useState<string | null>(initial.selected);

  const monthLabel = new Intl.DateTimeFormat(intlLocale, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  const weekdays = useMemo(() => {
    // Monday-first week headers.
    const fmt = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2024, 0, 1 + i); // Mon 1 Jan 2024
      return fmt.format(d);
    });
  }, [intlLocale]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    // JS getDay(): 0=Sun … convert to Mon=0
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = dateKey(new Date());
    const out: {
      key: string | null;
      day: number | null;
      isToday: boolean;
      hasUpcoming: boolean;
      hasPast: boolean;
      count: number;
    }[] = [];

    for (let i = 0; i < startPad; i++) {
      out.push({ key: null, day: null, isToday: false, hasUpcoming: false, hasPast: false, count: 0 });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKey(new Date(year, month, day));
      const dayEvents = byDay.get(key) || [];
      out.push({
        key,
        day,
        isToday: key === todayKey,
        hasUpcoming: dayEvents.some((e) => !e.past),
        hasPast: dayEvents.some((e) => e.past),
        count: dayEvents.length,
      });
    }
    while (out.length % 7 !== 0) {
      out.push({ key: null, day: null, isToday: false, hasUpcoming: false, hasPast: false, count: 0 });
    }
    return out;
  }, [year, month, byDay]);

  const selectedEvents = selected ? byDay.get(selected) || [] : [];
  const selectedLabel = selected
    ? new Intl.DateTimeFormat(intlLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(selected + "T12:00:00"))
    : null;

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label={labels.previousMonth}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden>
              <path d="M15 6 9 12l6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-xl font-extrabold capitalize text-navy sm:text-2xl">{monthLabel}</h2>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label={labels.nextMonth}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 text-navy transition-colors hover:bg-navy hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden>
              <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-navy/10 bg-surface-alt">
            {weekdays.map((label) => (
              <div
                key={label}
                className="px-1 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              if (!cell.key || cell.day == null) {
                return <div key={`empty-${i}`} className="min-h-[4.5rem] bg-surface-alt/40" />;
              }
              const isSelected = selected === cell.key;
              const hasEvents = cell.count > 0;
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelected(cell.key)}
                  aria-pressed={isSelected}
                  aria-label={
                    hasEvents
                      ? `${cell.day}, ${cell.count} event${cell.count > 1 ? "s" : ""}`
                      : String(cell.day)
                  }
                  className={`relative flex min-h-[4.5rem] flex-col items-center gap-1.5 border-b border-r border-navy/5 px-1 py-2 transition-colors ${
                    isSelected
                      ? "bg-navy text-white"
                      : hasEvents
                        ? "bg-white hover:bg-navy/5"
                        : "bg-white text-ink-soft hover:bg-surface-alt"
                  } ${cell.isToday && !isSelected ? "ring-2 ring-inset ring-red/40" : ""}`}
                >
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? "text-white" : cell.isToday ? "text-red" : "text-navy"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {hasEvents && (
                    <span className="flex items-center gap-1" aria-hidden>
                      {cell.hasUpcoming && (
                        <span
                          className={`h-2 w-2 rounded-full ${isSelected ? "bg-gold" : "bg-red"}`}
                          title={labels.upcomingDot}
                        />
                      )}
                      {cell.hasPast && (
                        <span
                          className={`h-2 w-2 rounded-full ${isSelected ? "bg-white/70" : "bg-navy"}`}
                          title={labels.pastDot}
                        />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red" aria-hidden />
            {labels.upcomingDot}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-navy" aria-hidden />
            {labels.pastDot}
          </span>
        </div>
      </div>

      <div>
        {selectedLabel && (
          <h3 className="mb-5 text-lg font-extrabold capitalize text-navy sm:text-xl">
            {labels.eventsOnDay.replace("{date}", selectedLabel)}
          </h3>
        )}
        {selectedEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {selectedEvents.map((item) => (
              <div key={item.id}>{item.node}</div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-surface-alt p-8 text-center text-sm text-ink-soft">
            {labels.noEventsOnDay}
          </p>
        )}
      </div>
    </div>
  );
}
