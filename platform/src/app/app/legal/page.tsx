"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Panel, ProgressBar, YesNo } from "@/components/ui";
import {
  CYFAIR_PILOT_KEYS,
  DATA_FIELD_MATRIX,
  LEGAL_CHECKLIST_ITEMS,
  SAFETY_TOGGLE_ITEMS,
} from "@/lib/programConfig";
import { DEMO_RETENTION, DEMO_SUBPROCESSORS } from "@/lib/demoContent";

export default function LegalPage() {
  const {
    snap,
    activeAthletes,
    setLegal,
    setSafety,
    setDirectoryOptOut,
  } = useApp();
  const done = LEGAL_CHECKLIST_ITEMS.filter((i) => snap.legal[i.key]).length;
  const safetyOn = SAFETY_TOGGLE_ITEMS.filter((i) => snap.safety[i.key]).length;
  const pilotLeft = CYFAIR_PILOT_KEYS.filter((k) => !snap.legal[k]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Legal & safety"
        description="Field rules, safety controls, and procurement checklist — ready to bind to real policy docs."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Checklist">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
            {Math.round((done / LEGAL_CHECKLIST_ITEMS.length) * 100)}%
          </p>
          <ProgressBar value={done} max={LEGAL_CHECKLIST_ITEMS.length} />
        </Panel>
        <Panel title="Safety on">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
            {safetyOn}/{SAFETY_TOGGLE_ITEMS.length}
          </p>
          <ProgressBar value={safetyOn} max={SAFETY_TOGGLE_ITEMS.length} />
        </Panel>
        <Panel title="Pilot gaps">
          {pilotLeft.length === 0 ? (
            <p className="text-sm font-semibold text-emerald-700">
              Pilot items complete
            </p>
          ) : (
            <ul className="text-sm">
              {pilotLeft.slice(0, 4).map((k) => (
                <li key={k}>
                  • {LEGAL_CHECKLIST_ITEMS.find((i) => i.key === k)?.label}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Who can see what">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2">Field</th>
                <th className="py-2">Fan</th>
                <th className="py-2">Parent</th>
                <th className="py-2">Staff</th>
                <th className="py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {DATA_FIELD_MATRIX.map((row) => (
                <tr key={row.field} className="border-b border-[var(--cc-line)]/70">
                  <td className="py-2 font-medium">{row.field}</td>
                  <td className="py-2">
                    <YesNo ok={row.fan} />
                  </td>
                  <td className="py-2">
                    <YesNo ok={row.parent} />
                  </td>
                  <td className="py-2">
                    <YesNo ok={row.staff} />
                  </td>
                  <td className="py-2 text-[var(--cc-steel)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Safety controls">
        <ul className="grid gap-2 md:grid-cols-2">
          {SAFETY_TOGGLE_ITEMS.map((item) => (
            <li
              key={item.key}
              className="flex gap-3 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <input
                type="checkbox"
                checked={snap.safety[item.key]}
                onChange={(e) => setSafety(item.key, e.target.checked)}
              />
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-[var(--cc-steel)]">{item.blurb}</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Directory opt-outs">
        <ul className="space-y-2">
          {activeAthletes.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <span>
                #{a.jersey} {a.name} · {a.pos}
              </span>
              <button
                type="button"
                onClick={() => setDirectoryOptOut(a.id, !a.directoryOptOut)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  a.directoryOptOut
                    ? "bg-amber-100 text-amber-900"
                    : "border border-[var(--cc-line)]"
                }`}
              >
                {a.directoryOptOut ? "Opted out of Fan" : "Visible on Fan"}
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Subprocessors">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2">Vendor</th>
                <th className="py-2">Purpose</th>
                <th className="py-2">Region</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_SUBPROCESSORS.map((s) => (
                <tr key={s.name} className="border-b border-[var(--cc-line)]/70">
                  <td className="py-2 font-medium">{s.name}</td>
                  <td className="py-2">{s.purpose}</td>
                  <td className="py-2">{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Retention">
          <ul className="space-y-3">
            {DEMO_RETENTION.map((r) => (
              <li key={r.title}>
                <p className="font-semibold">{r.title}</p>
                <p className="text-sm text-[var(--cc-steel)]">{r.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {(["legal", "security", "procurement"] as const).map((group) => {
        const items = LEGAL_CHECKLIST_ITEMS.filter((i) => i.group === group);
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
          >
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 rounded-lg border border-[var(--cc-line)] px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={snap.legal[item.key]}
                    onChange={(e) => setLegal(item.key, e.target.checked)}
                  />
                  <div>
                    <p className="font-semibold">{item.label}</p>
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
