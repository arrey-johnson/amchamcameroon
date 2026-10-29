"use client";

import { useMemo, useState } from "react";
import { PersonCard } from "@/components/cards/PersonCard";
import { Reveal } from "@/components/Reveal";
import {
  isExecutiveBureauRole,
  sortByLeadershipRole,
  termLabelOf,
} from "@/lib/utils";
import type { BoardMember } from "@/payload-types";

export function LeadershipExplorer({
  people,
  allYearsLabel,
  executiveBureauLabel,
  boardMembersLabel,
}: {
  people: BoardMember[];
  allYearsLabel: string;
  /** When set, board profiles split into Executive Bureau + Board Members. */
  executiveBureauLabel?: string;
  boardMembersLabel?: string;
}) {
  const terms = useMemo(() => {
    const set = new Set<string>();
    for (const p of people) set.add(termLabelOf(p));
    return Array.from(set).sort((a, b) => {
      const aStart = Number(a.split("-")[0]) || 0;
      const bStart = Number(b.split("-")[0]) || 0;
      return bStart - aStart;
    });
  }, [people]);

  const [term, setTerm] = useState<string | "all">(terms[0] ?? "all");

  const shown = useMemo(() => {
    const filtered = term === "all" ? people : people.filter((p) => termLabelOf(p) === term);
    return sortByLeadershipRole(filtered);
  }, [people, term]);

  const splitSections = Boolean(executiveBureauLabel && boardMembersLabel);
  const bureau = splitSections ? shown.filter((p) => isExecutiveBureauRole(p.role)) : [];
  const members = splitSections ? shown.filter((p) => !isExecutiveBureauRole(p.role)) : shown;

  return (
    <div>
      {terms.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setTerm("all")}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
              term === "all" ? "bg-navy text-white" : "border border-navy/20 text-navy hover:bg-navy/5"
            }`}
          >
            {allYearsLabel}
          </button>
          {terms.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                term === t ? "bg-navy text-white" : "border border-navy/20 text-navy hover:bg-navy/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {splitSections ? (
        <div className="space-y-14">
          <LeadershipSection title={executiveBureauLabel!} people={bureau} />
          <LeadershipSection title={boardMembersLabel!} people={members} />
        </div>
      ) : (
        <PersonGrid people={shown} />
      )}

      {shown.length === 0 && (
        <p className="rounded-lg bg-surface-alt p-10 text-center text-sm text-ink-soft">—</p>
      )}
    </div>
  );
}

function LeadershipSection({ title, people }: { title: string; people: BoardMember[] }) {
  if (people.length === 0) return null;
  return (
    <section>
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-navy px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
          {title}
        </span>
        <span className="h-px flex-1 bg-navy/10" aria-hidden />
      </div>
      <PersonGrid people={people} />
    </section>
  );
}

function PersonGrid({ people }: { people: BoardMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {people.map((person, i) => (
        <Reveal key={person.id} delay={(i % 4) * 80}>
          <PersonCard person={person} />
        </Reveal>
      ))}
    </div>
  );
}
