"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
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
      "when,who,action,detail",
      ...snap.audit.map(
        (e) =>
          `"${e.at}","${e.actor}","${e.action}","${e.detail.replace(/"/g, '""')}"`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit"
        description="Immutable event stream UI — persist via repository.log in production."
        action={<PrimaryButton onClick={exportCsv}>Export CSV</PrimaryButton>}
      />
      <Panel title="Events">
        <div className="mb-3 flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setFilter(a)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                filter === a
                  ? "bg-[var(--cc-navy)] text-white"
                  : "border border-[var(--cc-line)]"
              }`}
            >
              {a}
            </button>
          ))}
          <Badge>{rows.length}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2">When</th>
                <th className="py-2">Who</th>
                <th className="py-2">Action</th>
                <th className="py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-[var(--cc-line)]/70">
                  <td className="py-2 whitespace-nowrap text-[var(--cc-steel)]">
                    {new Date(e.at).toLocaleString()}
                  </td>
                  <td className="py-2 font-medium">{e.actor}</td>
                  <td className="py-2 font-mono text-xs">{e.action}</td>
                  <td className="py-2">{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
