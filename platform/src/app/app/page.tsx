"use client";

import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Panel, ProgressBar, StatTile, PrimaryButton } from "@/components/ui";
import { LEGAL_CHECKLIST_ITEMS, SAFETY_TOGGLE_ITEMS } from "@/lib/programConfig";

export default function DashboardPage() {
  const { snap, activeProgram, activeAthletes, activeGames, templateForActive } =
    useApp();
  const legalDone = LEGAL_CHECKLIST_ITEMS.filter((i) => snap.legal[i.key]).length;
  const safetyOn = SAFETY_TOGGLE_ITEMS.filter((i) => snap.safety[i.key]).length;
  const nextGame = activeGames.find((g) => !g.result) ?? activeGames[0];
  const campus = snap.campuses.find((c) => c.id === activeProgram.campusId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description={`${snap.district.name} · ${campus?.name ?? ""} · manage programs, roster, schedule, and district readiness.`}
        action={
          <Link href="/app/teams">
            <PrimaryButton>Manage teams</PrimaryButton>
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Active program"
          value={activeProgram.name}
          hint={`${activeProgram.seasonLabel} · ${templateForActive.label}`}
        />
        <StatTile
          label="Athletes"
          value={activeAthletes.length}
          hint={`${activeProgram.levels.join(" · ")}`}
        />
        <StatTile
          label="Legal checklist"
          value={`${legalDone}/${LEGAL_CHECKLIST_ITEMS.length}`}
          hint={
            <ProgressBar value={legalDone} max={LEGAL_CHECKLIST_ITEMS.length} />
          }
        />
        <StatTile
          label="Safety controls"
          value={`${safetyOn}/${SAFETY_TOGGLE_ITEMS.length} on`}
          tone="good"
          hint={<ProgressBar value={safetyOn} max={SAFETY_TOGGLE_ITEMS.length} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="This week">
          {nextGame ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--cc-navy)]">
                {nextGame.homeAway} vs {nextGame.opponent}
              </p>
              <p className="mt-1 text-sm text-[var(--cc-steel)]">
                {nextGame.date} · {nextGame.time}
                {nextGame.venue ? ` · ${nextGame.venue}` : ""}
              </p>
              <Link
                href="/app/schedule"
                className="mt-3 inline-block text-sm font-semibold text-[var(--cc-blue)] hover:underline"
              >
                Full schedule →
              </Link>
            </>
          ) : (
            <p className="text-sm text-[var(--cc-steel)]">No games yet.</p>
          )}
        </Panel>

        <Panel title="Quick actions">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["/app/roster", "Edit roster"],
              ["/app/roster/import", "Import roster CSV"],
              ["/app/members", "Invite staff"],
              ["/app/seasons", "Season roll"],
              ["/fan/" + activeProgram.slug, "Open Fan site"],
              ["/parent", "Open Parent portal"],
              ["/app/legal", "Legal & safety"],
              ["/onboarding", "Onboarding wizard"],
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

      <Panel title="Programs on this campus">
        <ul className="divide-y divide-[var(--cc-line)]">
          {snap.programs.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3"
            >
              <div>
                <p className="font-semibold text-[var(--cc-navy)]">
                  {p.name}{" "}
                  <span className="text-sm font-medium text-[var(--cc-steel)]">
                    · {p.seasonLabel}
                  </span>
                </p>
                <p className="text-xs text-[var(--cc-steel)]">
                  {p.athleteCount} athletes · {p.staffCount} staff ·{" "}
                  {p.levels.join(", ")}
                </p>
              </div>
              <Link
                href={`/app/teams/${p.id}`}
                className="text-sm font-semibold text-[var(--cc-blue)] hover:underline"
              >
                Open →
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
