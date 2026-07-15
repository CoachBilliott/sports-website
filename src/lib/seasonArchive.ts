/**
 * Season archive seed data, snapshot shape, and import category helpers.
 * AppState owns live season state; this module seeds the demo 2025 archive
 * and describes what coordinators/admins can pull into the live season.
 */

import {
  athletes,
  depthBoards,
  depthSchemes,
  emptyAthleteCustomFields,
  grades as seedGrades,
  MIN_DEPTH_ROWS,
  normalizeDepthBoardRows,
  cloneDepthBoard,
  syncDepthBoardRows,
  teamLevels,
  type Athlete,
  type DepthChartBoard,
  type UnitGoal,
} from "@/lib/mock";
import type {
  Game,
  GradeRow,
  GroupChatMessage,
  PersonalTodo,
  Quiz,
  QuizAttempt,
  SeasonId,
  SeasonMeta,
  Side,
} from "@/lib/types";
import { buildGames2025FromMaxPreps } from "@/lib/maxpreps";

export type PositionScoutReport = {
  notes: string;
  fileName: string | null;
  updatedAt: string | null;
};

export type GameWeekAssets = {
  defenseScout: string | null;
  offenseScout: string | null;
  specialTeamsScout: string | null;
  offensePracticeMon: string | null;
  offensePracticeTue: string | null;
  offensePracticeWed: string | null;
  offensePracticeThu: string | null;
  offensePracticeFri: string | null;
  offensePracticeSat: string | null;
  defensePracticeMon: string | null;
  defensePracticeTue: string | null;
  defensePracticeWed: string | null;
  defensePracticeThu: string | null;
  defensePracticeFri: string | null;
  defensePracticeSat: string | null;
  specialTeamsPracticeMon: string | null;
  specialTeamsPracticeTue: string | null;
  specialTeamsPracticeWed: string | null;
  specialTeamsPracticeThu: string | null;
  specialTeamsPracticeFri: string | null;
  specialTeamsPracticeSat: string | null;
  offenseCallSheet: string | null;
  defenseCallSheet: string | null;
  specialTeamsCallSheet: string | null;
  offenseStats: string | null;
  defenseStats: string | null;
  specialTeamsStats: string | null;
};

export type GameMetaOverride = {
  opponent?: string;
  date?: string;
  time?: string;
  venue?: string;
  homeAway?: "Home" | "Away";
  result?: string | null;
  ourScore?: number | null;
  oppScore?: number | null;
  resultSource?: "maxpreps" | "manual" | null;
};

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

