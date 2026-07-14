import type { AppPage, Role } from "./types";
import { demoMemberIdForRole, isDemoPlayerAthlete } from "./mock";

const staff: Role[] = ["admin", "coordinator", "coach"];

export function canSeeScout(role: Role) {
  return role !== "parent" && role !== "fan";
}

export function canEditContent(role: Role) {
  return staff.includes(role);
}

export function canManageMembers(role: Role) {
  return role === "admin";
}

export function canSeeStaffRoom(role: Role) {
  return staff.includes(role);
}

export function canSeeGradesDetail(role: Role) {
  return role !== "fan";
}

export function canTakeQuizzes(role: Role) {
  return role === "player" || role === "coach" || role === "coordinator" || role === "admin";
}

export function defaultPageForRole(role: Role): AppPage {
  if (role === "fan") return "schedule";
  if (role === "parent") return "this-week";
  if (role === "admin") return "this-week";
  return "this-week";
}

export function canEditDepthConfig(role: Role) {
  return role === "admin" || role === "coordinator";
}

/** Admin + coordinators edit offense / defense team goals */
export function canEditGameGoals(role: Role) {
  return role === "admin" || role === "coordinator";
}

/** Schedule event name / date / venue (preseason + games) */
export function canEditScheduleMeta(role: Role) {
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

/** Staff (Admin / Coordinator / Coach) can edit Program → Positions */
export function canEditPositionGroups(role: Role) {
  return staff.includes(role);
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

export function canSeeMyRoom(role: Role) {
  return role === "coach" || role === "coordinator" || role === "admin";
}

export function programNavForRole(role: Role): { id: AppPage; label: string }[] {
  if (role === "fan") {
    return [{ id: "schedule", label: "Schedule" }];
  }
  if (role === "parent") {
    return [
      { id: "this-week", label: "This Week" },
      { id: "schedule", label: "Schedule" },
      { id: "grades", label: "My Athlete" },
    ];
  }
  if (role === "player") {
    return [
      { id: "this-week", label: "This Week" },
      { id: "schedule", label: "Schedule" },
      { id: "personnel-program-groups", label: "Groups" },
    ];
  }
  const base: { id: AppPage; label: string }[] = [
    { id: "this-week", label: "This Week" },
    { id: "schedule", label: "Schedule" },
  ];
  return base;
}

/** Admin / Controls dropdown — program controls by role */
export function canSeeAdminMenu(role: Role) {
  return role === "admin" || role === "coordinator";
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
      { id: "admin-schedule", label: "Schedule" },
      { id: "admin-depth-settings", label: "Depth Chart Settings" },
      { id: "admin-team-goals", label: "Team Goals" },
      { id: "admin-staff", label: "Coaches Responsibilities" },
    ];
  }
  if (role === "coordinator") {
    return [
      { id: "admin-schedule", label: "Schedule" },
      { id: "admin-depth-settings", label: "Depth Chart Settings" },
      { id: "admin-team-goals", label: "Team Goals" },
      { id: "admin-staff", label: "Coaches Responsibilities" },
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
    page === "admin-schedule" ||
    page === "admin-depth-settings" ||
    page === "admin-team-goals" ||
    page === "admin-staff" ||
    page === "admin-coach-groups"
  );
}

export function canAccessAdminPage(role: Role, page: AppPage): boolean {
  if (!isAdminPage(page)) return false;
  if (role === "admin") return true;
  if (role === "coordinator") {
    return (
      page === "admin-schedule" ||
      page === "admin-depth-settings" ||
      page === "admin-team-goals" ||
      page === "admin-staff" ||
      page === "admin-coach-groups"
    );
  }
  return false;
}

/** Personnel dropdown (Coach+) */
export function personnelMenuItems(role?: Role): {
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
    { id: "personnel-depth", label: "Depth Chart" },
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
    {
      id: "personnel-players",
      label: "Rosters",
      children: rosterChildren,
    },
    {
      id: "personnel-program",
      label: "Program",
      children: [
        { id: "personnel-program-summary", label: "Summary" },
        { id: "personnel-program-groups", label: "Groups" },
        { id: "personnel-program-positions", label: "Positions" },
      ],
    },
  ];
}

export function isPersonnelPage(page: AppPage): boolean {
  return (
    page === "depth-charts" ||
    page === "personnel-players" ||
    page === "personnel-roster-athletes" ||
    page === "personnel-roster-support" ||
    page === "personnel-roster-coaches" ||
    page === "personnel-depth" ||
    page === "personnel-program" ||
    page === "personnel-program-summary" ||
    page === "personnel-program-groups" ||
    page === "personnel-program-positions" ||
    page === "personnel-attendance" ||
    page === "personnel-attendance-athletes" ||
    page === "personnel-attendance-support" ||
    page === "personnel-report"
  );
}

export function isProgramPage(page: AppPage): boolean {
  return (
    page === "personnel-program" ||
    page === "personnel-program-summary" ||
    page === "personnel-program-groups" ||
    page === "personnel-program-positions"
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

/** My Group dropdown items (Coach / Coordinator / Admin) */
export function myRoomMenuItems(): { id: AppPage; label: string }[] {
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

/** Shared menu under each Offense / Defense dropdown */
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
  ];
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
  parent: "Parent",
  fan: "Fan (public)",
};
