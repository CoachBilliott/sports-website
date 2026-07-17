/**
 * Repository interface — implement with Supabase/API later.
 * Screens should only talk to AppState / this interface.
 */

import type {
  Athlete,
  AttendanceDay,
  DepthSlot,
  Game,
  LegalItemKey,
  PlatformSnapshot,
  PlaybookEntry,
  PlayerGrade,
  Program,
  QuizItem,
  ResourceItem,
  SafetyKey,
  SessionUser,
  SportId,
  StaffDuty,
  WeekNote,
} from "./types";

export type CreateProgramInput = {
  name: string;
  sport: SportId;
  seasonLabel: string;
  levels?: string[];
  campusId: string;
};

export type InviteMemberInput = {
  name: string;
  email: string;
  role: SessionUser["role"];
  scope: string;
  programIds: string[];
  campusId?: string;
  reportsToId?: string;
};

export type ImportAthleteRow = {
  name: string;
  jersey: string;
  classYear: string;
  pos: string;
  level: string;
};

export type CreateAnnouncementInput = {
  title: string;
  body: string;
  audience: "staff" | "parent" | "public";
  programId: string;
  campusId?: string;
  dateLabel?: string;
};

export interface PlatformRepository {
  getSnapshot(): PlatformSnapshot;
  setActiveProgram(id: string): void;
  setActiveCampus(id: string): void;
  createProgram(input: CreateProgramInput): Program;
  updateProgram(id: string, patch: Partial<Program>): void;
  deleteProgram(id: string): void;
  setLegal(key: LegalItemKey, value: boolean): void;
  setSafety(key: SafetyKey, value: boolean): void;
  setSsoConnected(value: boolean): void;
  setDirectoryOptOut(athleteId: string, value: boolean): void;
  inviteMember(input: InviteMemberInput): void;
  removeMember(id: string): void;
  importAthletes(
    programId: string,
    rows: ImportAthleteRow[],
    mode: "merge" | "replace",
  ): void;
  addAthlete(programId: string, row: ImportAthleteRow): void;
  updateAthlete(id: string, patch: Partial<Athlete>): void;
  removeAthlete(id: string): void;
  addAnnouncement(input: CreateAnnouncementInput): void;
  /** Head-coach team workspace */
  setActiveWeek(programId: string, week: number): void;
  setActiveUnit(programId: string, unitId: string): void;
  updateDepthSlot(id: string, patch: Partial<DepthSlot>): void;
  swapDepthAthletes(aId: string, bId: string): void;
  upsertWeekNote(note: Omit<WeekNote, "id"> & { id?: string }): void;
  addPlaybookEntry(entry: Omit<PlaybookEntry, "id">): void;
  updatePlaybookEntry(id: string, patch: Partial<PlaybookEntry>): void;
  removePlaybookEntry(id: string): void;
  upsertQuiz(quiz: Omit<QuizItem, "id"> & { id?: string }): void;
  setQuizScore(quizId: string, athleteId: string, score: number): void;
  upsertGrade(grade: Omit<PlayerGrade, "id"> & { id?: string }): void;
  setAttendance(
    programId: string,
    date: string,
    records: AttendanceDay["records"],
  ): void;
  addResource(item: Omit<ResourceItem, "id">): void;
  removeResource(id: string): void;
  upsertDuty(duty: Omit<StaffDuty, "id"> & { id?: string }): void;
  setPhilosophy(programId: string, unitId: string, text: string): void;
  setInstall(programId: string, unitId: string, text: string): void;
  updateGame(id: string, patch: Partial<Game>): void;
  addGame(game: Omit<Game, "id">): void;
  log(action: string, detail: string, actor?: string): void;
  setOnboardingStep(step: number): void;
  completeOnboarding(): void;
  updateOnboarding(patch: Partial<PlatformSnapshot["onboarding"]>): void;
  signIn(email: string): SessionUser;
  switchToMember(memberId: string): SessionUser | null;
  signOut(): void;
  exportProgramJson(programId: string): string;
  resetToSeed(): void;
}
