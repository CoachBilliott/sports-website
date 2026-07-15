"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  athletes,
  emptyAthleteCustomFields,
  composeDisplayName,
  splitDisplayName,
  compareByLastName,
  buildInitialCoachAssignments,
  depthBoards,
  depthSchemes,
  columnsFromPositionNames,
  emptyDepthRow,
  normalizeDepthBoardRows,
  cloneDepthBoard,
  syncDepthBoardRows,
  MIN_DEPTH_ROWS,
  members as seedMembers,
  team,
  teamLevels,
  games,
  resolveActiveGame,
  seedPositionGroups,
  migrateAthleteGroups,
  allGroupAbbrevs,
  groupAbbrevsByType,
  seedOffenseGoals,
  seedDefenseGoals,
  coachDuties as seedCoachDuties,
  grades as seedGrades,
  quizzes as seedQuizzes,
  defaultInventorySheetColumns,
  slugifyInventoryFieldKey,
  defaultRecruitingSheetColumns,
  slugifyRecruitingFieldKey,
  isRecruitingCoreFieldKey,
  isRecruitingStructuralKey,
  type Athlete,
  type CoachGroupAssignments,
  type DepthChartBoard,
  type DepthColumnDef,
  type DepthScheme,
  type GradClass,
  type InventorySheetColumn,
  type RecruitingSheetColumn,
  type PositionGroupDef,
  type PositionType,
  type TeamMember,
  type UnitGoal,
} from "@/lib/mock";
import { defaultPageForRole } from "@/lib/permissions";
import {
  applyMaxPrepsResultsToGames,
  formatGameResult,
  maxPrepsYearForViewingSeason,
  parseResultLabel,
  type MaxPrepsSeasonPayload,
} from "@/lib/maxpreps";
import {
  buildArchivedSeason2025,
  cloneArchiveSnapshot,
  emptyGameWeekAssets,
  schemeMatchesSide,
  scoutReportKey,
  weekAssetFieldsForSide,
  type ArchiveImportCategory,
  type ArchiveImportResult,
  type ArchiveImportSelection,
  type ArchivedSeason,
  type GameMetaOverride,
  type GameWeekAssets,
  type PositionScoutReport,
  type SeasonArchiveSnapshot,
} from "@/lib/seasonArchive";
import type {
  AppPage,
  CoachDuty,
  Game,
  GradeRow,
  GroupChatMessage,
  GroupChatSenderRole,
  NavMenu,
  PersonalTodo,
  Quiz,
  QuizAttempt,
  QuizQuestion,
  Role,
  SeasonId,
  Side,
  UnitResourceFile,
  WeekAutoAdvanceConfig,
} from "@/lib/types";

export type {
  ArchivedSeason,
  GameMetaOverride,
  GameWeekAssets,
  PositionScoutReport,
  SeasonArchiveSnapshot,
};
export {
  emptyGameWeekAssets,
  scoutReportKey,
};

function cloneScheduleGames(list: Game[]): Game[] {
  return list.map((g) => ({ ...g }));
}

function visibleScheduleGamesList(
  schedule: Game[],
  disabledOptionalGames: Record<string, boolean>,
) {
  return schedule.filter((g) => !(g.optional && disabledOptionalGames[g.id]));
}

function localDayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function parseHm(time: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  return { hour, minute };
}

function seedGroupChatMessages(): Record<string, GroupChatMessage[]> {
  const base = Date.now() - 1000 * 60 * 45;
  return {
    DL: [
      {
        id: "gchat-dl-1",
        group: "DL",
        senderId: "spencer",
        senderName: "Coach Spencer",
        senderRole: "coach",
        body: "Film room after practice — focus on gap discipline vs. zone.",
        createdAt: new Date(base).toISOString(),
      },
      {
        id: "gchat-dl-2",
        group: "DL",
        senderId: "a23",
        senderName: "Jordan Martinez",
        senderRole: "player",
        body: "Got it. I'll pull the 3rd-down cuts tonight.",
        createdAt: new Date(base + 1000 * 60 * 12).toISOString(),
      },
    ],
  };
}

export type { UnitResourceFile };

function emptyUnitResources(): Record<Side, UnitResourceFile[]> {
  return { offense: [], defense: [], specialTeams: [] };
}

/** My GA Online Settings → Depth Chart Colors (Cy Creek values) */
export const defaultClassColors: Record<GradClass, string> = {
  senior: "#59aaf5",
  junior: "#d1cece",
  sophomore: "#a4e8aa",
  freshman: "#e1eb6d",
};

export type SchemeConfig = {
  id: DepthScheme;
  label: string;
  /** Category shown in the New Depth Chart form */
  schemeType: string;
  columns: DepthColumnDef[];
};

export type DepthCellRef = {
  teamIndex: number;
  schemeId: DepthScheme;
  row: number;
  col: number;
};

/** Ordered team×scheme charts on Depth Chart screen / print */
export type DepthChartPanel = {
  id: string;
  teamIndex: number;
  schemeId: DepthScheme;
};

const cloneBoard = cloneDepthBoard;
const syncDepthRows = syncDepthBoardRows;

function buildInitialBoards(): Record<string, DepthChartBoard> {
  const out: Record<string, DepthChartBoard> = {};
  teamLevels.forEach((_, teamIndex) => {
    for (const scheme of depthSchemes) {
      out[`${teamIndex}::${scheme}`] = syncDepthRows(
        normalizeDepthBoardRows(
          cloneBoard(depthBoards[scheme]),
          MIN_DEPTH_ROWS,
        ),
      );
    }
  });
  return out;
}

function boardKey(teamIndex: number, schemeId: DepthScheme) {
  return `${teamIndex}::${schemeId}`;
}

function defaultSchemes(): SchemeConfig[] {
  return depthSchemes.map((id) => ({
    id,
    label: id,
    schemeType: "Practice",
    columns: columnsFromPositionNames(depthBoards[id]?.positions ?? []),
  }));
}

function emptyBoardForColumns(columns: DepthColumnDef[]): DepthChartBoard {
  const positions = columns.map((c) => c.name.trim() || "POS");
  return syncDepthRows(
    normalizeDepthBoardRows(
      {
        positions,
        rows: Array.from({ length: MIN_DEPTH_ROWS }, () =>
          emptyDepthRow(positions.length),
        ),
      },
      MIN_DEPTH_ROWS,
    ),
  );
}

function remapBoardToColumns(
  board: DepthChartBoard,
  columns: DepthColumnDef[],
): DepthChartBoard {
  const positions = columns.map((c) => c.name.trim() || "POS");
  const oldIndex = new Map(board.positions.map((p, i) => [p, i]));
  const rows = board.rows.map((row) =>
    positions.map((pos) => {
      const i = oldIndex.get(pos);
      return i === undefined ? null : (row[i] ? { ...row[i]! } : null);
    }),
  );
  return syncDepthRows({ positions, rows });
}

function defaultDepthChartPanels(): DepthChartPanel[] {
  return [
    { id: "panel-v-off", teamIndex: 0, schemeId: "Offense" },
    { id: "panel-v-def", teamIndex: 0, schemeId: "Defense" },
  ];
}

