/**
 * Repository interface — implement with Supabase/API later.
 * Screens should only talk to AppState / this interface.
 */

import type {
  Athlete,
  LegalItemKey,
  PlatformSnapshot,
  Program,
  SafetyKey,
  SessionUser,
  SportId,
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
};

export type ImportAthleteRow = {
  name: string;
  jersey: string;
  classYear: string;
  pos: string;
  level: string;
};

export interface PlatformRepository {
  getSnapshot(): PlatformSnapshot;
  setActiveProgram(id: string): void;
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
  log(action: string, detail: string, actor?: string): void;
  setOnboardingStep(step: number): void;
  completeOnboarding(): void;
  updateOnboarding(patch: Partial<PlatformSnapshot["onboarding"]>): void;
  signIn(email: string): SessionUser;
  signOut(): void;
  exportProgramJson(programId: string): string;
  resetToSeed(): void;
}
