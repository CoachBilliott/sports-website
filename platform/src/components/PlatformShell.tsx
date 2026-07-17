"use client";

import { useMemo, useState } from "react";
import {
  CYFAIR_PILOT_KEYS,
  DEMO_ANNOUNCEMENTS,
  DEMO_FAN_NEWS,
  DEMO_ROSTER,
  DEMO_SCHEDULE,
  LEGAL_CHECKLIST_ITEMS,
  MODULE_LABELS,
  configForSport,
  type SportId,
} from "@/lib/programConfig";
import {
  usePlatform,
  type PlatformPage,
  PlatformProvider,
} from "./PlatformState";

const NAV: { id: PlatformPage; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "district", label: "District" },
  { id: "programs", label: "Teams" },
  { id: "legal", label: "Legal" },
  { id: "audit", label: "Audit" },
  { id: "data", label: "Export / Delete" },
  { id: "fan", label: "Fan page" },
  { id: "parent", label: "Parent" },
];

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="platform-panel rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cc-navy)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--cc-steel)]">
        <span>{pct}% complete</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--cc-line)]">
        <div
          className="h-full rounded-full bg-[var(--cc-blue)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function OverviewScreen() {
  const {
    district,
    campus,
    programs,
    activeProgram,
    activeConfig,
    setPage,
    legalChecklist,
  } = usePlatform();
  const doneLegal = LEGAL_CHECKLIST_ITEMS.filter(
    (i) => legalChecklist[i.key],
  ).length;
  const pilotDone = CYFAIR_PILOT_KEYS.filter((k) => legalChecklist[k]).length;

  return (
    <div className="space-y-4">
      <Panel title="Team OS Platform">
        <p className="text-sm text-[var(--cc-steel)]">
          District sales readiness, multi-sport teams, and Fan / Parent
          surfaces — kept separate from Cy Creek Football Team OS.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
              District
            </p>
            <p className="mt-1 font-semibold text-[var(--cc-navy)]">
              {district.name}
            </p>
            <p className="text-sm text-[var(--cc-steel)]">{campus.name}</p>
          </div>
          <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
              Programs
            </p>
            <p className="mt-1 font-semibold text-[var(--cc-navy)]">
              {programs.length} team{programs.length === 1 ? "" : "s"}
            </p>
            <p className="text-sm text-[var(--cc-steel)]">
              Active: {activeProgram.name} ({activeConfig.label})
            </p>
          </div>
          <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
              Legal checklist
            </p>
            <p className="mt-1 font-semibold text-[var(--cc-navy)]">
              {doneLegal} / {LEGAL_CHECKLIST_ITEMS.length}
            </p>
            <ProgressBar
              value={doneLegal}
              max={LEGAL_CHECKLIST_ITEMS.length}
            />
            <button
              type="button"
              onClick={() => setPage("legal")}
              className="mt-2 text-sm font-semibold text-[var(--cc-blue)] hover:underline"
            >
              Open Legal →
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="District → Campus → Program">
        <p className="mb-4 text-sm text-[var(--cc-steel)]">
          How tenancy nests for a Cy-Fair pilot. Click a node to jump into that
          screen.
        </p>
        <div className="org-diagram flex flex-col items-stretch gap-0 md:flex-row md:items-center md:justify-center md:gap-0">
          <button
            type="button"
            onClick={() => setPage("district")}
            className="org-node rounded-xl border-2 border-[var(--cc-navy)] bg-[var(--cc-navy)] px-5 py-4 text-left text-white transition hover:brightness-110"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              District
            </p>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">
              {district.name}
            </p>
          </button>
          <div
            className="org-connector mx-auto h-6 w-0.5 bg-[var(--cc-blue)] md:mx-0 md:h-0.5 md:w-10"
            aria-hidden
          />
          <button
            type="button"
            onClick={() => setPage("district")}
            className="org-node rounded-xl border-2 border-[var(--cc-blue)] bg-white px-5 py-4 text-left transition hover:bg-[var(--cc-field)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--cc-steel)]">
              Campus
            </p>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--cc-navy)]">
              {campus.name}
            </p>
          </button>
          <div
            className="org-connector mx-auto h-6 w-0.5 bg-[var(--cc-blue)] md:mx-0 md:h-0.5 md:w-10"
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {programs.map((p) => {
              const active = p.id === activeProgram.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPage("programs")}
                  className={`org-node rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/10 ring-2 ring-[var(--cc-blue)]/30"
                      : "border-[var(--cc-line)] bg-[var(--cc-field)] hover:border-[var(--cc-blue)]"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--cc-steel)]">
                    Program{active ? " · active" : ""}
                  </p>
                  <p className="font-semibold text-[var(--cc-navy)]">
                    {p.name}{" "}
                    <span className="font-medium text-[var(--cc-steel)]">
                      · {p.seasonLabel}
                    </span>
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Cy-Fair pilot readiness">
          <p className="text-sm text-[var(--cc-steel)]">
            Core items counsel and ADs usually ask about before a pilot.
          </p>
          <ProgressBar value={pilotDone} max={CYFAIR_PILOT_KEYS.length} />
          <ul className="mt-3 space-y-1.5 text-sm">
            {CYFAIR_PILOT_KEYS.map((key) => {
              const item = LEGAL_CHECKLIST_ITEMS.find((i) => i.key === key)!;
              const done = legalChecklist[key];
              return (
                <li key={key} className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      done
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {done ? "✓" : "!"}
                  </span>
                  <span
                    className={
                      done
                        ? "text-[var(--cc-steel)] line-through"
                        : "font-medium text-[var(--cc-navy)]"
                    }
                  >
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setPage("legal")}
            className="mt-3 text-sm font-semibold text-[var(--cc-blue)] hover:underline"
          >
            Update checklist →
          </button>
        </Panel>

        <Panel title="Quick links">
          <div className="flex flex-col gap-2">
            {(
              [
                ["programs", "Add a sport / team"],
                ["fan", "Preview fan page"],
                ["parent", "Preview parent portal"],
                ["data", "Export / delete demo"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPage(id)}
                className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2.5 text-left text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                {label} →
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DistrictScreen() {
  const {
    district,
    campus,
    programs,
    ssoDemoConnected,
    setSsoDemoConnected,
    setPage,
  } = usePlatform();

  return (
    <div className="space-y-4">
      <Panel title="Tenancy">
        <ol className="space-y-3 text-sm">
          <li className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
            <span className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              District
            </span>
            <p className="font-semibold text-[var(--cc-navy)]">{district.name}</p>
          </li>
          <li className="ml-4 rounded-xl border border-[var(--cc-line)] bg-white p-4">
            <span className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              Campus
            </span>
            <p className="font-semibold text-[var(--cc-navy)]">{campus.name}</p>
          </li>
          <li className="ml-8 space-y-2">
            <span className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              Programs
            </span>
            <ul className="mt-1 space-y-1">
              {programs.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)] px-3 py-2 font-medium text-[var(--cc-navy)]"
                >
                  {p.name} · {p.sport} · {p.seasonLabel}
                </li>
              ))}
            </ul>
          </li>
        </ol>
      </Panel>
      <Panel
        title="SSO status (demo)"
        action={
          <button
            type="button"
            onClick={() => setSsoDemoConnected(!ssoDemoConnected)}
            className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
          >
            {ssoDemoConnected ? "Disconnect demo" : "Mark connected"}
          </button>
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Production will use Microsoft / Google OIDC. This toggle is for AD
          demos only — not real authentication.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--cc-navy)]">
          Status:{" "}
          <span
            className={
              ssoDemoConnected ? "text-emerald-700" : "text-amber-700"
            }
          >
            {ssoDemoConnected ? "Connected (demo)" : "Not connected"}
          </span>
        </p>
        <button
          type="button"
          onClick={() => setPage("legal")}
          className="mt-3 text-sm font-semibold text-[var(--cc-blue)] hover:underline"
        >
          Legal readiness checklist →
        </button>
      </Panel>
    </div>
  );
}

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

function ProgramsScreen() {
  const {
    programs,
    activeProgramId,
    activeConfig,
    setActiveProgram,
    addProgram,
    removeProgram,
    sportOptions,
  } = usePlatform();
  const [name, setName] = useState("");
  const [sport, setSport] = useState<SportId>("volleyball");
  const [season, setSeason] = useState("2026");
  const previewTemplate = configForSport(sport);
  const isFootballTemplate = activeConfig.sport === "football";

  return (
    <div className="space-y-4">
      <Panel title="Campus teams / programs">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Add sports with a template. Football keeps full modules (Offense /
          Defense / Special Teams, depth, scout…). Other sports use a single{" "}
          <strong>Team</strong> unit with core modules.
        </p>
        <ul className="space-y-2">
          {programs.map((p) => {
            const active = p.id === activeProgramId;
            const cfg = configForSport(p.sport);
            return (
              <li
                key={p.id}
                className={`rounded-xl border px-3 py-2.5 ${
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
                        : " · core modules only"}
                    </p>
                    <ModuleChips
                      modules={cfg.enabledModules}
                      emphasize={cfg.sport === "football"}
                    />
                  </div>
                  <div className="flex gap-2">
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
              placeholder="e.g. Volleyball"
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
          <button
            type="submit"
            className="rounded-lg bg-[var(--cc-navy)] px-4 py-2 text-sm font-semibold text-white"
          >
            Add team
          </button>
        </form>
        <div className="mt-4 rounded-xl border border-dashed border-[var(--cc-line)] bg-[var(--cc-field)]/60 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
            Template preview · {previewTemplate.label}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-navy)]">
            Units:{" "}
            <strong>{previewTemplate.units.map((u) => u.label).join(", ")}</strong>
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
            {isFootballTemplate ? "Football · full program" : "Core sport · Team unit"}
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

function LegalScreen() {
  const { legalChecklist, setLegalItem } = usePlatform();
  const groups = ["legal", "security", "procurement"] as const;
  const done = LEGAL_CHECKLIST_ITEMS.filter((i) => legalChecklist[i.key]).length;
  const total = LEGAL_CHECKLIST_ITEMS.length;
  const pct = Math.round((done / total) * 100);
  const pilotLeft = CYFAIR_PILOT_KEYS.filter((k) => !legalChecklist[k]);

  return (
    <div className="space-y-4">
      <Panel title="District sales readiness">
        <p className="text-sm text-[var(--cc-steel)]">
          Checklist for selling to school districts (FERPA / PPRA / HIPAA scope,
          security, procurement). Not legal advice — track progress for demos
          and real counsel work.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
            <p className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              Overall progress
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
              {pct}%
            </p>
            <ProgressBar value={done} max={total} />
          </div>
          <div className="rounded-xl border border-[var(--cc-blue)]/40 bg-white p-4 ring-1 ring-[var(--cc-blue)]/20">
            <p className="text-xs font-bold uppercase text-[var(--cc-blue)]">
              What&apos;s left for Cy-Fair pilot
            </p>
            {pilotLeft.length === 0 ? (
              <p className="mt-2 text-sm font-semibold text-emerald-700">
                Pilot checklist complete — ready to walk ADs through Fan /
                Parent / Export.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {pilotLeft.map((key) => {
                  const item = LEGAL_CHECKLIST_ITEMS.find((i) => i.key === key)!;
                  return (
                    <li key={key} className="flex items-start gap-2">
                      <span className="mt-0.5 text-amber-600">•</span>
                      <span className="font-medium text-[var(--cc-navy)]">
                        {item.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Panel>
      {groups.map((group) => {
        const items = LEGAL_CHECKLIST_ITEMS.filter((i) => i.group === group);
        const groupDone = items.filter((i) => legalChecklist[i.key]).length;
        return (
          <Panel
            key={group}
            title={
              group === "legal"
                ? "Legal & privacy"
                : group === "security"
                  ? "Security"
                  : "Procurement"
            }
            action={
              <span className="text-xs font-semibold text-[var(--cc-steel)]">
                {groupDone}/{items.length}
              </span>
            }
          >
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 rounded-lg border border-[var(--cc-line)] px-3 py-2"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={legalChecklist[item.key]}
                    onChange={(e) => setLegalItem(item.key, e.target.checked)}
                  />
                  <div>
                    <p className="font-semibold text-[var(--cc-navy)]">
                      {item.label}
                    </p>
                    <p className="text-sm text-[var(--cc-steel)]">{item.blurb}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        );
      })}
    </div>
  );
}

function AuditScreen() {
  const { auditEvents } = usePlatform();
  return (
    <Panel title="Audit log">
      <p className="mb-3 text-sm text-[var(--cc-steel)]">
        Session-only demo events (add team, SSO toggle, legal checks, exports).
      </p>
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
            {auditEvents.map((e) => (
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

function DataScreen() {
  const { activeProgram, activeConfig, programs, logAudit, removeProgram } =
    usePlatform();

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
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
      <Panel title="Export">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Download a demo JSON package for the active program (portability
          story for DPAs).
        </p>
        <button
          type="button"
          onClick={exportJson}
          className="rounded-lg bg-[var(--cc-blue)] px-4 py-2 text-sm font-semibold text-white"
        >
          Export active program
        </button>
      </Panel>
      <Panel title="Delete / offboard">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Demo hard-delete of a program from this session. Production would
          purge DB + files and write a certificate.
        </p>
        <ul className="space-y-2">
          {programs.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <span className="font-medium">
                {p.name} · {p.sport}
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
    </div>
  );
}

function FanScreen() {
  const { activeProgram, campus, district } = usePlatform();
  const nextGame =
    DEMO_SCHEDULE.find((g) => !g.result) ?? DEMO_SCHEDULE[DEMO_SCHEDULE.length - 1]!;
  const recentResult = DEMO_SCHEDULE.filter((g) => g.result).at(-1);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--cc-line)] bg-white shadow-sm">
      <div className="fan-hero relative overflow-hidden px-6 py-12 text-white sm:px-10 sm:py-14">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0a2540 0%, #0b3d91 50%, #1a5bb5 100%)",
          }}
        />
        <div
          className="fan-hero-grid absolute inset-0 opacity-30"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/75">
            {campus.name} · {district.name}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-5xl">
            {activeProgram.name}
          </h1>
          <p className="mt-2 max-w-xl text-lg text-white/90">
            {activeProgram.seasonLabel} season · public schedule, results, and
            directory roster
          </p>
          <div className="fan-next-game mt-8 max-w-md rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
              Next game
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
              {nextGame.homeAway} vs {nextGame.opponent}
            </p>
            <p className="mt-1 text-sm text-white/85">
              {nextGame.date} · {nextGame.time} · Week {nextGame.week}
            </p>
            {recentResult ? (
              <p className="mt-3 text-xs font-semibold text-emerald-200">
                Last result: W{recentResult.week} {recentResult.result} vs{" "}
                {recentResult.opponent}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--cc-line)] bg-[var(--cc-field)]/80 px-6 py-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
          News
        </p>
        <div className="fan-news-strip flex gap-3 overflow-x-auto pb-1">
          {DEMO_FAN_NEWS.map((n) => (
            <article
              key={n.id}
              className="min-w-[220px] max-w-[280px] shrink-0 rounded-xl border border-[var(--cc-line)] bg-white p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--cc-blue)]">
                {n.tag}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--cc-navy)]">
                {n.title}
              </p>
              <p className="mt-1 text-xs text-[var(--cc-steel)]">{n.blurb}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Schedule
          </h2>
          <ul className="mt-3 space-y-2">
            {DEMO_SCHEDULE.map((g) => {
              const isNext = g.week === nextGame.week && !g.result;
              return (
                <li
                  key={g.week}
                  className={`flex justify-between rounded-lg border px-3 py-2 text-sm ${
                    isNext
                      ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                      : "border-[var(--cc-line)]"
                  }`}
                >
                  <span>
                    W{g.week} · {g.date} · {g.homeAway} vs {g.opponent}
                  </span>
                  <span className="font-semibold text-[var(--cc-navy)]">
                    {g.result ?? (isNext ? "Next" : "TBD")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Roster
          </h2>
          <p className="mt-1 text-xs text-[var(--cc-steel)]">
            Directory fields only — no grades, contacts, or scout
          </p>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-1">#</th>
                <th className="py-1">Name</th>
                <th className="py-1">Pos</th>
                <th className="py-1">Class</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ROSTER.map((a) => (
                <tr
                  key={a.jersey}
                  className="border-b border-[var(--cc-line)]/60"
                >
                  <td className="py-1.5 font-semibold">{a.jersey}</td>
                  <td className="py-1.5">{a.name}</td>
                  <td className="py-1.5">{a.pos}</td>
                  <td className="py-1.5">{a.classYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ParentScreen() {
  const { activeProgram, campus } = usePlatform();
  const [childJersey, setChildJersey] = useState(DEMO_ROSTER[0]!.jersey);
  const child =
    DEMO_ROSTER.find((a) => a.jersey === childJersey) ?? DEMO_ROSTER[0]!;
  const nextGame = DEMO_SCHEDULE.find((g) => !g.result) ?? DEMO_SCHEDULE[0]!;

  return (
    <div className="space-y-4">
      <Panel
        title="Parent portal"
        action={
          <label className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[var(--cc-steel)]">Child</span>
            <select
              value={childJersey}
              onChange={(e) => setChildJersey(e.target.value)}
              className="rounded-lg border border-[var(--cc-line)] px-2.5 py-1.5 font-semibold text-[var(--cc-navy)]"
            >
              {DEMO_ROSTER.map((a) => (
                <option key={a.jersey} value={a.jersey}>
                  #{a.jersey} {a.name}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          {campus.name} · {activeProgram.name}. Guardians see schedule and
          their linked athlete — not full staff tools.
        </p>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Your athlete">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
            #{child.jersey} {child.name}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            {child.pos} · {child.classYear} · {activeProgram.name}
          </p>
          <p className="mt-3 inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            Academically eligible
          </p>
        </Panel>
        <Panel title="This week">
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cc-navy)]">
            {nextGame.homeAway} vs {nextGame.opponent}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            {nextGame.date} · {nextGame.time} · Week {nextGame.week}
          </p>
          <p className="mt-3 text-xs text-[var(--cc-steel)]">
            Arrival details and bus times appear in announcements below.
          </p>
        </Panel>
      </div>
      <Panel title="Announcements">
        <ul className="space-y-3">
          {DEMO_ANNOUNCEMENTS.map((a) => (
            <li
              key={a.id}
              className="flex gap-3 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/50 px-3 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--cc-navy)] text-white">
                <span className="text-[10px] font-bold uppercase leading-none">
                  {a.date}
                </span>
              </div>
              <div>
                <p className="font-semibold text-[var(--cc-navy)]">{a.title}</p>
                <p className="mt-0.5 text-sm text-[var(--cc-steel)]">{a.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Eligibility">
        <p className="text-sm text-[var(--cc-steel)]">
          Summary only for guardians. Detailed gradebooks stay permission-gated
          in the staff app.
        </p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--cc-line)] px-3 py-2">
            <dt className="text-xs uppercase text-[var(--cc-steel)]">Status</dt>
            <dd className="font-semibold text-emerald-700">Eligible</dd>
          </div>
          <div className="rounded-lg border border-[var(--cc-line)] px-3 py-2">
            <dt className="text-xs uppercase text-[var(--cc-steel)]">Athlete</dt>
            <dd className="font-semibold text-[var(--cc-navy)]">{child.name}</dd>
          </div>
          <div className="rounded-lg border border-[var(--cc-line)] px-3 py-2">
            <dt className="text-xs uppercase text-[var(--cc-steel)]">Program</dt>
            <dd className="font-semibold text-[var(--cc-navy)]">
              {activeProgram.name}
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}

function Screen() {
  const { page } = usePlatform();
  switch (page) {
    case "district":
      return <DistrictScreen />;
    case "programs":
      return <ProgramsScreen />;
    case "legal":
      return <LegalScreen />;
    case "audit":
      return <AuditScreen />;
    case "data":
      return <DataScreen />;
    case "fan":
      return <FanScreen />;
    case "parent":
      return <ParentScreen />;
    default:
      return <OverviewScreen />;
  }
}

function PlatformShellInner() {
  const { page, setPage, activeProgram, district } = usePlatform();

  const title = useMemo(
    () => NAV.find((n) => n.id === page)?.label ?? "Platform",
    [page],
  );

  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--cc-navy)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-wide">
              Team OS Platform
            </p>
            <p className="text-xs text-white/70">
              {district.name} · Active: {activeProgram.name}
            </p>
          </div>
          <a
            href="http://localhost:3000"
            className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
          >
            Open football Team OS →
          </a>
        </div>
        <nav className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                page === item.id
                  ? "bg-white text-[var(--cc-navy)]"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6">
        <h1 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--cc-navy)]">
          {title}
        </h1>
        <Screen />
      </main>
      <footer className="mx-auto max-w-[90rem] px-4 pb-8 text-center text-xs text-[var(--cc-steel)] sm:px-6">
        Cy-Fair ISD · Cypress Creek · session demo data
      </footer>
    </div>
  );
}

export function PlatformShell() {
  return (
    <PlatformProvider>
      <PlatformShellInner />
    </PlatformProvider>
  );
}
