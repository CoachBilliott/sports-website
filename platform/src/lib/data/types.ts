/**
 * Domain types for the full Platform product UI.
 * Swap MemoryRepository → API repository later without changing screens.
 */

export type Role =
  | "district_admin"
  | "campus_ad"
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
  scope: string;
  programIds: string[];
  status: "active" | "invited" | "disabled";
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
  ssoConnected: boolean;
};
