"use client";

import { useMemo, useState } from "react";
import { PersonCard } from "@/components/cards/PersonCard";
import { Reveal } from "@/components/Reveal";
import { sortByLeadershipRole } from "@/lib/utils";
import type { BoardMember } from "@/payload-types";

export function LeadershipExplorer({
  people,
  allYearsLabel,
}: {
  people: BoardMember[];
  allYearsLabel: string;
}) {
  const yearOf = (p: BoardMember) =>
    typeof p.year === "number" ? p.year : new Date().getFullYear();

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const p of people) set.add(yearOf(p));
    return Array.from(set).sort((a, b) => b - a);
  }, [people]);

  const [year, setYear] = useState<number | "all">(years[0] ?? "all");

  const shown = useMemo(() => {
    const filtered = year === "all" ? people : people.filter((p) => yearOf(p) === year);
    return sortByLeadershipRole(filtered);
  }, [people, year]);

  return (
    <div>
      {years.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setYear("all")}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              year === "all" ? "bg-navy text-white" : "border border-navy/20 text-navy hover:bg-navy/5"
            }`}
          >
            {allYearsLabel}
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                year === y ? "bg-navy text-white" : "border border-navy/20 text-navy hover:bg-navy/5"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((person, i) => (
          <Reveal key={person.id} delay={(i % 4) * 80}>
            <PersonCard person={person} />
          </Reveal>
        ))}
      </div>
      {shown.length === 0 && (
        <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">—</p>
      )}
    </div>
  );
}
