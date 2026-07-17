"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppProvider, useApp, ROLE_SHORT } from "./AppProvider";
import type { Permission } from "@/lib/data/org";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  perm?: Permission;
};

const NAV: NavItem[] = [
  { href: "/app", label: "Home", exact: true },
  { href: "/app/district", label: "Org chart", perm: "view_district" },
  { href: "/app/campuses", label: "Campuses", perm: "view_district" },
  { href: "/app/teams", label: "Teams", perm: "view_programs" },
  { href: "/app/roster", label: "Roster", perm: "manage_roster" },
  { href: "/app/schedule", label: "Schedule", perm: "manage_schedule" },
  { href: "/app/announcements", label: "Announce", perm: "manage_announcements" },
  { href: "/app/members", label: "People", perm: "manage_members" },
  { href: "/app/permissions", label: "Controls", perm: "view_district" },
  { href: "/app/seasons", label: "Seasons", perm: "season_roll" },
  { href: "/app/legal", label: "Legal", perm: "manage_legal" },
  { href: "/app/audit", label: "Audit", perm: "view_audit" },
  { href: "/app/data", label: "Data", perm: "export_delete" },
  { href: "/app/settings", label: "Settings", perm: "manage_district_settings" },
];

function ShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    snap,
    activeProgram,
    activeCampus,
    setActiveProgram,
    setActiveCampus,
    campusPrograms,
    signOut,
    can: canDo,
    roleLabel,
    switchToMember,
  } = useApp();

  const visibleNav = NAV.filter((item) => !item.perm || canDo(item.perm));

  const previewOptions = snap.members.filter((m) =>
    [
      "district_athletic_director",
      "associate_athletic_director",
      "district_athletic_coordinator",
      "athletic_campus_coordinator",
      "assistant_athletic_campus_coordinator",
      "head_coach",
    ].includes(m.role),
  );

  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--cc-navy)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cypress-creek-logo.png"
              alt=""
              className="hidden h-10 w-10 rounded-lg bg-white/10 object-contain p-0.5 sm:block"
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-wide">
                Team OS
              </p>
              <p className="text-xs text-white/70">
                {snap.district.name} · {snap.session?.name ?? "Signed out"}
                {snap.session ? ` · ${ROLE_SHORT[snap.session.role]}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="font-semibold">Campus</span>
              <select
                value={activeCampus.id}
                onChange={(e) => setActiveCampus(e.target.value)}
                className="max-w-[10rem] rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 font-semibold text-white"
              >
                {snap.campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.short}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="font-semibold">Team</span>
              <select
                value={
                  campusPrograms.some((p) => p.id === activeProgram.id)
                    ? activeProgram.id
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value) setActiveProgram(e.target.value);
                }}
                disabled={!campusPrograms.length}
                className="rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 font-semibold text-white disabled:opacity-60"
              >
                {!campusPrograms.length ? (
                  <option value="">No teams yet</option>
                ) : (
                  campusPrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            {canDo("impersonate_preview") ? (
              <label className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="font-semibold">View as</span>
                <select
                  value={snap.session?.id ?? ""}
                  onChange={(e) => switchToMember(e.target.value)}
                  className="max-w-[12rem] rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 font-semibold text-white"
                >
                  {previewOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {ROLE_SHORT[m.role]} · {m.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {campusPrograms.length ? (
              <Link
                href={`/fan/${activeProgram.slug}`}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Fan
              </Link>
            ) : (
              <Link
                href="/app/teams"
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Add team
              </Link>
            )}
            <Link
              href="/parent"
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
            >
              Parent
            </Link>
            {snap.session ? (
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--cc-navy)]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {visibleNav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
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
      </header>
      <div className="border-b border-[var(--cc-line)] bg-white/70">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-2 px-4 py-2 text-xs text-[var(--cc-steel)] sm:px-6">
          <span className="font-semibold text-[var(--cc-navy)]">{roleLabel}</span>
          <span aria-hidden>·</span>
          <span>{activeCampus.short}</span>
          <span aria-hidden>·</span>
          <span>{activeProgram.name}</span>
          <span className="ml-auto hidden sm:inline">
            Need the AD pitch deck?{" "}
            <Link href="/demo" className="font-semibold text-[var(--cc-blue)]">
              Open walkthrough
            </Link>
          </span>
        </div>
      </div>
      <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ShellInner>{children}</ShellInner>
    </AppProvider>
  );
}
