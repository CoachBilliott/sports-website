import type { AppPage, Role, Side } from "./types";
import { demoMemberIdForRole, isDemoPlayerAthlete } from "./mock";

const staff: Role[] = ["admin", "coordinator", "coach"];

export function canSeeScout(_role: Role) {
  return true;
}

/**
 * Content uploads / edits.
 * Live season: admin, coordinator, coach.
 * Archive browse: admin + coordinator may backfill (uploads / edits);
 * coaches and players stay view-only.
 */
export function canEditContent(role: Role, archiveMode = false) {
  if (archiveMode) {
    return role === "admin" || role === "coordinator";
  }
  return staff.includes(role);
}

/** Only program admins may delete archived seasons / archived items. */
export function canDeleteArchivedSeason(role: Role) {
  return role === "admin";
}

/** Unit coordinators and program admins — may edit any group on a unit. */
export function isCoordinatorOrAdmin(role: Role) {
  return role === "admin" || role === "coordinator";
}

/**
 * Whether staff may edit content for a specific position-group abbreviation.
 * Admin / coordinator: any group. Position coach: only `assignedGroups`
 * (already expanded/migrated via expandCoachGroupsWith / migrateGroupAbbreviation).
 */
export function canEditPositionGroup(
  role: Role,
  group: string,
  assignedGroups: Iterable<string>,
  archiveMode = false,
): boolean {
  if (!canEditContent(role, archiveMode)) return false;
  if (isCoordinatorOrAdmin(role)) return true;
  if (role !== "coach") return false;
  const allowed =
    assignedGroups instanceof Set
      ? assignedGroups
      : new Set(assignedGroups);
  return allowed.has(group);
}

/**
 * Position groups this role may edit.
 * Admin / coordinator → `unitGroups` when provided, else the full assigned set.
 * Coach → intersection of assigned groups with `unitGroups` (or assigned only).
 */
export function editablePositionGroupSet(
  role: Role,
  assignedGroups: Iterable<string>,
  unitGroups?: Iterable<string>,
  archiveMode = false,
): Set<string> {
  if (!canEditContent(role, archiveMode)) return new Set();
  if (isCoordinatorOrAdmin(role)) {
    return unitGroups ? new Set(unitGroups) : new Set(assignedGroups);
  }
  if (role !== "coach") return new Set();
  const assigned =
    assignedGroups instanceof Set
      ? assignedGroups
      : new Set(assignedGroups);
  if (!unitGroups) return new Set(assigned);
  const unit = unitGroups instanceof Set ? unitGroups : new Set(unitGroups);
  const out = new Set<string>();
  for (const g of assigned) {
    if (unit.has(g)) out.add(g);
  }
  return out;
}

export function canManageMembers(role: Role) {
  return role === "admin";
}

export function canSeeStaffRoom(role: Role) {
  return staff.includes(role);
}

export function canSeeGradesDetail(_role: Role) {
  return true;
}

export function canTakeQuizzes(role: Role) {
  return role === "player" || role === "coach" || role === "coordinator" || role === "admin";
}

export function defaultPageForRole(_role: Role): AppPage {
  return "this-week";
}

export function canEditDepthConfig(role: Role) {
  return role === "admin" || role === "coordinator";
}

/** Admin + coordinators edit offense / defense team goals */
export function canEditGameGoals(role: Role) {
  return role === "admin" || role === "coordinator";
}

/** Schedule event name / date / venue / results (preseason + games) */
export function canEditScheduleMeta(role: Role, archiveMode = false) {
  if (archiveMode) return role === "admin" || role === "coordinator";
  return role === "admin" || role === "coordinator";
}

/** Admin + coordinators assign coaches to position groups */
export function canAssignCoachGroups(role: Role) {
  return role === "admin" || role === "coordinator";
}

export function canSeeDepthCharts(role: Role) {
  return staff.includes(role);
}

export function canSeePersonal(role: Role) {
  return staff.includes(role);
}

export function canSeePersonnel(role: Role) {
  return staff.includes(role);
}

/** Coach+ can edit roster name / group / grade (players) */
export function canEditRoster(role: Role) {
  return staff.includes(role);
}

/** Coach+ can edit any athlete; players can edit their own profile */
export function canEditAthleteProfile(
  role: Role,
  athlete: { accountId?: string | null; id: string } | null | undefined,
) {
  if (canEditRoster(role)) return true;
  if (role === "player" && athlete) return isDemoPlayerAthlete(athlete);
  return false;
}

/** Who may open an athlete profile overlay */
export function canOpenAthleteProfile(
  role: Role,
  athlete: { accountId?: string | null; id: string } | null | undefined,
) {
  if (canSeePersonnel(role)) return true;
  if (role === "player" && athlete) return isDemoPlayerAthlete(athlete);
  return false;
}

/** True when this member is the demo logged-in account for the active role */
export function isOwnAccountMember(
  role: Role,
  memberId: string | null | undefined,
) {
  if (!memberId) return false;
  return demoMemberIdForRole(role) === memberId;
}

