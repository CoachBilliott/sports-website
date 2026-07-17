"use client";

import { createSeedSnapshot } from "./seed";
import type {
  CreateAnnouncementInput,
  CreateProgramInput,
  ImportAthleteRow,
  InviteMemberInput,
  PlatformRepository,
} from "./repository";
import type {
  Athlete,
  LegalItemKey,
  PlatformSnapshot,
  Program,
  SafetyKey,
  SessionUser,
} from "./types";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** In-memory client store. Replace with API-backed repo later. */
export class MemoryRepository implements PlatformRepository {
  private state: PlatformSnapshot;

  constructor(seed: PlatformSnapshot = createSeedSnapshot()) {
    this.state = structuredClone(seed);
  }

  getSnapshot(): PlatformSnapshot {
    return this.state;
  }

  private touch(actor = this.state.session?.name ?? "System") {
    return actor;
  }

  log(action: string, detail: string, actor?: string) {
    this.state.audit = [
      {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        at: new Date().toISOString(),
        actor: actor ?? this.touch(),
        action,
        detail,
      },
      ...this.state.audit,
    ];
  }

  setActiveProgram(id: string) {
    if (!this.state.programs.some((p) => p.id === id)) return;
    this.state.activeProgramId = id;
    const p = this.state.programs.find((x) => x.id === id);
    if (p) this.state.activeCampusId = p.campusId;
    this.log("program.activate", `Active program → ${p?.name ?? id}`);
  }

  setActiveCampus(id: string) {
    if (!this.state.campuses.some((c) => c.id === id)) return;
    this.state.activeCampusId = id;
    const onCampus = this.state.programs.filter((p) => p.campusId === id);
    if (onCampus.length && !onCampus.some((p) => p.id === this.state.activeProgramId)) {
      this.state.activeProgramId = onCampus[0]!.id;
    }
    const c = this.state.campuses.find((x) => x.id === id);
    this.log("campus.activate", `Active campus → ${c?.short ?? id}`);
  }

  createProgram(input: CreateProgramInput): Program {
    const program: Program = {
      id: `prog-${input.sport}-${Date.now()}`,
      campusId: input.campusId,
      name: input.name.trim() || input.sport,
      sport: input.sport,
      seasonLabel: input.seasonLabel || "2026",
      slug: slugify(input.name || input.sport),
      levels: input.levels?.length ? input.levels : ["Varsity"],
      athleteCount: 0,
      staffCount: 0,
    };
    this.state.programs = [...this.state.programs, program];
    this.state.activeProgramId = program.id;
    this.state.activeCampusId = input.campusId;
    this.log(
      "program.create",
      `Created ${program.name} · ${program.sport} · ${program.seasonLabel}`,
    );
    return program;
  }

  updateProgram(id: string, patch: Partial<Program>) {
    this.state.programs = this.state.programs.map((p) =>
      p.id === id ? { ...p, ...patch, id: p.id } : p,
    );
    this.log("program.update", `Updated program ${id}`);
  }

  deleteProgram(id: string) {
    if (this.state.programs.length <= 1) return;
    const prog = this.state.programs.find((p) => p.id === id);
    this.state.programs = this.state.programs.filter((p) => p.id !== id);
    this.state.athletes = this.state.athletes.filter((a) => a.programId !== id);
    this.state.games = this.state.games.filter((g) => g.programId !== id);
    this.state.announcements = this.state.announcements.filter(
      (a) => a.programId !== id,
    );
    if (this.state.activeProgramId === id) {
      this.state.activeProgramId = this.state.programs[0]!.id;
    }
    this.log("program.delete", `Offboarded ${prog?.name ?? id}`);
  }

  setLegal(key: LegalItemKey, value: boolean) {
    this.state.legal = { ...this.state.legal, [key]: value };
    this.log("legal.update", `${key} → ${value ? "done" : "open"}`);
  }

  setSafety(key: SafetyKey, value: boolean) {
    this.state.safety = { ...this.state.safety, [key]: value };
    this.log("safety.update", `${key} → ${value ? "on" : "off"}`);
  }

  setSsoConnected(value: boolean) {
    this.state.ssoConnected = value;
    this.log("sso.update", value ? "SSO connected" : "SSO disconnected");
  }

  setDirectoryOptOut(athleteId: string, value: boolean) {
    this.state.athletes = this.state.athletes.map((a) =>
      a.id === athleteId ? { ...a, directoryOptOut: value } : a,
    );
    this.log(
      "directory.opt_out",
      `${athleteId} → ${value ? "hidden on Fan" : "visible on Fan"}`,
    );
  }

  inviteMember(input: InviteMemberInput) {
    this.state.members = [
      ...this.state.members,
      {
        id: `m-${Date.now()}`,
        name: input.name,
        email: input.email,
        role: input.role,
        scope: input.scope,
        campusId: input.campusId,
        programIds: input.programIds,
        status: "invited",
        reportsToId: input.reportsToId ?? this.state.session?.id,
      },
    ];
    this.log("member.invite", `Invited ${input.email} as ${input.role}`);
  }

  removeMember(id: string) {
    const m = this.state.members.find((x) => x.id === id);
    this.state.members = this.state.members.filter((x) => x.id !== id);
    this.log("member.remove", `Removed ${m?.email ?? id}`);
  }

