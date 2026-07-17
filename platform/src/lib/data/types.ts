/**
 * Domain types for the full Platform product UI.
 * Swap MemoryRepository → API repository later without changing screens.
 */

export type Role =
  | "district_athletic_director"
  | "associate_athletic_director"
  | "district_athletic_coordinator"
  | "athletic_campus_coordinator"
  | "assistant_athletic_campus_coordinator"
  | "head_coach"
  | "coach"
  | "parent"
  | "player";

export type SportId =
  | "football"
  | "volleyball"
  | "basketball"
  | "soccer"
  | "baseball"
  | "softball"
  | "track"
  | "generic";

export type ProgramModuleId =
  | "depth"
  | "scout"
  | "playbook"
  | "quizzes"
  | "callSheet"
  | "printMyga"
  | "practice"
  | "stats"
  | "grades"
  | "resources"
  | "philosophy"
  | "install"
  | "study";

export type District = {
  id: string;
  name: string;
};

export type Campus = {
  id: string;
  districtId: string;
  name: string;
  mascot: string;
  short: string;
};

export type Program = {
  id: string;
  campusId: string;
  name: string;
  sport: SportId;
  seasonLabel: string;
  slug: string;
  levels: string[];
  maxPrepsUrl?: string;
  athleteCount: number;
  staffCount: number;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Human-readable scope label */
  scope: string;
  /** Campus assignment (required for campus coordinator roles) */
  campusId?: string;
  programIds: string[];
  status: "active" | "invited" | "disabled";
  reportsToId?: string;
};

export type Athlete = {
  id: string;
  programId: string;
  jersey: string;
  name: string;
  pos: string;
  classYear: string;
  level: string;
  directoryOptOut: boolean;
};

export type Game = {
  id: string;
  programId: string;
  week: number;
  date: string;
  time: string;
  opponent: string;
  homeAway: "Home" | "Away";
  result: string | null;
  venue?: string;
};

export type Announcement = {
  id: string;
  programId: string;
  campusId?: string;
  dateLabel: string;
  title: string;
  body: string;
  audience: "staff" | "parent" | "public";
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  districtId: string;
  campusId: string;
};

export type OnboardingState = {
  step: number;
  completed: boolean;
  programName: string;
  sport: SportId;
  levels: string[];
  staffEmails: string[];
  maxPrepsUrl: string;
};

export type LegalItemKey =
  | "entityFormed"
  | "dpaTemplate"
  | "ferpaNotice"
  | "ppraReview"
  | "hipaaScope"
  | "ssoReady"
  | "encryption"
  | "auditLogging"
  | "exportDelete"
  | "cyberInsurance"
  | "soc2"
  | "vpat"
  | "subprocessors";

export type SafetyKey =
  | "minimizePublicFields"
  | "blockGradesOnFan"
  | "blockContactsOnFan"
  | "blockScoutOnParent"
  | "honorDirectoryOptOut"
  | "requireStaffRoleForGrades"
  | "logExportsAndDeletes"
  | "noPhiStorage";

/** Head-coach team workspace (per program). */
export type DepthSlot = {
  id: string;
  programId: string;
  unitId: string;
  level: string;
  position: string;
  depth: number;
  athleteId: string | null;
};

export type WeekNote = {
  id: string;
  programId: string;
  unitId: string;
  week: number;
  kind: "scout" | "practice" | "callSheet" | "stats";
  day?: string;
  title: string;
  body: string;
};

export type PlaybookEntry = {
  id: string;
  programId: string;
  unitId: string;
  title: string;
  category: string;
  body: string;
};

export type QuizItem = {
  id: string;
  programId: string;
  unitId: string;
  week: number;
  title: string;
  questions: { prompt: string; answer: string }[];
  scores: { athleteId: string; score: number }[];
};

export type PlayerGrade = {
  id: string;
  programId: string;
  athleteId: string;
  week: number;
  practice: number | null;
  game: number | null;
  pride: string | null;
  notes: string;
};

export type AttendanceRecord = {
  athleteId: string;
  status: "present" | "absent" | "late" | "excused";
};

export type AttendanceDay = {
  id: string;
  programId: string;
  date: string;
  records: AttendanceRecord[];
};

export type ResourceItem = {
  id: string;
  programId: string;
  unitId: string;
  name: string;
  category: string;
  note: string;
};

export type StaffDuty = {
  id: string;
  programId: string;
  title: string;
  assigneeName: string;
  status: "open" | "done";
};

export type TeamWorkspace = {
  activeWeekByProgram: Record<string, number>;
  activeUnitByProgram: Record<string, string>;
  depthSlots: DepthSlot[];
  weekNotes: WeekNote[];
  playbook: PlaybookEntry[];
  quizzes: QuizItem[];
  grades: PlayerGrade[];
  attendance: AttendanceDay[];
  resources: ResourceItem[];
  duties: StaffDuty[];
  philosophy: Record<string, string>;
  install: Record<string, string>;
};

export type PlatformSnapshot = {
  district: District;
  campuses: Campus[];
  programs: Program[];
  members: Member[];
  athletes: Athlete[];
  games: Game[];
  announcements: Announcement[];
  audit: AuditEvent[];
  legal: Record<LegalItemKey, boolean>;
  safety: Record<SafetyKey, boolean>;
  onboarding: OnboardingState;
  session: SessionUser | null;
  activeProgramId: string;
  activeCampusId: string;
  ssoConnected: boolean;
  team: TeamWorkspace;
  brandLogoUrl: string | null;
  parentDocs: { id: string; title: string; href: string }[];
};
