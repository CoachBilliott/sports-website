"use client";

import {
  AD_DEMO_PILLARS,
  CYFAIR_PILOT_KEYS,
  LEGAL_CHECKLIST_ITEMS,
  SAFETY_TOGGLE_ITEMS,
} from "@/lib/programConfig";
import { DEMO_SCRIPT } from "@/lib/demoContent";
import { usePlatform } from "../PlatformState";
import { Badge, GhostButton, Panel, ProgressBar, PrimaryButton, StatTile } from "@/components/ui";
import { asset } from "@/lib/asset";

export function OverviewScreen() {
  const {
    district,
    campus,
    programs,
    activeProgram,
    activeConfig,
    setPage,
    legalChecklist,
    safetyToggles,
    ssoDemoConnected,
    scriptStep,
    setScriptStep,
    advanceScript,
    scriptDone,
    markScriptStep,
    resetDemo,
    setPresentMode,
  } = usePlatform();

  const doneLegal = LEGAL_CHECKLIST_ITEMS.filter(
    (i) => legalChecklist[i.key],
  ).length;
  const pilotDone = CYFAIR_PILOT_KEYS.filter((k) => legalChecklist[k]).length;
  const safetyOn = SAFETY_TOGGLE_ITEMS.filter((i) => safetyToggles[i.key]).length;
  const readiness = Math.round(
    ((doneLegal / LEGAL_CHECKLIST_ITEMS.length) * 0.45 +
      (safetyOn / SAFETY_TOGGLE_ITEMS.length) * 0.35 +
      (ssoDemoConnected ? 0.1 : 0) +
      Math.min(programs.length, 3) / 3 * 0.1) *
      100,
  );

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[var(--cc-navy)] bg-[var(--cc-navy)] text-white shadow-sm">
        <div className="flex flex-wrap items-center gap-5 px-6 py-7 sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/cypress-creek-logo.png")}
            alt="Cypress Creek"
            className="h-16 w-16 rounded-xl bg-white/10 object-contain p-1"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Team OS Platform · District demo
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              {district.name}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {campus.name} · {programs.length} programs · Active:{" "}
              {activeProgram.name}
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              Show readiness
            </p>
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
              {readiness}%
            </p>
          </div>
        </div>
      </section>

      <Panel title="Show the district — 5 pillars">
        <p className="text-sm text-[var(--cc-steel)]">
          Walk an AD through district tenancy, adding sports, Fan site, Parent
          site, and Legal &amp; safety — without changing Cy Creek Football Team
          OS.
        </p>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {AD_DEMO_PILLARS.map((pillar, idx) => (
            <li key={pillar.id}>
              <button
                type="button"
                onClick={() => setPage(pillar.id)}
                className="flex h-full w-full flex-col rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4 text-left transition hover:border-[var(--cc-blue)] hover:bg-white"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--cc-blue)]">
                  Step {idx + 1}
                </span>
                <span className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--cc-navy)]">
                  {pillar.title}
                </span>
                <span className="mt-1 text-xs text-[var(--cc-steel)]">
                  {pillar.pitch}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="District"
          value={district.name}
          hint={campus.name}
        />
        <StatTile
          label="Teams"
          value={`${programs.length} programs`}
          hint={`Active: ${activeProgram.name} (${activeConfig.label})`}
        />
        <StatTile
          label="Legal checklist"
          value={`${doneLegal} / ${LEGAL_CHECKLIST_ITEMS.length}`}
          hint={<ProgressBar value={doneLegal} max={LEGAL_CHECKLIST_ITEMS.length} />}
        />
        <StatTile
          label="Safety controls"
          value={`${safetyOn} / ${SAFETY_TOGGLE_ITEMS.length} on`}
          hint={<ProgressBar value={safetyOn} max={SAFETY_TOGGLE_ITEMS.length} />}
          tone="good"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Live demo script"
          action={
            <PrimaryButton onClick={advanceScript}>
              {scriptStep >= DEMO_SCRIPT.length ? "Restart tour" : "Next beat →"}
            </PrimaryButton>
          }
        >
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Click through in order. Say the line out loud — ~5 minutes.
          </p>
          <ol className="space-y-2">
            {DEMO_SCRIPT.map((step, idx) => {
              const done = scriptDone.has(step.id) || idx < scriptStep;
              const current = idx === scriptStep;
              return (
                <li
                  key={step.id}
                  className={`rounded-xl border px-3 py-2.5 ${
                    current
                      ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                      : "border-[var(--cc-line)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[var(--cc-navy)]">
                      {idx + 1}. {step.title}
                    </p>
                    <div className="flex gap-2">
                      {done ? <Badge tone="good">Done</Badge> : null}
                      {current ? <Badge tone="brand">Now</Badge> : null}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-[var(--cc-steel)]">
                    “{step.say}”
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-[var(--cc-blue)] hover:underline"
                    onClick={() => {
                      markScriptStep(step.id);
                      setPage(step.page);
                      setScriptStep(idx + 1);
                    }}
                  >
                    Jump here →
                  </button>
                </li>
              );
            })}
          </ol>
        </Panel>

        <div className="space-y-4">
          <Panel title="Cy-Fair pilot readiness">
            <p className="text-sm text-[var(--cc-steel)]">
              Core items counsel and ADs ask about before a pilot.
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
            <GhostButton onClick={() => setPage("legal")}>
              Open Legal &amp; safety →
            </GhostButton>
          </Panel>

          <Panel title="Presenter tools">
            <div className="flex flex-wrap gap-2">
              <PrimaryButton
                onClick={() => {
                  setPresentMode(true);
                  setPage("fan");
                }}
              >
                Present Fan site
              </PrimaryButton>
              <button
                type="button"
                onClick={resetDemo}
                className="rounded-lg border border-[var(--cc-line)] px-4 py-2 text-sm font-semibold text-[var(--cc-navy)]"
              >
                Reset demo
              </button>
              <GhostButton onClick={() => setPage("programs")}>
                Add a sport →
              </GhostButton>
            </div>
            <p className="mt-3 text-xs text-[var(--cc-steel)]">
              Present mode hides admin chrome on Fan for a clean public look.
              SSO: {ssoDemoConnected ? "connected (demo)" : "not connected"}.
            </p>
          </Panel>
        </div>
      </div>

      <Panel title="District → Campus → Program">
        <div className="org-diagram flex flex-col items-stretch md:flex-row md:items-center">
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
    </div>
  );
}