  importAthletes(
    programId: string,
    rows: ImportAthleteRow[],
    mode: "merge" | "replace",
  ) {
    if (mode === "replace") {
      this.state.athletes = this.state.athletes.filter(
        (a) => a.programId !== programId,
      );
    }
    const existing = new Set(
      this.state.athletes
        .filter((a) => a.programId === programId)
        .map((a) => a.jersey),
    );
    const next: Athlete[] = rows
      .filter((r) => mode === "replace" || !existing.has(r.jersey))
      .map((r, i) => ({
        id: `${programId}-imp-${Date.now()}-${i}`,
        programId,
        jersey: r.jersey,
        name: r.name,
        pos: r.pos,
        classYear: r.classYear,
        level: r.level,
        directoryOptOut: false,
      }));
    this.state.athletes = [...this.state.athletes, ...next];
    this.recalcCounts(programId);
    this.log(
      "roster.import",
      `${mode} import · ${rows.length} rows → ${next.length} added`,
    );
  }

  addAthlete(programId: string, row: ImportAthleteRow) {
    this.state.athletes = [
      ...this.state.athletes,
      {
        id: `${programId}-ath-${Date.now()}`,
        programId,
        jersey: row.jersey,
        name: row.name,
        pos: row.pos,
        classYear: row.classYear,
        level: row.level,
        directoryOptOut: false,
      },
    ];
    this.recalcCounts(programId);
    this.log("roster.add", `Added #${row.jersey} ${row.name}`);
  }

  updateAthlete(id: string, patch: Partial<Athlete>) {
    this.state.athletes = this.state.athletes.map((a) =>
      a.id === id ? { ...a, ...patch, id: a.id } : a,
    );
    this.log("roster.update", `Updated athlete ${id}`);
  }

  removeAthlete(id: string) {
    const a = this.state.athletes.find((x) => x.id === id);
    this.state.athletes = this.state.athletes.filter((x) => x.id !== id);
    if (a) this.recalcCounts(a.programId);
    this.log("roster.remove", `Removed athlete ${a?.name ?? id}`);
  }

  addAnnouncement(input: CreateAnnouncementInput) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    this.state.announcements = [
      {
        id: `ann-${Date.now()}`,
        programId: input.programId,
        campusId: input.campusId,
        dateLabel: input.dateLabel ?? days[new Date().getDay()]!,
        title: input.title,
        body: input.body,
        audience: input.audience,
      },
      ...this.state.announcements,
    ];
    this.log("announcement.create", input.title);
  }

  private recalcCounts(programId: string) {
    const count = this.state.athletes.filter((a) => a.programId === programId)
      .length;
    this.state.programs = this.state.programs.map((p) =>
      p.id === programId ? { ...p, athleteCount: count } : p,
    );
  }

  setOnboardingStep(step: number) {
    this.state.onboarding = { ...this.state.onboarding, step };
  }

  completeOnboarding() {
    this.state.onboarding = { ...this.state.onboarding, completed: true };
    this.log("onboarding.complete", "Program onboarding marked complete");
  }

  updateOnboarding(patch: Partial<PlatformSnapshot["onboarding"]>) {
    this.state.onboarding = { ...this.state.onboarding, ...patch };
  }

  signIn(email: string): SessionUser {
    const member = this.state.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase(),
    );
    const session: SessionUser = member
      ? {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          districtId: this.state.district.id,
          campusId: member.campusId ?? this.state.activeCampusId,
        }
      : {
          id: "u-guest",
          name: email.split("@")[0] || "User",
          email,
          role: "athletic_campus_coordinator",
          districtId: this.state.district.id,
          campusId: this.state.activeCampusId,
        };
    this.state.session = session;
    this.state.activeCampusId = session.campusId;
    const onCampus = this.state.programs.filter(
      (p) => p.campusId === session.campusId,
    );
    if (onCampus.length) this.state.activeProgramId = onCampus[0]!.id;
    this.log("auth.signin", `Signed in as ${session.role}`, session.name);
    return session;
  }

  switchToMember(memberId: string): SessionUser | null {
    const member = this.state.members.find((m) => m.id === memberId);
    if (!member) return null;
    const session: SessionUser = {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      districtId: this.state.district.id,
      campusId: member.campusId ?? this.state.activeCampusId,
    };
    this.state.session = session;
    this.state.activeCampusId = session.campusId;
    const onCampus = this.state.programs.filter(
      (p) => p.campusId === session.campusId,
    );
    if (onCampus.length) this.state.activeProgramId = onCampus[0]!.id;
    this.log(
      "auth.preview",
      `Previewing as ${member.role} · ${member.name}`,
      member.name,
    );
    return session;
  }

  signOut() {
    const email = this.state.session?.email;
    this.state.session = null;
    this.log("auth.signout", `Signed out ${email ?? ""}`, "System");
  }

  exportProgramJson(programId: string): string {
    const program = this.state.programs.find((p) => p.id === programId);
    const payload = {
      exportedAt: new Date().toISOString(),
      program,
      athletes: this.state.athletes.filter((a) => a.programId === programId),
      games: this.state.games.filter((g) => g.programId === programId),
      members: this.state.members.filter((m) => m.programIds.includes(programId)),
    };
    this.log("data.export", `Exported ${program?.name ?? programId}`);
    return JSON.stringify(payload, null, 2);
  }

  resetToSeed() {
    this.state = createSeedSnapshot();
  }
}

let singleton: MemoryRepository | null = null;

export function getMemoryRepository() {
  if (!singleton) singleton = new MemoryRepository();
  return singleton;
}

/** Force a fresh seed (e.g. after role model changes in dev). */
export function resetMemoryRepository() {
  singleton = new MemoryRepository();
  return singleton;
}
