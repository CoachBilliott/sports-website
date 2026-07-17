"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";
import type { WeekNote } from "@/lib/data/types";

function NotesPage({
  kind,
  title,
  dayOptional,
}: {
  kind: WeekNote["kind"];
  title: string;
  dayOptional?: boolean;
}) {
  const { snap, activeProgram, activeUnitId, activeWeek, upsertWeekNote } =
    useApp();
  const notes = useMemo(
    () =>
      snap.team.weekNotes.filter(
        (n) =>
          n.programId === activeProgram.id &&
          n.unitId === activeUnitId &&
          n.week === activeWeek &&
          n.kind === kind,
      ),
    [snap.team.weekNotes, activeProgram.id, activeUnitId, activeWeek, kind],
  );
  const [form, setForm] = useState({ title: "", body: "", day: "Mon" });

  return (
    <div className="space-y-4">
      <Panel title={title}>
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-[var(--cc-line)] px-3 py-3"
            >
              <p className="font-semibold text-[var(--cc-navy)]">
                {n.day ? `${n.day} · ` : ""}
                {n.title}
              </p>
              <textarea
                className="mt-2 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
                rows={3}
                value={n.body}
                onChange={(e) => upsertWeekNote({ ...n, body: e.target.value })}
              />
            </li>
          ))}
          {!notes.length ? (
            <li className="text-sm text-[var(--cc-steel)]">
              Empty for week {activeWeek}.
            </li>
          ) : null}
        </ul>
      </Panel>
      <Panel title="Add">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim()) return;
            upsertWeekNote({
              programId: activeProgram.id,
              unitId: activeUnitId,
              week: activeWeek,
              kind,
              day: dayOptional ? form.day : undefined,
              title: form.title.trim(),
              body: form.body.trim(),
            });
            setForm({ title: "", body: "", day: "Mon" });
          }}
        >
          {dayOptional ? (
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
            >
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          ) : null}
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            required
          />
          <textarea
            placeholder="Notes"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
          />
          <PrimaryButton type="submit">Save</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}

export default function PracticePage() {
  return <NotesPage kind="practice" title="Practice plans" dayOptional />;
}
