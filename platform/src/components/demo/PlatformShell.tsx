"use client";

import { useMemo } from "react";
import {
  usePlatform,
  type PlatformPage,
  PlatformProvider,
} from "./PlatformState";
import { OverviewScreen } from "./screens/OverviewScreen";
import { DistrictScreen } from "./screens/DistrictScreen";
import { ProgramsScreen } from "./screens/ProgramsScreen";
import { FanScreen } from "./screens/FanScreen";
import { ParentScreen } from "./screens/ParentScreen";
import { LegalScreen } from "./screens/LegalScreen";
import { AuditScreen, DataScreen } from "./screens/AuditDataScreens";
import { asset } from "@/lib/asset";

const NAV: { id: PlatformPage; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "district", label: "District" },
  { id: "programs", label: "Add teams" },
  { id: "fan", label: "Fan site" },
  { id: "parent", label: "Parent site" },
  { id: "legal", label: "Legal & safety" },
  { id: "audit", label: "Audit" },
  { id: "data", label: "Export / Delete" },
];

function Screen() {
  const { page } = usePlatform();
  switch (page) {
    case "district":
      return <DistrictScreen />;
    case "programs":
      return <ProgramsScreen />;
    case "legal":
      return <LegalScreen />;
    case "audit":
      return <AuditScreen />;
    case "data":
      return <DataScreen />;
    case "fan":
      return <FanScreen />;
    case "parent":
      return <ParentScreen />;
    default:
      return <OverviewScreen />;
  }
}

function PlatformShellInner() {
  const {
    page,
    setPage,
    activeProgram,
    district,
    presentMode,
    setPresentMode,
    programs,
    setActiveProgram,
  } = usePlatform();

  const title = useMemo(
    () => NAV.find((n) => n.id === page)?.label ?? "Platform",
    [page],
  );

  if (presentMode && page === "fan") {
    return (
      <div className="min-h-full bg-[var(--cc-field)]">
        <main className="mx-auto max-w-[90rem] px-3 py-4 sm:px-6">
          <FanScreen />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--cc-navy)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/cypress-creek-logo.png")}
              alt=""
              className="hidden h-10 w-10 rounded-lg bg-white/10 object-contain p-0.5 sm:block"
            />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-wide">
                Team OS Platform
              </p>
              <p className="text-xs text-white/70">
                {district.name} · Active: {activeProgram.name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="font-semibold">Active</span>
              <select
                value={activeProgram.id}
                onChange={(e) => setActiveProgram(e.target.value)}
                className="rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 font-semibold text-white"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                setPresentMode(true);
                setPage("fan");
              }}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
            >
              Present Fan
            </button>
            <a
              href="/"
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10"
            >
              Football Team OS →
            </a>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPage(item.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                page === item.id
                  ? "bg-white text-[var(--cc-navy)]"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6">
        {page !== "fan" ? (
          <h1 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--cc-navy)]">
            {title}
          </h1>
        ) : null}
        <Screen />
      </main>
      <footer className="mx-auto max-w-[90rem] px-4 pb-8 text-center text-xs text-[var(--cc-steel)] sm:px-6">
        Cy-Fair ISD · Cypress Creek Cougars · session demo data · not legal advice
      </footer>
    </div>
  );
}

export function PlatformShell() {
  return (
    <PlatformProvider>
      <PlatformShellInner />
    </PlatformProvider>
  );
}
