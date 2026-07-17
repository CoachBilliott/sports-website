"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function ResourcesPage() {
  const {
    snap,
    activeProgram,
    activeUnitId,
    addResource,
    removeResource,
  } = useApp();
  const items = useMemo(
    () =>
      snap.team.resources.filter(
        (r) => r.programId === activeProgram.id && r.unitId === activeUnitId,
      ),
    [snap.team.resources, activeProgram.id, activeUnitId],
  );
  const [form, setForm] = useState({ name: "", category: "Install", note: "" });

  return (
    <div className="space-y-4">
      <Panel title="Resources">
        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--cc-line)] px-3 py-2.5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge>{r.category}</Badge>
                  <p className="font-semibold text-[var(--cc-navy)]">{r.name}</p>
                </div>
                {r.note ? (
                  <p className="text-xs text-[var(--cc-steel)]">{r.note}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeResource(r.id)}
                className="text-xs font-semibold text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
          {!items.length ? (
            <li className="text-sm text-[var(--cc-steel)]">No files yet.</li>
          ) : null}
        </ul>
      </Panel>
      <Panel title="Add resource">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            addResource({
              programId: activeProgram.id,
              unitId: activeUnitId,
              name: form.name.trim(),
              category: form.category,
              note: form.note.trim(),
            });
            setForm({ name: "", category: form.category, note: "" });
          }}
        >
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="File or link name"
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2"
            required
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-28 rounded-lg border border-[var(--cc-line)] px-3 py-2"
          />
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Note"
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2"
          />
          <PrimaryButton type="submit">Add</PrimaryButton>
        </form>
        <p className="mt-2 text-xs text-[var(--cc-steel)]">
          File bytes plug into storage later — names & categories work now.
        </p>
      </Panel>
    </div>
  );
}
