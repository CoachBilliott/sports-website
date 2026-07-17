/**
 * Seed helpers for the head-coach team workspace.
 */

import type {
  Athlete,
  DepthSlot,
  PlaybookEntry,
  PlayerGrade,
  QuizItem,
  ResourceItem,
  StaffDuty,
  TeamWorkspace,
  WeekNote,
} from "./types";

const OFFENSE_POS = ["QB", "RB", "WR", "TE", "OL"];
const DEFENSE_POS = ["DL", "LB", "DB"];
const ST_POS = ["K/P", "KR", "PR"];

function unitForPos(pos: string): string {
  if (ST_POS.includes(pos) || pos.includes("K") || pos.includes("P"))
    return "specialTeams";
  if (DEFENSE_POS.includes(pos)) return "defense";
  return "offense";
}

export function buildTeamWorkspace(
  footballId: string,
  volleyballId: string,
  athletes: Athlete[],
): TeamWorkspace {
  const fbAthletes = athletes.filter((a) => a.programId === footballId);
  const vbAthletes = athletes.filter((a) => a.programId === volleyballId);

  const depthSlots: DepthSlot[] = [];
  for (const level of ["Varsity", "JV"]) {
    const byPos = new Map<string, Athlete[]>();
    for (const a of fbAthletes.filter((x) => x.level === level)) {
      const list = byPos.get(a.pos) ?? [];
      list.push(a);
      byPos.set(a.pos, list);
    }
    for (const [pos, list] of byPos) {
      list.forEach((a, i) => {
        depthSlots.push({
          id: `depth-${footballId}-${level}-${pos}-${i}`,
          programId: footballId,
          unitId: unitForPos(pos),
          level,
          position: pos,
          depth: i + 1,
          athleteId: a.id,
        });
      });
    }
    // Ensure empty starter slots for common offense positions
    for (const pos of OFFENSE_POS) {
      if (![...byPos.keys()].includes(pos)) {
        depthSlots.push({
          id: `depth-${footballId}-${level}-${pos}-empty`,
          programId: footballId,
          unitId: "offense",
          level,
          position: pos,
          depth: 1,
          athleteId: null,
        });
      }
    }
  }

  // Volleyball simple depth by position
  const vbByPos = new Map<string, Athlete[]>();
  for (const a of vbAthletes) {
    const list = vbByPos.get(a.pos) ?? [];
    list.push(a);
    vbByPos.set(a.pos, list);
  }
  for (const [pos, list] of vbByPos) {
    list.forEach((a, i) => {
      depthSlots.push({
        id: `depth-${volleyballId}-${pos}-${i}`,
        programId: volleyballId,
        unitId: "team",
        level: a.level,
        position: pos,
        depth: i + 1,
        athleteId: a.id,
      });
    });
  }

  const weekNotes: WeekNote[] = [
    {
      id: "wn-scout-3-off",
      programId: footballId,
      unitId: "offense",
      week: 3,
      kind: "scout",
      title: "Cy Falls — defensive fronts",
      body: "Odd front look early downs. Expect pressure from boundary end. Work RPO away from pressure.",
    },
    {
      id: "wn-scout-3-def",
      programId: footballId,
      unitId: "defense",
      week: 3,
      kind: "scout",
      title: "Cy Falls — offensive tendencies",
      body: "Heavy 11 personnel. Boot right on 3rd & medium. Slot fade is their money ball.",
    },
    {
      id: "wn-prac-mon",
      programId: footballId,
      unitId: "offense",
      week: 3,
      kind: "practice",
      day: "Mon",
      title: "Install / walkthrough",
      body: "Tempo period 15 min. Red zone install. No live tackling.",
    },
    {
      id: "wn-prac-wed",
      programId: footballId,
      unitId: "offense",
      week: 3,
      kind: "practice",
      day: "Wed",
      title: "Team period",
      body: "Script vs odd front. 7-on-7 inside. Specialists after team.",
    },
    {
      id: "wn-call-3",
      programId: footballId,
      unitId: "offense",
      week: 3,
      kind: "callSheet",
      title: "Week 3 call sheet",
      body: "Open: Jet sweep · Mid: RPO glance · Close: Boot right · Red: Fade / Smash",
    },
    {
      id: "wn-stats-2",
      programId: footballId,
      unitId: "offense",
      week: 2,
      kind: "stats",
      title: "Week 2 offense totals",
      body: "Rush 142 · Pass 185 · 3rd down 6/12 · Red zone 3/4 TD",
    },
  ];

  const playbook: PlaybookEntry[] = [
    {
      id: "pb-1",
      programId: footballId,
      unitId: "offense",
      title: "Jet Sweep",
      category: "Run",
      body: "Motion across · handoff to jet · OL zone opposite · QB fake boot.",
    },
    {
      id: "pb-2",
      programId: footballId,
      unitId: "offense",
      title: "RPO Glance",
      category: "RPO",
      body: "Read end · pull if scrape · glance to #2 · check mesh.",
    },
    {
      id: "pb-3",
      programId: footballId,
      unitId: "defense",
      title: "Odd Front Base",
      category: "Front",
      body: "0 / 3 / 5 tech · MIKE to strength · soft edge opposite.",
    },
    {
      id: "pb-vb-1",
      programId: volleyballId,
      unitId: "team",
      title: "5-1 Rotation",
      category: "System",
      body: "Setter always right back · OH opposite · middle front.",
    },
  ];

  const quizzes: QuizItem[] = [
    {
      id: "qz-1",
      programId: footballId,
      unitId: "offense",
      week: 3,
      title: "Week 3 scout quiz",
      questions: [
        { prompt: "What front do they prefer early downs?", answer: "Odd front" },
        { prompt: "Where does pressure usually come from?", answer: "Boundary end" },
        { prompt: "Their money ball on 3rd?", answer: "Slot fade" },
      ],
      scores: fbAthletes.slice(0, 5).map((a, i) => ({
        athleteId: a.id,
        score: 67 + i * 7,
      })),
    },
  ];

  const grades: PlayerGrade[] = fbAthletes.slice(0, 8).map((a, i) => ({
    id: `gr-${a.id}-2`,
    programId: footballId,
    athleteId: a.id,
    week: 2,
    practice: 7 + (i % 3),
    game: 70 + i * 3,
    pride: ["A", "B", "A", "B+", "A-"][i % 5]!,
    notes: i % 2 === 0 ? "Physical finish" : "",
  }));

  const attendance = [
    {
      id: "att-today",
      programId: footballId,
      date: new Date().toISOString().slice(0, 10),
      records: fbAthletes.map((a, i) => ({
        athleteId: a.id,
        status: (i === 3 ? "late" : i === 7 ? "absent" : "present") as
          | "present"
          | "absent"
          | "late"
          | "excused",
      })),
    },
  ];

  const resources: ResourceItem[] = [
    {
      id: "res-1",
      programId: footballId,
      unitId: "offense",
      name: "Install packet — Week 3.pdf",
      category: "Install",
      note: "Uploaded by HC",
    },
    {
      id: "res-2",
      programId: footballId,
      unitId: "defense",
      name: "Cy Falls cutups.link",
      category: "Scout",
      note: "Hudl playlist",
    },
    {
      id: "res-3",
      programId: footballId,
      unitId: "offense",
      name: "Parent travel memo.docx",
      category: "Ops",
      note: "Share via announcements",
    },
  ];

  const duties: StaffDuty[] = [
    {
      id: "duty-1",
      programId: footballId,
      title: "Field setup — Friday",
      assigneeName: "Maria Santos",
      status: "open",
    },
    {
      id: "duty-2",
      programId: footballId,
      title: "Film upload after practice",
      assigneeName: "Chris Nguyen",
      status: "done",
    },
    {
      id: "duty-3",
      programId: footballId,
      title: "Visiting locker room check",
      assigneeName: "Coach Billiott",
      status: "open",
    },
  ];

  return {
    activeWeekByProgram: {
      [footballId]: 3,
      [volleyballId]: 1,
    },
    activeUnitByProgram: {
      [footballId]: "offense",
      [volleyballId]: "team",
    },
    depthSlots,
    weekNotes,
    playbook,
    quizzes,
    grades,
    attendance,
    resources,
    duties,
    philosophy: {
      [`${footballId}:offense`]:
        "Physical at the point of attack. Tempo with purpose. Finish every play.",
      [`${footballId}:defense`]:
        "Gap integrity first. Communicate. Swarm to the ball.",
      [`${volleyballId}:team`]:
        "Serve aggressively. Dig everything. Trust the next touch.",
    },
    install: {
      [`${footballId}:offense`]:
        "Week 3: Jet · RPO Glance · Boot Right · Smash · Fade",
      [`${footballId}:defense`]:
        "Week 3: Odd base · Soft edge · Cover 3 buzz · Goal-line stack",
      [`${volleyballId}:team`]: "Week 1: Serve receive patterns · Middle slide",
    },
  };
}
