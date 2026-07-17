"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";

export default function CallSheetPage() {
  const { snap, activeProgram, activeUnitId, activeWeek, upsertWeekNote } =
    useApp();
  const notes = useMemo(
    () =>
      snap.team.weekNotes.filter(
        (n) =>
          n.programId === activeProgram.id &&
          n.unitId === activeUnitId &&
          n.week === activeWeek &&
          n.kind === "callSheet",
      ),
    [snap.team.weekNotes, activeProgram.id, activeUnitId, activeWeek],
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-4">
      <Panel title={`Week ${activeWeek} call sheet`}>
        {notes.map((n) => (
          <div key={n.id} className="mb-3 rounded-xl border border-[var(--cc-line)] p-3">
            <p className="font-semibold text-[var(--cc-navy)]">{n.title}</p>
            <textarea
              className="mt-2 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 font-mono text-sm"
              rows={5}
              value={n.body}
              onChange={(e) => upsertWeekNote({ ...n, body: e.target.value })}
            />
          </div>
        ))}
        {!notes.length ? (
          <p className="text-sm text-[var(--cc-steel)]">No call sheet yet.</p>
        ) : null}
      </Panel>
      <Panel title="New call sheet">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            upsertWeekNote({
              programId: activeProgram.id,
              unitId: activeUnitId,
              week: activeWeek,
              kind: "callSheet",
              title: title.trim(),
              body: body.trim(),
            });
            setTitle("");
            setBody("");
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Open · Mid · Close · Red zone"
            rows={4}
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 font-mono text-sm"
          />
          <PrimaryButton type="submit">Save call sheet</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}
