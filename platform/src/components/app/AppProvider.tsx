"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { getMemoryRepository, resetMemoryRepository } from "@/lib/data/memory";
import type {
  CreateAnnouncementInput,
  CreateProgramInput,
  ImportAthleteRow,
  InviteMemberInput,
} from "@/lib/data/repository";
import type {
  Athlete,
  Campus,
  LegalItemKey,
  Member,
  PlatformSnapshot,
  Program,
  Role,
  SafetyKey,
} from "@/lib/data/types";
import {
  ROLE_LABEL,
  ROLE_SHORT,
  can,
  invitableRoles,
  type Permission,
} from "@/lib/data/org";
import { configForSport } from "@/lib/programConfig";

type AppContextValue = {
  snap: PlatformSnapshot;
  activeProgram: Program;
  activeCampus: Campus;
  activeAthletes: Athlete[];
  activeGames: PlatformSnapshot["games"];
  campusPrograms: Program[];
  /** True when the active team belongs to the working campus. */
  programOnCampus: boolean;
  role: Role | null;
  roleLabel: string;
  can: (perm: Permission) => boolean;
  invitableRoles: Role[];
  setActiveProgram: (id: string) => void;
  setActiveCampus: (id: string) => void;
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
  addAnnouncement: (input: CreateAnnouncementInput) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  updateOnboarding: (patch: Partial<PlatformSnapshot["onboarding"]>) => void;
  signIn: (email: string) => void;
  switchToMember: (memberId: string) => void;
  signOut: () => void;
  exportActiveProgram: () => void;
  resetToSeed: () => void;
  templateForActive: ReturnType<typeof configForSport>;
  membersByRole: (role: Role) => Member[];
};

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const repo = useMemo(() => {
    const r = getMemoryRepository();
    const snap0 = r.getSnapshot() as PlatformSnapshot & {
      members: { role: string }[];
    };
    const needsMigrate =
      !snap0.activeCampusId ||
      snap0.members.some(
        (m) =>
          (m.role as string) === "district_admin" ||
          (m.role as string) === "campus_ad",
      );
    return needsMigrate ? resetMemoryRepository() : r;
  }, []);
  const [, bump] = useReducer((n: number) => n + 1, 0);

  const run = useCallback((fn: () => void) => {
    fn();
    bump();
  }, []);

  const snap = repo.getSnapshot();
  const activeProgram =
    snap.programs.find((p) => p.id === snap.activeProgramId) ?? snap.programs[0]!;
  const activeCampus =
    snap.campuses.find((c) => c.id === snap.activeCampusId) ??
    snap.campuses.find((c) => c.id === activeProgram.campusId) ??
    snap.campuses[0]!;
  const campusPrograms = snap.programs.filter(
    (p) => p.campusId === activeCampus.id,
  );
  const programOnCampus = activeProgram.campusId === activeCampus.id;
  const activeAthletes = programOnCampus
    ? snap.athletes.filter((a) => a.programId === activeProgram.id)
    : [];
  const activeGames = programOnCampus
    ? snap.games.filter((g) => g.programId === activeProgram.id)
    : [];
  const role = snap.session?.role ?? null;

  const value: AppContextValue = {
    snap,
    activeProgram,
    activeCampus,
    activeAthletes,
    activeGames,
    campusPrograms,
    programOnCampus,
    role,
    roleLabel: role ? ROLE_LABEL[role] : "Signed out",
    can: (perm) => can(role, perm),
    invitableRoles: role ? invitableRoles(role) : [],
    setActiveProgram: (id) => run(() => repo.setActiveProgram(id)),
    setActiveCampus: (id) => run(() => repo.setActiveCampus(id)),
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
    addAnnouncement: (input) => run(() => repo.addAnnouncement(input)),
    setOnboardingStep: (step) => run(() => repo.setOnboardingStep(step)),
    completeOnboarding: () => run(() => repo.completeOnboarding()),
    updateOnboarding: (patch) => run(() => repo.updateOnboarding(patch)),
    signIn: (email) => run(() => repo.signIn(email)),
    switchToMember: (id) => run(() => repo.switchToMember(id)),
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
    membersByRole: (r) => snap.members.filter((m) => m.role === r),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { ROLE_LABEL, ROLE_SHORT };
