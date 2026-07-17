"use client";

import {
  CYFAIR_PILOT_KEYS,
  DATA_FIELD_MATRIX,
  LEGAL_CHECKLIST_ITEMS,
  SAFETY_TOGGLE_ITEMS,
} from "@/lib/programConfig";
import {
  DEMO_RETENTION,
  DEMO_SUBPROCESSORS,
  contentForSport,
} from "@/lib/demoContent";
import { usePlatform } from "../PlatformState";
import {
  GhostButton,
  Panel,
  ProgressBar,
  YesNo,
} from "../ui";

export function LegalScreen() {
  const {
    activeProgram,
    legalChecklist,
    setLegalItem,
    safetyToggles,
    setSafetyToggle,
    parentOptOuts,
    toggleParentOptOut,
    setPage,
  } = usePlatform();
  const groups = ["legal", "security", "procurement"] as const;
  const done = LEGAL_CHECKLIST_ITEMS.filter((i) => legalChecklist[i.key]).length;
  const total = LEGAL_CHECKLIST_ITEMS.length;
  const pct = Math.round((done / total) * 100);
  const pilotLeft = CYFAIR_PILOT_KEYS.filter((k) => !legalChecklist[k]);
  const safetyOn = SAFETY_TOGGLE_ITEMS.filter((i) => safetyToggles[i.key]).length;
  const roster = contentForSport(activeProgram.sport).roster;

  return (
    <div className="space-y-4">
      <Panel title="Legal & fully safe for the district">
        <p className="text-sm text-[var(--cc-steel)]">
          Show counsel and ADs how student data is minimized, who can see what,
          and that Fan / Parent never expose staff-only records. Not legal
          advice — a working checklist for demos and real counsel review.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
            <p className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              Procurement checklist
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
              {pct}%
            </p>
            <ProgressBar value={done} max={total} />
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="text-xs font-bold uppercase text-emerald-800">
              Safety controls on
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
              {safetyOn}/{SAFETY_TOGGLE_ITEMS.length}
            </p>
            <ProgressBar value={safetyOn} max={SAFETY_TOGGLE_ITEMS.length} />
          </div>
          <div className="rounded-xl border border-[var(--cc-blue)]/40 bg-white p-4 ring-1 ring-[var(--cc-blue)]/20">
            <p className="text-xs font-bold uppercase text-[var(--cc-blue)]">
              What&apos;s left for Cy-Fair pilot
            </p>
            {pilotLeft.length === 0 ? (
              <p className="mt-2 text-sm font-semibold text-emerald-700">
                Pilot checklist complete — walk Fan / Parent / Export next.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {pilotLeft.slice(0, 4).map((key) => {
                  const item = LEGAL_CHECKLIST_ITEMS.find((i) => i.key === key)!;
                  return (
                    <li key={key} className="font-medium text-[var(--cc-navy)]">
                      • {item.label}
                    </li>
                  );
                })}
                {pilotLeft.length > 4 ? (
                  <li className="text-xs text-[var(--cc-steel)]">
                    +{pilotLeft.length - 4} more
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Who can see what">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Field matrix for Fan site, Parent site, and staff — the “fully safe”
          story for district buyers.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2 pr-3">Field</th>
                <th className="py-2 pr-3">Fan</th>
                <th className="py-2 pr-3">Parent</th>
                <th className="py-2 pr-3">Staff</th>
                <th className="py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {DATA_FIELD_MATRIX.map((row) => (
                <tr
                  key={row.field}
                  className="border-b border-[var(--cc-line)]/70"
                >
                  <td className="py-2 pr-3 font-medium text-[var(--cc-navy)]">
                    {row.field}
                  </td>
                  <td className="py-2 pr-3">
                    <YesNo ok={row.fan} />
                  </td>
                  <td className="py-2 pr-3">
                    <YesNo ok={row.parent} />
                  </td>
                  <td className="py-2 pr-3">
                    <YesNo ok={row.staff} />
                  </td>
                  <td className="py-2 text-[var(--cc-steel)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <GhostButton onClick={() => setPage("fan")}>Open Fan site →</GhostButton>
          <GhostButton onClick={() => setPage("parent")}>
            Open Parent site →
          </GhostButton>
        </div>
      </Panel>

      <Panel title="Safety controls (live demo)">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Toggle these in front of an AD. Fan and Parent respect these rules in
          this session.
        </p>
        <ul className="grid gap-2 md:grid-cols-2">
          {SAFETY_TOGGLE_ITEMS.map((item) => (
            <li
              key={item.key}
              className="flex gap-3 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={safetyToggles[item.key]}
                onChange={(e) => setSafetyToggle(item.key, e.target.checked)}
              />
              <div>
                <p className="font-semibold text-[var(--cc-navy)]">{item.label}</p>
                <p className="text-sm text-[var(--cc-steel)]">{item.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Directory opt-outs · ${activeProgram.name}`}>
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Parents can hide an athlete from the public Fan roster. Opted-out
          athletes still appear for staff and (when linked) Parent.
        </p>
        <ul className="space-y-2">
          {roster.map((a) => {
            const key = `${activeProgram.sport}-${a.jersey}`;
            const opted = parentOptOuts.has(key);
            return (
              <li
                key={key}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              >
                <span className="font-medium text-[var(--cc-navy)]">
                  #{a.jersey} {a.name}{" "}
                  <span className="text-sm font-normal text-[var(--cc-steel)]">
                    · {a.pos} · {a.classYear}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => toggleParentOptOut(key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    opted
                      ? "bg-amber-100 text-amber-900"
                      : "border border-[var(--cc-line)] text-[var(--cc-navy)]"
                  }`}
                >
                  {opted ? "Opted out of Fan" : "Visible on Fan"}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Subprocessors">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2">Vendor</th>
                <th className="py-2">Purpose</th>
                <th className="py-2">Region</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_SUBPROCESSORS.map((s) => (
                <tr key={s.name} className="border-b border-[var(--cc-line)]/70">
                  <td className="py-2 font-medium">{s.name}</td>
                  <td className="py-2 text-[var(--cc-steel)]">{s.purpose}</td>
                  <td className="py-2">{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Retention & PHI scope">
          <ul className="space-y-3">
            {DEMO_RETENTION.map((r) => (
              <li key={r.title}>
                <p className="font-semibold text-[var(--cc-navy)]">{r.title}</p>
                <p className="text-sm text-[var(--cc-steel)]">{r.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

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
