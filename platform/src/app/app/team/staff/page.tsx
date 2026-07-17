"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function StaffDutiesPage() {
  const { snap, activeProgram, upsertDuty } = useApp();
  const duties = useMemo(
    () => snap.team.duties.filter((d) => d.programId === activeProgram.id),
    [snap.team.duties, activeProgram.id],
  );
  const coaches = snap.members.filter(
    (m) =>
      m.programIds.includes(activeProgram.id) &&
      (m.role === "head_coach" || m.role === "coach"),
  );
  const [form, setForm] = useState({ title: "", assigneeName: "" });

  return (
    <div className="space-y-4">
      <Panel title="Staff on this team">
        <ul className="grid gap-2 sm:grid-cols-2">
          {coaches.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-[var(--cc-line)] px-3 py-2"
            >
              <p className="font-semibold text-[var(--cc-navy)]">{c.name}</p>
              <p className="text-xs text-[var(--cc-steel)]">
                {c.scope} · {c.email}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Season duties">
        <ul className="space-y-2">
          {duties.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--cc-line)] px-3 py-2.5"
            >
              <div>
                <p className="font-semibold text-[var(--cc-navy)]">{d.title}</p>
                <p className="text-xs text-[var(--cc-steel)]">{d.assigneeName}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  upsertDuty({
                    ...d,
                    status: d.status === "done" ? "open" : "done",
                  })
                }
              >
                <Badge tone={d.status === "done" ? "good" : "warn"}>
                  {d.status}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Assign duty">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim()) return;
            upsertDuty({
              programId: activeProgram.id,
              title: form.title.trim(),
              assigneeName:
                form.assigneeName || coaches[0]?.name || "Unassigned",
              status: "open",
            });
            setForm({ title: "", assigneeName: "" });
          }}
        >
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Duty"
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2"
            required
          />
          <select
            value={form.assigneeName}
            onChange={(e) =>
              setForm({ ...form, assigneeName: e.target.value })
            }
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2"
          >
            <option value="">Assignee</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <PrimaryButton type="submit">Add</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}