/** Coach+ can create linked player accounts on Rosters */
export function canCreatePlayerAccounts(role: Role) {
  return staff.includes(role);
}

/** Admin + Coordinator + Coach can open Rosters → Coaches (directory) */
export function canSeeCoachesRoster(role: Role) {
  return staff.includes(role);
}

/** Admin + coordinators edit position definitions under Program → Groups */
export function canEditPositionGroups(role: Role) {
  return role === "admin" || role === "coordinator";
}

/** Admin-only staff profile fields (teams, duties, notes, athletic period) */
export function canManageCoachAdminFields(role: Role) {
  return role === "admin";
}

/**
 * Who can manage (edit/delete) a staff account on Rosters → Coaches.
 * Admin → coordinators & coaches. Coordinator → coaches only.
 */
export function canManageStaffRole(actor: Role, target: Role): boolean {
  if (actor === "admin") {
    return target === "coordinator" || target === "coach";
  }
  if (actor === "coordinator") {
    return target === "coach";
  }
  return false;
}

/** Roles the actor may create on Rosters → Coaches */
export function staffRolesActorCanCreate(actor: Role): Role[] {
  if (actor === "admin") return ["coordinator", "coach"];
  if (actor === "coordinator") return ["coach"];
  return [];
}

/** Coach and above can rearrange players on depth charts */
export function canMoveDepthPlayers(role: Role) {
  return staff.includes(role);
}

/** Full My Stuff suite (staff tools). */
export function canSeeMyRoomStaff(role: Role) {
  return role === "coach" || role === "coordinator" || role === "admin";
}

/**
 * My Stuff nav visibility. Players get My Stuff for Position Group (incl. chat).
 */
export function canSeeMyRoom(role: Role) {
  return canSeeMyRoomStaff(role) || role === "player";
}

/** Who may read/send position-group chat. */
export function canUseGroupChat(role: Role) {
  return canSeeMyRoomStaff(role) || role === "player";
}

export function programNavForRole(role: Role): { id: AppPage; label: string }[] {
  if (role === "player") {
    return [
      { id: "this-week", label: "This Week" },
      { id: "schedule", label: "Schedule" },
    ];
  }
  return [
    { id: "this-week", label: "This Week" },
    { id: "schedule", label: "Schedule" },
  ];
}

/** Admin / Controls dropdown — admin-only program settings */
export function canSeeAdminMenu(role: Role) {
  return role === "admin";
}

export function adminMenuLabel(_role: Role) {
  return "Controls";
}

export function adminMenuItems(role: Role): { id: AppPage; label: string }[] {
  if (role === "admin") {
    return [
      { id: "admin-branding", label: "Branding" },
      { id: "admin-members", label: "Members" },
      { id: "admin-teams", label: "Teams" },
      { id: "admin-program", label: "Program" },
    ];
  }
  return [];
}

export function isAdminPage(page: AppPage): boolean {
  return (
    page === "admin" ||
    page === "admin-branding" ||
    page === "admin-members" ||
    page === "admin-teams" ||
    page === "admin-program"
  );
}

/** Admin-only: set active schedule week / roll seasons */
export function canManageProgramSeason(role: Role) {
  return role === "admin";
}

/** Coordinators and admins may copy templates from an archived season into the live season. */
export function canImportFromArchive(role: Role) {
  return role === "admin" || role === "coordinator";
}

export function canAccessAdminPage(role: Role, page: AppPage): boolean {
  if (!isAdminPage(page)) return false;
  return role === "admin";
}

/** Depth Chart lives under Team ▾ (Coach+) */
export function isDepthChartPage(page: AppPage): boolean {
  return (
    page === "depth-charts" ||
    page === "personnel-depth" ||
    page === "personnel-program-depth"
  );
}

/** @deprecated Use isDepthChartPage — Personnel nav removed */
export function isPersonnelPage(page: AppPage): boolean {
  return isDepthChartPage(page);
}

export function isProgramPage(page: AppPage): boolean {
  return (
    page === "personnel-program" ||
    page === "personnel-program-summary" ||
    page === "personnel-program-groups"
  );
}

export function isRosterPage(page: AppPage): boolean {
  return (
    page === "personnel-players" ||
    page === "personnel-roster-athletes" ||
    page === "personnel-roster-support" ||
    page === "personnel-roster-coaches"
  );
}

export function isAttendancePage(page: AppPage): boolean {
  return (
    page === "personnel-attendance" ||
    page === "personnel-attendance-athletes" ||
    page === "personnel-attendance-support" ||
    page === "personnel-report"
  );
}

