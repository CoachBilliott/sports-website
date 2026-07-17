"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";
import type { WeekNote } from "@/lib/data/types";

function WeekNotesEditor({
  kind,
  title,
  dayOptional,
}: {
  kind: WeekNote["kind"];
  title: string;
  dayOptional?: boolean;
}) {
  const {
    snap,
    activeProgram,
    activeUnitId,
    activeWeek,
    upsertWeekNote,
  } = useApp();

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
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-[var(--cc-navy)]">{n.title}</p>
                {n.day ? (
                  <span className="text-xs font-bold text-[var(--cc-steel)]">
                    {n.day}
                  </span>
                ) : null}
              </div>
              <textarea
                className="mt-2 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
                rows={3}
                value={n.body}
                onChange={(e) =>
                  upsertWeekNote({ ...n, body: e.target.value })
                }
              />
            </li>
          ))}
          {!notes.length ? (
            <li className="text-sm text-[var(--cc-steel)]">
              Nothing for week {activeWeek} yet — add below.
            </li>
          ) : null}
        </ul>
      </Panel>

      <Panel title={`Add ${title.toLowerCase()}`}>
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
            <label className="block text-sm">
              <span className="font-semibold">Day</span>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="mt-1 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block text-sm">
            <span className="font-semibold">Title</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Notes</span>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <PrimaryButton type="submit">Save</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}

export default function ScoutPage() {
  return <WeekNotesEditor kind="scout" title="Scout notes" />;
}
