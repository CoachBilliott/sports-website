"use client";

import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel } from "@/components/ui";

export default function CampusesPage() {
  const { snap, activeCampus, setActiveCampus } = useApp();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Campuses"
        description="12 Cy-Fair high schools. Each has an Athletic Campus Coordinator and an Assistant."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {snap.campuses.map((c) => {
          const coord = snap.members.find(
            (m) =>
              m.role === "athletic_campus_coordinator" && m.campusId === c.id,
          );
          const asst = snap.members.find(
            (m) =>
              m.role === "assistant_athletic_campus_coordinator" &&
              m.campusId === c.id,
          );
          const programs = snap.programs.filter((p) => p.campusId === c.id);
          const active = c.id === activeCampus.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCampus(c.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5 ring-2 ring-[var(--cc-blue)]/20"
                  : "border-[var(--cc-line)] bg-white hover:border-[var(--cc-blue)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cc-navy)]">
                    {c.short}
                  </p>
                  <p className="text-sm text-[var(--cc-steel)]">{c.mascot}</p>
                </div>
                {active ? <Badge tone="brand">Working here</Badge> : null}
              </div>
              <dl className="mt-3 space-y-1 text-xs text-[var(--cc-steel)]">
                <div>
                  <dt className="inline font-semibold text-[var(--cc-navy)]">
                    Coord:{" "}
                  </dt>
                  <dd className="inline">{coord?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-[var(--cc-navy)]">
                    Asst:{" "}
                  </dt>
                  <dd className="inline">{asst?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-[var(--cc-navy)]">
                    Teams:{" "}
                  </dt>
                  <dd className="inline">
                    {programs.length
                      ? programs.map((p) => p.name).join(", ")
                      : "None yet — add from Teams"}
                  </dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>

      <Panel title="Working campus">
        <p className="text-sm text-[var(--cc-steel)]">
          Header campus switcher and this page stay in sync. Teams / Roster /
          Schedule apply to{" "}
          <strong className="text-[var(--cc-navy)]">{activeCampus.name}</strong>.
        </p>
        <Link
          href="/app/teams"
          className="mt-3 inline-block text-sm font-semibold text-[var(--cc-blue)]"
        >
          Manage teams on this campus →
        </Link>
      </Panel>
    </div>
  );
}
