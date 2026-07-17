/** Rich demo content for show-ready Platform screens. */

import type { SportId } from "./programConfig";

export type DemoAthlete = {
  jersey: string;
  name: string;
  pos: string;
  classYear: string;
  level?: string;
};

export type DemoGame = {
  week: number;
  date: string;
  time: string;
  opponent: string;
  homeAway: "Home" | "Away";
  result: string | null;
  venue?: string;
};

export type DemoStaff = {
  name: string;
  role: string;
  scope: string;
};

export type DemoCampus = {
  id: string;
  name: string;
  mascot: string;
  active: boolean;
};

export const DEMO_CAMPUSES: DemoCampus[] = [
  {
    id: "camp-cycreek",
    name: "Cypress Creek High School",
    mascot: "Cougars",
    active: true,
  },
  {
    id: "camp-cywoods",
    name: "Cy Woods High School",
    mascot: "Wildcats",
    active: false,
  },
  {
    id: "camp-langham",
    name: "Langham Creek High School",
    mascot: "Lobos",
    active: false,
  },
];

export const DEMO_STAFF: DemoStaff[] = [
  { name: "Jordan Hale", role: "Athletic Director", scope: "Campus" },
  { name: "Coach Billiott", role: "Head Football Coach", scope: "Football" },
  { name: "Maria Santos", role: "OC / QB Coach", scope: "Football" },
  { name: "Chris Nguyen", role: "DC / LB Coach", scope: "Football" },
  { name: "Alicia Brooks", role: "Head Volleyball Coach", scope: "Volleyball" },
  { name: "Sam Ortiz", role: "Campus Tech / Admin", scope: "Campus" },
];

export const DEMO_SUBPROCESSORS = [
  { name: "Vercel", purpose: "App hosting", region: "US" },
  { name: "Supabase (planned)", purpose: "Auth + database + files", region: "US" },
  { name: "Resend / email (planned)", purpose: "Staff invites", region: "US" },
];

export const DEMO_RETENTION = [
  {
    title: "Active season data",
    detail: "Roster placements, grades, scout, quizzes — kept for the season.",
  },
  {
    title: "Archived seasons",
    detail: "Soft-archived on roll; available for selective import.",
  },
  {
    title: "Offboard / delete",
    detail: "District can export then purge a program; audit writes a certificate.",
  },
  {
    title: "Clinical PHI",
    detail: "Not stored in Team OS — stays in nurse/trainer systems.",
  },
];

export const FOOTBALL_ROSTER: DemoAthlete[] = [
  { jersey: "7", name: "Alex Reyes", pos: "QB", classYear: "Sr", level: "Varsity" },
  { jersey: "11", name: "Tyler Brooks", pos: "WR", classYear: "Sr", level: "Varsity" },
  { jersey: "2", name: "Jordan Hill", pos: "WR", classYear: "Jr", level: "Varsity" },
  { jersey: "88", name: "Cameron Dunn", pos: "TE", classYear: "Sr", level: "Varsity" },
  { jersey: "72", name: "Blake Moss", pos: "OL", classYear: "Jr", level: "Varsity" },
  { jersey: "44", name: "Dee Carter", pos: "LB", classYear: "Sr", level: "Varsity" },
  { jersey: "5", name: "Noah Price", pos: "RB", classYear: "Jr", level: "Varsity" },
  { jersey: "21", name: "Eli Vargas", pos: "DB", classYear: "So", level: "Varsity" },
  { jersey: "9", name: "Marcus Cole", pos: "DL", classYear: "Sr", level: "Varsity" },
  { jersey: "17", name: "Kai Benton", pos: "K/P", classYear: "Jr", level: "Varsity" },
  { jersey: "3", name: "Ryan Park", pos: "WR", classYear: "Fr", level: "JV" },
  { jersey: "55", name: "Luis Medina", pos: "OL", classYear: "So", level: "JV" },
];

