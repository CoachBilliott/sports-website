import type { CoachDuty, Game, GradeRow, Quiz, Role, Side } from "./types";

export const team = {
  name: "Cy Creek Cougars",
  unit: "Football",
  motto: "Fast, Physical, Relentless",
  season: "2026",
  colors: { primary: "#0B3D91", steel: "#3D4A5C", field: "#E8EEF5" },
  maxPrepsUrl:
    "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/",
  logoLetter: "CC",
  logo: "/cypress-creek-logo.png",
};

const MAXPREPS_TX = "https://www.maxpreps.com/tx";
const DCTF = "https://www.texasfootball.com/team";

function maxPrepsLinks(city: string, slug: string) {
  const base = `${MAXPREPS_TX}/${city}/${slug}/football`;
  return {
    links2026: {
      schedule: `${base}/schedule/`,
      roster: `${base}/roster/`,
      stats: `${base}/stats/`,
    },
    links2025: {
      schedule: `${base}/25-26/schedule/`,
      roster: `${base}/25-26/roster/`,
      stats: `${base}/25-26/stats/`,
    },
    links2024: {
      schedule: `${base}/24-25/schedule/`,
      roster: `${base}/24-25/roster/`,
      stats: `${base}/24-25/stats/`,
    },
  };
}

function opponentMeta(
  key: string,
  dctfSlug: string,
  city: string,
  maxPrepsSlug: string,
) {
  return {
    opponentKey: key,
    logo: `/logos/opponents/${key}.png`,
    dctfUrl: `${DCTF}/${dctfSlug}`,
    ...maxPrepsLinks(city, maxPrepsSlug),
  };
}

const cyCreekMeta = {
  opponentKey: "cy-creek",
  logo: team.logo,
  dctfUrl: `${DCTF}/cypress-creek-cougars`,
  ...maxPrepsLinks("houston", "cypress-creek-cougars"),
};

export const games: Game[] = [
  {
    id: "camp-2a",
    week: 0,
    kind: "two-a-days",
    opponent: "2-a-Days",
    date: "Fri, Aug 14",
    time: "All day",
    homeAway: "Home",
    venue: "Cy Creek",
    ...cyCreekMeta,
  },
  {
    id: "scrim-1",
    week: 0,
    kind: "scrimmage",
    opponent: "Scrimmage 1 · TBD",
    date: "Sat, Aug 15",
    time: "TBD",
    homeAway: "Home",
    venue: "TBD",
    ...cyCreekMeta,
  },
  {
    id: "scrim-2",
    week: 0,
    kind: "scrimmage",
    optional: true,
    opponent: "Scrimmage 2 · TBD",
    date: "Sat, Aug 22",
    time: "TBD",
    homeAway: "Away",
    venue: "TBD",
    ...cyCreekMeta,
  },
  {
    id: "w1",
    week: 1,
    kind: "regular",
    opponent: "Morton Ranch",
    date: "Sat, Aug 29",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Rhodes Stadium",
    ...opponentMeta(
      "morton-ranch",
      "morton-ranch-mavericks",
      "katy",
      "morton-ranch-mavericks",
    ),
  },
  {
    id: "w2",
    week: 2,
    kind: "regular",
    opponent: "Magnolia West",
    date: "Fri, Sep 4",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Mustang Stadium",
    ...opponentMeta(
      "magnolia-west",
      "magnolia-west-mustangs",
      "magnolia",
      "magnolia-west-mustangs",
    ),
  },
  {
    id: "w3",
    week: 3,
    kind: "regular",
    opponent: "Cy Park",
    date: "Sat, Sep 12",
    time: "6:00 PM",
    homeAway: "Home",
    venue: "Cy-Fair FCU Stadium",
    ...opponentMeta(
      "cy-park",
      "cypress-park-tigers",
      "cypress",
      "cypress-park-tigers",
    ),
  },
  {
    id: "w4",
    week: 4,
    kind: "regular",
    opponent: "Cy Ridge",
    date: "Fri, Sep 25",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
    ...opponentMeta(
      "cy-ridge",
      "cypress-ridge-rams",
      "houston",
      "cypress-ridge-rams",
    ),
  },
  {
    id: "w5",
    week: 5,
    kind: "regular",
    opponent: "Cy Falls",
    date: "Fri, Oct 2",
    time: "7:00 PM",
    homeAway: "Home",
    venue: "Pridgeon Stadium",
    ...opponentMeta(
      "cy-falls",
      "cypress-falls-eagles",
      "houston",
      "cypress-falls-golden-eagles",
    ),
  },
  {
    id: "w6",
    week: 6,
    kind: "regular",
    opponent: "Cy-Fair",
    date: "Fri, Oct 9",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
    ...opponentMeta("cy-fair", "cy-fair-bobcats", "cypress", "cy-fair-bobcats"),
  },
  {
    id: "w7",
    week: 7,
    kind: "regular",
    opponent: "Cy Woods",
    date: "Thu, Oct 15",
    time: "6:30 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
    ...opponentMeta(
      "cy-woods",
      "cypress-woods-wildcats",
      "cypress",
      "cypress-woods-wildcats",
    ),
  },
  {
    id: "w8",
    week: 8,
    kind: "regular",
    opponent: "Cy Lakes",
    date: "Thu, Oct 22",
    time: "6:30 PM",
    homeAway: "Home",
    venue: "Cy-Fair FCU Stadium",
    ...opponentMeta(
      "cy-lakes",
      "cypress-lakes-spartans",
      "katy",
      "cypress-lakes-spartans",
    ),
  },
  {
    id: "w9",
    week: 9,
    kind: "regular",
    opponent: "Jersey Village",
    date: "Fri, Oct 30",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
    ...opponentMeta(
      "jersey-village",
      "jersey-village-falcons",
      "houston",
      "jersey-village-falcons",
    ),
  },
  {
    id: "w10",
    week: 10,
    kind: "regular",
    opponent: "Langham Creek",
    date: "Sat, Nov 7",
    time: "11:00 AM",
    homeAway: "Home",
    venue: "Pridgeon Stadium",
    ...opponentMeta(
      "langham-creek",
      "langham-creek-lobos",
      "houston",
      "langham-creek-lobos",
    ),
  },
  {
    id: "po-1",
    week: 11,
    kind: "playoff",
    optional: true,
    opponent: "Bi-District · TBD",
    date: "Fri, Nov 14",
    time: "TBD",
    homeAway: "Home",
    venue: "TBD",
    ...cyCreekMeta,
  },
  {
    id: "po-2",
    week: 12,
    kind: "playoff",
    optional: true,
    opponent: "Area · TBD",
    date: "Fri, Nov 21",
    time: "TBD",
    homeAway: "Home",
    venue: "TBD",
    ...cyCreekMeta,
  },
  {
    id: "po-3",
    week: 13,
    kind: "playoff",
    optional: true,
    opponent: "Regional · TBD",
    date: "Fri, Nov 28",
    time: "TBD",
    homeAway: "Home",
    venue: "TBD",
    ...cyCreekMeta,
  },
  {
    id: "po-4",
    week: 14,
    kind: "playoff",
    optional: true,
    opponent: "Quarterfinals · TBD",
    date: "Fri, Dec 5",
    time: "TBD",
    homeAway: "Home",
    venue: "TBD",
    ...cyCreekMeta,
  },
  {
    id: "po-5",
    week: 15,
    kind: "playoff",
    optional: true,
    opponent: "Semifinals · TBD",
    date: "Fri, Dec 12",
    time: "TBD",
    homeAway: "Home",
    venue: "TBD",
    ...cyCreekMeta,
  },
  {
    id: "po-6",
    week: 16,
    kind: "playoff",
    optional: true,
    opponent: "State · TBD",
    date: "Sat, Dec 20",
    time: "TBD",
    homeAway: "Home",
    venue: "TBD",
    ...cyCreekMeta,
  },
];

export type PositionType = "Offense" | "Defense" | "Special Teams";

export type PositionGroupDef = {
  id: string;
  name: string;
  abbreviation: string;
  type: PositionType;
};

export const positionTypes: PositionType[] = [
  "Offense",
  "Defense",
  "Special Teams",
];

