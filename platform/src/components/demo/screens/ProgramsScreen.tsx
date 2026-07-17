"use client";

import { useState } from "react";
import {
  MODULE_LABELS,
  SPORT_OPTIONS,
  configForSport,
  type SportId,
} from "@/lib/programConfig";
import { contentForSport } from "@/lib/demoContent";
import { usePlatform } from "../PlatformState";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

function ModuleChips({
  modules,
  emphasize,
}: {
  modules: string[];
  emphasize?: boolean;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {modules.map((m) => (
        <span
          key={m}
          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
            emphasize
              ? "bg-[var(--cc-navy)] text-white"
              : "bg-[var(--cc-field)] text-[var(--cc-navy)] ring-1 ring-[var(--cc-line)]"
          }`}
        >
          {MODULE_LABELS[m as keyof typeof MODULE_LABELS] ?? m}
        </span>
      ))}
    </div>
  );
}

export function ProgramsScreen() {
  const {
    programs,
    activeProgramId,
    activeConfig,
    setActiveProgram,
    addProgram,
    removeProgram,
    sportOptions,
    setPage,
  } = usePlatform();
  const [name, setName] = useState("");
  const [sport, setSport] = useState<SportId>("basketball");
  const [season, setSeason] = useState("2026");
  const previewTemplate = configForSport(sport);
  const isFootballTemplate = activeConfig.sport === "football";

  return (
    <div className="space-y-4">
      <Panel title="Add every sport the campus runs">
        <p className="text-sm text-[var(--cc-steel)]">
          Football keeps full modules (Offense / Defense / Special Teams). Other
          sports use a single <strong>Team</strong> unit with core modules —
          safe to demo for volleyball, basketball, and more.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SPORT_OPTIONS.map((s) => {
            const cfg = configForSport(s.id);
            const seeded = programs.some((p) => p.sport === s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSport(s.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  sport === s.id
                    ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5 ring-2 ring-[var(--cc-blue)]/20"
                    : "border-[var(--cc-line)] hover:border-[var(--cc-blue)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[var(--cc-navy)]">{s.label}</p>
                  {seeded ? <Badge tone="good">On campus</Badge> : null}
                </div>
                <p className="mt-1 text-xs text-[var(--cc-steel)]">
                  {cfg.units.map((u) => u.label).join(" · ")}
                </p>
                <p className="mt-1 text-[11px] text-[var(--cc-steel)]">
                  {cfg.enabledModules.length} modules
                </p>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Campus teams">
        <ul className="space-y-2">
          {programs.map((p) => {
            const active = p.id === activeProgramId;
            const cfg = configForSport(p.sport);
            const content = contentForSport(p.sport);
            return (
              <li
                key={p.id}
                className={`rounded-xl border px-3 py-3 ${
                  active
                    ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                    : "border-[var(--cc-line)] bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--cc-navy)]">
                      {p.name}{" "}
                      <span className="text-sm font-medium text-[var(--cc-steel)]">
                        · {p.sport} · {p.seasonLabel}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--cc-steel)]">
                      Units: {cfg.units.map((u) => u.label).join(", ")}
                      {cfg.sport === "football"
                        ? " · full football modules"
                        : " · core modules only"}{" "}
                      · {content.roster.length} athletes in demo data · record{" "}
                      {content.recordLabel}
                    </p>
                    <ModuleChips
                      modules={cfg.enabledModules}
                      emphasize={cfg.sport === "football"}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!active ? (
                      <button
                        type="button"
                        onClick={() => setActiveProgram(p.id)}
                        className="rounded-md border border-[var(--cc-line)] px-2.5 py-1 text-xs font-semibold"
                      >
                        Make active
                      </button>
                    ) : (
                      <span className="rounded-md bg-[var(--cc-blue)] px-2.5 py-1 text-xs font-semibold text-white">
                        Active
                      </span>
                    )}
                    {active ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPage("fan")}
                          className="rounded-md border border-[var(--cc-line)] px-2.5 py-1 text-xs font-semibold"
                        >
                          Fan site
                        </button>
                        <button
                          type="button"
                          onClick={() => setPage("parent")}
                          className="rounded-md border border-[var(--cc-line)] px-2.5 py-1 text-xs font-semibold"
                        >
                          Parent
                        </button>
                      </>
                    ) : null}
                    {programs.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Offboard ${p.name}? (Demo delete — session only)`,
                            )
                          ) {
                            removeProgram(p.id);
                          }
                        }}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Add team">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            addProgram({
              name:
                name ||
                sportOptions.find((s) => s.id === sport)?.label ||
                sport,
              sport,
              seasonLabel: season,
            });
            setName("");
          }}
        >
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basketball"
              className="mt-1 block w-44 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              Sport template
            </span>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value as SportId)}
              className="mt-1 block rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              {sportOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Season</span>
            <input
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="mt-1 block w-24 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <PrimaryButton type="submit">Add team</PrimaryButton>
        </form>
        <div className="mt-4 rounded-xl border border-dashed border-[var(--cc-line)] bg-[var(--cc-field)]/60 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
            Template preview · {previewTemplate.label}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-navy)]">
            Units:{" "}
            <strong>
              {previewTemplate.units.map((u) => u.label).join(", ")}
            </strong>
            {previewTemplate.sport === "football"
              ? " (Offense / Defense / Special Teams)"
              : " (single Team unit — not O/D/ST)"}
          </p>
          <ModuleChips modules={previewTemplate.enabledModules} />
        </div>
      </Panel>

      <Panel title="Active template preview">
        <div
          className={`rounded-xl border p-4 ${
            isFootballTemplate
              ? "border-[var(--cc-navy)] bg-[var(--cc-navy)]/5"
              : "border-[var(--cc-line)] bg-[var(--cc-field)]"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
            {isFootballTemplate
              ? "Football · full program"
              : "Core sport · Team unit"}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            How Team menus would look for the active sport. Football Team OS at
            :3000 stays separate and unchanged.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeConfig.units.map((u) => (
              <div
                key={u.id}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  isFootballTemplate
                    ? "bg-[var(--cc-navy)] text-white"
                    : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                }`}
              >
                {u.label}
              </div>
            ))}
          </div>
          <ModuleChips
            modules={activeConfig.enabledModules}
            emphasize={isFootballTemplate}
          />
          <p className="mt-2 text-xs text-[var(--cc-steel)]">
            Print formats: {activeConfig.printFormats.join(", ")}
          </p>
        </div>
      </Panel>
    </div>
  );
}
