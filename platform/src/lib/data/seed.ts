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
import { CYFAIR_CAMPUSES } from "./org";
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

const FIRST = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn",
  "Sam", "Jamie", "Cameron", "Drew", "Reese", "Skyler", "Parker", "Blake",
];
const LAST = [
  "Nguyen", "Patel", "Garcia", "Brooks", "Chen", "Rivera", "Walsh", "Torres",
  "Kim", "Foster", "Hayes", "Price", "Coleman", "Bennett", "Reed", "Ortiz",
];

function person(i: number) {
  return `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`;
}

function email(name: string, tag: string) {
  return `${name.toLowerCase().replace(/\s+/g, ".")}.${tag}@cyfair.isd.demo`;
}

export function createSeedSnapshot(): PlatformSnapshot {
  const districtId = "dist-cyfair";
  const campuses = CYFAIR_CAMPUSES.map((c) => ({
    id: c.id,
    districtId,
    name: c.name,
    mascot: c.mascot,
    short: c.short,
  }));

  const cyCreek = campuses[0]!;

  const fb: Program = {
    id: "prog-fb-2026",
    campusId: cyCreek.id,
    name: "Football",
    sport: "football",
    seasonLabel: "2026",
    slug: "football",
    levels: ["Varsity", "JV", "Freshman"],
    maxPrepsUrl:
      "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/",
    athleteCount: FOOTBALL_ROSTER.length,
    staffCount: 4,
  };
  const vb: Program = {
    id: "prog-vb-2026",
    campusId: cyCreek.id,
    name: "Volleyball",
    sport: "volleyball",
    seasonLabel: "2026",
    slug: "volleyball",
    levels: ["Varsity", "JV"],
    athleteCount: VOLLEYBALL_ROSTER.length,
    staffCount: 2,
  };

  const dads: Member[] = [0, 1].map((i) => ({
    id: `dad-${i}`,
    name: person(i),
    email: email(person(i), "dad"),
    role: "district_athletic_director" as const,
    scope: "Cy-Fair ISD Athletics",
    programIds: [],
    status: "active" as const,
  }));

  const aads: Member[] = [2, 3, 4, 5].map((i, idx) => ({
    id: `aad-${idx}`,
    name: person(i),
    email: email(person(i), "aad"),
    role: "associate_athletic_director" as const,
    scope: "Cy-Fair ISD Athletics",
    programIds: [],
    status: "active" as const,
    reportsToId: dads[idx % 2]!.id,
  }));

  const dacs: Member[] = [6, 7].map((i, idx) => ({
    id: `dac-${idx}`,
    name: person(i),
    email: email(person(i), "dac"),
    role: "district_athletic_coordinator" as const,
    scope: "Cy-Fair ISD Athletics",
    programIds: [],
    status: "active" as const,
    reportsToId: aads[idx]!.id,
  }));

  const campusCoords: Member[] = campuses.map((c, idx) => ({
    id: `acc-${c.id}`,
    name: person(8 + idx),
    email: email(person(8 + idx), "acc"),
    role: "athletic_campus_coordinator" as const,
    scope: c.short,
    campusId: c.id,
    programIds: c.id === cyCreek.id ? [fb.id, vb.id] : [],
    status: "active" as const,
    reportsToId: dacs[idx % 2]!.id,
  }));

  const asstCoords: Member[] = campuses.map((c, idx) => ({
    id: `aacc-${c.id}`,
    name: person(20 + idx),
    email: email(person(20 + idx), "aacc"),
    role: "assistant_athletic_campus_coordinator" as const,
    scope: c.short,
    campusId: c.id,
    programIds: c.id === cyCreek.id ? [fb.id, vb.id] : [],
    status: "active" as const,
    reportsToId: `acc-${c.id}`,
  }));

  const coaches: Member[] = [
    {
      id: "hc-fb",
      name: "Coach Billiott",
      email: "cbilliott@cyfair.isd.demo",
      role: "head_coach",
      scope: "Cy Creek Football",
      campusId: cyCreek.id,
      programIds: [fb.id],
      status: "active",
      reportsToId: `acc-${cyCreek.id}`,
    },
    {
      id: "c-off",
      name: "Maria Santos",
      email: "msantos@cyfair.isd.demo",
      role: "coach",
      scope: "Football · Offense",
      campusId: cyCreek.id,
      programIds: [fb.id],
      status: "active",
      reportsToId: "hc-fb",
    },
    {
      id: "c-def",
      name: "Chris Nguyen",
      email: "cnguyen@cyfair.isd.demo",
      role: "coach",
      scope: "Football · Defense",
      campusId: cyCreek.id,
      programIds: [fb.id],
      status: "active",
      reportsToId: "hc-fb",
    },
    {
      id: "hc-vb",
      name: "Alicia Brooks",
      email: "abrooks@cyfair.isd.demo",
      role: "head_coach",
      scope: "Cy Creek Volleyball",
      campusId: cyCreek.id,
      programIds: [vb.id],
      status: "active",
      reportsToId: `acc-${cyCreek.id}`,
    },
    {
      id: "parent-1",
      name: "Parent Demo",
      email: "parent@demo.local",
      role: "parent",
      scope: "Linked athletes",
      campusId: cyCreek.id,
      programIds: [fb.id],
      status: "invited",
    },
  ];

  const members: Member[] = [
    ...dads,
    ...aads,
    ...dacs,
    ...campusCoords,
    ...asstCoords,
    ...coaches,
  ];

  const now = Date.now();
  const audit: AuditEvent[] = [
    {
      id: "a1",
      at: new Date(now - 86400000 * 2).toISOString(),
      actor: dads[0]!.name,
      action: "auth.signin",
      detail: "District Athletic Director signed in",
    },
    {
      id: "a2",
      at: new Date(now - 86400000).toISOString(),
      actor: campusCoords[0]!.name,
      action: "program.create",
      detail: "Cy Creek · Volleyball 2026 ready",
    },
    {
      id: "a3",
      at: new Date(now - 3600000).toISOString(),
      actor: aads[0]!.name,
      action: "safety.update",
      detail: "Confirmed Fan directory minimization district-wide",
    },
  ];

  return {
    district: { id: districtId, name: "Cy-Fair ISD" },
    campuses,
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
    announcements: PARENT_ANNOUNCEMENTS.map((a) => ({
      id: a.id,
      programId: fb.id,
      campusId: cyCreek.id,
      dateLabel: a.date,
      title: a.title,
      body: a.body,
      audience: "parent" as const,
    })),
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
      id: dads[0]!.id,
      name: dads[0]!.name,
      email: dads[0]!.email,
      role: "district_athletic_director",
      districtId,
      campusId: cyCreek.id,
    },
    activeProgramId: fb.id,
    activeCampusId: cyCreek.id,
    ssoConnected: false,
  };
}
