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
  StaffDuty,
  WeekNote,
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

  setActiveWeek(programId: string, week: number) {
    this.state.team.activeWeekByProgram = {
      ...this.state.team.activeWeekByProgram,
      [programId]: week,
    };
  }

  setActiveUnit(programId: string, unitId: string) {
    this.state.team.activeUnitByProgram = {
      ...this.state.team.activeUnitByProgram,
      [programId]: unitId,
    };
  }

  updateDepthSlot(id: string, patch: Partial<DepthSlot>) {
    this.state.team.depthSlots = this.state.team.depthSlots.map((s) =>
      s.id === id ? { ...s, ...patch, id: s.id } : s,
    );
    this.log("depth.update", `Updated depth slot ${id}`);
  }

  swapDepthAthletes(aId: string, bId: string) {
    const a = this.state.team.depthSlots.find((s) => s.id === aId);
    const b = this.state.team.depthSlots.find((s) => s.id === bId);
    if (!a || !b) return;
    const aAth = a.athleteId;
    this.state.team.depthSlots = this.state.team.depthSlots.map((s) => {
      if (s.id === aId) return { ...s, athleteId: b.athleteId };
      if (s.id === bId) return { ...s, athleteId: aAth };
      return s;
    });
    this.log("depth.swap", "Swapped depth chart athletes");
  }

  upsertWeekNote(note: Omit<WeekNote, "id"> & { id?: string }) {
    const id = note.id ?? `wn-${Date.now()}`;
    const next = { ...note, id };
    const exists = this.state.team.weekNotes.some((n) => n.id === id);
    this.state.team.weekNotes = exists
      ? this.state.team.weekNotes.map((n) => (n.id === id ? next : n))
      : [next, ...this.state.team.weekNotes];
    this.log("weekNote.upsert", next.title);
  }

  addPlaybookEntry(entry: Omit<PlaybookEntry, "id">) {
    const item = { ...entry, id: `pb-${Date.now()}` };
    this.state.team.playbook = [item, ...this.state.team.playbook];
    this.log("playbook.add", item.title);
  }

  updatePlaybookEntry(id: string, patch: Partial<PlaybookEntry>) {
    this.state.team.playbook = this.state.team.playbook.map((p) =>
      p.id === id ? { ...p, ...patch, id: p.id } : p,
    );
  }

  removePlaybookEntry(id: string) {
    this.state.team.playbook = this.state.team.playbook.filter((p) => p.id !== id);
    this.log("playbook.remove", id);
  }

  upsertQuiz(quiz: Omit<QuizItem, "id"> & { id?: string }) {
    const id = quiz.id ?? `qz-${Date.now()}`;
    const next = { ...quiz, id, scores: quiz.scores ?? [] };
    const exists = this.state.team.quizzes.some((q) => q.id === id);
    this.state.team.quizzes = exists
      ? this.state.team.quizzes.map((q) => (q.id === id ? next : q))
      : [next, ...this.state.team.quizzes];
    this.log("quiz.upsert", next.title);
  }

  setQuizScore(quizId: string, athleteId: string, score: number) {
    this.state.team.quizzes = this.state.team.quizzes.map((q) => {
      if (q.id !== quizId) return q;
      const scores = q.scores.filter((s) => s.athleteId !== athleteId);
      scores.push({ athleteId, score });
      return { ...q, scores };
    });
  }

  upsertGrade(grade: Omit<PlayerGrade, "id"> & { id?: string }) {
    const existing = this.state.team.grades.find(
      (g) =>
        g.athleteId === grade.athleteId &&
        g.week === grade.week &&
        g.programId === grade.programId,
    );
    const id = grade.id ?? existing?.id ?? `gr-${Date.now()}`;
    const next = { ...grade, id };
    this.state.team.grades = existing
      ? this.state.team.grades.map((g) => (g.id === existing.id ? next : g))
      : [...this.state.team.grades, next];
    this.log("grade.upsert", `Week ${grade.week} grade`);
  }

  setAttendance(
    programId: string,
    date: string,
    records: AttendanceDay["records"],
  ) {
    const existing = this.state.team.attendance.find(
      (a) => a.programId === programId && a.date === date,
    );
    if (existing) {
      this.state.team.attendance = this.state.team.attendance.map((a) =>
        a.id === existing.id ? { ...a, records } : a,
      );
    } else {
      this.state.team.attendance = [
        { id: `att-${Date.now()}`, programId, date, records },
        ...this.state.team.attendance,
      ];
    }
    this.log("attendance.set", `${date} · ${records.length} athletes`);
  }

  addResource(item: Omit<ResourceItem, "id">) {
    const next = { ...item, id: `res-${Date.now()}` };
    this.state.team.resources = [next, ...this.state.team.resources];
    this.log("resource.add", next.name);
  }

  removeResource(id: string) {
    this.state.team.resources = this.state.team.resources.filter((r) => r.id !== id);
  }

  upsertDuty(duty: Omit<StaffDuty, "id"> & { id?: string }) {
    const id = duty.id ?? `duty-${Date.now()}`;
    const next = { ...duty, id };
    const exists = this.state.team.duties.some((d) => d.id === id);
    this.state.team.duties = exists
      ? this.state.team.duties.map((d) => (d.id === id ? next : d))
      : [next, ...this.state.team.duties];
  }

  setPhilosophy(programId: string, unitId: string, text: string) {
    this.state.team.philosophy = {
      ...this.state.team.philosophy,
      [`${programId}:${unitId}`]: text,
    };
    this.log("philosophy.update", unitId);
  }

  setInstall(programId: string, unitId: string, text: string) {
    this.state.team.install = {
      ...this.state.team.install,
      [`${programId}:${unitId}`]: text,
    };
    this.log("install.update", unitId);
  }

  updateGame(id: string, patch: Partial<Game>) {
    this.state.games = this.state.games.map((g) =>
      g.id === id ? { ...g, ...patch, id: g.id } : g,
    );
    this.log("game.update", id);
  }

  addGame(game: Omit<Game, "id">) {
    const next = { ...game, id: `game-${Date.now()}` };
    this.state.games = [...this.state.games, next].sort((a, b) => a.week - b.week);
    this.log("game.add", `${next.opponent} W${next.week}`);
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
