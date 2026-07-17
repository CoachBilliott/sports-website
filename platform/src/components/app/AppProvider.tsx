"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { getMemoryRepository } from "@/lib/data/memory";
import type {
  CreateProgramInput,
  ImportAthleteRow,
  InviteMemberInput,
} from "@/lib/data/repository";
import type {
  Athlete,
  LegalItemKey,
  PlatformSnapshot,
  Program,
  SafetyKey,
} from "@/lib/data/types";
import { configForSport } from "@/lib/programConfig";

type AppContextValue = {
  snap: PlatformSnapshot;
  activeProgram: Program;
  activeAthletes: Athlete[];
  activeGames: PlatformSnapshot["games"];
  refresh: () => void;
  setActiveProgram: (id: string) => void;
  createProgram: (input: CreateProgramInput) => void;
  updateProgram: (id: string, patch: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  setLegal: (key: LegalItemKey, value: boolean) => void;
  setSafety: (key: SafetyKey, value: boolean) => void;
  setSsoConnected: (v: boolean) => void;
  setDirectoryOptOut: (athleteId: string, value: boolean) => void;
  inviteMember: (input: InviteMemberInput) => void;
  removeMember: (id: string) => void;
  importAthletes: (
    programId: string,
    rows: ImportAthleteRow[],
    mode: "merge" | "replace",
  ) => void;
  addAthlete: (programId: string, row: ImportAthleteRow) => void;
  updateAthlete: (id: string, patch: Partial<Athlete>) => void;
  removeAthlete: (id: string) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  updateOnboarding: (patch: Partial<PlatformSnapshot["onboarding"]>) => void;
  signIn: (email: string) => void;
  signOut: () => void;
  exportActiveProgram: () => void;
  resetToSeed: () => void;
  templateForActive: ReturnType<typeof configForSport>;
};

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => getMemoryRepository(), []);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const refresh = useCallback(() => bump(), []);

  const run = useCallback(
    (fn: () => void) => {
      fn();
      bump();
    },
    [],
  );

  const snap = repo.getSnapshot();
  const activeProgram =
    snap.programs.find((p) => p.id === snap.activeProgramId) ?? snap.programs[0]!;
  const activeAthletes = snap.athletes.filter(
    (a) => a.programId === activeProgram.id,
  );
  const activeGames = snap.games.filter((g) => g.programId === activeProgram.id);

  const value: AppContextValue = {
    snap,
    activeProgram,
    activeAthletes,
    activeGames,
    refresh,
    setActiveProgram: (id) => run(() => repo.setActiveProgram(id)),
    createProgram: (input) => run(() => repo.createProgram(input)),
    updateProgram: (id, patch) => run(() => repo.updateProgram(id, patch)),
    deleteProgram: (id) => run(() => repo.deleteProgram(id)),
    setLegal: (k, v) => run(() => repo.setLegal(k, v)),
    setSafety: (k, v) => run(() => repo.setSafety(k, v)),
    setSsoConnected: (v) => run(() => repo.setSsoConnected(v)),
    setDirectoryOptOut: (id, v) => run(() => repo.setDirectoryOptOut(id, v)),
    inviteMember: (input) => run(() => repo.inviteMember(input)),
    removeMember: (id) => run(() => repo.removeMember(id)),
    importAthletes: (pid, rows, mode) =>
      run(() => repo.importAthletes(pid, rows, mode)),
    addAthlete: (pid, row) => run(() => repo.addAthlete(pid, row)),
    updateAthlete: (id, patch) => run(() => repo.updateAthlete(id, patch)),
    removeAthlete: (id) => run(() => repo.removeAthlete(id)),
    setOnboardingStep: (step) => run(() => repo.setOnboardingStep(step)),
    completeOnboarding: () => run(() => repo.completeOnboarding()),
    updateOnboarding: (patch) => run(() => repo.updateOnboarding(patch)),
    signIn: (email) => run(() => repo.signIn(email)),
    signOut: () => run(() => repo.signOut()),
    exportActiveProgram: () =>
      run(() => {
        const json = repo.exportProgramJson(activeProgram.id);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeProgram.slug}-export.json`;
        a.click();
        URL.revokeObjectURL(url);
      }),
    resetToSeed: () => run(() => repo.resetToSeed()),
    templateForActive: configForSport(activeProgram.sport),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
