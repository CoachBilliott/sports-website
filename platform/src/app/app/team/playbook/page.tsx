"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function PlaybookPage() {
  const {
    snap,
    activeProgram,
    activeUnitId,
    addPlaybookEntry,
    removePlaybookEntry,
  } = useApp();
  const entries = useMemo(
    () =>
      snap.team.playbook.filter(
        (p) => p.programId === activeProgram.id && p.unitId === activeUnitId,
      ),
    [snap.team.playbook, activeProgram.id, activeUnitId],
  );
  const [form, setForm] = useState({
    title: "",
    category: "Run",
    body: "",
  });

  return (
    <div className="space-y-4">
      <Panel title="Playbook">
        <ul className="grid gap-3 md:grid-cols-2">
          {entries.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-[var(--cc-line)] px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge>{p.category}</Badge>
                  <p className="mt-1 font-semibold text-[var(--cc-navy)]">
                    {p.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removePlaybookEntry(p.id)}
                  className="text-xs font-semibold text-red-700"
                >
                  Remove
                </button>
              </div>
              <p className="mt-2 text-sm text-[var(--cc-steel)]">{p.body}</p>
            </li>
          ))}
          {!entries.length ? (
            <li className="text-sm text-[var(--cc-steel)]">No plays yet.</li>
          ) : null}
        </ul>
      </Panel>
      <Panel title="Add play / concept">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim()) return;
            addPlaybookEntry({
              programId: activeProgram.id,
              unitId: activeUnitId,
              title: form.title.trim(),
              category: form.category,
              body: form.body.trim(),
            });
            setForm({ title: "", category: form.category, body: "" });
          }}
        >
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Name"
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2"
            required
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category"
            className="w-28 rounded-lg border border-[var(--cc-line)] px-3 py-2"
          />
          <input
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Coaching points"
            className="min-w-[16rem] flex-1 rounded-lg border border-[var(--cc-line)] px-3 py-2"
          />
          <PrimaryButton type="submit">Add</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}