/** Program → Groups position seed (name, abbreviation, type) */
export const seedPositionGroups: PositionGroupDef[] = [
  { id: "pos-ol", name: "Offensive Line", abbreviation: "OL", type: "Offense" },
  { id: "pos-qb", name: "Quarter Back", abbreviation: "QB", type: "Offense" },
  { id: "pos-rb", name: "Running Back", abbreviation: "RB", type: "Offense" },
  { id: "pos-te", name: "Tight End", abbreviation: "TE", type: "Offense" },
  { id: "pos-wr", name: "Wide Receiver", abbreviation: "WR", type: "Offense" },
  { id: "pos-db", name: "Defensive Back", abbreviation: "DB", type: "Defense" },
  { id: "pos-dl", name: "Defensive Line", abbreviation: "DL", type: "Defense" },
  { id: "pos-lb", name: "Linebacker", abbreviation: "LB", type: "Defense" },
  {
    id: "pos-ds",
    name: "Deep Snapper",
    abbreviation: "DS",
    type: "Special Teams",
  },
  { id: "pos-k", name: "Kicker", abbreviation: "K", type: "Special Teams" },
];

export function groupAbbrevsByType(
  groups: PositionGroupDef[],
  type: PositionType,
): string[] {
  return groups.filter((g) => g.type === type).map((g) => g.abbreviation);
}

export function allGroupAbbrevs(groups: PositionGroupDef[]): string[] {
  return groups.map((g) => g.abbreviation);
}

export const defenseGroups = groupAbbrevsByType(seedPositionGroups, "Defense");
export const offenseGroups = groupAbbrevsByType(seedPositionGroups, "Offense");
/** Specialists / coverage roles used on ST depth charts */
export const specialTeamsGroups = groupAbbrevsByType(
  seedPositionGroups,
  "Special Teams",
);

/** Map legacy abbreviations onto the Positions catalog */
export function migrateGroupAbbreviation(abbr: string): string {
  const map: Record<string, string> = {
    ILB: "LB",
    OLB: "LB",
    ST: "K",
  };
  return map[abbr] ?? abbr;
}

export function migrateAthleteGroups(groups: string[]): string[] {
  const next: string[] = [];
  for (const g of groups) {
    const mapped = migrateGroupAbbreviation(g);
    if (!next.includes(mapped)) next.push(mapped);
  }
  return next.length ? next : ["K"];
}

export type PersonnelType = "athlete" | "support-staff";

/** Support-staff specialty for Program Summary counts */
export type SupportRole = "manager" | "filmer" | "trainer";

export const supportRoleLabels: Record<SupportRole, string> = {
  manager: "Managers",
  filmer: "Filmers",
  trainer: "Trainers",
};

export const supportRoles: SupportRole[] = ["manager", "filmer", "trainer"];

/** Athletic period buckets used on Program Summary */
export const athleticPeriodOptions = [
  "5th",
  "7th",
  "After School",
  "None",
] as const;

/** Known custom athlete profile fields (equipment + guardian) */
export type AthleteKnownCustomFields = {
  lockerNumber: string;
  helmetSize: string;
  shirtSize: string;
  shortSize: string;
  girdleSize: string;
  pantSize: string;
  cleatSize: string;
  guardianName: string;
  guardianNumber: string;
  guardianEmail: string;
};

/** Equipment + guardian answers, plus any Issued Equipment columns added at runtime */
export type AthleteCustomFields = AthleteKnownCustomFields &
  Record<string, string>;

export type InventorySheetColumn = {
  key: string;
  label: string;
};

/** Default Issued Equipment columns (single source for sheet + profile) */
export const defaultInventorySheetColumns: InventorySheetColumn[] = [
  { key: "lockerNumber", label: "Locker #" },
  { key: "shirtSize", label: "Shirt Size" },
  { key: "girdleSize", label: "Girdle Size" },
  { key: "cleatSize", label: "Cleat Size" },
  { key: "helmetSize", label: "Helmet Size" },
  { key: "shortSize", label: "Short Size" },
  { key: "pantSize", label: "Pant Size" },
];

/** Built-in parent/guardian fields (not part of Issued Equipment) */
export const athleteGuardianFieldKeys = [
  "guardianName",
  "guardianNumber",
  "guardianEmail",
] as const;

export const athleteCustomFieldLabels: {
  key: keyof AthleteKnownCustomFields;
  label: string;
}[] = [
  { key: "lockerNumber", label: "Locker #" },
  { key: "helmetSize", label: "Helmet Size" },
  { key: "shirtSize", label: "Shirt Size" },
  { key: "shortSize", label: "Short Size" },
  { key: "girdleSize", label: "Girdle Size" },
  { key: "pantSize", label: "Pant Size" },
  { key: "cleatSize", label: "Cleat Size" },
  { key: "guardianName", label: "Parent/Guardian Name" },
  { key: "guardianNumber", label: "Parent/Guardian Number" },
  { key: "guardianEmail", label: "Parent/Guardian Email" },
];

export function emptyAthleteCustomFields(): AthleteCustomFields {
  return {
    lockerNumber: "",
    helmetSize: "",
    shirtSize: "",
    shortSize: "",
    girdleSize: "",
    pantSize: "",
    cleatSize: "",
    guardianName: "",
    guardianNumber: "",
    guardianEmail: "",
  };
}

