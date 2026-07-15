import type { QuizQuestion, Side } from "./types";

export type PlaybookSnippet = {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  coaching: string;
};

export type WeeklyQuizGenerateRequest = {
  side: Side;
  week: number;
  gameId?: string;
  opponent?: string;
  positionGroup: string;
  scoutNotes?: string;
  scoutFileName?: string | null;
  playbook?: PlaybookSnippet[];
  questionCount?: number;
};

export type WeeklyQuizGenerateResponse = {
  title: string;
  questions: QuizQuestion[];
  source: "ai" | "stub";
  contextSummary: string;
  /** True when generation was blocked because no scout report text exists. */
  needsScoutContent?: boolean;
};

/** Minimum pasted/uploaded scout text before AI/stub generation can run. */
export const MIN_SCOUT_CHARS = 40;

export function hasScoutContent(notes?: string | null): boolean {
  return (notes?.replace(/\s+/g, " ").trim().length ?? 0) >= MIN_SCOUT_CHARS;
}

/**
 * @deprecated Seed copy is no longer used for quiz generation.
 * Kept only so older imports do not break; prefer coach-pasted scout notes.
 */
export function seedScoutNotes(
  side: Side,
  positionGroup: string,
  opponent: string,
): string {
  const g = positionGroup.toUpperCase();
  if (side === "defense") {
    if (g === "DL") {
      return `${opponent} prefers shotgun stretch and duo. DL keys: stay square on stretch, spill pullers on duo, hands inside on down blocks. Watch chip from TE to free the edge.`;
    }
    if (g === "LB" || g === "ILB" || g === "OLB") {
      return `${opponent} will stretch the front and insert the H-back. LB fit: force outside-in on stretch, scrape to the puller on power, stay over the top vs RPO tags.`;
    }
    if (g === "DB") {
      return `${opponent} attacks the perimeter with speed sweeps and glance routes off play-action. DB keys: leverage outside, disrupt the first window, communicate coverage checks vs empty.`;
    }
    return `${opponent} scout: expect multiple formations into the boundary, early down run, and play-action on 2nd-and-medium.`;
  }
  if (side === "offense") {
    if (g === "OL") {
      return `Install focus vs ${opponent}: tight zone and mid zone. Combo to the second level, climb with square shoulders, communicate twists.`;
    }
    if (g === "QB") {
      return `Install vs ${opponent}: check tight zone to the bubble when edge leverage is soft. Know protection tags vs blitz and hot throws.`;
    }
    if (g === "RB") {
      return `RB rules vs ${opponent}: press the landmark on zone, cut off the first wrong color, finish north-south. Pass pro: chip then check.`;
    }
    if (g === "WR" || g === "TE") {
      return `Skill install vs ${opponent}: stem verticals, stem-out on glances, block the force on perimeter run. Know the alert tags.`;
    }
    return `Offense install vs ${opponent}: base run game first, then RPO tags and protection adjustments.`;
  }
  return `Special teams vs ${opponent}: win leverage on coverage, protect the edge on returns, communicate hold calls.`;
}

