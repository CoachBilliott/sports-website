"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { RequirePerm } from "@/components/app/RequirePerm";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function AuditPage() {
  const { snap } = useApp();
  const [filter, setFilter] = useState("all");
  const actions = useMemo(() => {
    const set = new Set(snap.audit.map((e) => e.action));
    return ["all", ...Array.from(set)];
  }, [snap.audit]);
  const rows =
    filter === "all"
      ? snap.audit
      : snap.audit.filter((e) => e.action === filter);

  function exportCsv() {
    const lines = [
      "at,actor,action,detail",
      ...rows.map(
        (e) =>
          `"${e.at}","${e.actor}","${e.action}","${e.detail.replace(/"/g, '""')}"`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <RequirePerm perm="view_audit" label="the audit log">
      <div className="space-y-4">
        <PageHeader
          title="Audit"
          description="Every mutating action in this local session is logged."
          action={
            <PrimaryButton onClick={exportCsv}>Export CSV</PrimaryButton>
          }
        />

        <Panel title="Filter">
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setFilter(a)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  filter === a
                    ? "bg-[var(--cc-navy)] text-white"
                    : "border border-[var(--cc-line)]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title={`${rows.length} events`}>
          <ul className="space-y-2">
            {rows.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-[var(--cc-line)] px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{e.action}</Badge>
                  <span className="font-semibold text-[var(--cc-navy)]">
                    {e.actor}
                  </span>
                  <span className="text-xs text-[var(--cc-steel)]">
                    {new Date(e.at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-[var(--cc-steel)]">{e.detail}</p>
              </li>
            ))}
            {!rows.length ? (
              <li className="text-sm text-[var(--cc-steel)]">
                No events yet — change something in the app.
              </li>
            ) : null}
          </ul>
        </Panel>
      </div>
    </RequirePerm>
  );
}