/** Stable slug for a new inventory column; avoids colliding with existing keys. */
export function slugifyInventoryFieldKey(
  label: string,
  existingKeys: Iterable<string>,
): string {
  const taken = new Set(existingKeys);
  for (const g of athleteGuardianFieldKeys) taken.add(g);
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "field";
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

export type RecruitingSheetColumn = {
  key: string;
  label: string;
  minWidth?: string;
  inputWidth?: string;
};

/** Built-in recruiting sheet columns that map to core Athlete fields */
export const recruitingCoreFieldKeys = [
  "jerseyNumber",
  "height",
  "weight",
  "totalGpa",
  "coreGpa",
  "actSat",
  "phone",
  "email",
  "twitterHandle",
  "hudlLink",
] as const;

export type RecruitingCoreFieldKey = (typeof recruitingCoreFieldKeys)[number];

const recruitingCoreFieldKeySet = new Set<string>(recruitingCoreFieldKeys);

/** Sheet-only columns derived from athlete identity / roster (not free-text stores) */
export const recruitingStructuralKeys = [
  "name",
  "classYear",
  "position",
] as const;

export type RecruitingStructuralKey = (typeof recruitingStructuralKeys)[number];

const recruitingStructuralKeySet = new Set<string>(recruitingStructuralKeys);

/** Profile main form already shows these — Recruiting panel skips them to avoid duplicates */
export const recruitingProfileMainKeys = new Set<string>([
  "name",
  "classYear",
  "position",
  "height",
  "weight",
  "jerseyNumber",
  "phone",
  "email",
]);

export function isRecruitingCoreFieldKey(
  key: string,
): key is RecruitingCoreFieldKey {
  return recruitingCoreFieldKeySet.has(key);
}

export function isRecruitingStructuralKey(
  key: string,
): key is RecruitingStructuralKey {
  return recruitingStructuralKeySet.has(key);
}

/** Default Staff Recruiting columns (sheet + profile Recruiting section) */
export const defaultRecruitingSheetColumns: RecruitingSheetColumn[] = [
  { key: "name", label: "Prospect Name", minWidth: "min-w-[10rem]" },
  { key: "classYear", label: "Classification" },
  { key: "position", label: "Position" },
  { key: "jerseyNumber", label: "Jersey #", inputWidth: "w-14" },
  { key: "height", label: "Height", inputWidth: "w-16" },
  { key: "weight", label: "Weight", inputWidth: "w-14" },
  { key: "totalGpa", label: "Total GPA", inputWidth: "w-16" },
  { key: "coreGpa", label: "Core GPA", inputWidth: "w-16" },
  { key: "actSat", label: "ACT/SAT", inputWidth: "w-24" },
  { key: "phone", label: "Cell #", inputWidth: "w-32" },
  { key: "email", label: "Email Address", inputWidth: "w-44" },
  { key: "twitterHandle", label: "Twitter Handle", inputWidth: "w-28" },
  { key: "hudlLink", label: "HUDL Link", inputWidth: "w-40" },
];

/** Stable slug for a new recruiting column; avoids colliding with existing keys. */
export function slugifyRecruitingFieldKey(
  label: string,
  existingKeys: Iterable<string>,
): string {
  const taken = new Set(existingKeys);
  taken.add("name");
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "field";
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

export type Athlete = {
  id: string;
  firstName: string;
  lastName: string;
  /** Display name: "First Last" (kept in sync) */
  name: string;
  groups: string[];
  classYear: GradClass;
  /** Set when created from a player account signup */
  accountId?: string | null;
  /** Athlete or student support staff */
  personnelType?: PersonnelType;
  /** When support-staff: manager / filmer / trainer */
  supportRole?: SupportRole;
  /** Varsity / JV / etc. */
  teamLevel?: string;
  /** Athletic period (e.g. 5th, 7th, After School) */
  athleticPeriod?: string;
  phone?: string;
  email?: string;
  /** Profile photo (data URL or remote URL) */
  headshotUrl?: string | null;
  headshotFileName?: string | null;
  /** e.g. 6'1" */
  height?: string;
  /** e.g. 185 */
  weight?: string;
  /** Jersey number */
  jerseyNumber?: string;
  /** Academic / recruiting */
  totalGpa?: string;
  coreGpa?: string;
  /** Combined ACT/SAT score or scores string */
  actSat?: string;
  twitterHandle?: string;
  hudlLink?: string;
  /** Equipment + guardian answers */
  customFields?: AthleteCustomFields;
  /** Values for custom Staff Recruiting columns (non-core keys) */
  recruitingFields?: Record<string, string>;
};

export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  /** Display name: "First Last" (kept in sync) */
  name: string;
  role: Role;
  status: "active" | "inactive";
  /** Contact (coaches / coordinators / players) */
  phone?: string;
  email?: string;
  /** Profile photo (data URL or remote URL) */
  headshotUrl?: string | null;
  headshotFileName?: string | null;
  /** Admin-only staff profile fields */
  assignedTeams?: string[];
  duties?: string;
  notes?: string;
  athleticPeriod?: string;
};

export function composeDisplayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function splitDisplayName(name: string): {
  firstName: string;
  lastName: string;
} {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export function compareByLastName(
  a: { firstName?: string; lastName?: string; name: string },
  b: { firstName?: string; lastName?: string; name: string },
): number {
  const aParts = {
    firstName: a.firstName ?? splitDisplayName(a.name).firstName,
    lastName: a.lastName ?? splitDisplayName(a.name).lastName,
  };
  const bParts = {
    firstName: b.firstName ?? splitDisplayName(b.name).firstName,
    lastName: b.lastName ?? splitDisplayName(b.name).lastName,
  };
  const byLast = aParts.lastName.localeCompare(bParts.lastName, undefined, {
    sensitivity: "base",
  });
  if (byLast !== 0) return byLast;
  return aParts.firstName.localeCompare(bParts.firstName, undefined, {
    sensitivity: "base",
  });
}

/**
 * Depth-chart column label → position group(s).
 * Search only returns athletes assigned to one of these groups.
 */
const coverage = ["WR", "RB", "DB", "LB", "DL"];
const lineLane = ["OL", "TE", "DL", "LB"];

export const depthPositionGroups: Record<string, string[]> = {
  // Offense
  X: ["WR"],
  A: ["WR"],
  Z: ["WR"],
  Y: ["TE"],
  LT: ["OL"],
  LG: ["OL"],
  C: ["OL"],
  RG: ["OL"],
  RT: ["OL"],
  QB: ["QB"],
  B: ["RB"],
  TE: ["TE"],
  // Defense
  E: ["DL"],
  N: ["DL"],
  T: ["DL"],
  Star: ["LB"],
  Mike: ["LB"],
  Will: ["LB"],
  Bandit: ["LB"],
  Free: ["DB"],
  Rover: ["DB"],
  CB: ["DB"],
  // Special teams
  K: ["K"],
  P: ["K"],
  H: ["K"],
  LS: ["DS", "OL", "TE"],
  RS: ["OL", "TE"],
  Ret: ["WR", "RB", "DB"],
  FB: ["RB", "TE"],
  G: ["DL", "LB"],
  M: lineLane,
  L1: coverage,
  L2: coverage,
  L3: coverage,
  L4: coverage,
  L5: coverage,
  R1: coverage,
  R2: coverage,
  R3: coverage,
  R4: coverage,
  R5: coverage,
};

export function groupsForDepthPosition(position: string): string[] {
  return depthPositionGroups[position] ?? [...offenseGroups, ...defenseGroups, ...specialTeamsGroups];
}

export function athletesForDepthPosition(
  position: string,
  roster: Athlete[] = athletes,
): Athlete[] {
  const allowed = new Set(groupsForDepthPosition(position));
  return roster.filter((a) => a.groups.some((g) => allowed.has(g)));
}

/** GradClass is declared below; athletes use the same values */
export type GradClass =
  | "senior"
  | "junior"
  | "sophomore"
  | "freshman";

export const gradClassLabels: Record<GradClass, string> = {
  senior: "Senior",
  junior: "Junior",
  sophomore: "Sophomore",
  freshman: "Freshman",
};

/** Compact grade labels for list/table cells (profiles & depth charts keep full names). */
export const gradClassAbbreviations: Record<GradClass, string> = {
  senior: "Sr",
  junior: "Jr",
  sophomore: "So",
  freshman: "Fr",
};

export function abbreviateGrade(classYear: string): string {
  if (!classYear) return classYear;
  if (classYear in gradClassAbbreviations) {
    return gradClassAbbreviations[classYear as GradClass];
  }
  const byLabel = (
    Object.entries(gradClassLabels) as [GradClass, string][]
  ).find(([, label]) => label.toLowerCase() === classYear.toLowerCase());
  if (byLabel) return gradClassAbbreviations[byLabel[0]];
  return classYear;
}

/** Known team name → short display form (custom names fall back to initials). */
const TEAM_ABBREVIATIONS: Record<string, string> = {
  Varsity: "V",
  "Junior Varsity": "JV",
  Sophomore: "So",
  "Freshmen Blue": "FrB",
  "Freshman Blue": "FrB",
  "Freshman Silver": "FrS",
  "Freshmen Silver": "FrS",
  "Freshman Gold": "FrG",
  "Freshmen Gold": "FrG",
};

export function abbreviateTeam(team: string): string {
  if (!team) return team;
  const exact = TEAM_ABBREVIATIONS[team];
  if (exact) return exact;
  const known = Object.keys(TEAM_ABBREVIATIONS).find(
    (k) => k.toLowerCase() === team.toLowerCase(),
  );
  if (known) return TEAM_ABBREVIATIONS[known];

  if (/^junior\s*varsity$/i.test(team) || /^j\.?\s*v\.?$/i.test(team)) {
    return "JV";
  }
  if (/^varsity$/i.test(team)) return "V";

  const freshmanColor = team.match(/^freshm[ae]n\s+(.+)$/i);
  if (freshmanColor) {
    const color = freshmanColor[1].trim();
    if (color) return `Fr${color.charAt(0).toUpperCase()}`;
  }

  const words = team.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words.map((w) => w.charAt(0).toUpperCase()).join("");
  }
  if (team.length <= 3) return team;
  return `${team.charAt(0).toUpperCase()}${team.slice(1, 2).toLowerCase()}`;
}

export const athletes: Athlete[] = [
  // Offense
  { id: "a1", firstName: "Tyler", lastName: "Brooks", name: "Tyler Brooks", groups: ["WR", "ILB"], classYear: "senior", height: "6'1\"", weight: "195", jerseyNumber: "11", totalGpa: "3.6", coreGpa: "3.4", actSat: "24 / 1180", phone: "281-555-1101", email: "tbrooks@student.cycreek.edu", twitterHandle: "@tbrooks11", hudlLink: "https://www.hudl.com/profile/tbrooks" },
  { id: "a2", firstName: "Jordan", lastName: "Hill", name: "Jordan Hill", groups: ["WR", "RB"], classYear: "senior", height: "5'11\"", weight: "185", jerseyNumber: "2", totalGpa: "3.2", coreGpa: "3.0", actSat: "21", phone: "281-555-1102", email: "jhill@student.cycreek.edu", twitterHandle: "@jordanhill2", hudlLink: "https://www.hudl.com/profile/jhill" },
  { id: "a3", firstName: "Blake", lastName: "Moss", name: "Blake Moss", groups: ["OL"], classYear: "senior", height: "6'4\"", weight: "285", jerseyNumber: "72", totalGpa: "3.1", coreGpa: "2.9", actSat: "20 / 1040", phone: "281-555-1103", email: "bmoss@student.cycreek.edu" },
  { id: "a4", firstName: "Ethan", lastName: "Ford", name: "Ethan Ford", groups: ["OL"], classYear: "senior", height: "6'3\"", weight: "290", jerseyNumber: "74", totalGpa: "3.4", coreGpa: "3.2", actSat: "23", phone: "281-555-1104", email: "eford@student.cycreek.edu", twitterHandle: "@ethanford74" },
  { id: "a5", firstName: "Tyler", lastName: "Voss", name: "Tyler Voss", groups: ["OL"], classYear: "senior", height: "6'5\"", weight: "305", jerseyNumber: "77", totalGpa: "2.9", coreGpa: "2.8", actSat: "19", phone: "281-555-1105", email: "tvoss@student.cycreek.edu" },
  { id: "a6", firstName: "Quinn", lastName: "West", name: "Quinn West", groups: ["OL"], classYear: "senior", height: "6'2\"", weight: "275", jerseyNumber: "65", totalGpa: "3.8", coreGpa: "3.7", actSat: "28 / 1320", phone: "281-555-1106", email: "qwest@student.cycreek.edu", twitterHandle: "@qwest65", hudlLink: "https://www.hudl.com/profile/qwest" },
  { id: "a7", firstName: "Mason", lastName: "Grant", name: "Mason Grant", groups: ["OL"], classYear: "senior", height: "6'3\"", weight: "280", jerseyNumber: "70", totalGpa: "3.0", coreGpa: "2.9", phone: "281-555-1107", email: "mgrant@student.cycreek.edu" },
  { id: "a8", firstName: "Cameron", lastName: "Dunn", name: "Cameron Dunn", groups: ["TE"], classYear: "senior", height: "6'4\"", weight: "240", jerseyNumber: "88", totalGpa: "3.5", coreGpa: "3.3", actSat: "25 / 1210", phone: "281-555-1108", email: "cdunn@student.cycreek.edu", twitterHandle: "@camdunn88", hudlLink: "https://www.hudl.com/profile/cdunn" },
  { id: "a9", firstName: "Ryan", lastName: "Cain", name: "Ryan Cain", groups: ["WR"], classYear: "senior", height: "6'0\"", weight: "180", jerseyNumber: "5", totalGpa: "3.7", coreGpa: "3.5", actSat: "26", phone: "281-555-1109", email: "rcain@student.cycreek.edu", twitterHandle: "@ryancain5" },
  { id: "a10", firstName: "Alex", lastName: "Reyes", name: "Alex Reyes", groups: ["QB"], classYear: "senior", height: "6'2\"", weight: "205", jerseyNumber: "7", totalGpa: "3.9", coreGpa: "3.8", actSat: "29 / 1380", phone: "281-555-1110", email: "areyes@student.cycreek.edu", twitterHandle: "@alexreyes7", hudlLink: "https://www.hudl.com/profile/areyes" },
  { id: "a11", firstName: "Kyle", lastName: "Ward", name: "Kyle Ward", groups: ["RB"], classYear: "senior", height: "5'10\"", weight: "200", jerseyNumber: "21", totalGpa: "3.3", coreGpa: "3.1", actSat: "22", phone: "281-555-1111", email: "kward@student.cycreek.edu", twitterHandle: "@kyleward21", hudlLink: "https://www.hudl.com/profile/kward" },
  { id: "a12", firstName: "Parker", lastName: "Soto", name: "Parker Soto", groups: ["WR"], classYear: "sophomore" },
  { id: "a13", firstName: "Tyler", lastName: "Lee", name: "Tyler Lee", groups: ["WR", "RB"], classYear: "sophomore" },
  { id: "a14", firstName: "Sam", lastName: "Ruiz", name: "Sam Ruiz", groups: ["OL"], classYear: "junior" },
  { id: "a15", firstName: "Hunter", lastName: "Kim", name: "Hunter Kim", groups: ["OL"], classYear: "sophomore" },
  { id: "a16", firstName: "Jordan", lastName: "Hale", name: "Jordan Hale", groups: ["OL"], classYear: "junior" },
  { id: "a17", firstName: "Alex", lastName: "Diaz", name: "Alex Diaz", groups: ["OL"], classYear: "sophomore" },
  { id: "a18", firstName: "Ian", lastName: "Nash", name: "Ian Nash", groups: ["OL"], classYear: "junior" },
  { id: "a19", firstName: "Logan", lastName: "Park", name: "Logan Park", groups: ["TE"], classYear: "sophomore" },
  { id: "a20", firstName: "Noah", lastName: "Ortiz", name: "Noah Ortiz", groups: ["WR"], classYear: "freshman" },
  { id: "a21", firstName: "Mason", lastName: "Cole", name: "Mason Cole", groups: ["QB"], classYear: "sophomore" },
  { id: "a22", firstName: "Cameron", lastName: "Day", name: "Cameron Day", groups: ["WR", "DB"], classYear: "freshman" },
  // Defense
  {
    id: "a23",
    firstName: "Jordan",
    lastName: "Martinez",
    name: "Jordan Martinez",
    groups: ["DL"],
    classYear: "senior",
    accountId: "m-martinez",
    height: "6'3\"",
    weight: "275",
    jerseyNumber: "90",
    totalGpa: "3.4",
    coreGpa: "3.2",
    actSat: "23 / 1120",
    phone: "281-555-0200",
    email: "jmartinez@student.cycreek.edu",
    twitterHandle: "@jmartinez90",
    hudlLink: "https://www.hudl.com/profile/jmartinez",
  },
  { id: "a24", firstName: "Ryan", lastName: "Stone", name: "Ryan Stone", groups: ["DL"], classYear: "senior" },
  { id: "a25", firstName: "Logan", lastName: "Cross", name: "Logan Cross", groups: ["DL"], classYear: "senior" },
  { id: "a26", firstName: "Noah", lastName: "Price", name: "Noah Price", groups: ["ILB"], classYear: "senior" },
  { id: "a27", firstName: "Gabriel", lastName: "Moss", name: "Gabriel Moss", groups: ["ILB"], classYear: "senior" },
  { id: "a28", firstName: "Hunter", lastName: "Cole", name: "Hunter Cole", groups: ["OLB"], classYear: "senior" },
  { id: "a29", firstName: "Alex", lastName: "Nguyen", name: "Alex Nguyen", groups: ["DB"], classYear: "senior" },
  { id: "a30", firstName: "Blake", lastName: "Quinn", name: "Blake Quinn", groups: ["DB"], classYear: "senior" },
  { id: "a31", firstName: "Mason", lastName: "Sharp", name: "Mason Sharp", groups: ["DB"], classYear: "senior" },
  { id: "a32", firstName: "Tyler", lastName: "West", name: "Tyler West", groups: ["DB"], classYear: "senior" },
  { id: "a33", firstName: "Cameron", lastName: "Bell", name: "Cameron Bell", groups: ["DL"], classYear: "sophomore" },
  { id: "a34", firstName: "Dylan", lastName: "Pike", name: "Dylan Pike", groups: ["DL"], classYear: "junior" },
  { id: "a35", firstName: "Kyle", lastName: "Moon", name: "Kyle Moon", groups: ["DL"], classYear: "sophomore" },
  { id: "a36", firstName: "Alex", lastName: "Vale", name: "Alex Vale", groups: ["OLB"], classYear: "sophomore" },
  { id: "a37", firstName: "Sam", lastName: "York", name: "Sam York", groups: ["ILB"], classYear: "junior" },
  { id: "a38", firstName: "Parker", lastName: "Lane", name: "Parker Lane", groups: ["ILB"], classYear: "sophomore" },
  { id: "a39", firstName: "Finn", lastName: "Reed", name: "Finn Reed", groups: ["OLB"], classYear: "junior" },
  { id: "a40", firstName: "Jordan", lastName: "Fox", name: "Jordan Fox", groups: ["DB"], classYear: "sophomore" },
  // ST specialists + coverage extras
  { id: "a41", firstName: "Parker", lastName: "Mills", name: "Parker Mills", groups: ["ST"], classYear: "senior" },
  { id: "a42", firstName: "Ian", lastName: "Moon", name: "Ian Moon", groups: ["WR", "DB"], classYear: "senior" },
  { id: "a43", firstName: "Dylan", lastName: "Vega", name: "Dylan Vega", groups: ["OLB", "WR"], classYear: "senior" },
  { id: "a44", firstName: "Cameron", lastName: "Rowe", name: "Cameron Rowe", groups: ["ILB", "RB"], classYear: "senior" },
  { id: "a45", firstName: "Blake", lastName: "Holt", name: "Blake Holt", groups: ["DB"], classYear: "senior" },
  { id: "a46", firstName: "Alex", lastName: "Gray", name: "Alex Gray", groups: ["WR"], classYear: "senior" },
  { id: "a47", firstName: "Ethan", lastName: "Nash", name: "Ethan Nash", groups: ["DB", "WR"], classYear: "senior" },
  { id: "a48", firstName: "Finn", lastName: "Ortiz", name: "Finn Ortiz", groups: ["OLB"], classYear: "senior" },
  { id: "a49", firstName: "Gabriel", lastName: "Pan", name: "Gabriel Pan", groups: ["DL"], classYear: "senior" },
  { id: "a50", firstName: "Hunter", lastName: "Cruz", name: "Hunter Cruz", groups: ["ILB"], classYear: "senior" },
  // Student support staff
  {
    id: "s1",
    firstName: "Kyle",
    lastName: "Adams",
    name: "Kyle Adams",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "manager",
    athleticPeriod: "5th",
  },
  {
    id: "s2",
    firstName: "Logan",
    lastName: "Bennett",
    name: "Logan Bennett",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "manager",
    athleticPeriod: "5th",
  },
  {
    id: "s3",
    firstName: "Mason",
    lastName: "Chen",
    name: "Mason Chen",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "filmer",
    athleticPeriod: "5th",
  },
  {
    id: "s4",
    firstName: "Ava",
    lastName: "Diaz",
    name: "Ava Diaz",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "filmer",
    athleticPeriod: "",
  },
  {
    id: "s5",
    firstName: "Noah",
    lastName: "Ellis",
    name: "Noah Ellis",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "filmer",
    athleticPeriod: "",
  },
  {
    id: "s6",
    firstName: "Mia",
    lastName: "Foster",
    name: "Mia Foster",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "filmer",
    athleticPeriod: "",
  },
  {
    id: "s7",
    firstName: "Liam",
    lastName: "Garcia",
    name: "Liam Garcia",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "filmer",
    athleticPeriod: "",
  },
  {
    id: "s8",
    firstName: "Emma",
    lastName: "Hayes",
    name: "Emma Hayes",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "filmer",
    athleticPeriod: "",
  },
  {
    id: "s9",
    firstName: "Owen",
    lastName: "Ivy",
    name: "Owen Ivy",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "trainer",
    athleticPeriod: "",
  },
  {
    id: "s10",
    firstName: "Zoe",
    lastName: "James",
    name: "Zoe James",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "trainer",
    athleticPeriod: "",
  },
  {
    id: "s11",
    firstName: "Eli",
    lastName: "King",
    name: "Eli King",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "trainer",
    athleticPeriod: "",
  },
  {
    id: "s12",
    firstName: "Ruby",
    lastName: "Lane",
    name: "Ruby Lane",
    groups: [],
    classYear: "senior",
    personnelType: "support-staff",
    supportRole: "trainer",
    athleticPeriod: "",
  },
];

export const potw = {
  varsity: "—",
  scout: "—",
  jv: "—",
  freshmen: "—",
};

export const quizzes: Quiz[] = [
  // Week 0 (2-a-days / scrimmages) intentionally has no seed quizzes.
  {
    id: "q1",
    title: "Week 1 Defense — Morton Ranch Scout",
    side: "defense",
    week: 1,
    gameId: "w1",
    due: "Mon Aug 25 · before AP",
    assignedGroups: ["DL", "LB", "DB"],
    status: "assigned",
    passingScore: 80,
    generatedAt: null,
    generationSource: "coach",
    questions: [
      {
        id: "q1-a",
        prompt: "Morton Ranch's base run look this week is most often:",
        options: [
          "Inside zone from under center",
          "Outside zone / stretch from shotgun",
          "Power ISO with a fullback",
          "Empty pass first",
        ],
        correctIndex: 1,
        source: "coach",
        explanation: "Scout cards flag shotgun stretch as their bread-and-butter.",
      },
      {
        id: "q1-b",
        prompt: "On stretch to your side, DL first step priority is:",
        options: [
          "Spill and chase backside",
          "Attack the near hip and stay square",
          "Drop into coverage immediately",
          "Wait to see the puller",
        ],
        correctIndex: 1,
        source: "coach",
      },
      {
        id: "q1-c",
        prompt: "LB fit vs stretch: the force player should:",
        options: [
          "Squeeze and set the edge outside-in",
          "Crash inside the tackle box first",
          "Bail to deep third",
          "Spy the QB only",
        ],
        correctIndex: 0,
        source: "ai",
      },
    ],
  },
  {
    id: "q2",
    title: "Week 1 Offense — Install #1 Check",
    side: "offense",
    week: 1,
    gameId: "w1",
    due: "Tue Aug 26 · before practice",
    assignedGroups: ["OL", "QB", "RB", "TE", "WR"],
    status: "assigned",
    passingScore: 80,
    generatedAt: null,
    generationSource: "coach",
    questions: [
      {
        id: "q2-a",
        prompt: "Install #1 base run is:",
        options: [
          "Outside zone (9/8)",
          "Tight zone (3/2)",
          "Gap scheme trap",
          "Draw",
        ],
        correctIndex: 1,
        source: "coach",
      },
      {
        id: "q2-b",
        prompt: "On tight zone, the aiming point for the back is:",
        options: [
          "Outside the tackle",
          "The A/B gap — press, then bounce or bang",
          "Opposite hash always",
          "Behind the center only",
        ],
        correctIndex: 1,
        source: "coach",
      },
    ],
  },
];

export const coachDuties: CoachDuty[] = [
  {
    id: "duty-dc",
    coach: "Defensive Coordinator",
    role: "coordinator",
    side: "defense",
    groups: ["All D"],
    duties: [
      { id: "duty-dc-1", text: "Game plan", dueBy: "Sunday 9:00 PM" },
      {
        id: "duty-dc-2",
        text: "Hudl fronts/coverages/pressures",
        dueBy: "Sunday 9:00 PM",
      },
      { id: "duty-dc-3", text: "Scout report QC", dueBy: "Monday 8:00 AM" },
    ],
    notes: "Finalize scout cards by Sunday 9 PM",
  },
  {
    id: "duty-spencer",
    coach: "Coach Spencer",
    role: "coach",
    side: "defense",
    groups: ["DL"],
    duties: [
      { id: "duty-spencer-1", text: "Position grades", dueBy: "Monday 12:00 PM" },
      { id: "duty-spencer-2", text: "Hudl run tags" },
      { id: "duty-spencer-3", text: "DL install" },
    ],
    notes: "Practice 0–10 · Game 0–100 · Cougar Pride",
  },
  {
    id: "duty-haralson",
    coach: "Coach Haralson",
    role: "coach",
    side: "defense",
    groups: ["ILB"],
    duties: [
      {
        id: "duty-haralson-1",
        text: "Position grades",
        dueBy: "Monday 12:00 PM",
      },
      { id: "duty-haralson-2", text: "Personnel / strength tags" },
      { id: "duty-haralson-3", text: "ILB quizzes", dueBy: "Tuesday 8:00 AM" },
    ],
    notes: "",
  },
  {
    id: "duty-bell",
    coach: "Coach Bell",
    role: "coach",
    side: "defense",
    groups: ["OLB"],
    duties: [
      { id: "duty-bell-1", text: "Position grades", dueBy: "Monday 12:00 PM" },
      { id: "duty-bell-2", text: "Motion / perimeter tags" },
    ],
    notes: "",
  },
  {
    id: "duty-oc",
    coach: "Offensive Coordinator",
    role: "coordinator",
    side: "offense",
    groups: ["All O"],
    duties: [
      {
        id: "duty-oc-1",
        text: "Install progression",
        dueBy: "Sunday 9:00 PM",
      },
      { id: "duty-oc-2", text: "Playbook ownership" },
      { id: "duty-oc-3", text: "Week script", dueBy: "Sunday 9:00 PM" },
    ],
    notes: "Keep Offense Teach library current",
  },
  {
    id: "duty-rivera",
    coach: "Coach Rivera",
    role: "coach",
    side: "offense",
    groups: ["OL"],
    duties: [
      { id: "duty-rivera-1", text: "Position grades", dueBy: "Monday 12:00 PM" },
      { id: "duty-rivera-2", text: "OL install" },
      { id: "duty-rivera-3", text: "Pass pro" },
    ],
    notes: "",
  },
];

export type CoachStaffMember = {
  id: string;
  name: string;
  role: "coach" | "coordinator";
  side: Side;
};

/** Staff who can be assigned to position groups */
export const coachStaff: CoachStaffMember[] = [
  {
    id: "dc",
    name: "Defensive Coordinator",
    role: "coordinator",
    side: "defense",
  },
  {
    id: "spencer",
    name: "Coach Spencer",
    role: "coach",
    side: "defense",
  },
  {
    id: "haralson",
    name: "Coach Haralson",
    role: "coach",
    side: "defense",
  },
  {
    id: "bell",
    name: "Coach Bell",
    role: "coach",
    side: "defense",
  },
  {
    id: "oc",
    name: "Offensive Coordinator",
    role: "coordinator",
    side: "offense",
  },
  {
    id: "rivera",
    name: "Coach Rivera",
    role: "coach",
    side: "offense",
  },
  {
    id: "patel",
    name: "Coach Patel",
    role: "coach",
    side: "offense",
  },
];

/** group label → assigned coach staff ids */
export type CoachGroupAssignments = Record<string, string[]>;

export function buildInitialCoachAssignments(): CoachGroupAssignments {
  const out: CoachGroupAssignments = {};
  for (const g of [...defenseGroups, ...offenseGroups]) {
    out[g] = [];
  }
  const byName = Object.fromEntries(coachStaff.map((c) => [c.name, c.id]));
  for (const d of coachDuties) {
    if (d.role !== "coach") continue;
    const id = byName[d.coach];
    if (!id || d.side === "st") continue;
    for (const g of expandCoachGroups(d.groups, d.side)) {
      if (!out[g]) out[g] = [];
      if (!out[g].includes(id)) out[g].push(id);
    }
  }
  return out;
}

export function groupsForCoachId(
  coachId: string,
  assignments: CoachGroupAssignments,
): string[] {
  return Object.entries(assignments)
    .filter(([, ids]) => ids.includes(coachId))
    .map(([group]) => group);
}

export function coachesOnSide(side: Side) {
  return coachStaff.filter((c) => c.side === side && c.role === "coach");
}

/** Demo position coach for the role switcher (Coach Spencer — DL). Stable across unit side. */
export const DEMO_COACH_STAFF_ID = "spencer";

/** Mock “who am I” for My Room based on role switcher + current side + assignments */
export function myRoomProfile(
  role: Role,
  side: Side,
  assignments: CoachGroupAssignments = buildInitialCoachAssignments(),
): {
  name: string;
  groups: string[];
  side: Side;
  coachId?: string;
} | null {
  if (role !== "coach" && role !== "coordinator" && role !== "admin") {
    return null;
  }
  if (role === "coach") {
    // Keep the demo coach identity fixed (Spencer / DL). Do not remap to the first
    // coach on the active unit side — that incorrectly granted OL edit rights when a
    // DL coach opened Offense → Team Grades.
    const coach =
      coachStaff.find((c) => c.id === DEMO_COACH_STAFF_ID) ??
      coachStaff.find((c) => c.role === "coach");
    if (!coach) return null;
    const assigned = groupsForCoachId(coach.id, assignments);
    return {
      name: coach.name,
      groups: assigned.length
        ? assigned
        : coach.side === "defense"
          ? ["DL"]
          : ["OL"],
      side: coach.side,
      coachId: coach.id,
    };
  }
  // coordinator + admin preview as unit coordinator for active side
  const match = coachDuties.find(
    (d) => d.role === "coordinator" && d.side === side,
  );
  if (match) {
    return { name: match.coach, groups: match.groups, side };
  }
  return {
    name:
      side === "defense"
        ? "Defensive Coordinator"
        : side === "specialTeams"
          ? "Special Teams Coordinator"
          : "Offensive Coordinator",
    groups:
      side === "defense"
        ? ["All D"]
        : side === "specialTeams"
          ? [...specialTeamsGroups]
          : ["All O"],
    side,
  };
}

export function expandCoachGroups(groups: string[], side: Side): string[] {
  if (groups.includes("All D")) return [...defenseGroups];
  if (groups.includes("All O")) return [...offenseGroups];
  return groups
    .filter((g) => g !== "All D" && g !== "All O")
    .map(migrateGroupAbbreviation);
}

export function expandCoachGroupsWith(
  groups: string[],
  side: Side,
  offense: string[],
  defense: string[],
): string[] {
  if (groups.includes("All D")) return [...defense];
  if (groups.includes("All O")) return [...offense];
  return groups
    .filter((g) => g !== "All D" && g !== "All O")
    .map(migrateGroupAbbreviation);
}

export const grades: GradeRow[] = [
  {
    player: "Jordan Martinez",
    group: "DL",
    week: 0,
    practice: 8,
    game: 0,
    pride: "B",
  },
  {
    player: "R. Stone",
    group: "DL",
    week: 0,
    practice: 7,
    game: 0,
    pride: "B",
  },
  {
    player: "L. Cross",
    group: "DL",
    week: 0,
    practice: 6,
    game: 0,
    pride: "C",
  },
  {
    player: "Tyler Brooks",
    group: "ILB",
    week: 0,
    practice: 9,
    game: 0,
    pride: "A",
  },
  {
    player: "N. Price",
    group: "ILB",
    week: 0,
    practice: 8,
    game: 0,
    pride: "B",
  },
  {
    player: "A. Nguyen",
    group: "DB",
    week: 0,
    practice: 7,
    game: 0,
    pride: "B",
  },
  {
    player: "B. Moss",
    group: "OL",
    week: 0,
    practice: 8,
    game: 0,
    pride: "B",
  },
  {
    player: "E. Ford",
    group: "OL",
    week: 0,
    practice: 7,
    game: 0,
    pride: "B",
  },
  {
    player: "T. Voss",
    group: "OL",
    week: 0,
    practice: 9,
    game: 0,
    pride: "A",
  },
];

export const members: TeamMember[] = [
  {
    id: "m-admin",
    firstName: "You",
    lastName: "Admin",
    name: "You Admin",
    role: "admin",
    status: "active",
  },
  {
    id: "m-dc",
    firstName: "Defensive",
    lastName: "Coordinator",
    name: "Defensive Coordinator",
    role: "coordinator",
    status: "active",
    phone: "281-555-0101",
    email: "dc@cycreek.edu",
    assignedTeams: ["Varsity"],
    duties: "Defensive play caller",
    notes: "",
    athleticPeriod: "7th period",
  },
  {
    id: "m-oc",
    firstName: "Offensive",
    lastName: "Coordinator",
    name: "Offensive Coordinator",
    role: "coordinator",
    status: "active",
    phone: "281-555-0102",
    email: "oc@cycreek.edu",
    assignedTeams: ["Varsity"],
    duties: "Offensive play caller",
    notes: "",
    athleticPeriod: "7th period",
  },
  {
    id: "m-spencer",
    firstName: "Coach",
    lastName: "Spencer",
    name: "Coach Spencer",
    role: "coach",
    status: "active",
    phone: "281-555-0110",
    email: "spencer@cycreek.edu",
    assignedTeams: ["Varsity", "Junior Varsity"],
    duties: "DL",
    notes: "",
    athleticPeriod: "7th period",
  },
  {
    id: "m-haralson",
    firstName: "Coach",
    lastName: "Haralson",
    name: "Coach Haralson",
    role: "coach",
    status: "active",
    phone: "281-555-0111",
    email: "haralson@cycreek.edu",
    assignedTeams: ["Varsity"],
    duties: "LB",
    notes: "",
    athleticPeriod: "6th period",
  },
  {
    id: "m-bell",
    firstName: "Coach",
    lastName: "Bell",
    name: "Coach Bell",
    role: "coach",
    status: "active",
    phone: "281-555-0112",
    email: "bell@cycreek.edu",
    assignedTeams: ["Varsity"],
    duties: "DB",
    notes: "",
    athleticPeriod: "7th period",
  },
  {
    id: "m-rivera",
    firstName: "Coach",
    lastName: "Rivera",
    name: "Coach Rivera",
    role: "coach",
    status: "active",
    phone: "281-555-0113",
    email: "rivera@cycreek.edu",
    assignedTeams: ["Varsity"],
    duties: "OL",
    notes: "",
    athleticPeriod: "7th period",
  },
  {
    id: "m-patel",
    firstName: "Coach",
    lastName: "Patel",
    name: "Coach Patel",
    role: "coach",
    status: "active",
    phone: "281-555-0114",
    email: "patel@cycreek.edu",
    assignedTeams: ["Junior Varsity"],
    duties: "WR",
    notes: "",
    athleticPeriod: "6th period",
  },
  {
    id: "m-martinez",
    firstName: "Jordan",
    lastName: "Martinez",
    name: "Jordan Martinez",
    role: "player",
    status: "active",
    phone: "281-555-0200",
    email: "jmartinez@student.cycreek.edu",
  },
];

/** Demo logged-in account when using the role switcher */
export const DEMO_PLAYER_MEMBER_ID = "m-martinez";
export const DEMO_PLAYER_ATHLETE_ID = "a23";

export function demoMemberIdForRole(role: Role): string {
  switch (role) {
    case "admin":
      return "m-admin";
    case "coordinator":
      return "m-dc";
    case "coach":
      return "m-spencer";
    case "player":
      return DEMO_PLAYER_MEMBER_ID;
  }
}

export function findDemoMember(
  members: TeamMember[],
  role: Role,
): TeamMember | undefined {
  return members.find((m) => m.id === demoMemberIdForRole(role));
}

export function isDemoPlayerAthlete(athlete: {
  id: string;
  accountId?: string | null;
}): boolean {
  return (
    athlete.accountId === DEMO_PLAYER_MEMBER_ID ||
    athlete.id === DEMO_PLAYER_ATHLETE_ID
  );
}

export function findDemoPlayerAthlete(
  roster: Athlete[],
): Athlete | undefined {
  return (
    roster.find((a) => a.accountId === DEMO_PLAYER_MEMBER_ID) ??
    roster.find((a) => a.id === DEMO_PLAYER_ATHLETE_ID)
  );
}

/** Who “This Week” is personalized for (demo role switcher identity). */
export type ThisWeekIdentity =
  | {
      kind: "player";
      member: TeamMember;
      athlete: Athlete;
    }
  | {
      kind: "staff";
      member: TeamMember;
      profile: NonNullable<ReturnType<typeof myRoomProfile>>;
    }
  | {
      kind: "other";
      member?: TeamMember;
    };

export function resolveThisWeekIdentity(
  role: Role,
  side: Side,
  members: TeamMember[],
  roster: Athlete[],
  assignments: CoachGroupAssignments,
): ThisWeekIdentity {
  const member = findDemoMember(members, role);
  if (role === "player") {
    const athlete = findDemoPlayerAthlete(roster);
    if (member && athlete) return { kind: "player", member, athlete };
  }
  if (role === "coach" || role === "coordinator" || role === "admin") {
    const profile = myRoomProfile(role, side, assignments);
    if (member && profile) return { kind: "staff", member, profile };
  }
  return { kind: "other", member };
}

/** Mock install focus line for unit pages / This Week */
export function installFocusForSide(side: Side): string {
  if (side === "defense") return "#1 Foundation — Tite front";
  if (side === "specialTeams") return "#1 Coverage fundamentals";
  return "#1 Base run game";
}

export const offenseGameGoals = [
  "Win.",
  "Score 24+ points.",
  "Convert 40%+ on 3rd down.",
  "Zero turnovers.",
  "200+ rushing yards or 250+ passing yards.",
  "Score in plus territory (red zone).",
  "No three-and-outs in the first half.",
  "Win time of possession.",
];

export const defenseGameGoals = [
  "Win.",
  "Score or set up a score in plus territory.",
  "Force or create 2+ turnovers.",
  "Win 3rd down (70% stop rate).",
  "Opponent scores 17 points or less.",
  "Less than 300 total yards.",
  "No 100-yard rusher. No explosives (25+ yards).",
  "At least one 3-and-out after sudden change.",
];

export type UnitGoal = { id: string; text: string };

export function seedUnitGoals(
  side: "offense" | "defense",
  texts: string[],
): UnitGoal[] {
  return texts.map((text, i) => ({
    id: `${side}-goal-${i + 1}`,
    text,
  }));
}

export const seedOffenseGoals = seedUnitGoals("offense", offenseGameGoals);
export const seedDefenseGoals = seedUnitGoals("defense", defenseGameGoals);

/** @deprecated use defenseGameGoals — kept for This Week panel */
export const gameGoals = defenseGameGoals;

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

/** Parse schedule labels like "Fri, Aug 14" into a Date for the season year. */
export function parseGameCalendarDate(
  dateLabel: string,
  seasonYear: number = Number(team.season) || new Date().getFullYear(),
): Date | null {
  const m = dateLabel.match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m) return null;
  const month = MONTH_INDEX[m[1]!];
  const day = Number(m[2]);
  if (month === undefined || !Number.isFinite(day) || day < 1) return null;
  // Fall season year covers Aug–Dec; Jan–Jun dates belong to the next calendar year.
  const year = month <= 5 ? seasonYear + 1 : seasonYear;
  return new Date(year, month, day, 23, 59, 59, 999);
}

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Next schedule event on or after `now` (by calendar date). */
export function getNextUpcomingGame(
  list: Game[] = games,
  now: Date = new Date(),
  seasonYear: number = Number(team.season) || new Date().getFullYear(),
): Game {
  const today = startOfLocalDay(now).getTime();
  const ranked = list
    .map((g) => ({ g, at: parseGameCalendarDate(g.date, seasonYear) }))
    .filter((x): x is { g: Game; at: Date } => x.at !== null)
    .map(({ g, at }) => ({ g, at: startOfLocalDay(at).getTime() }))
    .sort((a, b) => a.at - b.at);

  const upcoming = ranked.find(({ at }) => at >= today);
  return upcoming?.g ?? ranked[ranked.length - 1]?.g ?? list[0]!;
}