/** Prefer week/game-scoped report; fall back to legacy side::group key. */
export function lookupPositionScoutReport(
  reports: Record<string, PositionScoutReport>,
  side: Side,
  group: string,
  gameId: string,
): PositionScoutReport | undefined {
  return (
    reports[scoutReportKey(side, group, gameId)] ??
    reports[scoutReportKey(side, group)]
  );
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type BrandingConfig = {
  name: string;
  motto: string;
  unit: string;
  maxPrepsUrl: string;
  logoLetter: string;
  teamLogoUrl: string | null;
  teamLogoFileName: string | null;
  schoolLogoUrl: string | null;
  schoolLogoFileName: string | null;
  colors: {
    primary: string;
    navy: string;
    steel: string;
    field: string;
    accent: string;
  };
};

export function defaultBranding(): BrandingConfig {
  return {
    name: team.name,
    motto: team.motto,
    unit: team.unit,
    maxPrepsUrl: team.maxPrepsUrl,
    logoLetter: team.logoLetter,
    teamLogoUrl: team.logo,
    teamLogoFileName: null,
    schoolLogoUrl: null,
    schoolLogoFileName: null,
    colors: {
      primary: team.colors.primary,
      navy: "#0a2540",
      steel: team.colors.steel,
      field: team.colors.field,
      accent: "#8b9cb3",
    },
  };
}

export const INITIAL_SEASON_ID: SeasonId = team.season || "2026";

function defaultPlayoffDisabled(): Record<string, boolean> {
  return {
    "po-1": true,
    "po-2": true,
    "po-3": true,
    "po-4": true,
    "po-5": true,
    "po-6": true,
  };
}

function seasonLabel(year: number) {
  return `${year} Season`;
}

type AppState = {
  role: Role;
  setRole: (r: Role) => void;
  side: Side;
  setSide: (s: Side) => void;
  page: AppPage;
  setPage: (p: AppPage) => void;
  /** Workout / projector-friendly UI — hides mock chrome */
  presentMode: boolean;
  setPresentMode: (v: boolean) => void;
  /**
   * Display year / season label for chrome (viewing season — live or archive).
   */
  season: string;
  /** Live (editable) season id. */
  currentSeasonId: SeasonId;
  /** Season currently shown in the app (may be an archived snapshot). */
  viewingSeasonId: SeasonId;
  setViewingSeason: (seasonId: SeasonId) => void;
  /** True when browsing a past season snapshot. */
  isArchiveMode: boolean;
  /** Season schedule (live template or archived MaxPreps-backed list). */
  scheduleGames: Game[];
  setScheduleGames: (
    v: Game[] | ((prev: Game[]) => Game[]),
  ) => void;
  /** Patch result fields on a schedule game (manual edit). */
  setGameResult: (
    gameId: string,
    patch: {
      result?: string | null;
      ourScore?: number | null;
      oppScore?: number | null;
    },
  ) => void;
  /**
   * Pull MaxPreps schedule/results for the viewing context.
   * Live season → current MaxPreps year (merged into schedule).
   * Archive (e.g. 2025) → prior MaxPreps year (2024); payload only, schedule untouched.
   */
  syncMaxPrepsResults: (opts?: {
    force?: boolean;
  }) => Promise<{
    ok: boolean;
    updatedCount: number;
    fromSeed: boolean;
    message: string;
    payload?: MaxPrepsSeasonPayload;
  }>;
  maxPrepsLastSyncAt: string | null;
  /** Admin override for site-wide “this week”; null = calendar next-upcoming. */
  activeGameId: string | null;
  setActiveWeek: (gameId: string | null) => void;
  /** Recurring local day/time when active week auto-advances; null = off. */
  weekAutoAdvance: WeekAutoAdvanceConfig | null;
  setWeekAutoAdvance: (cfg: WeekAutoAdvanceConfig | null) => void;
  archivedSeasons: ArchivedSeason[];
  rollToNextSeason: () => void;
  deleteArchivedSeason: (seasonId: SeasonId) => void;
  /**
   * Copy selected categories from an archived season into the live season.
   * Only works while viewing the current season (not archive browse mode).
   */
  importFromArchivedSeason: (
    selection: ArchiveImportSelection,
  ) => ArchiveImportResult;
  /** Per-user quick action ids (empty / missing = role defaults). */
  quickActionsByOwner: Record<string, string[]>;
  setQuickActionsForOwner: (ownerKey: string, ids: string[]) => void;
  clearQuickActionsForOwner: (ownerKey: string) => void;
  openNavMenu: NavMenu | null;
  setOpenNavMenu: (v: NavMenu | null) => void;
  branding: BrandingConfig;
  setBranding: (
    v: BrandingConfig | ((prev: BrandingConfig) => BrandingConfig),
  ) => void;
  teamNames: string[];
  setTeamNames: (v: string[] | ((prev: string[]) => string[])) => void;
  schemes: SchemeConfig[];
  setSchemes: (
    v: SchemeConfig[] | ((prev: SchemeConfig[]) => SchemeConfig[]),
  ) => void;
  saveDepthScheme: (scheme: SchemeConfig) => void;
  deleteDepthScheme: (schemeId: string) => void;
  classColors: Record<GradClass, string>;
  setClassColors: (
    v:
      | Record<GradClass, string>
      | ((prev: Record<GradClass, string>) => Record<GradClass, string>),
  ) => void;
  getBoard: (teamIndex: number, schemeId: DepthScheme) => DepthChartBoard;
  ensureDepthBoard: (teamIndex: number, schemeId: DepthScheme) => void;
  moveDepthPlayer: (
    from: DepthCellRef,
    to: DepthCellRef,
    relevantCols?: number[],
  ) => void;
  setDepthCell: (
    ref: DepthCellRef,
    player: { name: string; classYear: GradClass } | null,
    relevantCols?: number[],
  ) => void;
  /** Replace a team×scheme board (e.g. coach draft commit). */
  saveDepthBoard: (
    teamIndex: number,
    schemeId: DepthScheme,
    board: DepthChartBoard,
  ) => void;
  depthChartPanels: DepthChartPanel[];
  setDepthChartPanels: (
    v: DepthChartPanel[] | ((prev: DepthChartPanel[]) => DepthChartPanel[]),
  ) => void;
  coachAssignments: CoachGroupAssignments;
  setCoachOnGroup: (
    group: string,
    coachId: string,
    assigned: boolean,
  ) => void;
  positionScoutReports: Record<string, PositionScoutReport>;
  savePositionScoutReport: (
    side: Side,
    group: string,
    report: { notes: string; fileName: string | null },
    gameId?: string,
  ) => void;
  gameWeekAssets: Record<string, GameWeekAssets>;
  setGameWeekAsset: (
    gameId: string,
    field: keyof GameWeekAssets,
    fileName: string | null,
  ) => void;
  gameMetaOverrides: Record<string, GameMetaOverride>;
  setGameMeta: (
    gameId: string,
    patch: GameMetaOverride,
  ) => void;
  /** Optional schedule slots turned off (e.g. second scrimmage) */
  disabledOptionalGames: Record<string, boolean>;
  setOptionalGameEnabled: (gameId: string, enabled: boolean) => void;
  offenseGoals: UnitGoal[];
  defenseGoals: UnitGoal[];
  setUnitGoalText: (side: Side, goalId: string, text: string) => void;
  addUnitGoal: (side: Side, text?: string) => void;
  removeUnitGoal: (side: Side, goalId: string) => void;
  moveUnitGoal: (side: Side, goalId: string, direction: "up" | "down") => void;
  coachDutiesList: CoachDuty[];
  updateCoachDuty: (
    id: string,
    patch: Partial<Omit<CoachDuty, "id">>,
  ) => void;
  addCoachDutyResponsibility: (dutyId: string) => void;
  updateCoachDutyResponsibility: (
    dutyId: string,
    respId: string,
    patch: Partial<{ text: string; dueBy: string }>,
  ) => void;
  removeCoachDutyResponsibility: (dutyId: string, respId: string) => void;
  addCoachDuty: () => void;
  removeCoachDuty: (id: string) => void;
  /** Personal weekly to-dos keyed by My Stuff profile name (or role). */
  personalTodosByOwner: Record<string, PersonalTodo[]>;
  addPersonalTodo: (
    ownerKey: string,
    text?: string,
    opts?: { sourceResponsibilityId?: string },
  ) => void;
  updatePersonalTodo: (
    ownerKey: string,
    id: string,
    patch: Partial<Pick<PersonalTodo, "text" | "done">>,
  ) => void;
  togglePersonalTodo: (ownerKey: string, id: string) => void;
  removePersonalTodo: (ownerKey: string, id: string) => void;
  /** Position-group chat threads keyed by group abbreviation. */
  groupChatMessagesByGroup: Record<string, GroupChatMessage[]>;
  sendGroupChatMessage: (input: {
    group: string;
    senderId: string;
    senderName: string;
    senderRole: GroupChatSenderRole;
    body: string;
  }) => void;
  gradeRows: GradeRow[];
  /** Upsert a player grade for a position group + week (coach edits for assigned groups). */
  upsertPlayerGrade: (
    key: { player: string; group: string; week: number },
    patch: Partial<Pick<GradeRow, "practice" | "game" | "pride">>,
  ) => void;
  /** Session-editable weekly quizzes (AI-generated + coach-authored). */
  quizzes: Quiz[];
  upsertQuiz: (quiz: Quiz) => void;
  updateQuiz: (
    id: string,
    patch: Partial<
      Pick<
        Quiz,
        | "title"
        | "due"
        | "assignedGroups"
        | "status"
        | "passingScore"
        | "score"
        | "questions"
        | "generatedAt"
        | "generationSource"
        | "gameId"
      >
    >,
  ) => void;
  removeQuiz: (id: string) => void;
  addQuizQuestion: (quizId: string, question?: QuizQuestion) => void;
  updateQuizQuestion: (
    quizId: string,
    questionId: string,
    patch: Partial<
      Pick<
        QuizQuestion,
        "prompt" | "options" | "correctIndex" | "source" | "explanation"
      >
    >,
  ) => void;
  removeQuizQuestion: (quizId: string, questionId: string) => void;
  /** Per-athlete quiz scores (coach sheet + player take-quiz). */
  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (input: {
    athleteId: string;
    quizId: string;
    score: number;
  }) => void;
  roster: Athlete[];
  updateAthlete: (
    id: string,
    patch: Partial<
      Pick<
        Athlete,
        | "firstName"
        | "lastName"
        | "name"
        | "groups"
        | "classYear"
        | "personnelType"
        | "supportRole"
        | "teamLevel"
        | "athleticPeriod"
        | "phone"
        | "email"
        | "headshotUrl"
        | "headshotFileName"
        | "height"
        | "weight"
        | "jerseyNumber"
        | "totalGpa"
        | "coreGpa"
        | "actSat"
        | "twitterHandle"
        | "hudlLink"
      >
      > & {
        customFields?: Partial<NonNullable<Athlete["customFields"]>>;
        recruitingFields?: Partial<
          NonNullable<Athlete["recruitingFields"]>
        >;
      },
  ) => void;
  deleteAthlete: (id: string) => void;
  deleteMember: (id: string) => void;
  updateMember: (
    id: string,
    patch: Partial<
      Pick<
        TeamMember,
        | "firstName"
        | "lastName"
        | "name"
        | "role"
        | "status"
        | "phone"
        | "email"
        | "headshotUrl"
        | "headshotFileName"
        | "assignedTeams"
        | "duties"
        | "notes"
        | "athleticPeriod"
      >
    >,
  ) => void;
  teamMembers: TeamMember[];
  createMemberAccount: (input: {
    firstName: string;
    lastName: string;
    role: Role;
    personnelType?: Athlete["personnelType"];
    phone?: string;
    email?: string;
  }) => { memberId: string; athleteId?: string };
  /** Open athlete profile settings (null = closed) */
  playerSettingsId: string | null;
  openPlayerSettings: (athleteId: string) => void;
  closePlayerSettings: () => void;
  /** Open coach/coordinator profile (null = closed) */
  coachSettingsId: string | null;
  openCoachSettings: (memberId: string) => void;
  closeCoachSettings: () => void;
  attendance: Record<string, AttendanceStatus>;
  attendanceByDate: Record<string, Record<string, AttendanceStatus>>;
  setAttendance: (athleteId: string, status: AttendanceStatus) => void;
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  positionGroups: PositionGroupDef[];
  addPositionGroup: () => void;
  updatePositionGroup: (
    id: string,
    patch: Partial<Pick<PositionGroupDef, "name" | "abbreviation" | "type">>,
  ) => void;
  removePositionGroup: (id: string) => void;
  offenseGroupCodes: string[];
  defenseGroupCodes: string[];
  specialTeamsGroupCodes: string[];
  allPositionCodes: string[];
  /** Issued Equipment columns (also shown on athlete Equipment profiles) */
  inventorySheetColumns: InventorySheetColumn[];
  addInventorySheetColumn: (label: string) => boolean;
  renameInventorySheetColumn: (key: string, label: string) => boolean;
  removeInventorySheetColumn: (key: string) => void;
  /** Staff Recruiting columns (also shown on athlete Recruiting profiles) */
  recruitingSheetColumns: RecruitingSheetColumn[];
  addRecruitingSheetColumn: (label: string) => boolean;
  renameRecruitingSheetColumn: (key: string, label: string) => boolean;
  removeRecruitingSheetColumn: (key: string) => void;
  /** Per-side unit Resources drive (Offense / Defense / ST — separate buckets) */
  unitResources: Record<Side, UnitResourceFile[]>;
  addUnitResource: (side: Side, file: Omit<UnitResourceFile, "id">) => void;
  removeUnitResource: (side: Side, id: string) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({
  children,
  initialPresent = false,
  initialPage,
}: {
  children: ReactNode;
  /** Clean board for projecting / showing coaches at workouts */
  initialPresent?: boolean;
  initialPage?: AppPage;
}) {
  const [role, setRoleState] = useState<Role>("coach");
  const [side, setSide] = useState<Side>("defense");
  const [page, setPage] = useState<AppPage>(
    initialPage ?? (initialPresent ? "personnel-depth" : "this-week"),
  );
  const [presentMode, setPresentMode] = useState(initialPresent);
  const [openNavMenu, setOpenNavMenu] = useState<NavMenu | null>(null);
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [teamNames, setTeamNames] = useState<string[]>([...teamLevels]);
  const [positionGroups, setPositionGroups] = useState<PositionGroupDef[]>(() =>
    seedPositionGroups.map((p) => ({ ...p })),
  );
  const [schemes, setSchemes] = useState<SchemeConfig[]>(defaultSchemes);
  const [classColors, setClassColors] =
    useState<Record<GradClass, string>>(defaultClassColors);
  const [boards, setBoards] = useState(buildInitialBoards);
  const [depthChartPanels, setDepthChartPanels] = useState<DepthChartPanel[]>(
    defaultDepthChartPanels,
  );
  const [unitResources, setUnitResources] =
    useState<Record<Side, UnitResourceFile[]>>(emptyUnitResources);

  // Keep trailing empty row in sync (e.g. after HMR / older board state)
  useEffect(() => {
    setBoards((prev) => {
      let changed = false;
      const next: Record<string, DepthChartBoard> = {};
      for (const [key, board] of Object.entries(prev)) {
        const synced = syncDepthRows(board);
        next[key] = synced;
        if (
          synced.rows.length !== board.rows.length ||
          synced.rows.some((row, ri) =>
            row.some((cell, ci) => cell !== board.rows[ri]?.[ci]),
          )
        ) {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const [coachAssignments, setCoachAssignments] = useState(
    buildInitialCoachAssignments,
  );
  const [positionScoutReports, setPositionScoutReports] = useState<
    Record<string, PositionScoutReport>
  >({});
  const [gameWeekAssets, setGameWeekAssets] = useState<
    Record<string, GameWeekAssets>
  >({});
  const [scheduleGames, setScheduleGames] = useState<Game[]>(() =>
    cloneScheduleGames(games),
  );
  const [maxPrepsLastSyncAt, setMaxPrepsLastSyncAt] = useState<string | null>(
    null,
  );
  const [gameMetaOverrides, setGameMetaOverrides] = useState<
    Record<string, GameMetaOverride>
  >({});
  const [disabledOptionalGames, setDisabledOptionalGames] = useState<
    Record<string, boolean>
  >(defaultPlayoffDisabled);
  const [offenseGoals, setOffenseGoals] = useState<UnitGoal[]>(() =>
    seedOffenseGoals.map((g) => ({ ...g })),
  );
  const [defenseGoals, setDefenseGoals] = useState<UnitGoal[]>(() =>
    seedDefenseGoals.map((g) => ({ ...g })),
  );
  const [coachDutiesList, setCoachDutiesList] = useState<CoachDuty[]>(() =>
    seedCoachDuties.map((d) => ({
      ...d,
      groups: [...d.groups],
      duties: d.duties.map((item) => ({ ...item })),
    })),
  );
  const [personalTodosByOwner, setPersonalTodosByOwner] = useState<
    Record<string, PersonalTodo[]>
  >({});
  const [groupChatMessagesByGroup, setGroupChatMessagesByGroup] = useState<
    Record<string, GroupChatMessage[]>
  >(() => seedGroupChatMessages());
  const [gradeRows, setGradeRows] = useState<GradeRow[]>(() =>
    seedGrades.map((g) => ({ ...g })),
  );
  const [quizzes, setQuizzes] = useState<Quiz[]>(() =>
    seedQuizzes
      .filter((q) => q.week !== 0)
      .map((q) => ({
        ...q,
        assignedGroups: [...q.assignedGroups],
        questions: q.questions.map((qq) => ({
          ...qq,
          options: [...qq.options],
        })),
      })),
  );
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [roster, setRoster] = useState<Athlete[]>(() =>
    athletes.map((a, index) => {
      const parts =
        a.firstName || a.lastName
          ? { firstName: a.firstName ?? "", lastName: a.lastName ?? "" }
          : splitDisplayName(a.name);
      const isSupport = (a.personnelType ?? "athlete") === "support-staff";
      const defaultPeriod =
        a.athleticPeriod !== undefined && a.athleticPeriod !== null
          ? a.athleticPeriod
          : isSupport
            ? ""
            : index % 5 === 0
              ? "After School"
              : index % 2 === 0
                ? "5th"
                : "7th";
      return {
        ...a,
        firstName: parts.firstName,
        lastName: parts.lastName,
        name: composeDisplayName(parts.firstName, parts.lastName) || a.name,
        groups: migrateAthleteGroups([...a.groups]),
        personnelType: a.personnelType ?? "athlete",
        supportRole: a.supportRole,
        athleticPeriod: defaultPeriod,
        teamLevel: isSupport
          ? undefined
          : a.teamLevel ??
            (a.classYear === "freshman"
              ? index % 2 === 0
                ? "Freshmen Blue"
                : "Freshman Silver"
              : a.classYear === "sophomore"
                ? index % 3 === 0
                  ? "Sophomore"
                  : "Junior Varsity"
                : a.classYear === "junior" && index % 4 === 0
                  ? "Junior Varsity"
                  : "Varsity"),
        phone: a.phone ?? "",
        email: a.email ?? "",
        headshotUrl: a.headshotUrl ?? null,
        headshotFileName: a.headshotFileName ?? null,
        height: a.height ?? "",
        weight: a.weight ?? "",
        customFields: {
          ...emptyAthleteCustomFields(),
          ...a.customFields,
        },
      };
    }),
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    seedMembers.map((m) => {
      const parts =
        m.firstName || m.lastName
          ? { firstName: m.firstName ?? "", lastName: m.lastName ?? "" }
          : splitDisplayName(m.name);
      return {
        ...m,
        firstName: parts.firstName,
        lastName: parts.lastName,
        name: composeDisplayName(parts.firstName, parts.lastName) || m.name,
        headshotUrl: m.headshotUrl ?? null,
        headshotFileName: m.headshotFileName ?? null,
      };
    }),
  );
  const [attendanceDate, setAttendanceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [attendanceByDate, setAttendanceByDate] = useState<
    Record<string, Record<string, AttendanceStatus>>
  >({});
  const [playerSettingsId, setPlayerSettingsId] = useState<string | null>(
    null,
  );
  const [coachSettingsId, setCoachSettingsId] = useState<string | null>(null);
  const [inventorySheetColumns, setInventorySheetColumns] = useState<
    InventorySheetColumn[]
  >(() => defaultInventorySheetColumns.map((c) => ({ ...c })));
  const [recruitingSheetColumns, setRecruitingSheetColumns] = useState<
    RecruitingSheetColumn[]
  >(() => defaultRecruitingSheetColumns.map((c) => ({ ...c })));
  const [currentSeasonId, setCurrentSeasonId] =
    useState<SeasonId>(INITIAL_SEASON_ID);
  const [viewingSeasonId, setViewingSeasonId] =
    useState<SeasonId>(INITIAL_SEASON_ID);
  const season = viewingSeasonId;
  const isArchiveMode = viewingSeasonId !== currentSeasonId;
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [weekAutoAdvance, setWeekAutoAdvanceState] =
    useState<WeekAutoAdvanceConfig | null>(null);
  const [weekAutoAdvanceLastDay, setWeekAutoAdvanceLastDay] = useState<
    string | null
  >(null);
  const [archivedSeasons, setArchivedSeasons] = useState<ArchivedSeason[]>(() => [
    buildArchivedSeason2025(),
  ]);
  const [quickActionsByOwner, setQuickActionsByOwner] = useState<
    Record<string, string[]>
  >({});
  const liveSeasonBufferRef = useRef<SeasonArchiveSnapshot | null>(null);
  const isArchiveModeRef = useRef(false);
  const viewingSeasonIdRef = useRef(viewingSeasonId);
  const currentSeasonIdRef = useRef(currentSeasonId);

  useEffect(() => {
    isArchiveModeRef.current = isArchiveMode;
  }, [isArchiveMode]);
  useEffect(() => {
    viewingSeasonIdRef.current = viewingSeasonId;
  }, [viewingSeasonId]);
  useEffect(() => {
    currentSeasonIdRef.current = currentSeasonId;
  }, [currentSeasonId]);

  const attendance = attendanceByDate[attendanceDate] ?? {};

  const setActiveWeek = useCallback((gameId: string | null) => {
    if (isArchiveModeRef.current) return;
    setActiveGameId(gameId);
  }, []);

  const setWeekAutoAdvance = useCallback(
    (cfg: WeekAutoAdvanceConfig | null) => {
      setWeekAutoAdvanceState(cfg);
      if (!cfg?.enabled) setWeekAutoAdvanceLastDay(null);
    },
    [],
  );

  const setQuickActionsForOwner = useCallback(
    (ownerKey: string, ids: string[]) => {
      setQuickActionsByOwner((prev) => ({ ...prev, [ownerKey]: [...ids] }));
    },
    [],
  );

  const clearQuickActionsForOwner = useCallback((ownerKey: string) => {
    setQuickActionsByOwner((prev) => {
      const next = { ...prev };
      delete next[ownerKey];
      return next;
    });
  }, []);

  const captureLiveSnapshot = useCallback((): SeasonArchiveSnapshot => {
    return cloneArchiveSnapshot({
      scheduleGames: cloneScheduleGames(scheduleGames),
      gameWeekAssets,
      gameMetaOverrides,
      disabledOptionalGames,
      positionScoutReports,
      personalTodosByOwner,
      groupChatMessagesByGroup,
      gradeRows,
      quizzes,
      quizAttempts,
      attendanceByDate,
      depthBoards: boards,
      athleteCustomFields: Object.fromEntries(
        roster.map((a) => [
          a.id,
          a.customFields ? { ...a.customFields } : undefined,
        ]),
      ),
      athleteRecruitingFields: Object.fromEntries(
        roster.map((a) => [
          a.id,
          a.recruitingFields ? { ...a.recruitingFields } : undefined,
        ]),
      ),
      offenseGoals,
      defenseGoals,
    });
  }, [
    scheduleGames,
    gameWeekAssets,
    gameMetaOverrides,
    disabledOptionalGames,
    positionScoutReports,
    personalTodosByOwner,
    groupChatMessagesByGroup,
    gradeRows,
    quizzes,
    quizAttempts,
    attendanceByDate,
    boards,
    roster,
    offenseGoals,
    defenseGoals,
  ]);

  const applySeasonSnapshot = useCallback((snap: SeasonArchiveSnapshot) => {
    const s = cloneArchiveSnapshot(snap);
    setScheduleGames(
      s.scheduleGames?.length
        ? cloneScheduleGames(s.scheduleGames)
        : cloneScheduleGames(games),
    );
    setGameWeekAssets(s.gameWeekAssets);
    setGameMetaOverrides(s.gameMetaOverrides);
    setDisabledOptionalGames(s.disabledOptionalGames);
    setPositionScoutReports(s.positionScoutReports);
    setPersonalTodosByOwner(s.personalTodosByOwner);
    setGroupChatMessagesByGroup(s.groupChatMessagesByGroup);
    setGradeRows(s.gradeRows);
    setQuizzes(s.quizzes);
    setQuizAttempts(s.quizAttempts);
    setAttendanceByDate(s.attendanceByDate);
    setBoards(s.depthBoards);
    setOffenseGoals(s.offenseGoals.map((g) => ({ ...g })));
    setDefenseGoals(s.defenseGoals.map((g) => ({ ...g })));
    setRoster((prev) =>
      prev.map((a) => ({
        ...a,
        customFields:
          s.athleteCustomFields[a.id] ?? emptyAthleteCustomFields(),
        recruitingFields: s.athleteRecruitingFields[a.id] ?? {},
      })),
    );
  }, []);

  const setViewingSeason = useCallback(
    (seasonId: SeasonId) => {
      if (seasonId === viewingSeasonIdRef.current) return;
      const liveId = currentSeasonIdRef.current;
      const leavingId = viewingSeasonIdRef.current;

      // Persist admin/coord edits back into the archive being left
      let archives = archivedSeasons;
      if (leavingId !== liveId) {
        const editedSnap = cloneArchiveSnapshot(captureLiveSnapshot());
        archives = archivedSeasons.map((a) =>
          a.id === leavingId ? { ...a, snapshot: editedSnap } : a,
        );
        setArchivedSeasons(archives);
      }

      if (seasonId === liveId) {
        if (liveSeasonBufferRef.current) {
          applySeasonSnapshot(liveSeasonBufferRef.current);
          liveSeasonBufferRef.current = null;
        }
        setViewingSeasonId(liveId);
        return;
      }

      const arch = archives.find((s) => s.id === seasonId);
      if (!arch) return;

      if (leavingId === liveId && !liveSeasonBufferRef.current) {
        liveSeasonBufferRef.current = captureLiveSnapshot();
      }

      applySeasonSnapshot(arch.snapshot);
      setViewingSeasonId(seasonId);
    },
    [archivedSeasons, applySeasonSnapshot, captureLiveSnapshot],
  );

  const deleteArchivedSeason = useCallback(
    (seasonId: SeasonId) => {
      setArchivedSeasons((prev) => prev.filter((s) => s.id !== seasonId));
      if (viewingSeasonIdRef.current === seasonId) {
        if (liveSeasonBufferRef.current) {
          applySeasonSnapshot(liveSeasonBufferRef.current);
          liveSeasonBufferRef.current = null;
        }
        setViewingSeasonId(currentSeasonIdRef.current);
      }
    },
    [applySeasonSnapshot],
  );

  const importFromArchivedSeason = useCallback(
    (selection: ArchiveImportSelection): ArchiveImportResult => {
      if (viewingSeasonIdRef.current !== currentSeasonIdRef.current) {
        return {
          ok: false,
          imported: [],
          skipped: selection.categories,
          message:
            "Return to the current season before importing from an archive.",
        };
      }
      const arch = archivedSeasons.find((s) => s.id === selection.seasonId);
      if (!arch) {
        return {
          ok: false,
          imported: [],
          skipped: selection.categories,
          message: "Archived season not found.",
        };
      }
      if (selection.categories.length === 0) {
        return {
          ok: false,
          imported: [],
          skipped: [],
          message: "Select at least one item to import.",
        };
      }

      const snap = cloneArchiveSnapshot(arch.snapshot);
      const sideFilter = selection.sideFilter ?? "all";
      const mode = selection.mode;
      const imported: ArchiveImportCategory[] = [];
      const skipped: ArchiveImportCategory[] = [];
      const stamp = Date.now().toString(36);

      const remapQuiz = (q: Quiz): Quiz => ({
        ...q,
        id: `imp-${stamp}-${q.id}`,
        assignedGroups: [...q.assignedGroups],
        questions: q.questions.map((qq) => ({
          ...qq,
          id: `imp-${stamp}-${qq.id}`,
          options: [...qq.options],
        })),
      });

      for (const category of selection.categories) {
        switch (category) {
          case "unitGoals": {
            if (sideFilter === "specialTeams") {
              skipped.push(category);
              break;
            }
            const importOff =
              sideFilter === "all" || sideFilter === "offense";
            const importDef =
              sideFilter === "all" || sideFilter === "defense";
            if (importOff && snap.offenseGoals.length > 0) {
              setOffenseGoals((prev) => {
                const incoming = snap.offenseGoals.map((g) => ({
                  ...g,
                  id:
                    mode === "merge"
                      ? `imp-${stamp}-${g.id}`
                      : g.id,
                }));
                return mode === "replace" ? incoming : [...prev, ...incoming];
              });
            }
            if (importDef && snap.defenseGoals.length > 0) {
              setDefenseGoals((prev) => {
                const incoming = snap.defenseGoals.map((g) => ({
                  ...g,
                  id:
                    mode === "merge"
                      ? `imp-${stamp}-${g.id}`
                      : g.id,
                }));
                return mode === "replace" ? incoming : [...prev, ...incoming];
              });
            }
            imported.push(category);
            break;
          }
          case "quizzes": {
            const incoming = snap.quizzes
              .filter((q) =>
                sideFilter === "all" ? true : q.side === sideFilter,
              )
              .map(remapQuiz);
            if (incoming.length === 0) {
              skipped.push(category);
              break;
            }
            setQuizzes((prev) => {
              if (mode === "replace") {
                if (sideFilter === "all") return incoming;
                return [
                  ...prev.filter((q) => q.side !== sideFilter),
                  ...incoming,
                ];
              }
              return [...prev, ...incoming];
            });
            // Drop attempts for quizzes that no longer exist after a full replace.
            if (mode === "replace" && sideFilter === "all") {
              setQuizAttempts([]);
            }
            imported.push(category);
            break;
          }
          case "depthBoards": {
            const entries = Object.entries(snap.depthBoards).filter(([key]) => {
              if (sideFilter === "all") return true;
              const schemeId = key.split("::")[1] ?? "";
              return schemeMatchesSide(schemeId, sideFilter);
            });
            if (entries.length === 0) {
              skipped.push(category);
              break;
            }
            setBoards((prev) => {
              const next = { ...prev };
              for (const [key, board] of entries) {
                if (mode === "merge" && next[key]) {
                  // Fill empty cells only; keep existing placements.
                  const live = next[key]!;
                  const rows = live.rows.map((row, ri) =>
                    row.map((cell, ci) => {
                      if (cell) return cell;
                      const from = board.rows[ri]?.[ci];
                      return from ? { ...from } : null;
                    }),
                  );
                  next[key] = syncDepthRows({
                    positions: [...live.positions],
                    rows,
                  });
                } else {
                  next[key] = syncDepthRows(cloneBoard(board));
                }
              }
              return next;
            });
            imported.push(category);
            break;
          }
          case "scoutReports": {
            const entries = Object.entries(snap.positionScoutReports).filter(
              ([key]) =>
                sideFilter === "all" ? true : key.startsWith(`${sideFilter}::`),
            );
            if (entries.length === 0) {
              skipped.push(category);
              break;
            }
            setPositionScoutReports((prev) => {
              if (mode === "replace" && sideFilter === "all") {
                return Object.fromEntries(
                  entries.map(([k, v]) => [k, { ...v }]),
                );
              }
              const next = { ...prev };
              if (mode === "replace" && sideFilter !== "all") {
                for (const key of Object.keys(next)) {
                  if (key.startsWith(`${sideFilter}::`)) delete next[key];
                }
              }
              for (const [key, report] of entries) {
                if (mode === "merge" && next[key]?.notes?.trim()) continue;
                next[key] = { ...report };
              }
              return next;
            });
            imported.push(category);
            break;
          }
          case "weekAssets": {
            const fields =
              sideFilter === "all"
                ? (Object.keys(emptyGameWeekAssets()) as (keyof GameWeekAssets)[])
                : weekAssetFieldsForSide(sideFilter);
            const gameIds = Object.keys(snap.gameWeekAssets);
            if (gameIds.length === 0) {
              skipped.push(category);
              break;
            }
            setGameWeekAssets((prev) => {
              const next = { ...prev };
              for (const gameId of gameIds) {
                const src = snap.gameWeekAssets[gameId]!;
                const current = next[gameId] ?? emptyGameWeekAssets();
                const merged = { ...current };
                for (const field of fields) {
                  const val = src[field];
                  if (!val) continue;
                  if (mode === "merge" && merged[field]) continue;
                  merged[field] = val;
                }
                next[gameId] = merged;
              }
              return next;
            });
            imported.push(category);
            break;
          }
          case "scheduleMeta": {
            const overrides = snap.gameMetaOverrides;
            if (Object.keys(overrides).length === 0) {
              skipped.push(category);
              break;
            }
            setGameMetaOverrides((prev) => {
              if (mode === "replace") return structuredClone(overrides);
              return { ...prev, ...structuredClone(overrides) };
            });
            imported.push(category);
            break;
          }
          case "recruitingFills": {
            const fills = snap.athleteRecruitingFields;
            if (
              !Object.values(fills).some((v) => v && Object.keys(v).length > 0)
            ) {
              skipped.push(category);
              break;
            }
            setRoster((prev) =>
              prev.map((a) => {
                const from = fills[a.id];
                if (!from || Object.keys(from).length === 0) return a;
                if (mode === "replace") {
                  return { ...a, recruitingFields: { ...from } };
                }
                return {
                  ...a,
                  recruitingFields: {
                    ...(a.recruitingFields ?? {}),
                    ...from,
                  },
                };
              }),
            );
            imported.push(category);
            break;
          }
          case "grades": {
            const off = new Set(
              groupAbbrevsByType(positionGroups, "Offense"),
            );
            const def = new Set(
              groupAbbrevsByType(positionGroups, "Defense"),
            );
            const st = new Set(
              groupAbbrevsByType(positionGroups, "Special Teams"),
            );
            let incoming = snap.gradeRows.map((g) => ({ ...g }));
            if (sideFilter === "offense") {
              incoming = incoming.filter((g) => off.has(g.group));
            } else if (sideFilter === "defense") {
              incoming = incoming.filter((g) => def.has(g.group));
            } else if (sideFilter === "specialTeams") {
              incoming = incoming.filter((g) => st.has(g.group));
            }
            if (incoming.length === 0) {
              skipped.push(category);
              break;
            }
            setGradeRows((prev) => {
              if (mode === "replace") {
                if (sideFilter === "all") return incoming;
                const keepGroups =
                  sideFilter === "offense"
                    ? off
                    : sideFilter === "defense"
                      ? def
                      : st;
                return [
                  ...prev.filter((g) => !keepGroups.has(g.group)),
                  ...incoming,
                ];
              }
              const keyOf = (g: GradeRow) =>
                `${g.player}::${g.group}::${g.week}`;
              const seen = new Set(prev.map(keyOf));
              const added = incoming.filter((g) => !seen.has(keyOf(g)));
              return [...prev, ...added];
            });
            imported.push(category);
            break;
          }
          default:
            skipped.push(category);
        }
      }

      const labels = imported.join(", ");
      return {
        ok: imported.length > 0,
        imported,
        skipped,
        message:
          imported.length > 0
            ? `Imported ${labels} from ${arch.label}.`
            : "Nothing to import for the selected items.",
      };
    },
    [
      archivedSeasons,
      positionGroups,
    ],
  );

  const rollToNextSeason = useCallback(() => {
    const year =
      Number(currentSeasonIdRef.current) ||
      Number(INITIAL_SEASON_ID) ||
      2026;
    const liveId = currentSeasonIdRef.current;
    const snapshotSource = liveSeasonBufferRef.current
      ? liveSeasonBufferRef.current
      : captureLiveSnapshot();

    const archive: ArchivedSeason = {
      id: liveId,
      label: seasonLabel(year),
      year,
      archivedAt: new Date().toISOString(),
      snapshot: cloneArchiveSnapshot(snapshotSource),
    };

    liveSeasonBufferRef.current = null;
    setArchivedSeasons((prev) => [archive, ...prev]);
    setCurrentSeasonId(String(year + 1));
    setViewingSeasonId(String(year + 1));
    setActiveGameId(null);
    setWeekAutoAdvanceLastDay(null);

    // RESET seasonal fills; KEEP staff, unit resources, schemes, goals, members…
    setScheduleGames(cloneScheduleGames(games));
    setMaxPrepsLastSyncAt(null);
    setGameWeekAssets({});
    setGameMetaOverrides({});
    setDisabledOptionalGames(defaultPlayoffDisabled());
    setPositionScoutReports({});
    setPersonalTodosByOwner({});
    setGroupChatMessagesByGroup({});
    setGradeRows([]);
    setQuizzes([]);
    setQuizAttempts([]);
    setAttendanceByDate({});
    setBoards((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([key, board]) => [
          key,
          syncDepthRows(
            normalizeDepthBoardRows(
              {
                positions: [...board.positions],
                rows: Array.from({ length: MIN_DEPTH_ROWS }, () =>
                  emptyDepthRow(board.positions.length),
                ),
              },
              MIN_DEPTH_ROWS,
            ),
          ),
        ]),
      ),
    );
    setRoster((prev) =>
      prev.map((a) => ({
        ...a,
        customFields: emptyAthleteCustomFields(),
        recruitingFields: {},
      })),
    );
  }, [captureLiveSnapshot]);

  // Recurring week auto-advance (local day + time)
  useEffect(() => {
    if (!weekAutoAdvance?.enabled || isArchiveMode) return;

    const tick = () => {
      const cfg = weekAutoAdvance;
      if (!cfg?.enabled) return;
      const hm = parseHm(cfg.time);
      if (!hm) return;
      const now = new Date();
      if (now.getDay() !== cfg.dayOfWeek) return;
      const minsNow = now.getHours() * 60 + now.getMinutes();
      const minsTarget = hm.hour * 60 + hm.minute;
      if (minsNow < minsTarget) return;
      const dayKey = localDayKey(now);
      if (weekAutoAdvanceLastDay === dayKey) return;

      const visible = visibleScheduleGamesList(
        scheduleGames,
        disabledOptionalGames,
      );
      if (visible.length === 0) return;
      const year = Number(currentSeasonId) || undefined;
      const current = resolveActiveGame(
        visible,
        activeGameId,
        now,
        year,
      );
      const idx = visible.findIndex((g) => g.id === current.id);
      const next = idx >= 0 ? visible[idx + 1] : undefined;
      if (!next) {
        setWeekAutoAdvanceLastDay(dayKey);
        return;
      }
      setActiveGameId(next.id);
      setWeekAutoAdvanceLastDay(dayKey);
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [
    weekAutoAdvance,
    weekAutoAdvanceLastDay,
    isArchiveMode,
    disabledOptionalGames,
    activeGameId,
    currentSeasonId,
    scheduleGames,
  ]);

  const openPlayerSettings = useCallback((athleteId: string) => {
    setCoachSettingsId(null);
    setPlayerSettingsId(athleteId);
  }, []);

  const closePlayerSettings = useCallback(() => {
    setPlayerSettingsId(null);
  }, []);

  const openCoachSettings = useCallback((memberId: string) => {
    setPlayerSettingsId(null);
    setCoachSettingsId(memberId);
  }, []);

  const closeCoachSettings = useCallback(() => {
    setCoachSettingsId(null);
  }, []);

  const addInventorySheetColumn = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return false;
    setInventorySheetColumns((prev) => {
      const key = slugifyInventoryFieldKey(
        trimmed,
        prev.map((c) => c.key),
      );
      if (prev.some((c) => c.key === key)) return prev;
      return [...prev, { key, label: trimmed }];
    });
    return true;
  }, []);

  const renameInventorySheetColumn = useCallback(
    (key: string, label: string) => {
      let found = false;
      setInventorySheetColumns((prev) => {
        if (!prev.some((c) => c.key === key)) return prev;
        found = true;
        return prev.map((c) => (c.key === key ? { ...c, label } : c));
      });
      return found;
    },
    [],
  );

  const removeInventorySheetColumn = useCallback((key: string) => {
    setInventorySheetColumns((prev) => prev.filter((c) => c.key !== key));
    setRoster((prev) =>
      prev.map((a) => {
        if (!a.customFields || !(key in a.customFields)) return a;
        const nextFields = { ...a.customFields };
        delete nextFields[key];
        return { ...a, customFields: nextFields };
      }),
    );
  }, []);

  const addRecruitingSheetColumn = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return false;
    setRecruitingSheetColumns((prev) => {
      const key = slugifyRecruitingFieldKey(
        trimmed,
        prev.map((c) => c.key),
      );
      if (prev.some((c) => c.key === key)) return prev;
      return [...prev, { key, label: trimmed, inputWidth: "w-28" }];
    });
    return true;
  }, []);

  const renameRecruitingSheetColumn = useCallback(
    (key: string, label: string) => {
      let found = false;
      setRecruitingSheetColumns((prev) => {
        if (!prev.some((c) => c.key === key)) return prev;
        found = true;
        return prev.map((c) => (c.key === key ? { ...c, label } : c));
      });
      return found;
    },
    [],
  );

  const removeRecruitingSheetColumn = useCallback((key: string) => {
    if (key === "name") return;
    setRecruitingSheetColumns((prev) => prev.filter((c) => c.key !== key));
    if (isRecruitingStructuralKey(key)) return;
    setRoster((prev) =>
      prev.map((a) => {
        if (isRecruitingCoreFieldKey(key)) {
          if (!a[key]) return a;
          return { ...a, [key]: "" };
        }
        if (!a.recruitingFields || !(key in a.recruitingFields)) return a;
        const nextFields = { ...a.recruitingFields };
        delete nextFields[key];
        return { ...a, recruitingFields: nextFields };
      }),
    );
  }, []);

  const setAttendance = useCallback(
    (athleteId: string, status: AttendanceStatus) => {
      setAttendanceByDate((prev) => ({
        ...prev,
        [attendanceDate]: {
          ...(prev[attendanceDate] ?? {}),
          [athleteId]: status,
        },
      }));
    },
    [attendanceDate],
  );

  const updateAthlete = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          Athlete,
          | "firstName"
          | "lastName"
          | "name"
          | "groups"
          | "classYear"
          | "personnelType"
          | "supportRole"
          | "teamLevel"
          | "athleticPeriod"
          | "phone"
          | "email"
          | "headshotUrl"
          | "headshotFileName"
          | "height"
          | "weight"
          | "jerseyNumber"
          | "totalGpa"
          | "coreGpa"
          | "actSat"
          | "twitterHandle"
          | "hudlLink"
        >
      > & {
        customFields?: Partial<NonNullable<Athlete["customFields"]>>;
        recruitingFields?: Partial<
          NonNullable<Athlete["recruitingFields"]>
        >;
      },
    ) => {
      setRoster((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const {
            customFields: customPatch,
            recruitingFields: recruitingPatch,
            ...rest
          } = patch;
          const next = { ...a, ...rest };
          if (patch.firstName !== undefined || patch.lastName !== undefined) {
            next.firstName = patch.firstName ?? a.firstName;
            next.lastName = patch.lastName ?? a.lastName;
            next.name = composeDisplayName(next.firstName, next.lastName);
          }
          if (customPatch) {
            next.customFields = {
              ...emptyAthleteCustomFields(),
              ...a.customFields,
              ...(customPatch as Record<string, string>),
            };
          }
          if (recruitingPatch) {
            next.recruitingFields = {
              ...a.recruitingFields,
              ...(recruitingPatch as Record<string, string>),
            };
          }
          if (patch.personnelType === "support-staff") {
            next.groups = patch.groups ?? [];
            next.teamLevel = undefined;
          }
          return next;
        }),
      );
    },
    [],
  );

  const deleteAthlete = useCallback((id: string) => {
    setRoster((prev) => {
      const victim = prev.find((a) => a.id === id);
      if (victim?.accountId) {
        setTeamMembers((members) =>
          members.map((m) =>
            m.id === victim.accountId
              ? { ...m, status: "inactive" as const }
              : m,
          ),
        );
      }
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const deleteMember = useCallback((id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    setRoster((prev) =>
      prev.map((a) =>
        a.accountId === id ? { ...a, accountId: null } : a,
      ),
    );
  }, []);

  const updateMember = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          TeamMember,
          | "firstName"
          | "lastName"
          | "name"
          | "role"
          | "status"
          | "phone"
          | "email"
          | "headshotUrl"
          | "headshotFileName"
          | "assignedTeams"
          | "duties"
          | "notes"
          | "athleticPeriod"
        >
      >,
    ) => {
      setTeamMembers((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const next = { ...m, ...patch };
          if (patch.firstName !== undefined || patch.lastName !== undefined) {
            next.firstName = patch.firstName ?? m.firstName;
            next.lastName = patch.lastName ?? m.lastName;
            next.name = composeDisplayName(next.firstName, next.lastName);
          }
          return next;
        }),
      );
    },
    [],
  );

  const createMemberAccount = useCallback(
    (input: {
      firstName: string;
      lastName: string;
      role: Role;
      personnelType?: Athlete["personnelType"];
      phone?: string;
      email?: string;
    }) => {
      const memberId = `m-${Date.now()}`;
      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      const name = composeDisplayName(firstName, lastName);
      const isStaff =
        input.role === "coach" ||
        input.role === "coordinator" ||
        input.role === "admin";
      setTeamMembers((prev) => [
        ...prev,
        {
          id: memberId,
          firstName,
          lastName,
          name,
          role: input.role,
          status: "active",
          phone: input.phone?.trim() || "",
          email: input.email?.trim() || "",
          headshotUrl: null,
          headshotFileName: null,
          ...(isStaff
            ? {
                assignedTeams: [],
                duties: "",
                notes: "",
                athleticPeriod: "",
              }
            : {}),
        },
      ]);
      if (input.role !== "player") {
        return { memberId };
      }
      const athleteId = `a-acct-${Date.now()}`;
      const personnelType = input.personnelType ?? "athlete";
      const isSupport = personnelType === "support-staff";
      setRoster((prev) => {
        const next: Athlete = {
          id: athleteId,
          firstName,
          lastName,
          name,
          groups: isSupport ? [] : ["K"],
          classYear: "freshman",
          accountId: memberId,
          personnelType,
          teamLevel: isSupport ? undefined : "Varsity",
          phone: input.phone?.trim() || "",
          email: input.email?.trim() || "",
          headshotUrl: null,
          headshotFileName: null,
          height: "",
          weight: "",
          customFields: emptyAthleteCustomFields(),
          recruitingFields: {},
        };
        return [...prev, next].sort(compareByLastName);
      });
      return { memberId, athleteId };
    },
    [],
  );

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    setPage(defaultPageForRole(r));
    setOpenNavMenu(null);
  }, []);

  const setGameWeekAsset = useCallback(
    (
      gameId: string,
      field: keyof GameWeekAssets,
      fileName: string | null,
    ) => {
      setGameWeekAssets((prev) => {
        const current = prev[gameId] ?? emptyGameWeekAssets();
        return {
          ...prev,
          [gameId]: { ...current, [field]: fileName },
        };
      });
    },
    [],
  );

  const setGameMeta = useCallback((gameId: string, patch: GameMetaOverride) => {
    setGameMetaOverrides((prev) => ({
      ...prev,
      [gameId]: { ...prev[gameId], ...patch },
    }));
    // Keep result fields on the schedule row in sync when edited via meta form
    if (
      "result" in patch ||
      "ourScore" in patch ||
      "oppScore" in patch ||
      "resultSource" in patch
    ) {
      setScheduleGames((prev) =>
        prev.map((g) => {
          if (g.id !== gameId) return g;
          const ourScore =
            patch.ourScore !== undefined ? patch.ourScore : g.ourScore;
          const oppScore =
            patch.oppScore !== undefined ? patch.oppScore : g.oppScore;
          const label =
            patch.result !== undefined
              ? patch.result
              : formatGameResult({
                  ourScore,
                  oppScore,
                  outcome: parseResultLabel(g.result ?? "")?.outcome,
                  label: g.result,
                }) ?? g.result;
          return {
            ...g,
            result: label ?? undefined,
            ourScore: ourScore ?? null,
            oppScore: oppScore ?? null,
            resultSource:
              patch.resultSource !== undefined
                ? patch.resultSource
                : "manual",
          };
        }),
      );
    }
  }, []);

  const setGameResult = useCallback(
    (
      gameId: string,
      patch: {
        result?: string | null;
        ourScore?: number | null;
        oppScore?: number | null;
      },
    ) => {
      const resolve = (cur: {
        result?: string | null;
        ourScore?: number | null;
        oppScore?: number | null;
      }) => {
        const clearing =
          patch.result === null &&
          patch.ourScore === null &&
          patch.oppScore === null;

        if (clearing) {
          return {
            result: null as string | null,
            ourScore: null as number | null,
            oppScore: null as number | null,
            resultSource: null as "manual" | "maxpreps" | null,
          };
        }

        let ourScore =
          patch.ourScore !== undefined ? patch.ourScore : cur.ourScore;
        let oppScore =
          patch.oppScore !== undefined ? patch.oppScore : cur.oppScore;
        let label =
          patch.result !== undefined ? patch.result : cur.result ?? null;

        if (
          patch.ourScore !== undefined &&
          patch.oppScore !== undefined &&
          patch.ourScore != null &&
          patch.oppScore != null &&
          patch.result === undefined
        ) {
          const outcome =
            patch.ourScore > patch.oppScore
              ? "W"
              : patch.ourScore < patch.oppScore
                ? "L"
                : "T";
          label = `${outcome} ${patch.ourScore}-${patch.oppScore}`;
        } else if (typeof label === "string" && label.trim()) {
          const parsed = parseResultLabel(label);
          if (parsed) {
            ourScore = parsed.ourScore;
            oppScore = parsed.oppScore;
            label = parsed.label;
          }
        }

        return {
          result: label || null,
          ourScore: ourScore ?? null,
          oppScore: oppScore ?? null,
          resultSource: "manual" as const,
        };
      };

      setScheduleGames((prev) =>
        prev.map((g) => {
          if (g.id !== gameId) return g;
          const next = resolve(g);
          return {
            ...g,
            result: next.result || undefined,
            ourScore: next.ourScore,
            oppScore: next.oppScore,
            resultSource: next.resultSource,
          };
        }),
      );
      setGameMetaOverrides((prev) => {
        const cur = prev[gameId] ?? {};
        const next = resolve({
          result: cur.result ?? null,
          ourScore: cur.ourScore ?? null,
          oppScore: cur.oppScore ?? null,
        });
        return {
          ...prev,
          [gameId]: {
            ...cur,
            result: next.result,
            ourScore: next.ourScore,
            oppScore: next.oppScore,
            resultSource: next.resultSource,
          },
        };
      });
    },
    [],
  );

  const syncMaxPrepsResults = useCallback(
    async (opts?: { force?: boolean }) => {
      const viewingYear =
        Number(viewingSeasonIdRef.current) ||
        Number(currentSeasonIdRef.current) ||
        2026;
      const currentYear = Number(currentSeasonIdRef.current) || 2026;
      const year = maxPrepsYearForViewingSeason(viewingYear, currentYear);
      const archiveBrowse = viewingYear !== currentYear;
      try {
        const res = await fetch(`/api/maxpreps?year=${year}`);
        if (!res.ok) {
          return {
            ok: false,
            updatedCount: 0,
            fromSeed: true,
            message: `MaxPreps request failed (${res.status}).`,
          };
        }
        const payload = (await res.json()) as MaxPrepsSeasonPayload;
        let updatedCount = 0;
        // Archive MaxPreps section is prior-year reference — do not overwrite
        // that season's schedule scores with a different MaxPreps year.
        // Merge rules (applyMaxPrepsResultsToGames): skip two-a-days/scrimmage;
        // preserve resultSource === "manual" unless opts.force; match by opponent.
        // After a successful apply, clear result fields on gameMetaOverrides for
        // updated ids so MaxPreps values are not shadowed by stale overrides.
        if (!archiveBrowse) {
          let updatedIds: string[] = [];
          setScheduleGames((prev) => {
            const applied = applyMaxPrepsResultsToGames(
              prev,
              payload.games ?? [],
              { force: opts?.force },
            );
            updatedCount = applied.updatedIds.length;
            updatedIds = applied.updatedIds;
            return applied.games;
          });
          if (updatedIds.length > 0) {
            const clearIds = new Set(updatedIds);
            setGameMetaOverrides((prev) => {
              let changed = false;
              const next: typeof prev = { ...prev };
              for (const id of clearIds) {
                const cur = next[id];
                if (!cur) continue;
                if (
                  cur.result === undefined &&
                  cur.ourScore === undefined &&
                  cur.oppScore === undefined &&
                  (cur.resultSource === undefined || cur.resultSource === null)
                ) {
                  continue;
                }
                changed = true;
                const {
                  result: _r,
                  ourScore: _o,
                  oppScore: _p,
                  resultSource: _s,
                  ...rest
                } = cur;
                if (Object.keys(rest).length === 0) delete next[id];
                else next[id] = rest;
              }
              return changed ? next : prev;
            });
          }
        }
        const at = new Date().toISOString();
        setMaxPrepsLastSyncAt(at);
        const seasonLabel = `${payload.seasonYear}`;
        return {
          ok: true,
          updatedCount,
          fromSeed: !!payload.fromSeed,
          message: archiveBrowse
            ? payload.fromSeed
              ? `Loaded ${seasonLabel} MaxPreps seed (${payload.record.wins}-${payload.record.losses}).`
              : `Loaded ${seasonLabel} MaxPreps (${payload.record.wins}-${payload.record.losses}).`
            : payload.fromSeed
              ? updatedCount > 0
                ? `Updated ${updatedCount} result(s) from seeded MaxPreps data.`
                : "Synced (seeded MaxPreps data; no new results)."
              : updatedCount > 0
                ? `Updated ${updatedCount} result(s) from MaxPreps.`
                : "Synced with MaxPreps; no new results.",
          payload,
        };
      } catch (e) {
        return {
          ok: false,
          updatedCount: 0,
          fromSeed: true,
          message:
            e instanceof Error ? e.message : "MaxPreps sync failed.",
        };
      }
    },
    [],
  );

  const setOptionalGameEnabled = useCallback(
    (gameId: string, enabled: boolean) => {
      setDisabledOptionalGames((prev) => {
        if (enabled) {
          const next = { ...prev };
          delete next[gameId];
          return next;
        }
        return { ...prev, [gameId]: true };
      });
    },
    [],
  );

  const setGoalsForSide = useCallback(
    (side: Side, updater: (prev: UnitGoal[]) => UnitGoal[]) => {
      if (side === "offense") setOffenseGoals(updater);
      else if (side === "defense") setDefenseGoals(updater);
      // specialTeams goals are not persisted yet
    },
    [],
  );

  const setUnitGoalText = useCallback(
    (side: Side, goalId: string, text: string) => {
      setGoalsForSide(side, (prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, text } : g)),
      );
    },
    [setGoalsForSide],
  );

  const addUnitGoal = useCallback(
    (side: Side, text = "New goal") => {
      setGoalsForSide(side, (prev) => [
        ...prev,
        {
          id: `${side}-goal-${Date.now()}`,
          text,
        },
      ]);
    },
    [setGoalsForSide],
  );

  const removeUnitGoal = useCallback(
    (side: Side, goalId: string) => {
      setGoalsForSide(side, (prev) => prev.filter((g) => g.id !== goalId));
    },
    [setGoalsForSide],
  );

  const moveUnitGoal = useCallback(
    (side: Side, goalId: string, direction: "up" | "down") => {
      setGoalsForSide(side, (prev) => {
        const i = prev.findIndex((g) => g.id === goalId);
        if (i < 0) return prev;
        const j = direction === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= prev.length) return prev;
        const next = [...prev];
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
        return next;
      });
    },
    [setGoalsForSide],
  );

  const updateCoachDuty = useCallback(
    (id: string, patch: Partial<Omit<CoachDuty, "id">>) => {
      setCoachDutiesList((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    },
    [],
  );

  const addCoachDutyResponsibility = useCallback((dutyId: string) => {
    setCoachDutiesList((prev) =>
      prev.map((d) =>
        d.id === dutyId
          ? {
              ...d,
              duties: [
                ...d.duties,
                {
                  id: `resp-${Date.now()}`,
                  text: "New responsibility",
                  dueBy: "",
                },
              ],
            }
          : d,
      ),
    );
  }, []);

  const updateCoachDutyResponsibility = useCallback(
    (
      dutyId: string,
      respId: string,
      patch: Partial<{ text: string; dueBy: string }>,
    ) => {
      setCoachDutiesList((prev) =>
        prev.map((d) =>
          d.id === dutyId
            ? {
                ...d,
                duties: d.duties.map((r) =>
                  r.id === respId ? { ...r, ...patch } : r,
                ),
              }
            : d,
        ),
      );
    },
    [],
  );

  const removeCoachDutyResponsibility = useCallback(
    (dutyId: string, respId: string) => {
      setCoachDutiesList((prev) =>
        prev.map((d) =>
          d.id === dutyId
            ? { ...d, duties: d.duties.filter((r) => r.id !== respId) }
            : d,
        ),
      );
    },
    [],
  );

  const addCoachDuty = useCallback(() => {
    setCoachDutiesList((prev) => [
      ...prev,
      {
        id: `duty-${Date.now()}`,
        coach: seedCoachDuties[0]?.coach ?? "Coach Spencer",
        role: "coach",
        side: "defense",
        groups: [],
        duties: [
          {
            id: `resp-${Date.now()}`,
            text: "New responsibility",
            dueBy: "",
          },
        ],
        notes: "",
      },
    ]);
  }, []);

  const removeCoachDuty = useCallback((id: string) => {
    setCoachDutiesList((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addPersonalTodo = useCallback(
    (
      ownerKey: string,
      text = "New to-do",
      opts?: { sourceResponsibilityId?: string },
    ) => {
      if (!ownerKey) return;
      setPersonalTodosByOwner((prev) => ({
        ...prev,
        [ownerKey]: [
          ...(prev[ownerKey] ?? []),
          {
            id: `ptodo-${Date.now()}`,
            text,
            done: false,
            ...(opts?.sourceResponsibilityId
              ? { sourceResponsibilityId: opts.sourceResponsibilityId }
              : {}),
          },
        ],
      }));
    },
    [],
  );

  const updatePersonalTodo = useCallback(
    (
      ownerKey: string,
      id: string,
      patch: Partial<Pick<PersonalTodo, "text" | "done">>,
    ) => {
      if (!ownerKey) return;
      setPersonalTodosByOwner((prev) => ({
        ...prev,
        [ownerKey]: (prev[ownerKey] ?? []).map((t) =>
          t.id === id ? { ...t, ...patch } : t,
        ),
      }));
    },
    [],
  );

  const togglePersonalTodo = useCallback((ownerKey: string, id: string) => {
    if (!ownerKey) return;
    setPersonalTodosByOwner((prev) => ({
      ...prev,
      [ownerKey]: (prev[ownerKey] ?? []).map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      ),
    }));
  }, []);

  const removePersonalTodo = useCallback((ownerKey: string, id: string) => {
    if (!ownerKey) return;
    setPersonalTodosByOwner((prev) => ({
      ...prev,
      [ownerKey]: (prev[ownerKey] ?? []).filter((t) => t.id !== id),
    }));
  }, []);

  const sendGroupChatMessage = useCallback(
    (input: {
      group: string;
      senderId: string;
      senderName: string;
      senderRole: GroupChatSenderRole;
      body: string;
    }) => {
      const body = input.body.trim();
      if (!input.group || !body) return;
      const message: GroupChatMessage = {
        id: `gchat-${Date.now()}`,
        group: input.group,
        senderId: input.senderId,
        senderName: input.senderName,
        senderRole: input.senderRole,
        body,
        createdAt: new Date().toISOString(),
      };
      setGroupChatMessagesByGroup((prev) => ({
        ...prev,
        [input.group]: [...(prev[input.group] ?? []), message],
      }));
    },
    [],
  );

  const setCoachOnGroup = useCallback(
    (group: string, coachId: string, assigned: boolean) => {
      setCoachAssignments((prev) => {
        const current = prev[group] ?? [];
        const next = assigned
          ? current.includes(coachId)
            ? current
            : [...current, coachId]
          : current.filter((id) => id !== coachId);
        return { ...prev, [group]: next };
      });
    },
    [],
  );

  const savePositionScoutReport = useCallback(
    (
      reportSide: Side,
      group: string,
      report: { notes: string; fileName: string | null },
      gameId?: string,
    ) => {
      const key = scoutReportKey(reportSide, group, gameId);
      setPositionScoutReports((prev) => ({
        ...prev,
        [key]: {
          notes: report.notes,
          fileName: report.fileName,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    [],
  );

  const getBoard = useCallback(
    (teamIndex: number, schemeId: DepthScheme) => {
      const existing = boards[boardKey(teamIndex, schemeId)];
      if (existing) return existing;
      const template = depthBoards[schemeId];
      if (template) {
        return syncDepthRows(
          normalizeDepthBoardRows(cloneBoard(template), MIN_DEPTH_ROWS),
        );
      }
      return emptyBoardForColumns(columnsFromPositionNames(["POS"]));
    },
    [boards],
  );

  const ensureDepthBoard = useCallback(
    (teamIndex: number, schemeId: DepthScheme) => {
      setBoards((prev) => {
        const key = boardKey(teamIndex, schemeId);
        if (prev[key]) {
          const synced = syncDepthRows(prev[key]!);
          if (synced.rows.length === prev[key]!.rows.length) return prev;
          return { ...prev, [key]: synced };
        }
        const template = depthBoards[schemeId];
        const next = template
          ? syncDepthRows(
              normalizeDepthBoardRows(cloneBoard(template), MIN_DEPTH_ROWS),
            )
          : emptyBoardForColumns(columnsFromPositionNames(["POS"]));
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const moveDepthPlayer = useCallback(
    (from: DepthCellRef, to: DepthCellRef, relevantCols?: number[]) => {
      if (
        from.teamIndex === to.teamIndex &&
        from.schemeId === to.schemeId &&
        from.row === to.row &&
        from.col === to.col
      ) {
        return;
      }
      if (from.teamIndex !== to.teamIndex || from.schemeId !== to.schemeId) {
        return;
      }

      setBoards((prev) => {
        const key = boardKey(from.teamIndex, from.schemeId);
        const template = depthBoards[from.schemeId];
        const current =
          prev[key] ??
          (template
            ? syncDepthRows(
                normalizeDepthBoardRows(cloneBoard(template), MIN_DEPTH_ROWS),
              )
            : emptyBoardForColumns(columnsFromPositionNames(["POS"])));
        const rows = current.rows.map((row) => [...row]);
        const a = rows[from.row]?.[from.col];
        if (!a) return prev;
        const b = rows[to.row]?.[to.col] ?? null;
        rows[from.row] = [...rows[from.row]];
        rows[to.row] = [...rows[to.row]];
        rows[from.row][from.col] = b;
        rows[to.row][to.col] = a;
        return {
          ...prev,
          [key]: syncDepthRows(
            { positions: [...current.positions], rows },
            relevantCols,
          ),
        };
      });
    },
    [],
  );

  const setDepthCell = useCallback(
    (
      ref: DepthCellRef,
      player: { name: string; classYear: GradClass } | null,
      relevantCols?: number[],
    ) => {
      setBoards((prev) => {
        const key = boardKey(ref.teamIndex, ref.schemeId);
        const template = depthBoards[ref.schemeId];
        const current =
          prev[key] ??
          (template
            ? syncDepthRows(
                normalizeDepthBoardRows(cloneBoard(template), MIN_DEPTH_ROWS),
              )
            : emptyBoardForColumns(columnsFromPositionNames(["POS"])));
        const rows = current.rows.map((row) => [...row]);
        if (!rows[ref.row]) return prev;
        rows[ref.row] = [...rows[ref.row]];
        rows[ref.row][ref.col] = player ? { ...player } : null;
        return {
          ...prev,
          [key]: syncDepthRows(
            { positions: [...current.positions], rows },
            relevantCols,
          ),
        };
      });
    },
    [],
  );

  const saveDepthBoard = useCallback(
    (teamIndex: number, schemeId: DepthScheme, board: DepthChartBoard) => {
      setBoards((prev) => ({
        ...prev,
        [boardKey(teamIndex, schemeId)]: syncDepthRows(cloneBoard(board)),
      }));
    },
    [],
  );

  const saveDepthScheme = useCallback((scheme: SchemeConfig) => {
    const columns = scheme.columns.length
      ? scheme.columns
      : columnsFromPositionNames(["POS"]);
    const normalized: SchemeConfig = {
      ...scheme,
      label: scheme.label.trim() || "Untitled",
      schemeType: scheme.schemeType || "Practice",
      columns,
    };
    setSchemes((prev) => {
      const exists = prev.some((s) => s.id === normalized.id);
      return exists
        ? prev.map((s) => (s.id === normalized.id ? normalized : s))
        : [...prev, normalized];
    });
    setBoards((prev) => {
      const next = { ...prev };
      const teamIndices = new Set<number>();
      for (let i = 0; i < teamLevels.length; i++) teamIndices.add(i);
      for (const key of Object.keys(prev)) {
        const n = Number(key.split("::")[0]);
        if (!Number.isNaN(n)) teamIndices.add(n);
      }
      for (const teamIndex of teamIndices) {
        const key = boardKey(teamIndex, normalized.id);
        const existing = prev[key];
        next[key] = existing
          ? remapBoardToColumns(existing, columns)
          : emptyBoardForColumns(columns);
      }
      return next;
    });
  }, []);

  const deleteDepthScheme = useCallback((schemeId: string) => {
    setSchemes((prev) => prev.filter((s) => s.id !== schemeId));
    setBoards((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.endsWith(`::${schemeId}`)) delete next[key];
      }
      return next;
    });
    setDepthChartPanels((prev) =>
      prev.filter((p) => p.schemeId !== schemeId),
    );
  }, []);

  const offenseGroupCodes = useMemo(
    () => groupAbbrevsByType(positionGroups, "Offense"),
    [positionGroups],
  );
  const defenseGroupCodes = useMemo(
    () => groupAbbrevsByType(positionGroups, "Defense"),
    [positionGroups],
  );
  const specialTeamsGroupCodes = useMemo(
    () => groupAbbrevsByType(positionGroups, "Special Teams"),
    [positionGroups],
  );
  const allPositionCodes = useMemo(
    () => allGroupAbbrevs(positionGroups),
    [positionGroups],
  );

  const addPositionGroup = useCallback(() => {
    setPositionGroups((prev) => [
      ...prev,
      {
        id: `pos-${Date.now()}`,
        name: "New Position",
        abbreviation: "NEW",
        type: "Offense" as PositionType,
      },
    ]);
  }, []);

  const updatePositionGroup = useCallback(
    (
      id: string,
      patch: Partial<Pick<PositionGroupDef, "name" | "abbreviation" | "type">>,
    ) => {
      setPositionGroups((prev) => {
        const current = prev.find((p) => p.id === id);
        if (!current) return prev;
        let nextAbbr = patch.abbreviation ?? current.abbreviation;
        nextAbbr = nextAbbr.trim().toUpperCase() || current.abbreviation;
        const oldAbbr = current.abbreviation;
        const renamed = nextAbbr !== oldAbbr;

        if (renamed) {
          const clash = prev.some(
            (p) => p.id !== id && p.abbreviation === nextAbbr,
          );
          if (clash) return prev;

          setRoster((rosterPrev) =>
            rosterPrev.map((a) => ({
              ...a,
              groups: a.groups.map((g) => (g === oldAbbr ? nextAbbr : g)),
            })),
          );
          setCoachAssignments((assignPrev) => {
            if (!(oldAbbr in assignPrev)) return assignPrev;
            const next = { ...assignPrev };
            const existing = next[nextAbbr] ?? [];
            const merged = [
              ...new Set([...(next[oldAbbr] ?? []), ...existing]),
            ];
            delete next[oldAbbr];
            next[nextAbbr] = merged;
            return next;
          });
        }

        return prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...patch,
                abbreviation: nextAbbr,
                name: patch.name !== undefined ? patch.name : p.name,
                type: patch.type !== undefined ? patch.type : p.type,
              }
            : p,
        );
      });
    },
    [],
  );

  const removePositionGroup = useCallback((id: string) => {
    setPositionGroups((prev) => {
      const victim = prev.find((p) => p.id === id);
      if (!victim) return prev;
      const abbr = victim.abbreviation;
      setRoster((rosterPrev) =>
        rosterPrev.map((a) => ({
          ...a,
          groups: a.groups.filter((g) => g !== abbr),
        })),
      );
      setCoachAssignments((assignPrev) => {
        if (!(abbr in assignPrev)) return assignPrev;
        const next = { ...assignPrev };
        delete next[abbr];
        return next;
      });
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const addUnitResource = useCallback(
    (forSide: Side, file: Omit<UnitResourceFile, "id">) => {
      const entry: UnitResourceFile = {
        ...file,
        id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      };
      setUnitResources((prev) => ({
        ...prev,
        [forSide]: [entry, ...prev[forSide]],
      }));
    },
    [],
  );

  const removeUnitResource = useCallback((forSide: Side, id: string) => {
    setUnitResources((prev) => ({
      ...prev,
      [forSide]: prev[forSide].filter((f) => f.id !== id),
    }));
  }, []);

  const upsertPlayerGrade = useCallback(
    (
      key: { player: string; group: string; week: number },
      patch: Partial<Pick<GradeRow, "practice" | "game" | "pride">>,
    ) => {
      setGradeRows((prev) => {
        const idx = prev.findIndex(
          (g) =>
            g.player === key.player &&
            g.group === key.group &&
            g.week === key.week,
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx]!, ...patch };
          return next;
        }
        return [
          ...prev,
          {
            player: key.player,
            group: key.group,
            week: key.week,
            practice: patch.practice ?? 0,
            game: patch.game ?? 0,
            pride: patch.pride ?? "C",
          },
        ];
      });
    },
    [],
  );

  const upsertQuiz = useCallback((quiz: Quiz) => {
    setQuizzes((prev) => {
      const idx = prev.findIndex((q) => q.id === quiz.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = quiz;
        return next;
      }
      return [quiz, ...prev];
    });
  }, []);

  const updateQuiz = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<
          Quiz,
          | "title"
          | "due"
          | "assignedGroups"
          | "status"
          | "passingScore"
          | "score"
          | "questions"
          | "generatedAt"
          | "generationSource"
          | "gameId"
        >
      >,
    ) => {
      setQuizzes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      );
    },
    [],
  );

  const removeQuiz = useCallback((id: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const addQuizQuestion = useCallback(
    (quizId: string, question?: QuizQuestion) => {
      const nextQ: QuizQuestion = question ?? {
        id: `qq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        prompt: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        source: "coach",
      };
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId
            ? { ...q, questions: [...q.questions, nextQ] }
            : q,
        ),
      );
    },
    [],
  );

  const updateQuizQuestion = useCallback(
    (
      quizId: string,
      questionId: string,
      patch: Partial<
        Pick<
          QuizQuestion,
          "prompt" | "options" | "correctIndex" | "source" | "explanation"
        >
      >,
    ) => {
      setQuizzes((prev) =>
        prev.map((q) => {
          if (q.id !== quizId) return q;
          return {
            ...q,
            questions: q.questions.map((qq) =>
              qq.id === questionId ? { ...qq, ...patch } : qq,
            ),
          };
        }),
      );
    },
    [],
  );

  const removeQuizQuestion = useCallback(
    (quizId: string, questionId: string) => {
      setQuizzes((prev) =>
        prev.map((q) => {
          if (q.id !== quizId) return q;
          return {
            ...q,
            questions: q.questions.filter((qq) => qq.id !== questionId),
          };
        }),
      );
    },
    [],
  );

  const recordQuizAttempt = useCallback(
    (input: { athleteId: string; quizId: string; score: number }) => {
      const completedAt = new Date().toISOString();
      setQuizAttempts((prev) => {
        const idx = prev.findIndex(
          (a) =>
            a.athleteId === input.athleteId && a.quizId === input.quizId,
        );
        const next: QuizAttempt = {
          id:
            idx >= 0
              ? prev[idx]!.id
              : `qa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          athleteId: input.athleteId,
          quizId: input.quizId,
          score: input.score,
          completed: true,
          completedAt,
        };
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = next;
          return copy;
        }
        return [next, ...prev];
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      side,
      setSide,
      page,
      setPage,
      presentMode,
      setPresentMode,
      season,
      currentSeasonId,
      viewingSeasonId,
      setViewingSeason,
      isArchiveMode,
      scheduleGames,
      setScheduleGames,
      setGameResult,
      syncMaxPrepsResults,
      maxPrepsLastSyncAt,
      activeGameId,
      setActiveWeek,
      weekAutoAdvance,
      setWeekAutoAdvance,
      archivedSeasons,
      rollToNextSeason,
      deleteArchivedSeason,
      importFromArchivedSeason,
      quickActionsByOwner,
      setQuickActionsForOwner,
      clearQuickActionsForOwner,
      openNavMenu,
      setOpenNavMenu,
      branding,
      setBranding,
      teamNames,
      setTeamNames,
      schemes,
      setSchemes,
      saveDepthScheme,
      deleteDepthScheme,
      classColors,
      setClassColors,
      getBoard,
      ensureDepthBoard,
      moveDepthPlayer,
      setDepthCell,
      saveDepthBoard,
      depthChartPanels,
      setDepthChartPanels,
      coachAssignments,
      setCoachOnGroup,
      positionScoutReports,
      savePositionScoutReport,
      gameWeekAssets,
      setGameWeekAsset,
      gameMetaOverrides,
      setGameMeta,
      disabledOptionalGames,
      setOptionalGameEnabled,
      offenseGoals,
      defenseGoals,
      setUnitGoalText,
      addUnitGoal,
      removeUnitGoal,
      moveUnitGoal,
      coachDutiesList,
      updateCoachDuty,
      addCoachDutyResponsibility,
      updateCoachDutyResponsibility,
      removeCoachDutyResponsibility,
      addCoachDuty,
      removeCoachDuty,
      personalTodosByOwner,
      addPersonalTodo,
      updatePersonalTodo,
      togglePersonalTodo,
      removePersonalTodo,
      groupChatMessagesByGroup,
      sendGroupChatMessage,
      gradeRows,
      upsertPlayerGrade,
      quizzes,
      upsertQuiz,
      updateQuiz,
      removeQuiz,
      addQuizQuestion,
      updateQuizQuestion,
      removeQuizQuestion,
      quizAttempts,
      recordQuizAttempt,
      roster,
      updateAthlete,
      deleteAthlete,
      deleteMember,
      updateMember,
      teamMembers,
      createMemberAccount,
      playerSettingsId,
      openPlayerSettings,
      closePlayerSettings,
      coachSettingsId,
      openCoachSettings,
      closeCoachSettings,
      attendance,
      attendanceByDate,
      setAttendance,
      attendanceDate,
      setAttendanceDate,
      positionGroups,
      addPositionGroup,
      updatePositionGroup,
      removePositionGroup,
      offenseGroupCodes,
      defenseGroupCodes,
      specialTeamsGroupCodes,
      allPositionCodes,
      inventorySheetColumns,
      addInventorySheetColumn,
      renameInventorySheetColumn,
      removeInventorySheetColumn,
      recruitingSheetColumns,
      addRecruitingSheetColumn,
      renameRecruitingSheetColumn,
      removeRecruitingSheetColumn,
      unitResources,
      addUnitResource,
      removeUnitResource,
    }),
    [
      role,
      setRole,
      side,
      page,
      presentMode,
      season,
      currentSeasonId,
      viewingSeasonId,
      setViewingSeason,
      isArchiveMode,
      scheduleGames,
      setScheduleGames,
      setGameResult,
      syncMaxPrepsResults,
      maxPrepsLastSyncAt,
      activeGameId,
      setActiveWeek,
      weekAutoAdvance,
      setWeekAutoAdvance,
      archivedSeasons,
      rollToNextSeason,
      deleteArchivedSeason,
      importFromArchivedSeason,
      quickActionsByOwner,
      setQuickActionsForOwner,
      clearQuickActionsForOwner,
      openNavMenu,
      branding,
      teamNames,
      schemes,
      saveDepthScheme,
      deleteDepthScheme,
      classColors,
      getBoard,
      ensureDepthBoard,
      moveDepthPlayer,
      setDepthCell,
      saveDepthBoard,
      depthChartPanels,
      coachAssignments,
      setCoachOnGroup,
      positionScoutReports,
      savePositionScoutReport,
      gameWeekAssets,
      setGameWeekAsset,
      gameMetaOverrides,
      setGameMeta,
      disabledOptionalGames,
      setOptionalGameEnabled,
      offenseGoals,
      defenseGoals,
      setUnitGoalText,
      addUnitGoal,
      removeUnitGoal,
      moveUnitGoal,
      coachDutiesList,
      updateCoachDuty,
      addCoachDutyResponsibility,
      updateCoachDutyResponsibility,
      removeCoachDutyResponsibility,
      addCoachDuty,
      removeCoachDuty,
      personalTodosByOwner,
      addPersonalTodo,
      updatePersonalTodo,
      togglePersonalTodo,
      removePersonalTodo,
      groupChatMessagesByGroup,
      sendGroupChatMessage,
      gradeRows,
      upsertPlayerGrade,
      quizzes,
      upsertQuiz,
      updateQuiz,
      removeQuiz,
      addQuizQuestion,
      updateQuizQuestion,
      removeQuizQuestion,
      quizAttempts,
      recordQuizAttempt,
      roster,
      updateAthlete,
      deleteAthlete,
      deleteMember,
      updateMember,
      teamMembers,
      createMemberAccount,
      playerSettingsId,
      openPlayerSettings,
      closePlayerSettings,
      coachSettingsId,
      openCoachSettings,
      closeCoachSettings,
      attendance,
      attendanceByDate,
      setAttendance,
      attendanceDate,
      positionGroups,
      addPositionGroup,
      updatePositionGroup,
      removePositionGroup,
      offenseGroupCodes,
      defenseGroupCodes,
      specialTeamsGroupCodes,
      allPositionCodes,
      inventorySheetColumns,
      addInventorySheetColumn,
      renameInventorySheetColumn,
      removeInventorySheetColumn,
      recruitingSheetColumns,
      addRecruitingSheetColumn,
      renameRecruitingSheetColumn,
      removeRecruitingSheetColumn,
      unitResources,
      addUnitResource,
      removeUnitResource,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
