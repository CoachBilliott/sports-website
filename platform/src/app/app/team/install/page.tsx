"use client";

import { useApp } from "@/components/app/AppProvider";
import { Panel } from "@/components/ui";

export default function InstallPage() {
  const { snap, activeProgram, activeUnitId, activeWeek, setInstall } = useApp();
  const key = `${activeProgram.id}:${activeUnitId}`;
  const text = snap.team.install[key] ?? "";

  return (
    <Panel title={`Week ${activeWeek} install`}>
      <textarea
        value={text}
        onChange={(e) => setInstall(e.target.value)}
        rows={8}
        className="w-full rounded-xl border border-[var(--cc-line)] px-4 py-3 font-mono text-sm leading-relaxed"
        placeholder="Concepts to install this week…"
      />
    </Panel>
  );
}