/**
 * Featured / default week: admin override when `activeGameId` is set and present
 * in `list`, otherwise next upcoming by calendar date.
 */
export function resolveActiveGame(
  list: Game[] = games,
  activeGameId: string | null | undefined = null,
  now: Date = new Date(),
  seasonYear: number = Number(team.season) || new Date().getFullYear(),
): Game {
  if (activeGameId) {
    const forced = list.find((g) => g.id === activeGameId);
    if (forced) return forced;
  }
  return getNextUpcomingGame(list, now, seasonYear);
}

/** Featured “This Week” event — follows today's date (e.g. next up = 2-a-Days). */
export const currentGame = getNextUpcomingGame();

/** Eyebrow label for schedule / weekly accordions */
export function gameSlotLabel(g: Game): string {
  if (g.kind === "two-a-days") return "Preseason";
  if (g.kind === "scrimmage") return "Scrimmage";
  if (g.kind === "playoff") {
    const rounds: Record<number, string> = {
      11: "Playoff · Bi-District",
      12: "Playoff · Area",
      13: "Playoff · Regional",
      14: "Playoff · Quarterfinals",
      15: "Playoff · Semifinals",
      16: "Playoff · State",
    };
    return rounds[g.week] ?? `Playoff · Round ${g.week - 10}`;
  }
  return `Week ${g.week}`;
}