/** Snapshot of seasonal content archived on rollover (plus template goals). */
export type SeasonArchiveSnapshot = {
  /** Season-specific schedule (when set, replaces live mock template while viewing). */
  scheduleGames?: Game[];
  gameWeekAssets: Record<string, GameWeekAssets>;
  gameMetaOverrides: Record<string, GameMetaOverride>;
  disabledOptionalGames: Record<string, boolean>;
  positionScoutReports: Record<string, PositionScoutReport>;
  personalTodosByOwner: Record<string, PersonalTodo[]>;
  groupChatMessagesByGroup: Record<string, GroupChatMessage[]>;
  gradeRows: GradeRow[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  attendanceByDate: Record<string, Record<string, AttendanceStatus>>;
  depthBoards: Record<string, DepthChartBoard>;
  athleteCustomFields: Record<
    string,
    NonNullable<Athlete["customFields"]> | undefined
  >;
  athleteRecruitingFields: Record<
    string,
    NonNullable<Athlete["recruitingFields"]> | undefined
  >;
  /** Last season's unit goal templates (kept on live at rollover; stored for import). */
  offenseGoals: UnitGoal[];
  defenseGoals: UnitGoal[];
};

export type ArchivedSeason = SeasonMeta & {
  snapshot: SeasonArchiveSnapshot;
};

/** Domains that can be selectively imported from an archived season. */
export type ArchiveImportCategory =
  | "unitGoals"
  | "quizzes"
  | "depthBoards"
  | "scoutReports"
  | "weekAssets"
  | "scheduleMeta"
  | "recruitingFills"
  | "grades";

export type ArchiveImportMode = "merge" | "replace";

export type ArchiveImportSelection = {
  seasonId: SeasonId;
  categories: ArchiveImportCategory[];
  /** When set, limit side-scoped categories to this unit. */
  sideFilter?: Side | "all";
  mode: ArchiveImportMode;
};

export type ArchiveImportResult = {
  ok: boolean;
  imported: ArchiveImportCategory[];
  skipped: ArchiveImportCategory[];
  message: string;
};

export const ARCHIVE_IMPORT_CATEGORY_META: Record<
  ArchiveImportCategory,
  {
    label: string;
    description: string;
    /** Categories that are scoped by offense/defense/ST when sideFilter is set. */
    sideScoped: boolean;
  }
> = {
  unitGoals: {
    label: "Unit goal templates",
    description: "Offense / defense game-goal lists from last season.",
    sideScoped: true,
  },
  quizzes: {
    label: "Quizzes & question banks",
    description: "Weekly quizzes and questions (attempts are not imported).",
    sideScoped: true,
  },
  depthBoards: {
    label: "Depth chart placements",
    description: "Player placements on depth boards (scheme columns stay).",
    sideScoped: true,
  },
  scoutReports: {
    label: "Position scout notes",
    description: "Per-group scout report notes and attached file names.",
    sideScoped: true,
  },
  weekAssets: {
    label: "Week file slots",
    description:
      "Scout / practice / call-sheet / stats filenames on the schedule.",
    sideScoped: true,
  },
  scheduleMeta: {
    label: "Schedule meta overrides",
    description: "Opponent, date, time, and venue overrides from last year.",
    sideScoped: false,
  },
  recruitingFills: {
    label: "Recruiting sheet fills",
    description: "Recruiting column values by athlete (structure stays).",
    sideScoped: false,
  },
  grades: {
    label: "Grade rows",
    description: "Player practice / game / pride grade entries.",
    sideScoped: true,
  },
};

export function emptyGameWeekAssets(): GameWeekAssets {
  return {
    defenseScout: null,
    offenseScout: null,
    specialTeamsScout: null,
    offensePracticeMon: null,
    offensePracticeTue: null,
    offensePracticeWed: null,
    offensePracticeThu: null,
    offensePracticeFri: null,
    offensePracticeSat: null,
    defensePracticeMon: null,
    defensePracticeTue: null,
    defensePracticeWed: null,
    defensePracticeThu: null,
    defensePracticeFri: null,
    defensePracticeSat: null,
    specialTeamsPracticeMon: null,
    specialTeamsPracticeTue: null,
    specialTeamsPracticeWed: null,
    specialTeamsPracticeThu: null,
    specialTeamsPracticeFri: null,
    specialTeamsPracticeSat: null,
    offenseCallSheet: null,
    defenseCallSheet: null,
    specialTeamsCallSheet: null,
    offenseStats: null,
    defenseStats: null,
    specialTeamsStats: null,
  };
}

export function scoutReportKey(side: Side, group: string, gameId?: string) {
  if (gameId) return `${side}::${group}::${gameId}`;
  return `${side}::${group}`;
}

const offense2025Goals: UnitGoal[] = [
  { id: "off-2025-1", text: "Win the football game." },
  { id: "off-2025-2", text: "Score 28+ points." },
  { id: "off-2025-3", text: "Convert 45%+ on 3rd down." },
  { id: "off-2025-4", text: "Zero turnovers." },
  { id: "off-2025-5", text: "250+ total yards before half." },
  { id: "off-2025-6", text: "Score on every red-zone trip." },
  { id: "off-2025-7", text: "No three-and-outs after a score." },
  { id: "off-2025-8", text: "Win explosive-play battle (15+)." },
];

const defense2025Goals: UnitGoal[] = [
  { id: "def-2025-1", text: "Win the football game." },
  { id: "def-2025-2", text: "Hold opponent under 14 points." },
  { id: "def-2025-3", text: "Create 2+ turnovers." },
  { id: "def-2025-4", text: "70%+ stop rate on 3rd down." },
  { id: "def-2025-5", text: "Less than 275 total yards allowed." },
  { id: "def-2025-6", text: "No 100-yard rusher." },
  { id: "def-2025-7", text: "Force one 3-and-out after every score." },
  { id: "def-2025-8", text: "Zero touchdowns on explosive (25+) plays." },
];

const quizzes2025: Quiz[] = [
  {
    id: "arch-2025-q1",
    title: "2025 W1 Defense — Base fronts & fits",
    side: "defense",
    week: 1,
    gameId: "w1",
    due: "Mon · before AP",
    assignedGroups: ["DL", "LB", "DB"],
    status: "assigned",
    passingScore: 80,
    generatedAt: null,
    generationSource: "coach",
    questions: [
      {
        id: "arch-2025-q1-a",
        prompt: "Our base front vs 11 personnel is:",
        options: ["Even front", "Odd front / 3-down", "Goal-line only", "Nickel only"],
        correctIndex: 1,
        source: "coach",
        explanation: "2025 install kept odd front as week-1 base.",
      },
      {
        id: "arch-2025-q1-b",
        prompt: "Mike's first key on run strength is:",
        options: [
          "QB eyes",
          "Guard / center mesh",
          "Boundary safety",
          "Sideline only",
        ],
        correctIndex: 1,
        source: "coach",
      },
      {
        id: "arch-2025-q1-c",
        prompt: "On stretch away, backside end should:",
        options: [
          "Chase deep for sack",
          "Squeeze, then pursue flat",
          "Drop to hook",
          "Spy only",
        ],
        correctIndex: 1,
        source: "ai",
      },
    ],
  },
  {
    id: "arch-2025-q2",
    title: "2025 W1 Offense — Zone & protection",
    side: "offense",
    week: 1,
    gameId: "w1",
    due: "Tue · before practice",
    assignedGroups: ["OL", "QB", "RB", "TE", "WR"],
    status: "assigned",
    passingScore: 80,
    generatedAt: null,
    generationSource: "coach",
    questions: [
      {
        id: "arch-2025-q2-a",
        prompt: "2025 base run from gun was:",
        options: ["Power", "Tight zone", "Toss", "Draw"],
        correctIndex: 1,
        source: "coach",
      },
      {
        id: "arch-2025-q2-b",
        prompt: "On 5-man slide protection, center's call priority is:",
        options: [
          "Identify Mike, set slide direction",
          "Always slide boundary",
          "Ignore backers",
          "Max protect first",
        ],
        correctIndex: 0,
        source: "coach",
      },
    ],
  },
  {
    id: "arch-2025-q3",
    title: "2025 W2 Defense — Pass strength & coverage",
    side: "defense",
    week: 2,
    gameId: "w2",
    due: "Mon · before AP",
    assignedGroups: ["LB", "DB"],
    status: "assigned",
    passingScore: 75,
    generatedAt: null,
    generationSource: "coach",
    questions: [
      {
        id: "arch-2025-q3-a",
        prompt: "Our week-2 base coverage vs empty was:",
        options: ["Cover 3 match", "Cover 0", "Cover 4 quarters", "Prevent"],
        correctIndex: 0,
        source: "coach",
      },
      {
        id: "arch-2025-q3-b",
        prompt: "Star vs #2 vertical from trips should:",
        options: [
          "Carry vertical / match rules",
          "Spy QB only",
          "Blitz A gap always",
          "Play deep middle",
        ],
        correctIndex: 0,
        source: "coach",
      },
    ],
  },
  {
    id: "arch-2025-q4",
    title: "2025 W2 Offense — RPOs & tags",
    side: "offense",
    week: 2,
    gameId: "w2",
    due: "Wed · install test",
    assignedGroups: ["QB", "RB", "WR", "TE"],
    status: "assigned",
    passingScore: 80,
    generatedAt: null,
    generationSource: "coach",
    questions: [
      {
        id: "arch-2025-q4-a",
        prompt: "RPO bubble tag: QB reads:",
        options: [
          "End man on LOS / alley defender",
          "Free safety only",
          "Center only",
          "Sideline clock",
        ],
        correctIndex: 0,
        source: "coach",
      },
    ],
  },
];

function buildDepthBoardsSnapshot(): Record<string, DepthChartBoard> {
  const out: Record<string, DepthChartBoard> = {};
  teamLevels.forEach((_, teamIndex) => {
    for (const scheme of depthSchemes) {
      const base = depthBoards[scheme];
      if (!base) continue;
      out[`${teamIndex}::${scheme}`] = syncDepthBoardRows(
        normalizeDepthBoardRows(cloneDepthBoard(base), MIN_DEPTH_ROWS),
      );
    }
  });
  return out;
}

function buildScoutReports2025(): Record<string, PositionScoutReport> {
  // Notes only — no seeded upload filenames (archive must show nothing uploaded).
  const updatedAt = "2025-09-12T18:00:00.000Z";
  const entries: [Side, string, string, string][] = [
    [
      "defense",
      "DL",
      "w1",
      "2025 W1: Expect stretch / outside zone. Ends set edge; tackles 2-gap in base. Watch cutback on mid-zone.",
    ],
    [
      "defense",
      "LB",
      "w1",
      "2025 W1: Mike keys guard mesh. Will scrapes over. Star matches #2 on pass. Force fit outside-in vs stretch.",
    ],
    [
      "defense",
      "DB",
      "w1",
      "2025 W1: Cover 3 base. Corners press cloud on trips. Free safety middle third; Rover alley support.",
    ],
    [
      "offense",
      "OL",
      "w1",
      "2025 W1: Tight zone aiming points. Combo to LB. Slide protection vs odd front — ID Mike early.",
    ],
    [
      "offense",
      "QB",
      "w1",
      "2025 W1: Check to zone away from overhang. RPO bubble on light box. No force into Cover 0 look.",
    ],
    [
      "offense",
      "WR",
      "w2",
      "2025 W2: Trips tags — pivot vs soft corner, vertical vs press. Crack on jet when called.",
    ],
  ];
  const out: Record<string, PositionScoutReport> = {};
  for (const [side, group, gameId, notes] of entries) {
    out[scoutReportKey(side, group, gameId)] = {
      notes,
      fileName: null,
      updatedAt,
    };
  }
  return out;
}

function buildRecruitingFills2025(): SeasonArchiveSnapshot["athleteRecruitingFields"] {
  const out: SeasonArchiveSnapshot["athleteRecruitingFields"] = {};
  for (const a of athletes.slice(0, 8)) {
    out[a.id] = {
      offerStatus: "Interest",
      campNotes: "2025 camp — strong film / frame",
      priority: "Watch",
    };
  }
  return out;
}

function buildCustomFields2025(): SeasonArchiveSnapshot["athleteCustomFields"] {
  const out: SeasonArchiveSnapshot["athleteCustomFields"] = {};
  athletes.slice(0, 6).forEach((a, i) => {
    out[a.id] = {
      ...emptyAthleteCustomFields(),
      lockerNumber: String(100 + i),
      helmetSize: i % 2 === 0 ? "L" : "M",
      shirtSize: "L",
      cleatSize: "11",
    };
  });
  return out;
}

/** Demo archived season coordinators/admins can import from. */
export function buildArchivedSeason2025(): ArchivedSeason {
  const grades2025: GradeRow[] = seedGrades.map((g) => ({
    ...g,
    practice: Math.min(10, Math.max(5, (g.practice ?? 7) - 1)),
  }));

  const scheduleGames = buildGames2025FromMaxPreps();

  const snapshot: SeasonArchiveSnapshot = {
    scheduleGames: scheduleGames.map((g) => ({ ...g })),
    // Intentionally empty — no seeded PDF / upload placeholders for 2025.
    gameWeekAssets: {},
    gameMetaOverrides: {},
    disabledOptionalGames: {
      "scrim-2": true,
      "po-1": true,
      "po-2": true,
      "po-3": true,
      "po-4": true,
      "po-5": true,
      "po-6": true,
    },
    positionScoutReports: buildScoutReports2025(),
    personalTodosByOwner: {},
    groupChatMessagesByGroup: {},
    gradeRows: grades2025,
    quizzes: quizzes2025.map((q) => ({
      ...q,
      assignedGroups: [...q.assignedGroups],
      questions: q.questions.map((qq) => ({
        ...qq,
        options: [...qq.options],
      })),
    })),
    quizAttempts: [],
    attendanceByDate: {},
    depthBoards: buildDepthBoardsSnapshot(),
    athleteCustomFields: buildCustomFields2025(),
    athleteRecruitingFields: buildRecruitingFills2025(),
    offenseGoals: offense2025Goals.map((g) => ({ ...g })),
    defenseGoals: defense2025Goals.map((g) => ({ ...g })),
  };

  return {
    id: "2025",
    label: "2025 Season",
    year: 2025,
    archivedAt: "2025-12-15T12:00:00.000Z",
    snapshot,
  };
}

export function schemeMatchesSide(schemeId: string, side: Side): boolean {
  const id = schemeId.toLowerCase();
  if (side === "offense") return id.includes("offense") || id === "offense";
  if (side === "defense") return id.includes("defense") || id === "defense";
  return (
    id.includes("kick") ||
    id.includes("punt") ||
    id.includes("field") ||
    id.includes("hands") ||
    id.includes("st")
  );
}

export function weekAssetFieldsForSide(
  side: Side,
): (keyof GameWeekAssets)[] {
  const prefix =
    side === "offense"
      ? "offense"
      : side === "defense"
        ? "defense"
        : "specialTeams";
  return (Object.keys(emptyGameWeekAssets()) as (keyof GameWeekAssets)[]).filter(
    (k) => k.startsWith(prefix),
  );
}

export function archiveHasCategoryContent(
  snap: SeasonArchiveSnapshot,
  category: ArchiveImportCategory,
  sideFilter: Side | "all" = "all",
): boolean {
  switch (category) {
    case "unitGoals": {
      if (sideFilter === "offense") return (snap.offenseGoals?.length ?? 0) > 0;
      if (sideFilter === "defense") return (snap.defenseGoals?.length ?? 0) > 0;
      if (sideFilter === "specialTeams") return false;
      return (
        (snap.offenseGoals?.length ?? 0) > 0 ||
        (snap.defenseGoals?.length ?? 0) > 0
      );
    }
    case "quizzes": {
      const list = snap.quizzes ?? [];
      if (sideFilter === "all") return list.length > 0;
      return list.some((q) => q.side === sideFilter);
    }
    case "depthBoards": {
      const entries = Object.entries(snap.depthBoards ?? {});
      if (sideFilter === "all") {
        return entries.some(([, b]) =>
          b.rows.some((row) => row.some((c) => c !== null)),
        );
      }
      return entries.some(([key, b]) => {
        const schemeId = key.split("::")[1] ?? "";
        if (!schemeMatchesSide(schemeId, sideFilter)) return false;
        return b.rows.some((row) => row.some((c) => c !== null));
      });
    }
    case "scoutReports": {
      const keys = Object.keys(snap.positionScoutReports ?? {});
      if (sideFilter === "all") return keys.length > 0;
      return keys.some((k) => k.startsWith(`${sideFilter}::`));
    }
    case "weekAssets": {
      const assets = snap.gameWeekAssets ?? {};
      const fields =
        sideFilter === "all"
          ? (Object.keys(emptyGameWeekAssets()) as (keyof GameWeekAssets)[])
          : weekAssetFieldsForSide(sideFilter);
      return Object.values(assets).some((wa) =>
        fields.some((f) => Boolean(wa?.[f])),
      );
    }
    case "scheduleMeta":
      return Object.keys(snap.gameMetaOverrides ?? {}).length > 0;
    case "recruitingFills":
      return Object.values(snap.athleteRecruitingFields ?? {}).some(
        (v) => v && Object.keys(v).length > 0,
      );
    case "grades":
      return (snap.gradeRows ?? []).length > 0;
    default:
      return false;
  }
}

export function liveHasCategoryContent(input: {
  category: ArchiveImportCategory;
  sideFilter: Side | "all";
  offenseGoals: UnitGoal[];
  defenseGoals: UnitGoal[];
  quizzes: Quiz[];
  depthBoards: Record<string, DepthChartBoard>;
  positionScoutReports: Record<string, PositionScoutReport>;
  gameWeekAssets: Record<string, GameWeekAssets>;
  gameMetaOverrides: Record<string, GameMetaOverride>;
  athleteRecruitingFields: Record<string, Record<string, string> | undefined>;
  gradeRows: GradeRow[];
}): boolean {
  const snap: SeasonArchiveSnapshot = {
    gameWeekAssets: input.gameWeekAssets,
    gameMetaOverrides: input.gameMetaOverrides,
    disabledOptionalGames: {},
    positionScoutReports: input.positionScoutReports,
    personalTodosByOwner: {},
    groupChatMessagesByGroup: {},
    gradeRows: input.gradeRows,
    quizzes: input.quizzes,
    quizAttempts: [],
    attendanceByDate: {},
    depthBoards: input.depthBoards,
    athleteCustomFields: {},
    athleteRecruitingFields: input.athleteRecruitingFields,
    offenseGoals: input.offenseGoals,
    defenseGoals: input.defenseGoals,
  };
  return archiveHasCategoryContent(snap, input.category, input.sideFilter);
}

export function cloneArchiveSnapshot(
  snap: SeasonArchiveSnapshot,
): SeasonArchiveSnapshot {
  return {
    scheduleGames: snap.scheduleGames
      ? snap.scheduleGames.map((g) => ({ ...g }))
      : undefined,
    gameWeekAssets: structuredClone(snap.gameWeekAssets),
    gameMetaOverrides: structuredClone(snap.gameMetaOverrides),
    disabledOptionalGames: { ...snap.disabledOptionalGames },
    positionScoutReports: structuredClone(snap.positionScoutReports),
    personalTodosByOwner: structuredClone(snap.personalTodosByOwner),
    groupChatMessagesByGroup: structuredClone(snap.groupChatMessagesByGroup),
    gradeRows: snap.gradeRows.map((g) => ({ ...g })),
    quizzes: snap.quizzes.map((q) => ({
      ...q,
      assignedGroups: [...q.assignedGroups],
      questions: q.questions.map((qq) => ({
        ...qq,
        options: [...qq.options],
      })),
    })),
    quizAttempts: snap.quizAttempts.map((a) => ({ ...a })),
    attendanceByDate: structuredClone(snap.attendanceByDate),
    depthBoards: structuredClone(snap.depthBoards),
    athleteCustomFields: structuredClone(snap.athleteCustomFields),
    athleteRecruitingFields: structuredClone(snap.athleteRecruitingFields),
    offenseGoals: (snap.offenseGoals ?? []).map((g) => ({ ...g })),
    defenseGoals: (snap.defenseGoals ?? []).map((g) => ({ ...g })),
  };
}
