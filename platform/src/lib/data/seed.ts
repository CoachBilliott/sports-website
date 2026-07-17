import type {
  Athlete,
  AuditEvent,
  Game,
  LegalItemKey,
  Member,
  PlatformSnapshot,
  Program,
  SafetyKey,
} from "./types";
import {
  FOOTBALL_ROSTER,
  FOOTBALL_SCHEDULE,
  PARENT_ANNOUNCEMENTS,
  VOLLEYBALL_ROSTER,
  VOLLEYBALL_SCHEDULE,
} from "@/lib/demoContent";

const legalDefaults = (): Record<LegalItemKey, boolean> => ({
  entityFormed: false,
  dpaTemplate: false,
  ferpaNotice: false,
  ppraReview: false,
  hipaaScope: true,
  ssoReady: false,
  encryption: false,
  auditLogging: true,
  exportDelete: true,
  cyberInsurance: false,
  soc2: false,
  vpat: false,
  subprocessors: false,
});

const safetyDefaults = (): Record<SafetyKey, boolean> => ({
  minimizePublicFields: true,
  blockGradesOnFan: true,
  blockContactsOnFan: true,
  blockScoutOnParent: true,
  honorDirectoryOptOut: true,
  requireStaffRoleForGrades: true,
  logExportsAndDeletes: true,
  noPhiStorage: true,
});

function athletesFrom(
  programId: string,
  rows: { jersey: string; name: string; pos: string; classYear: string; level?: string }[],
): Athlete[] {
  return rows.map((r, i) => ({
    id: `${programId}-ath-${i}`,
    programId,
    jersey: r.jersey,
    name: r.name,
    pos: r.pos,
    classYear: r.classYear,
    level: r.level ?? "Varsity",
    directoryOptOut: false,
  }));
}

function gamesFrom(
  programId: string,
  rows: {
    week: number;
    date: string;
    time: string;
    opponent: string;
    homeAway: "Home" | "Away";
    result: string | null;
    venue?: string;
  }[],
): Game[] {
  return rows.map((g, i) => ({
    id: `${programId}-game-${i}`,
    programId,
    ...g,
  }));
}

export function createSeedSnapshot(): PlatformSnapshot {
  const fb: Program = {
    id: "prog-fb-2026",
    campusId: "camp-cycreek",
    name: "Football",
    sport: "football",
    seasonLabel: "2026",
    slug: "football",
    levels: ["Varsity", "JV", "Freshman"],
    maxPrepsUrl: "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/",
    athleteCount: FOOTBALL_ROSTER.length,
    staffCount: 4,
  };
  const vb: Program = {
    id: "prog-vb-2026",
    campusId: "camp-cycreek",
    name: "Volleyball",
    sport: "volleyball",
    seasonLabel: "2026",
    slug: "volleyball",
    levels: ["Varsity", "JV"],
    athleteCount: VOLLEYBALL_ROSTER.length,
    staffCount: 2,
  };

  const members: Member[] = [
    {
      id: "m1",
      name: "Jordan Hale",
      email: "jhale@cyfair.isd.demo",
      role: "campus_ad",
      scope: "Cypress Creek",
      programIds: [fb.id, vb.id],
      status: "active",
    },
    {
      id: "m2",
      name: "Coach Billiott",
      email: "cbilliott@cyfair.isd.demo",
      role: "head_coach",
      scope: "Football",
      programIds: [fb.id],
      status: "active",
    },
    {
      id: "m3",
      name: "Maria Santos",
      email: "msantos@cyfair.isd.demo",
      role: "coach",
      scope: "Football · Offense",
      programIds: [fb.id],
      status: "active",
    },
    {
      id: "m4",
      name: "Chris Nguyen",
      email: "cnguyen@cyfair.isd.demo",
      role: "coach",
      scope: "Football · Defense",
      programIds: [fb.id],
      status: "active",
    },
    {
      id: "m5",
      name: "Alicia Brooks",
      email: "abrooks@cyfair.isd.demo",
      role: "head_coach",
      scope: "Volleyball",
      programIds: [vb.id],
      status: "active",
    },
    {
      id: "m6",
      name: "Sam Ortiz",
      email: "sortiz@cyfair.isd.demo",
      role: "district_admin",
      scope: "Cy-Fair ISD",
      programIds: [fb.id, vb.id],
      status: "active",
    },
    {
      id: "m7",
      name: "Parent Demo",
      email: "parent@demo.local",
      role: "parent",
      scope: "Linked athletes",
      programIds: [fb.id],
      status: "invited",
    },
  ];

  const now = Date.now();
  const audit: AuditEvent[] = [
    {
      id: "a1",
      at: new Date(now - 86400000 * 2).toISOString(),
      actor: "Sam Ortiz",
      action: "login",
      detail: "Signed in as district admin",
    },
    {
      id: "a2",
      at: new Date(now - 86400000).toISOString(),
      actor: "Jordan Hale",
      action: "program.create",
      detail: "Created Volleyball 2026",
    },
    {
      id: "a3",
      at: new Date(now - 3600000).toISOString(),
      actor: "Sam Ortiz",
      action: "safety.update",
      detail: "Confirmed Fan directory minimization",
    },
  ];

  return {
    district: { id: "dist-cyfair", name: "Cy-Fair ISD" },
    campuses: [
      {
        id: "camp-cycreek",
        districtId: "dist-cyfair",
        name: "Cypress Creek High School",
        mascot: "Cougars",
      },
      {
        id: "camp-cywoods",
        districtId: "dist-cyfair",
        name: "Cy Woods High School",
        mascot: "Wildcats",
      },
      {
        id: "camp-langham",
        districtId: "dist-cyfair",
        name: "Langham Creek High School",
        mascot: "Lobos",
      },
    ],
    programs: [fb, vb],
    members,
    athletes: [
      ...athletesFrom(fb.id, FOOTBALL_ROSTER),
      ...athletesFrom(vb.id, VOLLEYBALL_ROSTER),
    ],
    games: [
      ...gamesFrom(fb.id, FOOTBALL_SCHEDULE),
      ...gamesFrom(vb.id, VOLLEYBALL_SCHEDULE),
    ],
    announcements: PARENT_ANNOUNCEMENTS.map((a, i) => ({
      id: a.id,
      programId: fb.id,
      dateLabel: a.date,
      title: a.title,
      body: a.body,
      audience: "parent" as const,
    })).concat(
      PARENT_ANNOUNCEMENTS.slice(0, 2).map((a, i) => ({
        id: `vb-${a.id}`,
        programId: vb.id,
        dateLabel: a.date,
        title: a.title.replace("Bridgeland", "Langham Creek"),
        body: a.body,
        audience: "parent" as const,
      })),
    ),
    audit,
    legal: legalDefaults(),
    safety: safetyDefaults(),
    onboarding: {
      step: 0,
      completed: true,
      programName: "Football",
      sport: "football",
      levels: ["Varsity", "JV", "Freshman"],
      staffEmails: [],
      maxPrepsUrl: fb.maxPrepsUrl ?? "",
    },
    session: {
      id: "u-admin",
      name: "Sam Ortiz",
      email: "sortiz@cyfair.isd.demo",
      role: "district_admin",
      districtId: "dist-cyfair",
      campusId: "camp-cycreek",
    },
    activeProgramId: fb.id,
    ssoConnected: false,
  };
}
