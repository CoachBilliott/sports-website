"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function DepthPage() {
  const {
    snap,
    activeProgram,
    activeUnitId,
    activeAthletes,
    updateDepthSlot,
    swapDepthAthletes,
  } = useApp();
  const [level, setLevel] = useState(activeProgram.levels[0] ?? "Varsity");
  const [swapFrom, setSwapFrom] = useState<string | null>(null);

  const slots = useMemo(
    () =>
      snap.team.depthSlots
        .filter(
          (s) =>
            s.programId === activeProgram.id &&
            s.unitId === activeUnitId &&
            s.level === level,
        )
        .sort((a, b) => a.position.localeCompare(b.position) || a.depth - b.depth),
    [snap.team.depthSlots, activeProgram.id, activeUnitId, level],
  );

  const byPos = useMemo(() => {
    const map = new Map<string, typeof slots>();
    for (const s of slots) {
      const list = map.get(s.position) ?? [];
      list.push(s);
      map.set(s.position, list);
    }
    return [...map.entries()];
  }, [slots]);

  const athleteName = (id: string | null) =>
    id ? activeAthletes.find((a) => a.id === id)?.name ?? "—" : "Open";

  return (
    <div className="space-y-4">
      <Panel
        title="Depth chart"
        action={
          <div className="flex flex-wrap gap-2">
            {activeProgram.levels.map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => setLevel(lv)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  level === lv
                    ? "bg-[var(--cc-navy)] text-white"
                    : "border border-[var(--cc-line)]"
                }`}
              >
                {lv}
              </button>
            ))}
          </div>
        }
      >
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Click a player, then click another to swap. Assign open slots from the
          roster dropdown.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {byPos.map(([pos, list]) => (
            <div
              key={pos}
              className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/40 p-3"
            >
              <p className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--cc-navy)]">
                {pos}
              </p>
              <ul className="space-y-2">
                {list.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <Badge tone={s.depth === 1 ? "brand" : "neutral"}>
                      {s.depth}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => {
                        if (!swapFrom) setSwapFrom(s.id);
                        else if (swapFrom === s.id) setSwapFrom(null);
                        else {
                          swapDepthAthletes(swapFrom, s.id);
                          setSwapFrom(null);
                        }
                      }}
                      className={`min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-left text-sm font-semibold ${
                        swapFrom === s.id
                          ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/10"
                          : "border-[var(--cc-line)] bg-white"
                      }`}
                    >
                      {athleteName(s.athleteId)}
                    </button>
                    <select
                      value={s.athleteId ?? ""}
                      onChange={(e) =>
                        updateDepthSlot(s.id, {
                          athleteId: e.target.value || null,
                        })
                      }
                      className="max-w-[7rem] rounded-md border border-[var(--cc-line)] px-1 py-1 text-xs"
                    >
                      <option value="">Open</option>
                      {activeAthletes
                        .filter((a) => a.level === level || level === "Varsity")
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            #{a.jersey} {a.name}
                          </option>
                        ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!byPos.length ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No depth slots for this unit yet.
            </p>
          ) : null}
        </div>
        {swapFrom ? (
          <p className="mt-3 text-sm font-semibold text-[var(--cc-blue)]">
            Swap mode on — click another slot (or the same to cancel).
          </p>
        ) : null}
        <div className="mt-4">
          <PrimaryButton
            type="button"
            onClick={() => window.print()}
          >
            Print board
          </PrimaryButton>
        </div>
      </Panel>
    </div>
  );
}