/** Default playbook excerpts by position when the library is empty. */
export function seedPlaybookSnippets(
  side: Side,
  positionGroup: string,
): PlaybookSnippet[] {
  const g = positionGroup.toUpperCase();
  if (side === "defense") {
    if (g === "DL") {
      return [
        {
          title: "Tite Front Base",
          category: "Front",
          subcategory: "Alignment",
          description: "3-tech and shade alignments with 2i support.",
          coaching: "Hands first, eyes second. Control the near shoulder.",
        },
        {
          title: "Spill Technique",
          category: "Run Fit",
          subcategory: "Pullers",
          description: "Wrong-arm pullers and force the ball bounce.",
          coaching: "Attack the puller’s outside shoulder, then flatten.",
        },
      ];
    }
    if (g === "LB" || g === "ILB" || g === "OLB") {
      return [
        {
          title: "Force & Spill Fits",
          category: "Run Fit",
          subcategory: "LB",
          description: "Outside force sets the edge; inside LB fills the alley.",
          coaching: "See the blockers, feel the back, fit off the DL spill.",
        },
        {
          title: "Coverage Drop Rules",
          category: "Coverage",
          subcategory: "Hook/Curl",
          description: "Drop to landmarks; expand with #2’s stem.",
          coaching: "Eyes on QB after the first step — break on throw.",
        },
      ];
    }
    return [
      {
        title: "Cover Check Communication",
        category: "Coverage",
        subcategory: "DB",
        description: "Match coverage checks vs trips and empty.",
        coaching: "Call strength early; leverage #1 outside until the ball moves.",
      },
    ];
  }
  if (side === "offense") {
    if (g === "OL") {
      return [
        {
          title: "3/2 Tight Zone",
          category: "Run",
          subcategory: "3/2 Tight Zone",
          description: "Combo to LB, vertical displacement.",
          coaching: "First step same foot/same shoulder; climb on contact.",
        },
      ];
    }
    if (g === "QB") {
      return [
        {
          title: "Zone Read Alert",
          category: "RPO",
          subcategory: "Alert",
          description: "Read the end man on the LOS for give/pull.",
          coaching: "Mesh timing — ride, decide, accelerate.",
        },
      ];
    }
    return [
      {
        title: "Base Install Concepts",
        category: "Install",
        subcategory: "Week 1",
        description: "Core run and pass concepts for the openers.",
        coaching: "Know your landmark, alignment, and assignment.",
      },
    ];
  }
  return [
    {
      title: "Coverage Fundamentals",
      category: "Special Teams",
      subcategory: "Kickoff",
      description: "Lane integrity and leverage to the ball.",
      coaching: "Stay in your lane until the return declares.",
    },
  ];
}

const POSITION_KEYWORDS: Record<string, string[]> = {
  DL: ["dl", "defensive line", "end", "nose", "tackle", "rush", "spill", "front"],
  LB: ["lb", "linebacker", "mike", "will", "sam", "fit", "scrape", "hook"],
  ILB: ["lb", "linebacker", "mike", "inside"],
  OLB: ["lb", "linebacker", "will", "sam", "edge"],
  DB: ["db", "corner", "safety", "coverage", "leverage", "match"],
  OL: ["ol", "offensive line", "combo", "zone", "protection", "guard", "tackle"],
  QB: ["qb", "quarterback", "read", "protection", "mesh", "alert"],
  RB: ["rb", "running back", "press", "cut", "pass pro"],
  TE: ["te", "tight end", "y", "seam", "block"],
  WR: ["wr", "receiver", "route", "stem", "release"],
  K: ["kick", "punt", "coverage", "return"],
  DS: ["snap", "long snap", "punt"],
};

export function playbookRelevantToGroup(
  items: PlaybookSnippet[],
  positionGroup: string,
): PlaybookSnippet[] {
  const keys = POSITION_KEYWORDS[positionGroup.toUpperCase()] ?? [
    positionGroup.toLowerCase(),
  ];
  const scored = items.map((item) => {
    const blob =
      `${item.title} ${item.category} ${item.subcategory} ${item.description} ${item.coaching}`.toLowerCase();
    const hits = keys.reduce((n, k) => (blob.includes(k) ? n + 1 : n), 0);
    return { item, hits };
  });
  const matched = scored.filter((s) => s.hits > 0).map((s) => s.item);
  return matched.length > 0 ? matched.slice(0, 8) : items.slice(0, 5);
}

