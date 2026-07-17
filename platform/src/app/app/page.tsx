"use client";

import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp, ROLE_SHORT } from "@/components/app/AppProvider";
import { Panel, ProgressBar, PrimaryButton, StatTile } from "@/components/ui";
import {
  DISTRICT_CHAIN,
  ROLE_HEADCOUNT,
  ROLE_LABEL,
} from "@/lib/data/org";
import { LEGAL_CHECKLIST_ITEMS, SAFETY_TOGGLE_ITEMS } from "@/lib/programConfig";

export default function DashboardPage() {
  const {
    snap,
    activeProgram,
    activeCampus,
    activeAthletes,
    activeGames,
    templateForActive,
    membersByRole,
    can,
    roleLabel,
  } = useApp();

  const legalDone = LEGAL_CHECKLIST_ITEMS.filter((i) => snap.legal[i.key]).length;
  const safetyOn = SAFETY_TOGGLE_ITEMS.filter((i) => snap.safety[i.key]).length;
  const nextGame = activeGames.find((g) => !g.result) ?? activeGames[0];

  const chainReady = DISTRICT_CHAIN.every((role) => {
    const need = ROLE_HEADCOUNT[role] ?? 0;
    return membersByRole(role).length >= need;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Welcome, ${snap.session?.name?.split(" ")[0] ?? "there"}`}
        description={`You're signed in as ${roleLabel}. Working campus: ${activeCampus.short}. Everything below is linked and ready — backend can plug into the same screens later.`}
        action={
          can("manage_programs") ? (
            <Link href="/app/teams">
              <PrimaryButton>Go to teams</PrimaryButton>
            </Link>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Your role"
          value={ROLE_SHORT[snap.session?.role ?? "coach"]}
          hint={roleLabel}
        />
        <StatTile
          label="Campus"
          value={activeCampus.short}
          hint={`${activeCampus.mascot} · ${snap.campuses.length} campuses`}
        />
        <StatTile
          label="Active team"
          value={activeProgram.name}
          hint={`${activeAthletes.length} athletes · ${templateForActive.label}`}
        />
        <StatTile
          label="Org seats"
          value={chainReady ? "Filled" : "In progress"}
          hint="2 DAD · 4 AAD · 2 DAC · 12+12 campus"
          tone={chainReady ? "good" : "default"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Do this next" className="lg:col-span-2">
          <ol className="space-y-2">
            {[
              can("view_district") && {
                href: "/app/district",
                title: "Review the org chart",
                detail: "Confirm DAD → AAD → DAC → Campus Coord. → Asst.",
              },
              can("view_district") && {
                href: "/app/campuses",
                title: "Pick a campus",
                detail: "12 schools — click to set your working campus.",
              },
              can("manage_programs") && {
                href: "/app/teams",
                title: "Open or add a team",
                detail: "Football & Volleyball are live at Cy Creek.",
              },
              can("manage_roster") && {
                href: "/app/roster",
                title: "Check the roster",
                detail: "Add athletes or import CSV.",
              },
              can("manage_announcements") && {
                href: "/app/announcements",
                title: "Post for parents",
                detail: "Shows up in the Parent portal.",
              },
              {
                href: `/fan/${activeProgram.slug}`,
                title: "Preview Fan site",
                detail: "Public schedule + directory roster only.",
              },
            ]
              .filter(Boolean)
              .map((item, idx) => {
                const it = item as {
                  href: string;
                  title: string;
                  detail: string;
                };
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="flex gap-3 rounded-xl border border-[var(--cc-line)] px-3 py-3 transition hover:border-[var(--cc-blue)] hover:bg-[var(--cc-field)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--cc-navy)] text-sm font-bold text-white">
                        {idx + 1}
                      </span>
                      <span>
                        <span className="block font-semibold text-[var(--cc-navy)]">
                          {it.title}
                        </span>
                        <span className="text-sm text-[var(--cc-steel)]">
                          {it.detail}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
          </ol>
        </Panel>

        <Panel title="This week">
          {nextGame ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--cc-navy)]">
                {nextGame.homeAway} vs {nextGame.opponent}
              </p>
              <p className="mt-1 text-sm text-[var(--cc-steel)]">
                {nextGame.date} · {nextGame.time}
              </p>
              <Link
                href="/app/schedule"
                className="mt-3 inline-block text-sm font-semibold text-[var(--cc-blue)]"
              >
                Full schedule →
              </Link>
            </>
          ) : (
            <p className="text-sm text-[var(--cc-steel)]">
              No games on this team yet.
            </p>
          )}
          {can("manage_legal") ? (
            <div className="mt-4 border-t border-[var(--cc-line)] pt-3">
              <p className="text-xs font-bold uppercase text-[var(--cc-steel)]">
                Legal / safety
              </p>
              <ProgressBar
                value={legalDone}
                max={LEGAL_CHECKLIST_ITEMS.length}
              />
              <ProgressBar value={safetyOn} max={SAFETY_TOGGLE_ITEMS.length} />
              <Link
                href="/app/legal"
                className="mt-2 inline-block text-sm font-semibold text-[var(--cc-blue)]"
              >
                Open Legal →
              </Link>
            </div>
          ) : null}
        </Panel>
      </div>

      <Panel title="Chain of command at a glance">
        <div className="flex flex-wrap gap-2">
          {DISTRICT_CHAIN.map((r, i) => (
            <Link
              key={r}
              href="/app/district"
              className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] px-3 py-2 text-sm hover:border-[var(--cc-blue)]"
            >
              <span className="text-[10px] font-bold text-[var(--cc-blue)]">
                {i + 1}
              </span>{" "}
              <span className="font-semibold text-[var(--cc-navy)]">
                {ROLE_LABEL[r]}
              </span>{" "}
              <span className="text-[var(--cc-steel)]">
                ({membersByRole(r).length}/{ROLE_HEADCOUNT[r]})
              </span>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
