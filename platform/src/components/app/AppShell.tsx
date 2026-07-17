"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppProvider, useApp } from "./AppProvider";

const NAV = [
  { href: "/app", label: "Dashboard", exact: true },
  { href: "/app/district", label: "District" },
  { href: "/app/teams", label: "Teams" },
  { href: "/app/roster", label: "Roster" },
  { href: "/app/schedule", label: "Schedule" },
  { href: "/app/members", label: "Members" },
  { href: "/app/seasons", label: "Seasons" },
  { href: "/app/legal", label: "Legal & safety" },
  { href: "/app/audit", label: "Audit" },
  { href: "/app/data", label: "Data" },
  { href: "/app/settings", label: "Settings" },
];

function ShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { snap, activeProgram, setActiveProgram, signOut } = useApp();

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
                {snap.district.name} ·{" "}
                {snap.session?.name ?? "Signed out"} · {snap.session?.role}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="font-semibold">Program</span>
              <select
                value={activeProgram.id}
                onChange={(e) => setActiveProgram(e.target.value)}
                className="rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 font-semibold text-white"
              >
                {snap.programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <Link
              href={`/fan/${activeProgram.slug}`}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
            >
              Fan site
            </Link>
            <Link
              href="/parent"
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/10"
            >
              Parent
            </Link>
            <Link
              href="/demo"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10"
            >
              AD walkthrough
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
          {NAV.map((item) => {
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