export function gameSlotTitle(g: Game): string {
  if (g.kind === "two-a-days") return g.opponent;
  if (g.kind === "scrimmage") return g.opponent;
  if (g.kind === "playoff") return g.opponent;
  return `vs ${g.opponent}`;
}

export const teamLevels = [
  "Varsity",
  "Junior Varsity",
  "Sophomore",
  "Freshmen Blue",
  "Freshman Silver",
] as const;

export type DepthScheme = string;

export const depthSchemes: DepthScheme[] = [
  "Offense",
  "Defense",
  "Kick Off",
  "Kick Off Return",
  "Hands Team",
  "Punt",
  "Punt Return",
  "Field Goal",
];

/** Options for depth chart Practice vs Game Day */
export const depthSchemeTypeOptions = ["Practice", "Game Day"] as const;

export type DepthColumnDef = {
  id: string;
  name: string;
  /** "any" = use built-in depth position mapping; else a position-group abbreviation */
  positionFilter: string;
  twoDeepLabel: string;
};

export function columnsFromPositionNames(
  names: string[],
): DepthColumnDef[] {
  return names.map((name, i) => ({
    id: `col-${i}-${name}`,
    name,
    positionFilter: "any",
    twoDeepLabel: "",
  }));
}

export type DepthPlayer = { name: string; classYear: GradClass };

