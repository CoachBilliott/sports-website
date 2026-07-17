"use client";

import { useMemo } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Panel } from "@/components/ui";

export default function GradesPage() {
  const { snap, activeProgram, activeWeek, activeAthletes, upsertGrade } =
    useApp();

  const byAthlete = useMemo(() => {
    return activeAthletes.map((a) => {
      const g = snap.team.grades.find(
        (x) =>
          x.programId === activeProgram.id &&
          x.athleteId === a.id &&
          x.week === activeWeek,
      );
      return { athlete: a, grade: g };
    });
  }, [activeAthletes, snap.team.grades, activeProgram.id, activeWeek]);

  return (
    <Panel title={`Week ${activeWeek} grades`}>
      <p className="mb-3 text-sm text-[var(--cc-steel)]">
        Practice 0–10 · Game 0–100 · Pride letter. Grades stay off Fan / Parent.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
              <th className="py-2">Athlete</th>
              <th className="py-2">Practice</th>
              <th className="py-2">Game</th>
              <th className="py-2">Pride</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {byAthlete.map(({ athlete: a, grade: g }) => (
              <tr key={a.id} className="border-b border-[var(--cc-line)]/50">
                <td className="py-2 font-medium">
                  #{a.jersey} {a.name}
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={g?.practice ?? ""}
                    onChange={(e) =>
                      upsertGrade({
                        programId: activeProgram.id,
                        athleteId: a.id,
                        week: activeWeek,
                        practice: Number(e.target.value) || null,
                        game: g?.game ?? null,
                        pride: g?.pride ?? null,
                        notes: g?.notes ?? "",
                        id: g?.id,
                      })
                    }
                    className="w-16 rounded-md border border-[var(--cc-line)] px-2 py-1"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={g?.game ?? ""}
                    onChange={(e) =>
                      upsertGrade({
                        programId: activeProgram.id,
                        athleteId: a.id,
                        week: activeWeek,
                        practice: g?.practice ?? null,
                        game: Number(e.target.value) || null,
                        pride: g?.pride ?? null,
                        notes: g?.notes ?? "",
                        id: g?.id,
                      })
                    }
                    className="w-20 rounded-md border border-[var(--cc-line)] px-2 py-1"
                  />
                </td>
                <td className="py-2">
                  <input
                    value={g?.pride ?? ""}
                    onChange={(e) =>
                      upsertGrade({
                        programId: activeProgram.id,
                        athleteId: a.id,
                        week: activeWeek,
                        practice: g?.practice ?? null,
                        game: g?.game ?? null,
                        pride: e.target.value || null,
                        notes: g?.notes ?? "",
                        id: g?.id,
                      })
                    }
                    className="w-14 rounded-md border border-[var(--cc-line)] px-2 py-1"
                    placeholder="A"
                  />
                </td>
                <td className="py-2">
                  <input
                    value={g?.notes ?? ""}
                    onChange={(e) =>
                      upsertGrade({
                        programId: activeProgram.id,
                        athleteId: a.id,
                        week: activeWeek,
                        practice: g?.practice ?? null,
                        game: g?.game ?? null,
                        pride: g?.pride ?? null,
                        notes: e.target.value,
                        id: g?.id,
                      })
                    }
                    className="w-full min-w-[8rem] rounded-md border border-[var(--cc-line)] px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
