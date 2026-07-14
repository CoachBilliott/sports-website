export type Role =
  | "admin"
  | "coordinator"
  | "coach"
  | "player"
  | "parent"
  | "fan";

export type Side = "offense" | "defense";

export type ProgramPage =
  | "this-week"
  | "schedule"
  | "groups"
  | "admin"
  | "admin-branding"
  | "admin-members"
  | "admin-teams"
  | "admin-depth-settings"
  | "admin-schedule"
  | "admin-team-goals"
  | "admin-staff"
  | "admin-coach-groups"
  | "staff"
  | "depth-charts"
  | "personnel-players"
  | "personnel-roster-athletes"
  | "personnel-roster-support"
  | "personnel-roster-coaches"
  | "personnel-depth"
  | "personnel-program"
  | "personnel-program-summary"
  | "personnel-program-groups"
  | "personnel-program-positions"
  | "personnel-program-depth"
  | "personnel-attendance"
  | "personnel-attendance-athletes"
  | "personnel-attendance-support"
  | "personnel-report"
  | "my-room-group"
  | "my-room-depth"
  | "my-room-scout"
  | "my-room-quizzes"
  | "my-room-grades"
  | "my-room-responsibles"
  | "account";

export type SidePage =
  | "unit-home"
  | "teach-playbook"
  | "teach-playbook-builder"
  | "teach-install"
  | "teach-practice"
  | "teach-study"
  | "teach-philosophy"
  | "teach-call-sheet"
  | "stats"
  | "scout"
  | "grades"
  | "quizzes";

export type AppPage = ProgramPage | SidePage;

export type NavMenu = Side | "my-room" | "personnel" | "admin";

export interface Game {
  id: string;
  week: number;
  opponent: string;
  /** slug used for logos/files */
  opponentKey: string;
  date: string;
  time: string;
  homeAway: "Home" | "Away";
  venue: string;
  result?: string;
  logo: string;
  /** Preseason / regular / playoff event type */
  kind?: "regular" | "two-a-days" | "scrimmage" | "playoff";
  /** Optional slots (2nd scrimmage, playoff weeks) can be hidden per program */
  optional?: boolean;
  /** Dave Campbell's Texas Football team page */
  dctfUrl: string;
  links2026: {
    schedule: string;
    roster: string;
    stats: string;
  };
  links2025: {
    schedule: string;
    roster: string;
    stats: string;
  };
}

export interface Quiz {
  id: string;
  title: string;
  side: Side;
  week: number;
  due: string;
  assignedGroups: string[];
  status: "assigned" | "completed" | "overdue";
  score?: number;
  passingScore: number;
}

export interface CoachResponsibility {
  id: string;
  text: string;
  /** Optional deadline for this responsibility */
  dueBy?: string;
}

export interface CoachDuty {
  id: string;
  coach: string;
  role: "coordinator" | "coach";
  side: Side | "st";
  groups: string[];
  duties: CoachResponsibility[];
  notes: string;
}

export interface GradeRow {
  player: string;
  group: string;
  week: number;
  practice: number;
  game: number;
  pride: "A" | "B" | "C" | "D" | "F";
}
