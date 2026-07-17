"use client";

import { useMemo, useState } from "react";
import { usePlatform } from "../PlatformState";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export function AuditScreen() {
  const { auditEvents, logAudit } = usePlatform();
  const [filter, setFilter] = useState("all");
  const actions = useMemo(() => {
    const set = new Set(auditEvents.map((e) => e.action));
    return ["all", ...Array.from(set)];
  }, [auditEvents]);

  const rows =
    filter === "all"
      ? auditEvents
      : auditEvents.filter((e) => e.action === filter);

  function exportCsv() {
    const lines = [
      "when,who,action,detail",
      ...auditEvents.map(
        (e) =>
          `"${e.at}","${e.actor}","${e.action}","${e.detail.replace(/"/g, '""')}"`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platform-audit-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
    logAudit("audit_export", "Downloaded audit CSV (demo)");
  }

  return (
    <Panel
      title="Audit log"
      action={
        <PrimaryButton onClick={exportCsv}>Export CSV</PrimaryButton>
      }
    >
      <p className="mb-3 text-sm text-[var(--cc-steel)]">
        Session events: add team, SSO, legal checks, safety toggles, exports,
        opt-outs. Production would retain these for district review.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setFilter(a)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
              filter === a
                ? "bg-[var(--cc-navy)] text-white"
                : "border border-[var(--cc-line)] text-[var(--cc-navy)]"
            }`}
          >
            {a}
          </button>
        ))}
        <Badge>{rows.length} events</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pr-3">Who</th>
              <th className="py-2 pr-3">Action</th>
              <th className="py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-[var(--cc-line)]/70">
                <td className="py-2 pr-3 whitespace-nowrap text-[var(--cc-steel)]">
                  {new Date(e.at).toLocaleString()}
                </td>
                <td className="py-2 pr-3 font-medium">{e.actor}</td>
                <td className="py-2 pr-3 font-mono text-xs">{e.action}</td>
                <td className="py-2">{e.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function DataScreen() {
  const {
    activeProgram,
    activeConfig,
    programs,
    logAudit,
    removeProgram,
    deletionCert,
    safetyToggles,
  } = usePlatform();

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Demo portability package — not production student PII dump",
      activeProgram,
      config: activeConfig,
      programs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProgram.name.replace(/\s+/g, "-").toLowerCase()}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit("export", `Exported ${activeProgram.name} package (JSON)`);
  }

  return (
    <div className="space-y-4">
      <Panel title="Export (data portability)">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Download a demo JSON package for the active program — the DPA story
          that districts can leave with their data.
        </p>
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-[var(--cc-field)] px-2 py-1 font-semibold">
            Active: {activeProgram.name}
          </span>
          <span className="rounded-md bg-[var(--cc-field)] px-2 py-1 font-semibold">
            Audit exports:{" "}
            {safetyToggles.logExportsAndDeletes ? "on" : "off"}
          </span>
        </div>
        <PrimaryButton onClick={exportJson}>Export active program</PrimaryButton>
      </Panel>

      <Panel title="Delete / offboard">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Demo hard-delete of a program from this session. Production would
          purge DB + files and write a certificate for counsel.
        </p>
        <ul className="space-y-2">
          {programs.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <span className="font-medium">
                {p.name} · {p.sport} · {p.seasonLabel}
              </span>
              <button
                type="button"
                disabled={programs.length <= 1}
                onClick={() => {
                  if (
                    confirm(
                      `Permanently remove ${p.name} from this demo session?`,
                    )
                  ) {
                    removeProgram(p.id);
                  }
                }}
                className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 disabled:opacity-40"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {deletionCert ? (
        <Panel title="Offboard certificate (demo)">
          <pre className="overflow-x-auto rounded-xl bg-[var(--cc-navy)] p-4 text-xs leading-relaxed text-white/90 whitespace-pre-wrap">
            {deletionCert}
          </pre>
          <p className="mt-2 text-xs text-[var(--cc-steel)]">
            Generated when you delete a program in this session.
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
