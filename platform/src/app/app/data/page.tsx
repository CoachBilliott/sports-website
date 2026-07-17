"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { RequirePerm } from "@/components/app/RequirePerm";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";

export default function DataPage() {
  const { snap, activeProgram, exportActiveProgram, deleteProgram } = useApp();
  const [cert, setCert] = useState<string | null>(null);

  return (
    <RequirePerm perm="export_delete" label="data export / offboard">
      <div className="space-y-4">
        <PageHeader
          title="Data"
          description="Export and offboard tools for district portability requirements."
        />

        <Panel title="Export program">
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Download JSON for {activeProgram.name} (athletes, games, staff).
          </p>
          <PrimaryButton onClick={exportActiveProgram}>
            Export JSON
          </PrimaryButton>
        </Panel>

        <Panel title="Offboard program">
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Deletes the active program and related local records. Keeps at least
            one program in the demo store.
          </p>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  `Offboard ${activeProgram.name}? This cannot be undone in local demo.`,
                )
              ) {
                deleteProgram(activeProgram.id);
                setCert(
                  `Offboard certificate · ${activeProgram.name} · ${new Date().toISOString()} · actor ${snap.session?.email ?? "unknown"}`,
                );
              }
            }}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
          >
            Offboard active program
          </button>
          {cert ? (
            <p className="mt-3 rounded-lg bg-[var(--cc-field)] px-3 py-2 font-mono text-xs">
              {cert}
            </p>
          ) : null}
        </Panel>
      </div>
    </RequirePerm>
  );
}
