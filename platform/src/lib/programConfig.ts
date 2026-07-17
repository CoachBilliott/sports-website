/** Sport / program templates for the Platform app (standalone — not football Team OS). */

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

export type ProgramUnitDef = {
  id: string;
  label: string;
};

export type ProgramConfig = {
  sport: SportId;
  label: string;
  units: ProgramUnitDef[];
  enabledModules: ProgramModuleId[];
  printFormats: string[];
};

export type SportProgram = {
  id: string;
  name: string;
  sport: SportId;
  seasonLabel: string;
  campusId: string;
};

export type OrgDistrict = {
  id: string;
  name: string;
};

export type OrgCampus = {
  id: string;
  name: string;
  districtId: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type LegalChecklistKey =
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

export type LegalChecklistState = Record<LegalChecklistKey, boolean>;

export const LEGAL_CHECKLIST_ITEMS: {
  key: LegalChecklistKey;
  label: string;
  group: "legal" | "security" | "procurement";
  blurb: string;
}[] = [
  {
    key: "entityFormed",
    label: "Business entity formed",
    group: "legal",
    blurb: "LLC/corp with EIN before district contracts.",
  },
  {
    key: "dpaTemplate",
    label: "Student data / DPA template",
    group: "legal",
    blurb: "FERPA school-official language, no selling student data.",
  },
  {
    key: "ferpaNotice",
    label: "FERPA alignment reviewed",
    group: "legal",
    blurb: "Directory vs non-directory fields; parent opt-outs.",
  },
  {
    key: "ppraReview",
    label: "PPRA survey/marketing review",
    group: "legal",
    blurb: "Avoid protected surveys unless parental rights are handled.",
  },
  {
    key: "hipaaScope",
    label: "HIPAA scope decided",
    group: "legal",
    blurb: "Usually keep clinical PHI out of athletics ops tools.",
  },
  {
    key: "ssoReady",
    label: "District SSO planned",
    group: "security",
    blurb: "Microsoft/Google OIDC in production — demo checklist only.",
  },
  {
    key: "encryption",
    label: "Encryption in transit & at rest",
    group: "security",
    blurb: "HTTPS + encrypted DB/files in production hosting.",
  },
  {
    key: "auditLogging",
    label: "Audit logging",
    group: "security",
    blurb: "Logins, exports, roster/grade access, deletes.",
  },
  {
    key: "exportDelete",
    label: "Export & deletion tools",
    group: "security",
    blurb: "District can export or purge student data on request.",
  },
  {
    key: "cyberInsurance",
    label: "Cyber / E&O insurance",
    group: "procurement",
    blurb: "Certificates districts ask for on vendor onboarding.",
  },
  {
    key: "soc2",
    label: "SOC 2 path started",
    group: "procurement",
    blurb: "Not required day one; expected for larger districts.",
  },
  {
    key: "vpat",
    label: "Accessibility (VPAT / WCAG)",
    group: "procurement",
    blurb: "Section 508 / ADA procurement paperwork.",
  },
  {
    key: "subprocessors",
    label: "Subprocessor list published",
    group: "procurement",
    blurb: "Hosting, AI, email — named in the DPA.",
  },
];

export function emptyLegalChecklist(): LegalChecklistState {
  return {
    entityFormed: false,
    dpaTemplate: false,
    ferpaNotice: false,
    ppraReview: false,
    hipaaScope: true,
    ssoReady: false,
    encryption: false,
    auditLogging: true,
    exportDelete: true,
    cyberInsurance: false,
    soc2: false,
    vpat: false,
    subprocessors: false,
  };
}

/** Runtime safety controls shown on Legal & Safety (session demo). */
export type SafetyToggleKey =
  | "minimizePublicFields"
  | "blockGradesOnFan"
  | "blockContactsOnFan"
  | "blockScoutOnParent"
  | "honorDirectoryOptOut"
  | "requireStaffRoleForGrades"
  | "logExportsAndDeletes"
  | "noPhiStorage";

export type SafetyToggleState = Record<SafetyToggleKey, boolean>;

export const SAFETY_TOGGLE_ITEMS: {
  key: SafetyToggleKey;
  label: string;
  blurb: string;
}[] = [
  {
    key: "minimizePublicFields",
    label: "Minimize Fan directory fields",
    blurb: "Fan page shows jersey, name, position, class only.",
  },
  {
    key: "blockGradesOnFan",
    label: "Block grades on Fan",
    blurb: "Academic records never appear on the public Fan site.",
  },
  {
    key: "blockContactsOnFan",
    label: "Block contacts on Fan",
    blurb: "No phone, email, or address on public pages.",
  },
  {
    key: "blockScoutOnParent",
    label: "Block scout / film on Parent",
    blurb: "Guardians see schedule + eligibility — not opponent scout.",
  },
  {
    key: "honorDirectoryOptOut",
    label: "Honor directory opt-outs",
    blurb: "Parents can hide an athlete from the public roster.",
  },
  {
    key: "requireStaffRoleForGrades",
    label: "Staff-only gradebook",
    blurb: "Detailed grades stay in the staff app behind roles.",
  },
  {
    key: "logExportsAndDeletes",
    label: "Audit exports & deletes",
    blurb: "Every export / offboard writes an audit event.",
  },
  {
    key: "noPhiStorage",
    label: "No clinical PHI in Team OS",
    blurb: "Injury clinic notes stay out of athletics ops (HIPAA scope).",
  },
];

export function emptySafetyToggles(): SafetyToggleState {
  return {
    minimizePublicFields: true,
    blockGradesOnFan: true,
    blockContactsOnFan: true,
    blockScoutOnParent: true,
    honorDirectoryOptOut: true,
    requireStaffRoleForGrades: true,
    logExportsAndDeletes: true,
    noPhiStorage: true,
  };
}

/** Who can see which student fields — district safety story. */
export const DATA_FIELD_MATRIX: {
  field: string;
  fan: boolean;
  parent: boolean;
  staff: boolean;
  note: string;
}[] = [
  {
    field: "Jersey # / name / position / class",
    fan: true,
    parent: true,
    staff: true,
    note: "Directory-style fields (respect opt-out)",
  },
  {
    field: "Schedule & results",
    fan: true,
    parent: true,
    staff: true,
    note: "Public game info",
  },
  {
    field: "Announcements",
    fan: false,
    parent: true,
    staff: true,
    note: "Guardian + staff",
  },
  {
    field: "Eligibility summary",
    fan: false,
    parent: true,
    staff: true,
    note: "Eligible / not — not full gradebook",
  },
  {
    field: "Full gradebook",
    fan: false,
    parent: false,
    staff: true,
    note: "Staff roles only",
  },
  {
    field: "Phone / email / address",
    fan: false,
    parent: false,
    staff: true,
    note: "Never on Fan",
  },
  {
    field: "Scout / film / installs",
    fan: false,
    parent: false,
    staff: true,
    note: "Internal competitive data",
  },
  {
    field: "Clinical / medical PHI",
    fan: false,
    parent: false,
    staff: false,
    note: "Out of scope — keep in nurse/trainer systems",
  },
];

export const AD_DEMO_PILLARS: {
  id: PlatformPageLike;
  title: string;
  pitch: string;
}[] = [
  {
    id: "district",
    title: "District",
    pitch: "Cy-Fair ISD → Cypress Creek → programs, with SSO readiness.",
  },
  {
    id: "programs",
    title: "Add teams",
    pitch: "Spin up Volleyball, Basketball, and more from sport templates.",
  },
  {
    id: "fan",
    title: "Fan site",
    pitch: "Public schedule + directory roster — nothing sensitive.",
  },
  {
    id: "parent",
    title: "Parent site",
    pitch: "Linked athlete, this week’s game, announcements, eligibility.",
  },
  {
    id: "legal",
    title: "Legal & safety",
    pitch: "FERPA field rules, safety controls, export/delete, audit.",
  },
];

type PlatformPageLike =
  | "district"
  | "programs"
  | "fan"
  | "parent"
  | "legal";

const FOOTBALL_MODULES: ProgramModuleId[] = [
  "depth",
  "scout",
  "playbook",
  "quizzes",
  "callSheet",
  "printMyga",
  "practice",
  "stats",
  "grades",
  "resources",
  "philosophy",
  "install",
  "study",
];

const CORE_MODULES: ProgramModuleId[] = [
  "resources",
  "stats",
  "grades",
  "philosophy",
];

function genericConfig(sport: SportId, label: string): ProgramConfig {
  return {
    sport,
    label,
    units: [{ id: "team", label: "Team" }],
    enabledModules: [...CORE_MODULES],
    printFormats: ["roster"],
  };
}

export const SPORT_TEMPLATES: Record<SportId, ProgramConfig> = {
  football: {
    sport: "football",
    label: "Football",
    units: [
      { id: "offense", label: "Offense" },
      { id: "defense", label: "Defense" },
      { id: "specialTeams", label: "Special Teams" },
    ],
    enabledModules: [...FOOTBALL_MODULES],
    printFormats: ["single-column", "two-column", "media", "two-deep"],
  },
  volleyball: genericConfig("volleyball", "Volleyball"),
  basketball: genericConfig("basketball", "Basketball"),
  soccer: genericConfig("soccer", "Soccer"),
  baseball: genericConfig("baseball", "Baseball"),
  softball: genericConfig("softball", "Softball"),
  track: genericConfig("track", "Track & Field"),
  generic: genericConfig("generic", "Team"),
};

export const SPORT_OPTIONS: { id: SportId; label: string }[] = [
  { id: "football", label: "Football" },
  { id: "volleyball", label: "Volleyball" },
  { id: "basketball", label: "Basketball" },
  { id: "soccer", label: "Soccer" },
  { id: "baseball", label: "Baseball" },
  { id: "softball", label: "Softball" },
  { id: "track", label: "Track & Field" },
  { id: "generic", label: "Generic / Other" },
];

export const SEED_DISTRICT: OrgDistrict = {
  id: "dist-cyfair",
  name: "Cy-Fair ISD",
};

export const SEED_CAMPUS: OrgCampus = {
  id: "camp-cycreek",
  name: "Cypress Creek High School",
  districtId: SEED_DISTRICT.id,
};

export const SEED_PROGRAMS: SportProgram[] = [
  {
    id: "prog-fb-2026",
    name: "Football",
    sport: "football",
    seasonLabel: "2026",
    campusId: SEED_CAMPUS.id,
  },
  {
    id: "prog-vb-2026",
    name: "Volleyball",
    sport: "volleyball",
    seasonLabel: "2026",
    campusId: SEED_CAMPUS.id,
  },
];

export function configForSport(sport: SportId): ProgramConfig {
  return SPORT_TEMPLATES[sport] ?? SPORT_TEMPLATES.generic;
}

export function configForProgram(
  program: SportProgram | null | undefined,
): ProgramConfig {
  if (!program) return SPORT_TEMPLATES.football;
  return configForSport(program.sport);
}

export function seedAuditEvents(): AuditEvent[] {
  const now = Date.now();
  return [
    {
      id: "aud-1",
      at: new Date(now - 86400000 * 2).toISOString(),
      actor: "Admin",
      action: "login",
      detail: "Platform demo session started",
    },
    {
      id: "aud-2",
      at: new Date(now - 86400000).toISOString(),
      actor: "Admin",
      action: "view_roster",
      detail: "Opened public Fan roster preview",
    },
    {
      id: "aud-3",
      at: new Date(now - 7200000).toISOString(),
      actor: "AD",
      action: "add_program",
      detail: "Seeded Volleyball · volleyball · 2026",
    },
    {
      id: "aud-4",
      at: new Date(now - 3600000).toISOString(),
      actor: "AD",
      action: "legal_checklist",
      detail: "Reviewed FERPA checklist item",
    },
    {
      id: "aud-5",
      at: new Date(now - 1800000).toISOString(),
      actor: "Admin",
      action: "safety_control",
      detail: "blockGradesOnFan → on",
    },
  ];
}

/** Human labels for module chips in Teams preview */
export const MODULE_LABELS: Record<ProgramModuleId, string> = {
  depth: "Depth charts",
  scout: "Scout",
  playbook: "Playbook",
  quizzes: "Quizzes",
  callSheet: "Call sheet",
  printMyga: "Print boards",
  practice: "Practice",
  stats: "Stats",
  grades: "Grades",
  resources: "Resources",
  philosophy: "Philosophy",
  install: "Install",
  study: "Study",
};

/** Lightweight aliases kept for older imports — prefer demoContent. */
export {
  FOOTBALL_ROSTER as DEMO_ROSTER,
  FOOTBALL_SCHEDULE as DEMO_SCHEDULE,
  FAN_NEWS as DEMO_FAN_NEWS,
  PARENT_ANNOUNCEMENTS as DEMO_ANNOUNCEMENTS,
} from "./demoContent";

/** Items ADs typically need before a Cy-Fair pilot conversation */
export const CYFAIR_PILOT_KEYS: LegalChecklistKey[] = [
  "entityFormed",
  "dpaTemplate",
  "ferpaNotice",
  "ssoReady",
  "encryption",
  "auditLogging",
  "exportDelete",
  "subprocessors",
];
