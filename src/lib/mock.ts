import type { CoachDuty, Game, GradeRow, Quiz } from "./types";

export const team = {
  name: "Cy Creek Cougars",
  unit: "Football",
  motto: "Fast, Physical, Relentless",
  season: "2026",
  colors: { primary: "#0B3D91", steel: "#3D4A5C", field: "#E8EEF5" },
  maxPrepsUrl:
    "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/",
  logoLetter: "CC",
};

export const games: Game[] = [
  {
    id: "w1",
    week: 1,
    opponent: "Morton Ranch",
    date: "Sat, Aug 29",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Rhodes Stadium",
  },
  {
    id: "w2",
    week: 2,
    opponent: "Magnolia West",
    date: "Fri, Sep 4",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Mustang Stadium",
  },
  {
    id: "w3",
    week: 3,
    opponent: "Cy Park",
    date: "Sat, Sep 12",
    time: "6:00 PM",
    homeAway: "Home",
    venue: "Cy-Fair FCU Stadium",
  },
  {
    id: "w4",
    week: 4,
    opponent: "Cy Ridge",
    date: "Fri, Sep 25",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
  },
  {
    id: "w5",
    week: 5,
    opponent: "Cy Falls",
    date: "Fri, Oct 2",
    time: "7:00 PM",
    homeAway: "Home",
    venue: "Pridgeon Stadium",
  },
  {
    id: "w6",
    week: 6,
    opponent: "Cy-Fair",
    date: "Fri, Oct 9",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
  },
  {
    id: "w7",
    week: 7,
    opponent: "Cy Woods",
    date: "Thu, Oct 15",
    time: "6:30 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
  },
  {
    id: "w8",
    week: 8,
    opponent: "Cy Lakes",
    date: "Thu, Oct 22",
    time: "6:30 PM",
    homeAway: "Home",
    venue: "Cy-Fair FCU Stadium",
  },
  {
    id: "w9",
    week: 9,
    opponent: "Jersey Village",
    date: "Fri, Oct 30",
    time: "7:00 PM",
    homeAway: "Away",
    venue: "Pridgeon Stadium",
  },
  {
    id: "w10",
    week: 10,
    opponent: "Langham Creek",
    date: "Sat, Nov 7",
    time: "11:00 AM",
    homeAway: "Home",
    venue: "Pridgeon Stadium",
  },
];

export const defenseGroups = ["DL", "ILB", "OLB", "DB"];
export const offenseGroups = ["OL", "QB", "RB", "TE", "WR"];

export const potw = {
  varsity: "—",
  scout: "—",
  jv: "—",
  freshmen: "—",
};

export const quizzes: Quiz[] = [
  {
    id: "q1",
    title: "Week 1 Defense — Morton Ranch Scout",
    side: "defense",
    week: 1,
    due: "Mon Aug 25 · before AP",
    assignedGroups: ["DL", "ILB", "OLB", "DB"],
    status: "assigned",
    passingScore: 80,
  },
  {
    id: "q2",
    title: "Week 1 Offense — Install #1 Check",
    side: "offense",
    week: 1,
    due: "Tue Aug 26 · before practice",
    assignedGroups: ["OL", "QB", "RB", "TE", "WR"],
    status: "assigned",
    passingScore: 80,
  },
];

export const coachDuties: CoachDuty[] = [
  {
    coach: "Defensive Coordinator",
    role: "coordinator",
    side: "defense",
    groups: ["All D"],
    duties: ["Game plan", "Hudl fronts/coverages/pressures", "Scout report QC"],
    notes: "Finalize scout cards by Sunday 9 PM",
  },
  {
    coach: "Coach Spencer",
    role: "coach",
    side: "defense",
    groups: ["DL"],
    duties: ["Position grades", "Hudl run tags", "DL install"],
    notes: "Practice 0–10 · Game 0–100 · Cougar Pride",
  },
  {
    coach: "Coach Haralson",
    role: "coach",
    side: "defense",
    groups: ["ILB"],
    duties: ["Position grades", "Personnel / strength tags", "ILB quizzes"],
    notes: "",
  },
  {
    coach: "Coach Bell",
    role: "coach",
    side: "defense",
    groups: ["OLB"],
    duties: ["Position grades", "Motion / perimeter tags"],
    notes: "",
  },
  {
    coach: "Offensive Coordinator",
    role: "coordinator",
    side: "offense",
    groups: ["All O"],
    duties: ["Install progression", "Playbook ownership", "Week script"],
    notes: "Keep Offense Teach library current",
  },
];

export const grades: GradeRow[] = [
  {
    player: "J. Martinez",
    group: "DL",
    week: 0,
    practice: 8,
    game: 0,
    pride: "B",
  },
  {
    player: "T. Brooks",
    group: "ILB",
    week: 0,
    practice: 9,
    game: 0,
    pride: "A",
  },
  {
    player: "A. Nguyen",
    group: "DB",
    week: 0,
    practice: 7,
    game: 0,
    pride: "B",
  },
];

export const members = [
  { name: "You (Admin)", role: "admin", status: "active" },
  { name: "DC", role: "coordinator", status: "active" },
  { name: "OC", role: "coordinator", status: "active" },
  { name: "Coach Spencer", role: "coach", status: "active" },
  { name: "J. Martinez", role: "player", status: "active" },
  { name: "Parent — Martinez", role: "parent", status: "active" },
];

export const gameGoals = [
  "Win.",
  "Score or set up a score in plus territory.",
  "Force or create 2+ turnovers.",
  "Win 3rd down (70% stop rate).",
  "Opponent scores 17 points or less.",
  "Less than 300 total yards.",
  "No 100-yard rusher. No explosives (25+ yards).",
  "At least one 3-and-out after sudden change.",
];

export const currentGame = games[0];
