"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton, ProgressBar } from "@/components/ui";
import {
  SEASON_POST_ROLL,
  SEASON_PROGRAM_SCOPED,
  SEASON_SEASON_SCOPED,
} from "@/lib/data/seasonCopy";

export default function SeasonsPage() {
  const { activeProgram, snap } = useApp();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [rolled, setRolled] = useState(false);
  const done = SEASON_POST_ROLL.filter((s) => checks[s.id]).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Seasons"
        description={`Archive / roll for ${activeProgram.name}. Persistence hooks go on the repository later.`}
      />

      <Panel title="Current season">
        <p className="font-semibold text-[var(--cc-navy)]">
          {activeProgram.name} · {activeProgram.seasonLabel}
        </p>
        <p className="mt-1 text-sm text-[var(--cc-steel)]">
          {snap.programs.length} programs on campus · active athletes{" "}
          {snap.athletes.filter((a) => a.programId === activeProgram.id).length}
        </p>
        <PrimaryButton
          onClick={() => setRolled(true)}
        >
          {rolled ? "Roll started" : "Start season roll"}
        </PrimaryButton>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Survives roll (program-scoped)">
          <ul className="space-y-2 text-sm">
            {SEASON_PROGRAM_SCOPED.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Badge tone="good">Keep</Badge>
                {item}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Resets (season-scoped)">
          <ul className="space-y-2 text-sm">
            {SEASON_SEASON_SCOPED.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Badge tone="warn">Archive</Badge>
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {rolled ? (
        <Panel title="Post-roll checklist">
          <ProgressBar value={done} max={SEASON_POST_ROLL.length} />
          <ul className="mt-3 space-y-2">
            {SEASON_POST_ROLL.map((s) => (
              <li
                key={s.id}
                className="flex gap-3 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={!!checks[s.id]}
                  onChange={(e) =>
                    setChecks({ ...checks, [s.id]: e.target.checked })
                  }
                />
                <div>
                  <p className="font-semibold">{s.label}</p>
                  <p className="text-sm text-[var(--cc-steel)]">{s.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
