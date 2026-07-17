"use client";

import { useMemo, useState } from "react";
import {
  DEMO_ROSTER,
  DEMO_SCHEDULE,
  LEGAL_CHECKLIST_ITEMS,
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
    <section className="rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-sm">
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

  return (
    <div className="space-y-4">
      <Panel title="Team OS Platform">
        <p className="text-sm text-[var(--cc-steel)]">
          Separate from the football Team OS app. Use this shell to demo
          district sales readiness, multi-sport teams, and Fan / Parent
          surfaces — without changing Cy Creek Football UI.
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
            <button
              type="button"
              onClick={() => setPage("legal")}
              className="mt-1 text-sm font-semibold text-[var(--cc-blue)] hover:underline"
            >
              Open Legal →
            </button>
          </div>
        </div>
      </Panel>
      <Panel title="Quick links">
        <div className="flex flex-wrap gap-2">
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
              className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              {label}
            </button>
          ))}
        </div>
      </Panel>
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

  return (
    <div className="space-y-4">
      <Panel title="Campus teams / programs">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Add sports with a template. Football keeps full modules (O/D/ST,
          depth, scout…). Other sports start with core units until you deepen
          them.
        </p>
        <ul className="space-y-2">
          {programs.map((p) => {
            const active = p.id === activeProgramId;
            return (
              <li
                key={p.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                  active
                    ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                    : "border-[var(--cc-line)] bg-white"
                }`}
              >
                <div>
                  <p className="font-semibold text-[var(--cc-navy)]">
                    {p.name}{" "}
                    <span className="text-sm font-medium text-[var(--cc-steel)]">
                      · {p.sport} · {p.seasonLabel}
                    </span>
                  </p>
                  {active ? (
                    <p className="text-xs text-[var(--cc-steel)]">
                      Units: {activeConfig.units.map((u) => u.label).join(", ")}{" "}
                      · Modules: {activeConfig.enabledModules.length}
                    </p>
                  ) : null}
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
              name: name || sportOptions.find((s) => s.id === sport)?.label || sport,
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
            <span className="font-semibold text-[var(--cc-navy)]">Sport template</span>
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
      </Panel>

      <Panel title="Active template preview">
        <p className="text-sm text-[var(--cc-steel)]">
          This is how Team menus would look for the active sport (football Team
          OS stays separate and unchanged).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {activeConfig.units.map((u) => (
            <div
              key={u.id}
              className="rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)] px-3 py-2 text-sm font-semibold"
            >
              {u.label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--cc-steel)]">
          Enabled modules: {activeConfig.enabledModules.join(", ")}
        </p>
      </Panel>
    </div>
  );
}

function LegalScreen() {
  const { legalChecklist, setLegalItem } = usePlatform();
  const groups = ["legal", "security", "procurement"] as const;

  return (
    <div className="space-y-4">
      <Panel title="District sales readiness">
        <p className="text-sm text-[var(--cc-steel)]">
          Checklist for selling to school districts (FERPA / PPRA / HIPAA scope,
          security, procurement). Not legal advice — track progress for demos
          and real counsel work.
        </p>
      </Panel>
      {groups.map((group) => (
        <Panel
          key={group}
          title={
            group === "legal"
              ? "Legal & privacy"
              : group === "security"
                ? "Security"
                : "Procurement"
          }
        >
          <ul className="space-y-3">
            {LEGAL_CHECKLIST_ITEMS.filter((i) => i.group === group).map(
              (item) => (
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
              ),
            )}
          </ul>
        </Panel>
      ))}
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
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--cc-line)] bg-white shadow-sm">
      <div
        className="px-6 py-10 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0a2540 0%, #0b3d91 55%, #1a5bb5 100%)",
        }}
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-white/70">
          {campus.name} · {district.name}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">
          {activeProgram.name} Fan Page
        </h1>
        <p className="mt-2 max-w-xl text-white/85">
          Public schedule, results, and directory roster fields only — not
          grades, contacts, or internal scout.
        </p>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Schedule
          </h2>
          <ul className="mt-3 space-y-2">
            {DEMO_SCHEDULE.map((g) => (
              <li
                key={g.week}
                className="flex justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
              >
                <span>
                  W{g.week} · {g.date} · {g.homeAway} vs {g.opponent}
                </span>
                <span className="font-semibold text-[var(--cc-navy)]">
                  {g.result ?? "TBD"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Roster
          </h2>
          <p className="mt-1 text-xs text-[var(--cc-steel)]">
            Published directory fields only
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
                <tr key={a.jersey} className="border-b border-[var(--cc-line)]/60">
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
  const child = DEMO_ROSTER[0]!;
  const nextGame = DEMO_SCHEDULE.find((g) => !g.result) ?? DEMO_SCHEDULE[0]!;

  return (
    <div className="space-y-4">
      <Panel title="Parent portal">
        <p className="text-sm text-[var(--cc-steel)]">
          {campus.name} · {activeProgram.name}. Parents see schedule and their
          linked athlete — not full staff tools.
        </p>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Your athlete">
          <p className="text-2xl font-bold text-[var(--cc-navy)]">
            #{child.jersey} {child.name}
          </p>
          <p className="text-sm text-[var(--cc-steel)]">
            {child.pos} · {child.classYear} · {activeProgram.name}
          </p>
        </Panel>
        <Panel title="This week">
          <p className="font-semibold text-[var(--cc-navy)]">
            {nextGame.homeAway} vs {nextGame.opponent}
          </p>
          <p className="text-sm text-[var(--cc-steel)]">
            {nextGame.date} · Week {nextGame.week}
          </p>
        </Panel>
      </div>
      <Panel title="Announcements">
        <p className="text-sm text-[var(--cc-steel)]">
          Booster meeting Thursday 6pm · Media day Friday after school.
        </p>
      </Panel>
      <Panel title="Grades summary">
        <p className="text-sm text-[var(--cc-steel)]">
          Academic eligibility: Eligible (demo). Detailed gradebooks stay
          permission-gated in the staff app.
        </p>
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
            ← Football Team OS
          </a>
        </div>
        <nav className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${
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
        Platform demo · separate from football Team OS · session data only
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
