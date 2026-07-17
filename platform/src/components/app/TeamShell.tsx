"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useApp } from "./AppProvider";
import { EmptyCampusCallout } from "./EmptyCampusCallout";
import { MODULE_LABELS, type ProgramModuleId } from "@/lib/programConfig";

const MODULE_HREF: Partial<Record<ProgramModuleId, string>> = {
  depth: "/app/team/depth",
  scout: "/app/team/scout",
  practice: "/app/team/practice",
  callSheet: "/app/team/call-sheet",
  playbook: "/app/team/playbook",
  quizzes: "/app/team/quizzes",
  grades: "/app/team/grades",
  stats: "/app/team/stats",
  resources: "/app/team/resources",
  philosophy: "/app/team/philosophy",
  install: "/app/team/install",
  study: "/app/team/study",
  printMyga: "/app/team/depth",
};

const EXTRA = [
  { href: "/app/team", label: "This week", exact: true },
  { href: "/app/team/attendance", label: "Attendance" },
  { href: "/app/team/staff", label: "Staff duties" },
  { href: "/app/roster", label: "Roster" },
  { href: "/app/schedule", label: "Schedule" },
  { href: "/app/announcements", label: "Announce" },
];

export function TeamShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    activeProgram,
    activeCampus,
    programOnCampus,
    templateForActive,
    activeWeek,
    setActiveWeek,
    activeUnitId,
    setActiveUnit,
    activeGames,
    can,
  } = useApp();

  if (!can("manage_team")) {
    return (
      <div className="rounded-2xl border border-[var(--cc-line)] bg-white p-6">
        <p className="font-semibold text-[var(--cc-navy)]">
          Team workspace is for coaches
        </p>
        <p className="mt-1 text-sm text-[var(--cc-steel)]">
          Sign in as Head Coach (or use View as → HC) to open the team desk.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-block text-sm font-semibold text-[var(--cc-blue)]"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  if (!programOnCampus) {
    return <EmptyCampusCallout context="Team tools need a program on this campus." />;
  }

  const maxWeek = Math.max(1, ...activeGames.map((g) => g.week), activeWeek);
  const moduleLinks = templateForActive.enabledModules
    .map((m) => {
      const href = MODULE_HREF[m];
      if (!href) return null;
      return { href, label: MODULE_LABELS[m], module: m };
    })
    .filter(Boolean) as { href: string; label: string; module: ProgramModuleId }[];

  const nav = [
    ...EXTRA.slice(0, 1),
    ...moduleLinks.filter(
      (l, i, arr) => arr.findIndex((x) => x.href === l.href) === i,
    ),
    ...EXTRA.slice(1),
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--cc-navy)] bg-[var(--cc-navy)] px-4 py-4 text-white sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Head coach desk · {activeCampus.short}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-wide">
              {activeProgram.name}
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {templateForActive.label} · {activeProgram.seasonLabel} · Week{" "}
              {activeWeek}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-white/80">Week</span>
              <select
                value={activeWeek}
                onChange={(e) => setActiveWeek(Number(e.target.value))}
                className="rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 font-semibold"
              >
                {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
            {templateForActive.units.length > 1 ? (
              <label className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-white/80">Unit</span>
                <select
                  value={activeUnitId}
                  onChange={(e) => setActiveUnit(e.target.value)}
                  className="rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 font-semibold"
                >
                  {templateForActive.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </div>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1">
          {nav.map((item) => {
            const exact = "exact" in item && item.exact;
            const active = exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-[var(--cc-navy)]"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
