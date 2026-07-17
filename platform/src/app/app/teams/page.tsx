"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";
import {
  MODULE_LABELS,
  SPORT_OPTIONS,
  configForSport,
  type SportId,
} from "@/lib/programConfig";

export default function TeamsPage() {
  const {
    snap,
    activeProgram,
    setActiveProgram,
    createProgram,
    deleteProgram,
  } = useApp();
  const [name, setName] = useState("");
  const [sport, setSport] = useState<SportId>("basketball");
  const [season, setSeason] = useState("2026");
  const preview = configForSport(sport);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Teams"
        description="Create and manage sport programs on this campus."
      />

      <Panel title="Programs">
        <ul className="space-y-2">
          {snap.programs.map((p) => {
            const cfg = configForSport(p.sport);
            const active = p.id === activeProgram.id;
            return (
              <li
                key={p.id}
                className={`rounded-xl border px-4 py-3 ${
                  active
                    ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                    : "border-[var(--cc-line)]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--cc-navy)]">
                      {p.name}{" "}
                      <span className="text-sm font-medium text-[var(--cc-steel)]">
                        · {p.sport} · {p.seasonLabel}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--cc-steel)]">
                      Units: {cfg.units.map((u) => u.label).join(", ")} ·{" "}
                      {p.athleteCount} athletes · levels{" "}
                      {p.levels.join(", ")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {cfg.enabledModules.map((m) => (
                        <span
                          key={m}
                          className="rounded-md bg-[var(--cc-field)] px-2 py-0.5 text-[11px] font-semibold ring-1 ring-[var(--cc-line)]"
                        >
                          {MODULE_LABELS[m]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {active ? (
                      <Badge tone="brand">Active</Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveProgram(p.id)}
                        className="rounded-md border border-[var(--cc-line)] px-2.5 py-1 text-xs font-semibold"
                      >
                        Make active
                      </button>
                    )}
                    <Link
                      href={`/app/teams/${p.id}`}
                      className="rounded-md border border-[var(--cc-line)] px-2.5 py-1 text-xs font-semibold"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/fan/${p.slug}`}
                      className="rounded-md border border-[var(--cc-line)] px-2.5 py-1 text-xs font-semibold"
                    >
                      Fan
                    </Link>
                    {snap.programs.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete ${p.name}?`)) deleteProgram(p.id);
                        }}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Add program">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createProgram({
              name:
                name ||
                SPORT_OPTIONS.find((s) => s.id === sport)?.label ||
                sport,
              sport,
              seasonLabel: season,
              campusId: snap.session?.campusId ?? snap.campuses[0]!.id,
              levels:
                sport === "football"
                  ? ["Varsity", "JV", "Freshman"]
                  : ["Varsity", "JV"],
            });
            setName("");
          }}
        >
          <label className="text-sm">
            <span className="font-semibold">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-44 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              placeholder="e.g. Basketball"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold">Sport</span>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as SportId)}
              className="mt-1 block rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              {SPORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold">Season</span>
            <input
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-1 block w-24 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <PrimaryButton type="submit">Create program</PrimaryButton>
        </form>
        <p className="mt-3 text-sm text-[var(--cc-steel)]">
          Template: <strong>{preview.label}</strong> · units{" "}
          {preview.units.map((u) => u.label).join(", ")} ·{" "}
          {preview.enabledModules.length} modules
        </p>
      </Panel>
    </div>
  );
}
