"use client";

import { useApp } from "@/components/app/AppProvider";
import { Panel } from "@/components/ui";

export default function PhilosophyPage() {
  const { snap, activeProgram, activeUnitId, setPhilosophy, templateForActive } =
    useApp();
  const key = `${activeProgram.id}:${activeUnitId}`;
  const unit =
    templateForActive.units.find((u) => u.id === activeUnitId)?.label ??
    activeUnitId;
  const text = snap.team.philosophy[key] ?? "";

  return (
    <Panel title={`${unit} philosophy`}>
      <textarea
        value={text}
        onChange={(e) => setPhilosophy(e.target.value)}
        rows={8}
        className="w-full rounded-xl border border-[var(--cc-line)] px-4 py-3 text-base leading-relaxed text-[var(--cc-navy)]"
        placeholder="What this unit stands for…"
      />
      <p className="mt-2 text-xs text-[var(--cc-steel)]">Autosaves as you type.</p>
    </Panel>
  );
}