/** Client helper: load playbook library from localStorage. */
export function loadPlaybookLibrary(side: Side): PlaybookSnippet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`team-os-playbook-library-${side}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      title?: string;
      category?: string;
      subcategory?: string;
      description?: string;
      coaching?: string;
    }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => ({
      title: p.title ?? "Untitled",
      category: p.category ?? "",
      subcategory: p.subcategory ?? "",
      description: p.description ?? "",
      coaching: p.coaching ?? "",
    }));
  } catch {
    return [];
  }
}

function newQuestionId() {
  return `qq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function truncate(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Split scout text into usable coaching beats (sentences / bullets / lines). */
export function scoutBeats(text: string): string[] {
  const chunks = text
    .split(/\n+|•|\u2022|(?<=[.!?])\s+|(?<=;)\s+/)
    .map((s) => s.replace(/^[-*\d.)\s]+/, "").replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 18);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of chunks) {
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

/** Prefer beats that look like keys, tendencies, schemes, or fit rules. */
function prioritizeScoutBeats(beats: string[]): string[] {
  const weight = (b: string) => {
    const t = b.toLowerCase();
    let score = 0;
    if (/\b(key|keys|tendency|tendencies|prefer|prefers|expect|watch|alert|fit|fits|scheme|coverage|blitz|formation|personnel|rpo|protection)\b/.test(t)) {
      score += 3;
    }
    if (/\b(vs\.?|versus|against|when|if|must|should|do not|don't)\b/.test(t)) {
      score += 1;
    }
    if (b.length > 40 && b.length < 160) score += 1;
    return score;
  };
  return [...beats].sort((a, b) => weight(b) - weight(a));
}

function distractorsForBeat(beat: string, opponent: string, group: string): string[] {
  const lower = beat.toLowerCase();
  const pool = [
    `${opponent} never runs or throws — ignore formation strength`,
    `${group} should freestyle without communicating the call`,
    "Ignore scout notes and play base every snap",
    `Chase the ball from the backside first vs ${opponent}`,
    "Align opposite your landmark and wait for the whistle",
    "Change the call mid-snap without telling anyone",
  ];
  if (/\brun\b/.test(lower)) {
    pool.unshift(`${opponent} abandons the run entirely on early downs`);
  }
  if (/\bpass|route|coverage|throw\b/.test(lower)) {
    pool.unshift("Never communicate coverage checks or route alerts");
  }
  if (/\bblitz|pressure|protection\b/.test(lower)) {
    pool.unshift("Skip protection tags and hot throws this week");
  }
  const unique: string[] = [];
  for (const d of pool) {
    if (d.toLowerCase() === beat.toLowerCase()) continue;
    if (unique.some((u) => u.toLowerCase() === d.toLowerCase())) continue;
    unique.push(d);
    if (unique.length >= 3) break;
  }
  while (unique.length < 3) {
    unique.push(`Generic option ${unique.length + 1} — not from scout`);
  }
  return unique.slice(0, 3);
}

export function emptyScoutQuizResponse(
  req: WeeklyQuizGenerateRequest,
): WeeklyQuizGenerateResponse {
  const opponent = req.opponent?.trim() || "this week's opponent";
  const unitLabel =
    req.side === "defense"
      ? "Defense"
      : req.side === "offense"
        ? "Offense"
        : "Special Teams";
  const fileBit = req.scoutFileName
    ? ` A file name is attached (${req.scoutFileName}), but PDF/image text is not extracted — paste the report into Weekly Scouting Report notes.`
    : "";
  return {
    title: `Week ${req.week} ${unitLabel} — ${req.positionGroup} · ${opponent}`,
    questions: [],
    source: "stub",
    needsScoutContent: true,
    contextSummary: `No scout report text for ${req.positionGroup} vs ${opponent}.${fileBit} Paste or type the scouting report in My Stuff → Weekly Scouting Report, then generate again.`,
  };
}

/** Deterministic stub quiz from real scout text (+ optional playbook). No generic trivia. */
export function buildStubWeeklyQuiz(
  req: WeeklyQuizGenerateRequest,
): WeeklyQuizGenerateResponse {
  const opponent = req.opponent?.trim() || "this week's opponent";
  const group = req.positionGroup;
  const scout = req.scoutNotes?.trim() ?? "";

  if (!hasScoutContent(scout)) {
    return emptyScoutQuizResponse(req);
  }

  const playbook =
    req.playbook && req.playbook.length > 0
      ? playbookRelevantToGroup(req.playbook, group)
      : [];
  const count = Math.min(Math.max(req.questionCount ?? 8, 3), 15);

  const questions: QuizQuestion[] = [];
  const beats = prioritizeScoutBeats(scoutBeats(scout));

  for (const beat of beats) {
    if (questions.length >= count) break;
    const correct = truncate(beat, 90);
    const wrong = distractorsForBeat(beat, opponent, group);
    questions.push({
      id: newQuestionId(),
      prompt: `According to this week's ${group} scouting report vs ${opponent}, which is correct?`,
      options: [correct, ...wrong],
      correctIndex: 0,
      source: "ai",
      explanation: "Pulled from this week's scouting report.",
    });
  }

  // Secondary: real playbook library only (never seed stubs)
  for (const pb of playbook) {
    if (questions.length >= count) break;
    const detail =
      pb.coaching.trim() ||
      pb.description.trim() ||
      `${pb.title} assignment for ${group}`;
    if (detail.length < 12) continue;
    questions.push({
      id: newQuestionId(),
      prompt: `Playbook — ${pb.title}${pb.subcategory ? ` (${pb.subcategory})` : ""}: what is the key teaching point?`,
      options: [
        truncate(detail, 90),
        "Wait for the whistle before moving",
        "Change the call without communicating",
        "Align wherever you want pre-snap",
      ],
      correctIndex: 0,
      source: "ai",
      explanation: pb.description || undefined,
    });
  }

  // If scout was short, still only ask what we can derive — do not invent trivia
  if (questions.length === 0) {
    const hook = truncate(scout, 90);
    questions.push({
      id: newQuestionId(),
      prompt: `From the ${group} scout vs ${opponent}, which statement matches the report?`,
      options: [
        hook,
        ...distractorsForBeat(scout, opponent, group),
      ],
      correctIndex: 0,
      source: "ai",
      explanation: "Pulled from this week's scouting report.",
    });
  }

  const unitLabel =
    req.side === "defense"
      ? "Defense"
      : req.side === "offense"
        ? "Offense"
        : "Special Teams";
  const fileBit = req.scoutFileName ? ` File: ${req.scoutFileName}.` : "";
  const pbBit =
    playbook.length > 0
      ? ` Playbook cues: ${playbook.map((p) => p.title).slice(0, 3).join(", ")}.`
      : "";

  return {
    title: `Week ${req.week} ${unitLabel} — ${group} · ${opponent}`,
    questions: questions.slice(0, count),
    source: "stub",
    contextSummary: `Built from ${group} scout report vs ${opponent}.${fileBit}${pbBit}`,
  };
}

export function blankCoachQuestion(): QuizQuestion {
  return {
    id: newQuestionId(),
    prompt: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    source: "coach",
  };
}

export function blankQuizShell(input: {
  side: Side;
  week: number;
  gameId?: string;
  opponent?: string;
  positionGroup: string;
}): import("./types").Quiz {
  const unitLabel =
    input.side === "defense"
      ? "Defense"
      : input.side === "offense"
        ? "Offense"
        : "Special Teams";
  const opponent = input.opponent?.trim() || "Opponent";
  return {
    id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Week ${input.week} ${unitLabel} — ${input.positionGroup} · ${opponent}`,
    side: input.side,
    week: input.week,
    gameId: input.gameId,
    due: "Before practice",
    assignedGroups: [input.positionGroup],
    status: "draft",
    passingScore: 80,
    questions: [blankCoachQuestion()],
    generatedAt: null,
    generationSource: "coach",
  };
}