export const VOLLEYBALL_ROSTER: DemoAthlete[] = [
  { jersey: "4", name: "Maya Chen", pos: "OH", classYear: "Sr", level: "Varsity" },
  { jersey: "12", name: "Sofia Ramirez", pos: "S", classYear: "Jr", level: "Varsity" },
  { jersey: "8", name: "Emma Walsh", pos: "MB", classYear: "Sr", level: "Varsity" },
  { jersey: "15", name: "Ava Nguyen", pos: "OH", classYear: "So", level: "Varsity" },
  { jersey: "2", name: "Lily Torres", pos: "L", classYear: "Jr", level: "Varsity" },
  { jersey: "10", name: "Zoe Harper", pos: "RS", classYear: "Sr", level: "Varsity" },
  { jersey: "6", name: "Nina Patel", pos: "MB", classYear: "Fr", level: "JV" },
  { jersey: "14", name: "Chloe Diaz", pos: "S", classYear: "So", level: "JV" },
];

export const FOOTBALL_SCHEDULE: DemoGame[] = [
  {
    week: 1,
    date: "Aug 28",
    time: "7:00 PM",
    opponent: "Tomball Memorial",
    homeAway: "Home",
    result: "W 28-21",
    venue: "Cougar Stadium",
  },
  {
    week: 2,
    date: "Sep 4",
    time: "7:00 PM",
    opponent: "Bridgeland",
    homeAway: "Away",
    result: null,
    venue: "Bridgeland Stadium",
  },
  {
    week: 3,
    date: "Sep 11",
    time: "7:00 PM",
    opponent: "Cy Ranch",
    homeAway: "Home",
    result: null,
    venue: "Cougar Stadium",
  },
  {
    week: 4,
    date: "Sep 18",
    time: "7:00 PM",
    opponent: "Cy Woods",
    homeAway: "Home",
    result: null,
    venue: "Cougar Stadium",
  },
  {
    week: 5,
    date: "Sep 25",
    time: "7:00 PM",
    opponent: "Cy Falls",
    homeAway: "Away",
    result: null,
    venue: "Cy Falls",
  },
  {
    week: 6,
    date: "Oct 2",
    time: "7:00 PM",
    opponent: "Jersey Village",
    homeAway: "Home",
    result: null,
    venue: "Cougar Stadium",
  },
];

export const VOLLEYBALL_SCHEDULE: DemoGame[] = [
  {
    week: 1,
    date: "Aug 12",
    time: "6:00 PM",
    opponent: "Cy Ranch",
    homeAway: "Home",
    result: "W 3-1",
    venue: "Cougar Gym",
  },
  {
    week: 2,
    date: "Aug 19",
    time: "6:00 PM",
    opponent: "Cy Woods",
    homeAway: "Away",
    result: "L 1-3",
    venue: "Cy Woods Gym",
  },
  {
    week: 3,
    date: "Aug 26",
    time: "6:00 PM",
    opponent: "Langham Creek",
    homeAway: "Home",
    result: null,
    venue: "Cougar Gym",
  },
  {
    week: 4,
    date: "Sep 2",
    time: "6:00 PM",
    opponent: "Cy Falls",
    homeAway: "Away",
    result: null,
    venue: "Cy Falls Gym",
  },
  {
    week: 5,
    date: "Sep 9",
    time: "6:00 PM",
    opponent: "Cy Lakes",
    homeAway: "Home",
    result: null,
    venue: "Cougar Gym",
  },
];

export const FOOTBALL_STANDINGS = [
  { team: "Cy Creek", w: 1, l: 0, pf: 28, pa: 21 },
  { team: "Bridgeland", w: 1, l: 0, pf: 35, pa: 14 },
  { team: "Cy Ranch", w: 1, l: 0, pf: 24, pa: 17 },
  { team: "Tomball Mem.", w: 0, l: 1, pf: 21, pa: 28 },
  { team: "Cy Woods", w: 0, l: 1, pf: 10, pa: 31 },
];

