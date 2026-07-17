"use client";

import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, StatTile } from "@/components/ui";
import {
  DISTRICT_CHAIN,
  ROLE_HEADCOUNT,
  ROLE_LABEL,
  ROLE_SHORT,
} from "@/lib/data/org";

export default function DistrictPage() {
  const { snap, membersByRole, setActiveCampus } = useApp();

  return (
    <div className="space-y-4">
      <PageHeader
        title="District org chart"
        description="Cy-Fair athletics chain of command. Controls follow this order — higher roles can manage everything below them."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {DISTRICT_CHAIN.map((role) => {
          const people = membersByRole(role);
          const expected = ROLE_HEADCOUNT[role] ?? people.length;
          return (
            <StatTile
              key={role}
              label={ROLE_SHORT[role]}
              value={`${people.length} / ${expected}`}
              hint={ROLE_LABEL[role]}
              tone={people.length === expected ? "good" : "default"}
            />
          );
        })}
      </div>

      <Panel title="Chain of command">
        <ol className="space-y-4">
          {DISTRICT_CHAIN.map((role, idx) => {
            const people = membersByRole(role);
            return (
              <li key={role}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cc-navy)] text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--cc-navy)]">
                    {ROLE_LABEL[role]}
                  </h3>
                  <Badge>
                    {people.length} seated
                    {ROLE_HEADCOUNT[role]
                      ? ` · ${ROLE_HEADCOUNT[role]} planned`
                      : ""}
                  </Badge>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {people.map((m) => {
                    const campus = snap.campuses.find((c) => c.id === m.campusId);
                    return (
                      <li
                        key={m.id}
                        className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/50 px-3 py-2.5"
                      >
                        <p className="font-semibold text-[var(--cc-navy)]">
                          {m.name}
                        </p>
                        <p className="text-xs text-[var(--cc-steel)]">{m.email}</p>
                        <p className="mt-1 text-xs font-medium text-[var(--cc-steel)]">
                          {campus ? campus.short : m.scope}
                        </p>
                        {campus ? (
                          <button
                            type="button"
                            onClick={() => setActiveCampus(campus.id)}
                            className="mt-1 text-xs font-semibold text-[var(--cc-blue)] hover:underline"
                          >
                            Open campus →
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                {idx < DISTRICT_CHAIN.length - 1 ? (
                  <div className="mx-3 mt-3 h-4 w-0.5 bg-[var(--cc-blue)]" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="What each level can do">
          <ul className="space-y-2 text-sm text-[var(--cc-steel)]">
            <li>
              <strong className="text-[var(--cc-navy)]">DAD / AAD</strong> —
              district settings, SSO, legal, export/offboard, all campuses.
            </li>
            <li>
              <strong className="text-[var(--cc-navy)]">DAC</strong> — district
              coordination, view all campuses, manage members below them.
            </li>
            <li>
              <strong className="text-[var(--cc-navy)]">Campus Coord.</strong> —
              own campus teams, roster, schedule, season roll, invites below.
            </li>
            <li>
              <strong className="text-[var(--cc-navy)]">Asst. Campus Coord.</strong> —
              day-to-day campus ops; cannot run district legal or offboard.
            </li>
          </ul>
          <Link
            href="/app/permissions"
            className="mt-3 inline-block text-sm font-semibold text-[var(--cc-blue)]"
          >
            Full controls matrix →
          </Link>
        </Panel>
        <Panel title="Quick links">
          <div className="grid gap-2">
            {[
              ["/app/campuses", "All 12 campuses"],
              ["/app/members", "People & invites"],
              ["/app/permissions", "Who can do what"],
              ["/app/teams", "Campus teams"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-[var(--cc-line)] px-3 py-2.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                {label} →
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