/** My GA-style chart: positions as columns, depth as rows */
export type DepthChartBoard = {
  positions: string[];
  /** rows[depthIndex][positionIndex] */
  rows: (DepthPlayer | null)[][];
};

export const MIN_DEPTH_ROWS = 3;

export function emptyDepthRow(
  colCount: number,
): (DepthPlayer | null)[] {
  return Array.from({ length: colCount }, () => null);
}

/** Keep first `rowCount` rows (pad with empties if short). */
export function normalizeDepthBoardRows(
  board: DepthChartBoard,
  rowCount = MIN_DEPTH_ROWS,
): DepthChartBoard {
  const cols = board.positions.length;
  const rows = board.rows
    .slice(0, rowCount)
    .map((row) => {
      const next = row.slice(0, cols);
      while (next.length < cols) next.push(null);
      return next;
    });
  while (rows.length < rowCount) {
    rows.push(emptyDepthRow(cols));
  }
  return { positions: [...board.positions], rows };
}

export function cloneDepthBoard(board: DepthChartBoard): DepthChartBoard {
  return {
    positions: [...board.positions],
    rows: board.rows.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null)),
    ),
  };
}

function rowIsEmpty(row: (DepthPlayer | null)[]): boolean {
  return row.every((cell) => cell == null);
}