export const VOLLEYBALL_STANDINGS = [
  { team: "Cy Ranch", w: 2, l: 0 },
  { team: "Cy Woods", w: 2, l: 0 },
  { team: "Cy Creek", w: 1, l: 1 },
  { team: "Langham Creek", w: 0, l: 1 },
  { team: "Cy Falls", w: 0, l: 2 },
];

export const FAN_NEWS = [
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
  {
    id: "news-4",
    tag: "Tickets",
    title: "Season tickets still available",
    blurb: "Buy at the field house or online — student IDs free at the gate.",
  },
];

export const PARENT_ANNOUNCEMENTS = [
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
  {
    id: "ann-4",
    date: "Sat",
    title: "Film / recovery optional",
    body: "Optional lift 9–10am for Varsity. No pads.",
  },
];

export const PARENT_DOCS = [
  { id: "doc-1", title: "Athletic handbook (PDF)", kind: "Handbook" },
  { id: "doc-2", title: "Travel consent form", kind: "Form" },
  { id: "doc-3", title: "Booster calendar", kind: "Calendar" },
];

export const DEMO_SCRIPT = [
  {
    id: "s1",
    page: "district" as const,
    title: "Open District",
    say: "One district account — campuses and sports nest underneath.",
  },
  {
    id: "s2",
    page: "programs" as const,
    title: "Add a team",
    say: "Add Volleyball — single Team unit, not Offense/Defense.",
  },
  {
    id: "s3",
    page: "fan" as const,
    title: "Show Fan site",
    say: "Public schedule + directory roster. No grades or contacts.",
  },
  {
    id: "s4",
    page: "parent" as const,
    title: "Show Parent site",
    say: "Guardians see their child, this week, announcements, eligibility.",
  },
  {
    id: "s5",
    page: "legal" as const,
    title: "Legal & safety",
    say: "Field matrix, safety toggles, opt-outs, procurement checklist.",
  },
  {
    id: "s6",
    page: "data" as const,
    title: "Export / delete",
    say: "District can export JSON and offboard a program.",
  },
];

export function contentForSport(sport: SportId): {
  roster: DemoAthlete[];
  schedule: DemoGame[];
  standings: { team: string; w: number; l: number; pf?: number; pa?: number }[];
  recordLabel: string;
} {
  if (sport === "volleyball") {
    const w = VOLLEYBALL_SCHEDULE.filter((g) => g.result?.startsWith("W")).length;
    const l = VOLLEYBALL_SCHEDULE.filter((g) => g.result?.startsWith("L")).length;
    return {
      roster: VOLLEYBALL_ROSTER,
      schedule: VOLLEYBALL_SCHEDULE,
      standings: VOLLEYBALL_STANDINGS,
      recordLabel: `${w}-${l}`,
    };
  }
  const w = FOOTBALL_SCHEDULE.filter((g) => g.result?.startsWith("W")).length;
  const l = FOOTBALL_SCHEDULE.filter((g) => g.result?.startsWith("L")).length;
  return {
    roster: FOOTBALL_ROSTER,
    schedule: FOOTBALL_SCHEDULE,
    standings: FOOTBALL_STANDINGS,
    recordLabel: `${w}-${l}`,
  };
}

/** Map opponent display names to /logos/opponents/*.png when available */
export const OPPONENT_LOGO: Record<string, string> = {
  "Tomball Memorial": "/logos/opponents/tomball-memorial.png",
  "Cy Woods": "/logos/opponents/cy-woods.png",
  "Cy Falls": "/logos/opponents/cy-falls.png",
  "Cy Lakes": "/logos/opponents/cy-lakes.png",
  "Jersey Village": "/logos/opponents/jersey-village.png",
  "Langham Creek": "/logos/opponents/langham-creek.png",
  "Cy Ranch": "/logos/opponents/cy-woods.png",
  Bridgeland: "/logos/opponents/cy-fair.png",
};

export function logoForOpponent(name: string): string | null {
  return OPPONENT_LOGO[name] ?? null;
}