/** Staff dropdown (Coach / Coordinator / Admin) */
export function staffMenuItems(role?: Role): {
  id: AppPage;
  label: string;
  children?: { id: AppPage; label: string }[];
}[] {
  const rosterChildren: { id: AppPage; label: string }[] = [
    { id: "personnel-roster-athletes", label: "Athletes" },
    {
      id: "personnel-roster-support",
      label: "Student support staff",
    },
  ];
  if (!role || canSeeCoachesRoster(role)) {
    rosterChildren.push({
      id: "personnel-roster-coaches",
      label: "Coaches",
    });
  }

  return [
    {
      id: "personnel-attendance",
      label: "Attendance",
      children: [
        { id: "personnel-attendance-athletes", label: "Athletes" },
        {
          id: "personnel-attendance-support",
          label: "Student support staff",
        },
        { id: "personnel-report", label: "Report" },
      ],
    },
    { id: "staff-recruiting", label: "Recruiting" },
    {
      id: "staff-inventory",
      label: "Inventory",
      children: [
        { id: "staff-issued-equipment", label: "Issued Equipment" },
        { id: "staff-inventory", label: "Inventory" },
      ],
    },
    { id: "staff-handbook", label: "Handbook" },
    { id: "staff-responsibilities", label: "Responsibilities" },
    {
      id: "personnel-players",
      label: "Rosters",
      children: rosterChildren,
    },
    {
      id: "personnel-program",
      label: "Program(s)",
      children: [
        { id: "personnel-program-summary", label: "Summary" },
        { id: "personnel-program-groups", label: "Groups" },
      ],
    },
  ];
}

export function isStaffPage(page: AppPage): boolean {
  return (
    page === "staff" ||
    page === "staff-responsibilities" ||
    page === "staff-handbook" ||
    page === "staff-recruiting" ||
    page === "staff-inventory" ||
    page === "staff-issued-equipment" ||
    page === "admin-staff" ||
    page === "admin-coach-groups" ||
    isAttendancePage(page) ||
    isRosterPage(page) ||
    isProgramPage(page)
  );
}

/** My Stuff dropdown items — staff get the full suite; players get Position Group + Quizzes. */
export function myRoomMenuItems(
  role?: Role,
): { id: AppPage; label: string }[] {
  if (role === "player") {
    return [
      { id: "my-room-group", label: "Position Group" },
      { id: "my-room-quizzes", label: "Quizzes" },
    ];
  }
  return [
    { id: "my-room-responsibles", label: "Responsibilities" },
    { id: "my-room-depth", label: "Depth Chart" },
    { id: "my-room-scout", label: "Weekly Scouting Report" },
    { id: "my-room-grades", label: "Player Grades" },
    { id: "my-room-quizzes", label: "Weekly Quizzes" },
    { id: "my-room-group", label: "Position Group" },
  ];
}

export function isMyRoomPage(page: AppPage): boolean {
  return page.startsWith("my-room-");
}

/** Display label for a unit side (Offense / Defense / Special Teams) */
export function sideLabel(side: Side): string {
  if (side === "defense") return "Defense";
  if (side === "specialTeams") return "Special Teams";
  return "Offense";
}

/** Units shown as separate sections under the Team nav dropdown */
export function teamMenuUnits(): { id: Side; label: string }[] {
  return [
    { id: "offense", label: "Offense" },
    { id: "defense", label: "Defense" },
    { id: "specialTeams", label: "Special Teams" },
  ];
}

/** Shared menu under each Offense / Defense / ST section in Team */
export function unitMenuItems(): { id: AppPage; label: string }[] {
  return [
    { id: "teach-philosophy", label: "Philosophy" },
    { id: "teach-playbook", label: "Playbook" },
    { id: "teach-install", label: "Install" },
    { id: "scout", label: "Scouting Reports" },
    { id: "teach-practice", label: "Practice Plans" },
    { id: "teach-call-sheet", label: "Call Sheet" },
    { id: "stats", label: "Stats" },
    { id: "quizzes", label: "Weekly Quizzes" },
    { id: "grades", label: "Team Grades" },
    { id: "teach-playbook-builder", label: "Playbook Builder" },
    { id: "teach-resources", label: "Resources" },
  ];
}

/** Player-facing Team ▾ unit pages (view-only; no Groups / install / grades / etc.) */
const PLAYER_UNIT_MENU_IDS: AppPage[] = [
  "teach-philosophy",
  "teach-playbook",
  "scout",
  "stats",
];

/** Unit submenu filtered by role — players only see Philosophy / Playbook / Scout / Stats */
export function unitMenuItemsForRole(role: Role): { id: AppPage; label: string }[] {
  const all = unitMenuItems();
  if (role === "player") {
    return all.filter((item) => PLAYER_UNIT_MENU_IDS.includes(item.id));
  }
  return all;
}

/** Whether this role may open a unit Team page (deep-link guard) */
export function canAccessUnitPage(role: Role, page: AppPage): boolean {
  if (!isUnitPage(page)) return true;
  if (role === "player") {
    // Players take quizzes via My Stuff → Quizzes (my-room-quizzes → QuizzesScreen).
    // Unit Weekly Quizzes stay hidden from Team nav.
    return PLAYER_UNIT_MENU_IDS.includes(page);
  }
  return true;
}

export function isUnitPage(page: AppPage): boolean {
  return (
    page === "unit-home" ||
    page === "scout" ||
    page === "grades" ||
    page === "quizzes" ||
    page === "stats" ||
    page.startsWith("teach-")
  );
}

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  coordinator: "Coordinator",
  coach: "Coach",
  player: "Player",
};