/** True if any cell (or any relevantCols cell) on the row has a player. */
function rowHasPlayerInCols(
  row: (DepthPlayer | null)[],
  relevantCols?: number[],
): boolean {
  if (!relevantCols?.length) {
    return row.some((cell) => cell != null);
  }
  return relevantCols.some((i) => row[i] != null);
}

/**
 * Keep at least MIN_DEPTH_ROWS. When the last row has any player
 * (optionally only in relevantCols — e.g. a coach’s filtered positions),
 * append one empty row so there is always a free depth line.
 */
export function syncDepthBoardRows(
  board: DepthChartBoard,
  relevantCols?: number[],
): DepthChartBoard {
  const cols = board.positions.length;
  const rows = board.rows.map((row) => {
    const next = row.slice(0, cols);
    while (next.length < cols) next.push(null);
    return next;
  });

  while (rows.length > MIN_DEPTH_ROWS && rowIsEmpty(rows[rows.length - 1]!)) {
    rows.pop();
  }
  while (rows.length < MIN_DEPTH_ROWS) {
    rows.push(emptyDepthRow(cols));
  }
  if (
    rows.length > 0 &&
    rowHasPlayerInCols(rows[rows.length - 1]!, relevantCols)
  ) {
    rows.push(emptyDepthRow(cols));
  }

  return { positions: [...board.positions], rows };
}

