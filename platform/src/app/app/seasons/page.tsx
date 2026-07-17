"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { RequirePerm } from "@/components/app/RequirePerm";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton, ProgressBar } from "@/components/ui";
import {
  SEASON_POST_ROLL,
  SEASON_PROGRAM_SCOPED,
  SEASON_SEASON_SCOPED,
} from "@/lib/data/seasonCopy";

export default function SeasonsPage() {
  const { activeProgram, snap, rollSeason, activeAthletes } = useApp();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [rolled, setRolled] = useState(false);
  const [nextLabel, setNextLabel] = useState(() => {
    const n = Number(activeProgram.seasonLabel);
    return Number.isFinite(n) ? String(n + 1) : `${activeProgram.seasonLabel}-next`;
  });
  const done = SEASON_POST_ROLL.filter((s) => checks[s.id]).length;
  const seniors = activeAthletes.filter((a) => a.classYear === "Sr").length;

  return (
    <RequirePerm perm="season_roll" label="season roll">
      <div className="space-y-4">
        <PageHeader
          title="Seasons"
          description={`Archive season-scoped data and promote classes for ${activeProgram.name}.`}
        />

        <Panel title="Current season">
          <p className="font-semibold text-[var(--cc-navy)]">
            {activeProgram.name} · {activeProgram.seasonLabel}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            {activeAthletes.length} athletes · {seniors} seniors will archive off
            roster · games / grades / quizzes / attendance reset
          </p>
          <label className="mt-3 block text-sm">
            <span className="font-semibold">Next season label</span>
            <input
              value={nextLabel}
              onChange={(e) => setNextLabel(e.target.value)}
              className="mt-1 block w-40 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <div className="mt-3">
            <PrimaryButton
              onClick={() => {
                if (
                  !confirm(
                    `Roll ${activeProgram.name} to ${nextLabel}? This archives games, grades, quizzes & attendance and promotes class years.`,
                  )
                )
                  return;
                rollSeason(nextLabel.trim() || "2027");
                setRolled(true);
                setChecks({});
              }}
            >
              {rolled ? "Roll again / confirm" : "Start season roll"}
            </PrimaryButton>
          </div>
          {rolled ? (
            <p className="mt-2 text-sm font-semibold text-emerald-800">
              Rolled to {activeProgram.seasonLabel}. Complete the checklist below.
            </p>
          ) : null}
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
            <p className="mt-2 text-xs text-[var(--cc-steel)]">
              Programs on campus: {snap.programs.length}
            </p>
          </Panel>
        ) : null}
      </div>
    </RequirePerm>
  );
}
