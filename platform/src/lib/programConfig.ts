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
      detail: "Opened public roster preview",
    },
    {
      id: "aud-3",
      at: new Date(now - 3600000).toISOString(),
      actor: "AD",
      action: "legal_checklist",
      detail: "Reviewed FERPA checklist item",
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

/** Lightweight demo data for Fan / Parent previews */
export const DEMO_SCHEDULE = [
  {
    week: 1,
    date: "Aug 28",
    time: "7:00 PM",
    opponent: "Tomball Memorial",
    homeAway: "Home" as const,
    result: "W 28-21" as string | null,
  },
  {
    week: 2,
    date: "Sep 4",
    time: "7:00 PM",
    opponent: "Bridgeland",
    homeAway: "Away" as const,
    result: null as string | null,
  },
  {
    week: 3,
    date: "Sep 11",
    time: "7:00 PM",
    opponent: "Cy Ranch",
    homeAway: "Home" as const,
    result: null as string | null,
  },
  {
    week: 4,
    date: "Sep 18",
    time: "7:00 PM",
    opponent: "Cy Woods",
    homeAway: "Home" as const,
    result: null as string | null,
  },
];

export const DEMO_ROSTER = [
  { jersey: "7", name: "Alex Reyes", pos: "QB", classYear: "Sr" },
  { jersey: "11", name: "Tyler Brooks", pos: "WR", classYear: "Sr" },
  { jersey: "2", name: "Jordan Hill", pos: "WR", classYear: "Jr" },
  { jersey: "88", name: "Cameron Dunn", pos: "TE", classYear: "Sr" },
  { jersey: "72", name: "Blake Moss", pos: "OL", classYear: "Jr" },
];

export const DEMO_FAN_NEWS = [
  {
    id: "news-1",
    tag: "Game day",
    title: "Cougars open district play Friday",
    blurb: "Kickoff 7:00 PM at Cougar Stadium. Student section gates open at 5:30.",
  },
  {
    id: "news-2",
    tag: "Community",
    title: "Booster club cookout Saturday",
    blurb: "Families welcome after morning walkthrough — parking lot B.",
  },
  {
    id: "news-3",
    tag: "Media",
    title: "Media day photos posted",
    blurb: "Directory headshots are live on the public roster below.",
  },
];

export const DEMO_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    date: "Mon",
    title: "Booster meeting Thursday 6pm",
    body: "Library conference room. Agenda: travel meals and senior night.",
  },
  {
    id: "ann-2",
    date: "Wed",
    title: "Media day Friday after school",
    body: "Athletes wear game jerseys. Pickup by 5:30pm at the field house.",
  },
  {
    id: "ann-3",
    date: "Fri",
    title: "Bus leaves 4:45 for Bridgeland",
    body: "Parents: arrival ~9:30pm. Check the app for delays.",
  },
];

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
