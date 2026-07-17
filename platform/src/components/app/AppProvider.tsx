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
  AttendanceDay,
  Campus,
  DepthSlot,
  Game,
  LegalItemKey,
  Member,
  PlatformSnapshot,
  PlaybookEntry,
  PlayerGrade,
  Program,
  QuizItem,
  ResourceItem,
  Role,
  SafetyKey,
  StaffDuty,
  WeekNote,
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
  programOnCampus: boolean;
  role: Role | null;
  roleLabel: string;
  can: (perm: Permission) => boolean;
  invitableRoles: Role[];
  /** Coach team workspace helpers */
  activeWeek: number;
  activeUnitId: string;
  setActiveWeek: (week: number) => void;
  setActiveUnit: (unitId: string) => void;
  setActiveProgram: (id: string) => void;
  setActiveCampus: (id: string) => void;
  createProgram: (input: CreateProgramInput) => Program;
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
  updateDepthSlot: (id: string, patch: Partial<DepthSlot>) => void;
  swapDepthAthletes: (aId: string, bId: string) => void;
  upsertWeekNote: (note: Omit<WeekNote, "id"> & { id?: string }) => void;
  addPlaybookEntry: (entry: Omit<PlaybookEntry, "id">) => void;
  updatePlaybookEntry: (id: string, patch: Partial<PlaybookEntry>) => void;
  removePlaybookEntry: (id: string) => void;
  upsertQuiz: (quiz: Omit<QuizItem, "id"> & { id?: string }) => void;
  setQuizScore: (quizId: string, athleteId: string, score: number) => void;
  upsertGrade: (grade: Omit<PlayerGrade, "id"> & { id?: string }) => void;
  setAttendance: (
    date: string,
    records: AttendanceDay["records"],
  ) => void;
  addResource: (item: Omit<ResourceItem, "id">) => void;
  removeResource: (id: string) => void;
  upsertDuty: (duty: Omit<StaffDuty, "id"> & { id?: string }) => void;
  setPhilosophy: (text: string) => void;
  setInstall: (text: string) => void;
  updateGame: (id: string, patch: Partial<Game>) => void;
  addGame: (game: Omit<Game, "id">) => void;
  rollSeason: (nextSeasonLabel: string) => void;
  updateDistrict: (patch: { name?: string }) => void;
  setBrandLogoUrl: (url: string | null) => void;
  removeGame: (id: string) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
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
      team?: PlatformSnapshot["team"];
    };
    const needsMigrate =
      !snap0.activeCampusId ||
      !snap0.team?.depthSlots ||
      snap0.brandLogoUrl === undefined ||
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
  const templateForActive = configForSport(activeProgram.sport);
  const activeWeek =
    snap.team.activeWeekByProgram[activeProgram.id] ??
    activeGames.find((g) => !g.result)?.week ??
    1;
  const activeUnitId =
    snap.team.activeUnitByProgram[activeProgram.id] ??
    templateForActive.units[0]?.id ??
    "team";

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
    activeWeek,
    activeUnitId,
    setActiveWeek: (week) =>
      run(() => repo.setActiveWeek(activeProgram.id, week)),
    setActiveUnit: (unitId) =>
      run(() => repo.setActiveUnit(activeProgram.id, unitId)),
    setActiveProgram: (id) => run(() => repo.setActiveProgram(id)),
    setActiveCampus: (id) => run(() => repo.setActiveCampus(id)),
    createProgram: (input) => {
      let created!: Program;
      run(() => {
        created = repo.createProgram(input);
      });
      return created;
    },
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
    updateDepthSlot: (id, patch) => run(() => repo.updateDepthSlot(id, patch)),
    swapDepthAthletes: (a, b) => run(() => repo.swapDepthAthletes(a, b)),
    upsertWeekNote: (note) => run(() => repo.upsertWeekNote(note)),
    addPlaybookEntry: (e) => run(() => repo.addPlaybookEntry(e)),
    updatePlaybookEntry: (id, patch) =>
      run(() => repo.updatePlaybookEntry(id, patch)),
    removePlaybookEntry: (id) => run(() => repo.removePlaybookEntry(id)),
    upsertQuiz: (q) => run(() => repo.upsertQuiz(q)),
    setQuizScore: (qid, aid, score) =>
      run(() => repo.setQuizScore(qid, aid, score)),
    upsertGrade: (g) => run(() => repo.upsertGrade(g)),
    setAttendance: (date, records) =>
      run(() => repo.setAttendance(activeProgram.id, date, records)),
    addResource: (item) => run(() => repo.addResource(item)),
    removeResource: (id) => run(() => repo.removeResource(id)),
    upsertDuty: (d) => run(() => repo.upsertDuty(d)),
    setPhilosophy: (text) =>
      run(() => repo.setPhilosophy(activeProgram.id, activeUnitId, text)),
    setInstall: (text) =>
      run(() => repo.setInstall(activeProgram.id, activeUnitId, text)),
    updateGame: (id, patch) => run(() => repo.updateGame(id, patch)),
    addGame: (game) => run(() => repo.addGame(game)),
    rollSeason: (label) =>
      run(() => repo.rollSeason(activeProgram.id, label)),
    updateDistrict: (patch) => run(() => repo.updateDistrict(patch)),
    setBrandLogoUrl: (url) => run(() => repo.setBrandLogoUrl(url)),
    removeGame: (id) => run(() => repo.removeGame(id)),
    updateMember: (id, patch) => run(() => repo.updateMember(id, patch)),
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
    templateForActive,
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
