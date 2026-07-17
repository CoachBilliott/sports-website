"use client";

import { useMemo } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, StatTile } from "@/components/ui";
import type { AttendanceRecord } from "@/lib/data/types";

const STATUSES: AttendanceRecord["status"][] = [
  "present",
  "late",
  "absent",
  "excused",
];

export default function AttendancePage() {
  const { snap, activeProgram, activeAthletes, setAttendance } = useApp();
  const date = new Date().toISOString().slice(0, 10);
  const day =
    snap.team.attendance.find(
      (a) => a.programId === activeProgram.id && a.date === date,
    ) ??
    snap.team.attendance.find((a) => a.programId === activeProgram.id);

  const records = useMemo(() => {
    const map = new Map(
      (day?.records ?? []).map((r) => [r.athleteId, r.status] as const),
    );
    return activeAthletes.map((a) => ({
      athlete: a,
      status: (map.get(a.id) ?? "present") as AttendanceRecord["status"],
    }));
  }, [activeAthletes, day]);

  const counts = STATUSES.reduce(
    (acc, s) => {
      acc[s] = records.filter((r) => r.status === s).length;
      return acc;
    },
    {} as Record<AttendanceRecord["status"], number>,
  );

  const write = (
    athleteId: string,
    status: AttendanceRecord["status"],
  ) => {
    const next = records.map((r) =>
      r.athlete.id === athleteId
        ? { athleteId, status }
        : { athleteId: r.athlete.id, status: r.status },
    );
    setAttendance(date, next);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatTile label="Present" value={String(counts.present)} tone="good" />
        <StatTile label="Late" value={String(counts.late)} />
        <StatTile label="Absent" value={String(counts.absent)} />
        <StatTile label="Excused" value={String(counts.excused)} />
      </div>
      <Panel title={`Attendance · ${date}`}>
        <ul className="divide-y divide-[var(--cc-line)]">
          {records.map(({ athlete: a, status }) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5"
            >
              <div>
                <p className="font-semibold text-[var(--cc-navy)]">
                  #{a.jersey} {a.name}
                </p>
                <p className="text-xs text-[var(--cc-steel)]">
                  {a.pos} · {a.level}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => write(a.id, s)}
                    className="rounded-md"
                  >
                    <Badge tone={status === s ? "brand" : "neutral"}>{s}</Badge>
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
