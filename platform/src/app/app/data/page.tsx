"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";

export default function DataPage() {
  const { snap, activeProgram, exportActiveProgram, deleteProgram } = useApp();
  const [cert, setCert] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Data"
        description="Export and offboard tools for district portability requirements."
      />

      <Panel title="Export program">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Downloads JSON for <strong>{activeProgram.name}</strong> (athletes,
          games, members). Replace `exportActiveProgram` with a server export
          later.
        </p>
        <PrimaryButton onClick={exportActiveProgram}>
          Export JSON
        </PrimaryButton>
      </Panel>

      <Panel title="Offboard program">
        <ul className="space-y-2">
          {snap.programs.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <span>
                {p.name} · {p.sport}
              </span>
              <button
                type="button"
                disabled={snap.programs.length <= 1}
                onClick={() => {
                  if (!confirm(`Offboard ${p.name}?`)) return;
                  deleteProgram(p.id);
                  setCert(
                    `OFFBOARD CERTIFICATE\nProgram: ${p.name}\nAt: ${new Date().toISOString()}\nActor: ${snap.session?.email ?? "unknown"}`,
                  );
                }}
                className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 disabled:opacity-40"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {cert ? (
        <Panel title="Offboard certificate">
          <pre className="overflow-x-auto rounded-xl bg-[var(--cc-navy)] p-4 text-xs text-white/90 whitespace-pre-wrap">
            {cert}
          </pre>
        </Panel>
      ) : null}
    </div>
  );
}
