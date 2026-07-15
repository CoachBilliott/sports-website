export type Role =
  | "admin"
  | "coordinator"
  | "coach"
  | "player";

export type Side = "offense" | "defense" | "specialTeams";

/** Calendar / program season key, e.g. `"2026"`. */
export type SeasonId = string;

export type SeasonMeta = {
  id: SeasonId;
  label: string;
  year: number;
  /** ISO timestamp when this season was archived (rollover). */
  archivedAt: string;
};

/**
 * Admin schedule for auto-advancing the active week.
 * `null` / disabled = no automatic advance.
 */
export type WeekAutoAdvanceConfig = {
  enabled: boolean;
  /** 0 = Sunday … 6 = Saturday (Date#getDay). */
  dayOfWeek: number;
  /** Local time `"HH:mm"` (24h). */
  time: string;
};

export type ProgramPage =
  | "this-week"
  | "schedule"
  | "results"
  | "groups"
  | "season-archives"
  | "admin"
  | "admin-branding"
  | "admin-members"
  | "admin-teams"
  | "admin-program"
  | "admin-depth-settings"
  | "admin-schedule"
  | "admin-team-goals"
  | "admin-staff"
  | "admin-coach-groups"
  | "staff"
  | "staff-responsibilities"
  | "staff-handbook"
  | "staff-recruiting"
  | "staff-inventory"
  | "staff-issued-equipment"
  | "depth-charts"
  | "personnel-players"
  | "personnel-roster-athletes"
  | "personnel-roster-support"
  | "personnel-roster-coaches"
  | "personnel-depth"
  | "personnel-program"
  | "personnel-program-summary"
  | "personnel-program-groups"
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
  | "my-room-chat"
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
  | "teach-resources"
  | "stats"
  | "scout"
  | "grades"
  | "quizzes";

export type AppPage = ProgramPage | SidePage;

export type NavMenu = "team" | "my-room" | "admin" | "staff";

/** File stored in a unit Resources drive (client-side mock) */
export interface UnitResourceFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  /** data URL or object URL for open/download */
  dataUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

/** How a game result was last set (MaxPreps sync vs staff edit). */
export type GameResultSource = "maxpreps" | "manual";

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
  /**
   * Display result, e.g. `"W 47-13"` / `"L 10-40"`.
   * Prefer ourScore/oppScore when editing; keep label in sync.
   */
  result?: string;
  ourScore?: number | null;
  oppScore?: number | null;
  resultSource?: GameResultSource | null;
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
  links2024: {
    schedule: string;
    roster: string;
    stats: string;
  };
}

/** Who authored a quiz question (AI draft vs coach-written). */
export type QuizQuestionSource = "ai" | "coach";

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** Multiple-choice options (typically 3–4). */
  options: string[];
  /** Index into `options` for the correct answer. */
  correctIndex: number;
  source: QuizQuestionSource;
  /** Optional coach note / rationale shown after grading. */
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  side: Side;
  week: number;
  /** Schedule game id when tied to a specific week folder. */
  gameId?: string;
  due: string;
  assignedGroups: string[];
  status: "draft" | "assigned" | "completed" | "overdue";
  score?: number;
  passingScore: number;
  questions: QuizQuestion[];
  /** Last AI/stub generation timestamp (ISO). */
  generatedAt?: string | null;
  /** How the current question set was produced. */
  generationSource?: "ai" | "stub" | "coach" | null;
}

/** Per-athlete quiz attempt (score is independent of shared Quiz.score). */
export interface QuizAttempt {
  id: string;
  athleteId: string;
  quizId: string;
  /** Score percent 0–100 */
  score: number;
  completed: boolean;
  completedAt: string;
}

export interface CoachResponsibility {
  id: string;
  text: string;
  /** Optional deadline for this responsibility */
  dueBy?: string;
}

/** User-managed weekly to-do on My Stuff → Responsibilities / This Week */
export interface PersonalTodo {
  id: string;
  text: string;
  done: boolean;
  /** When quick-added from a staff responsibility, links back for dedupe */
  sourceResponsibilityId?: string;
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

/** Position-group thread message (session mock chat). */
export type GroupChatSenderRole = "coach" | "player";

export interface GroupChatMessage {
  id: string;
  group: string;
  senderId: string;
  senderName: string;
  senderRole: GroupChatSenderRole;
  body: string;
  /** ISO timestamp */
  createdAt: string;
}
