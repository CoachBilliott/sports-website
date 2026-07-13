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
  | "quizzes"
  | "groups"
  | "admin"
  | "staff";

export type SidePage =
  | "unit-home"
  | "teach-playbook"
  | "teach-install"
  | "teach-practice"
  | "teach-study"
  | "teach-philosophy"
  | "scout"
  | "my-room"
  | "grades";

export type AppPage = ProgramPage | SidePage;

export interface Game {
  id: string;
  week: number;
  opponent: string;
  date: string;
  time: string;
  homeAway: "Home" | "Away";
  venue: string;
  result?: string;
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

export interface CoachDuty {
  coach: string;
  role: "coordinator" | "coach";
  side: Side | "st";
  groups: string[];
  duties: string[];
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
