"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  seedPositionGroups,
  migrateAthleteGroups,
  allGroupAbbrevs,
  groupAbbrevsByType,
  seedOffenseGoals,
  seedDefenseGoals,
  coachDuties as seedCoachDuties,
  type Athlete,
  type CoachGroupAssignments,
  type DepthChartBoard,
  type DepthColumnDef,
  type DepthScheme,
  type GradClass,
  type PositionGroupDef,
  type PositionType,
  type TeamMember,
  type UnitGoal,
} from "@/lib/mock";
import { defaultPageForRole } from "@/lib/permissions";
import type { AppPage, CoachDuty, NavMenu, Role, Side } from "@/lib/types";

/** My GA Online Settings → Depth Chart Colors (Cy Creek values) */
export const defaultClassColors: Record<GradClass, string> = {
  alumni: "#f3f4f6",
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

export type PositionScoutReport = {
  notes: string;
  fileName: string | null;
  updatedAt: string | null;
};

export type GameWeekAssets = {
  defenseScout: string | null;
  offenseScout: string | null;
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
  offenseCallSheet: string | null;
  defenseCallSheet: string | null;
  offenseStats: string | null;
  defenseStats: string | null;
};

export function emptyGameWeekAssets(): GameWeekAssets {
  return {
    defenseScout: null,
    offenseScout: null,
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
    offenseCallSheet: null,
    defenseCallSheet: null,
    offenseStats: null,
    defenseStats: null,
  };
}

export type GameMetaOverride = {
  opponent?: string;
  date?: string;
  time?: string;
  venue?: string;
  homeAway?: "Home" | "Away";
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

export function scoutReportKey(side: Side, group: string) {
  return `${side}::${group}`;
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
  season: string;
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
      >
    > & {
      customFields?: Partial<NonNullable<Athlete["customFields"]>>;
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
  const [gameMetaOverrides, setGameMetaOverrides] = useState<
    Record<string, GameMetaOverride>
  >({});
  const [disabledOptionalGames, setDisabledOptionalGames] = useState<
    Record<string, boolean>
  >({
    // Playoff weeks start hidden until Admin enables them
    "po-1": true,
    "po-2": true,
    "po-3": true,
    "po-4": true,
    "po-5": true,
    "po-6": true,
  });
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
  const season = "2026";

  const attendance = attendanceByDate[attendanceDate] ?? {};

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
        >
      > & {
        customFields?: Partial<NonNullable<Athlete["customFields"]>>;
      },
    ) => {
      setRoster((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const { customFields: customPatch, ...rest } = patch;
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
              ...customPatch,
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
  }, []);

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
      else setDefenseGoals(updater);
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
    ) => {
      const key = scoutReportKey(reportSide, group);
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
    }),
    [
      role,
      setRole,
      side,
      page,
      presentMode,
      season,
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
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