function board(
  positions: string[],
  rows: (DepthPlayer | null)[][],
): DepthChartBoard {
  return { positions, rows };
}

const p = (name: string, classYear: GradClass): DepthPlayer => ({
  name,
  classYear,
});

/** Shared mock boards by scheme (shown for each team level) */
export const depthBoards: Record<DepthScheme, DepthChartBoard> = {
  Offense: board(
    ["X", "A", "LT", "LG", "C", "RG", "RT", "Y", "Z", "QB", "B"],
    [
      [
        p("Tyler Brooks", "senior"),
        p("Jordan Hill", "senior"),
        p("Blake Moss", "senior"),
        p("Ethan Ford", "senior"),
        p("Tyler Voss", "senior"),
        p("Quinn West", "senior"),
        p("Mason Grant", "senior"),
        p("Cameron Dunn", "senior"),
        p("Ryan Cain", "senior"),
        p("Alex Reyes", "senior"),
        p("Kyle Ward", "senior"),
      ],
      [
        p("Parker Soto", "sophomore"),
        p("Tyler Lee", "sophomore"),
        p("Sam Ruiz", "junior"),
        p("Hunter Kim", "sophomore"),
        p("Jordan Hale", "junior"),
        p("Alex Diaz", "sophomore"),
        p("Ian Nash", "junior"),
        p("Logan Park", "sophomore"),
        p("Noah Ortiz", "freshman"),
        p("Mason Cole", "sophomore"),
        p("Jordan Hill", "junior"),
      ],
      [
        p("Cameron Day", "freshman"),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        p("Tyler Lee", "sophomore"),
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
  Defense: board(
    ["E", "N", "T", "Star", "Mike", "Will", "Bandit", "Free", "Rover", "CB", "CB"],
    [
      [
        p("Jordan Martinez", "senior"),
        p("Ryan Stone", "senior"),
        p("Logan Cross", "senior"),
        p("Tyler Brooks", "senior"),
        p("Noah Price", "senior"),
        p("Gabriel Moss", "senior"),
        p("Hunter Cole", "senior"),
        p("Alex Nguyen", "senior"),
        p("Blake Quinn", "senior"),
        p("Mason Sharp", "senior"),
        p("Tyler West", "senior"),
      ],
      [
        p("Cameron Bell", "sophomore"),
        p("Dylan Pike", "junior"),
        p("Kyle Moon", "sophomore"),
        p("Alex Vale", "sophomore"),
        p("Sam York", "junior"),
        p("Parker Lane", "sophomore"),
        p("Finn Reed", "junior"),
        p("Jordan Fox", "sophomore"),
        p("Cameron Day", "freshman"),
        p("Tyler West", "junior"),
        p("Mason Sharp", "sophomore"),
      ],
      [
        null,
        null,
        null,
        p("Sam York", "junior"),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
  "Kick Off": board(
    ["L5", "L4", "L3", "L2", "L1", "K", "R1", "R2", "R3", "R4", "R5"],
    [
      [
        p("Ian Moon", "senior"),
        p("Dylan Vega", "senior"),
        p("Cameron Rowe", "senior"),
        p("Blake Holt", "senior"),
        p("Alex Gray", "senior"),
        p("Parker Mills", "senior"),
        p("Ethan Nash", "senior"),
        p("Finn Ortiz", "senior"),
        p("Gabriel Pan", "senior"),
        p("Hunter Cruz", "senior"),
        p("Cameron Day", "senior"),
      ],
      [
        null,
        p("Tyler Lee", "sophomore"),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
  "Kick Off Return": board(
    ["L4", "L3", "L2", "L1", "Ret", "Ret", "R1", "R2", "R3", "R4", "FB"],
    [
      [
        p("Alex Gray", "senior"),
        p("Blake Holt", "senior"),
        p("Cameron Rowe", "senior"),
        p("Dylan Vega", "senior"),
        p("Tyler Brooks", "senior"),
        p("Ryan Cain", "senior"),
        p("Ethan Nash", "senior"),
        p("Finn Ortiz", "senior"),
        p("Gabriel Pan", "senior"),
        p("Hunter Cruz", "senior"),
        p("Jordan Hill", "senior"),
      ],
      [
        null,
        null,
        null,
        null,
        p("Parker Soto", "sophomore"),
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
  "Hands Team": board(
    ["L3", "L2", "L1", "M", "M", "M", "R1", "R2", "R3", "FB", "K"],
    [
      [
        p("Cameron Dunn", "senior"),
        p("Logan Park", "senior"),
        p("Tyler Brooks", "senior"),
        p("Tyler Voss", "senior"),
        p("Ethan Ford", "senior"),
        p("Quinn West", "senior"),
        p("Ryan Cain", "senior"),
        p("Noah Ortiz", "senior"),
        p("Parker Soto", "senior"),
        p("Jordan Hill", "senior"),
        p("Parker Mills", "senior"),
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
  Punt: board(
    ["L4", "L3", "L2", "L1", "LS", "P", "RS", "R1", "R2", "R3", "R4"],
    [
      [
        p("Blake Moss", "senior"),
        p("Ethan Ford", "senior"),
        p("Tyler Voss", "senior"),
        p("Quinn West", "senior"),
        p("Mason Grant", "senior"),
        p("Parker Mills", "senior"),
        p("Sam Ruiz", "senior"),
        p("Ian Nash", "senior"),
        p("Alex Diaz", "senior"),
        p("Hunter Kim", "senior"),
        p("Jordan Hale", "senior"),
      ],
      [
        null,
        null,
        null,
        null,
        null,
        p("Mason Cole", "sophomore"),
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
  "Punt Return": board(
    ["L3", "L2", "L1", "G", "G", "G", "R1", "R2", "R3", "Ret", "Ret"],
    [
      [
        p("Noah Price", "senior"),
        p("Gabriel Moss", "senior"),
        p("Hunter Cole", "senior"),
        p("Tyler Brooks", "senior"),
        p("Alex Vale", "senior"),
        p("Sam York", "senior"),
        p("Finn Reed", "senior"),
        p("Parker Lane", "senior"),
        p("Jordan Fox", "senior"),
        p("Alex Nguyen", "senior"),
        p("Blake Quinn", "senior"),
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        p("Mason Sharp", "sophomore"),
        null,
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
  "Field Goal": board(
    ["L3", "L2", "L1", "TE", "C", "TE", "R1", "R2", "R3", "H", "K"],
    [
      [
        p("Blake Moss", "senior"),
        p("Ethan Ford", "senior"),
        p("Quinn West", "senior"),
        p("Cameron Dunn", "senior"),
        p("Tyler Voss", "senior"),
        p("Logan Park", "senior"),
        p("Mason Grant", "senior"),
        p("Ian Nash", "senior"),
        p("Sam Ruiz", "senior"),
        p("Alex Reyes", "senior"),
        p("Parker Mills", "senior"),
      ],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null],
    ],
  ),
};
