/**
 * MaxPreps schedule / results helpers for Cypress Creek football.
 * Live fetch is best-effort (HTML scrape).
 * Seeded archives: 2025 schedule uses 25-26 MaxPreps; prior-year MaxPreps
 * reference data (2024 / 24-25) is available via sync during archive browse.
 */

import type { Game } from "@/lib/types";

const MAXPREPS_TX = "https://www.maxpreps.com/tx";
const DCTF = "https://www.texasfootball.com/team";

export const CY_CREEK_MAXPREPS = {
  teamPath: "houston/cypress-creek-cougars/football",
  teamUrl: "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/",
  scheduleUrl2024:
    "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/24-25/schedule/",
  scheduleUrl2025:
    "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/25-26/schedule/",
  scheduleUrl2026:
    "https://www.maxpreps.com/tx/houston/cypress-creek-cougars/football/schedule/",
} as const;

/**
 * MaxPreps API year for a viewing season.
 * Live 2026 → current MaxPreps; 2025 archive MaxPreps section → 2024 (24-25).
 */
export function maxPrepsYearForViewingSeason(
  viewingSeasonYear: number,
  currentSeasonYear: number,
): number {
  if (viewingSeasonYear < currentSeasonYear) {
    return viewingSeasonYear - 1;
  }
  return viewingSeasonYear;
}

export type MaxPrepsGameResult = {
  outcome: "W" | "L" | "T";
  ourScore: number;
  oppScore: number;
  /** e.g. "W 47-13" */
  label: string;
};

export type MaxPrepsScheduleRow = {
  /** Match key for merging into app Game rows */
  opponentKey?: string;
  opponent: string;
  date: string;
  time: string;
  homeAway: "Home" | "Away";
  venue?: string;
  district?: boolean;
  result?: MaxPrepsGameResult | null;
};

export type MaxPrepsSeasonPayload = {
  seasonYear: number;
  team: string;
  sourceUrl: string;
  record: { wins: number; losses: number; ties?: number };
  districtRecord?: { wins: number; losses: number; place?: string };
  fetchedAt: string;
  /** true when HTML scrape failed / blocked and seed was used */
  fromSeed: boolean;
  games: MaxPrepsScheduleRow[];
};

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
  logo: "/cypress-creek-logo.png",
  dctfUrl: `${DCTF}/cypress-creek-cougars`,
  ...maxPrepsLinks("houston", "cypress-creek-cougars"),
};

export function formatGameResult(r: {
  outcome?: "W" | "L" | "T" | null;
  ourScore?: number | null;
  oppScore?: number | null;
  label?: string | null;
}): string | undefined {
  if (r.label?.trim()) return r.label.trim();
  if (
    r.outcome &&
    typeof r.ourScore === "number" &&
    typeof r.oppScore === "number"
  ) {
    return `${r.outcome} ${r.ourScore}-${r.oppScore}`;
  }
  return undefined;
}

export function parseResultLabel(
  label: string | null | undefined,
): MaxPrepsGameResult | null {
  if (!label) return null;
  const m = /^\s*([WLT])\s+(\d+)\s*[-–]\s*(\d+)\s*$/i.exec(label.trim());
  if (!m) return null;
  const outcome = m[1]!.toUpperCase() as "W" | "L" | "T";
  return {
    outcome,
    ourScore: Number(m[2]),
    oppScore: Number(m[3]),
    label: `${outcome} ${m[2]}-${m[3]}`,
  };
}

/** Normalize opponent names for fuzzy matching MaxPreps ↔ app schedule. */
export function normalizeOpponentName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(high|school|hs|vs|at|the)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function opponentsLikelyMatch(a: string, b: string): boolean {
  const na = normalizeOpponentName(a);
  const nb = normalizeOpponentName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // Cypress Park ↔ Cy Park, Cypress Woods ↔ Cy Woods, etc.
  const compact = (s: string) =>
    s.replace(/\bcypress\b/g, "cy").replace(/\s+/g, " ").trim();
  const ca = compact(na);
  const cb = compact(nb);
  return ca === cb || ca.includes(cb) || cb.includes(ca);
}

/**
 * Public MaxPreps 2024 (24-25) Cy Creek schedule — Overall 2-8, District 2-5 (7th).
 * Source: maxpreps.com …/24-25/schedule/ (retrieved Jul 2026).
 * Shown as prior-year MaxPreps reference when browsing the 2025 archive.
 */
export const SEEDED_2024_MAXPREPS: MaxPrepsSeasonPayload = {
  seasonYear: 2024,
  team: "Cypress Creek Cougars",
  sourceUrl: CY_CREEK_MAXPREPS.scheduleUrl2024,
  record: { wins: 2, losses: 8 },
  districtRecord: { wins: 2, losses: 5, place: "7th" },
  fetchedAt: "2024-11-14T19:04:00.000Z",
  fromSeed: true,
  games: [
    {
      opponentKey: "jordan",
      opponent: "Jordan",
      date: "Thu, Aug 29",
      time: "6:30 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      result: { outcome: "L", ourScore: 20, oppScore: 66, label: "L 20-66" },
    },
    {
      opponentKey: "tomball-memorial",
      opponent: "Tomball Memorial",
      date: "Thu, Sep 5",
      time: "7:00 PM",
      homeAway: "Away",
      venue: "Tomball Memorial",
      result: { outcome: "L", ourScore: 27, oppScore: 52, label: "L 27-52" },
    },
    {
      opponentKey: "cy-woods",
      opponent: "Cypress Woods",
      date: "Fri, Sep 13",
      time: "7:00 PM",
      homeAway: "Away",
      venue: "Cypress Woods",
      result: { outcome: "L", ourScore: 7, oppScore: 59, label: "L 7-59" },
    },
    {
      opponentKey: "stratford",
      opponent: "Stratford",
      date: "Fri, Sep 27",
      time: "7:00 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      district: true,
      result: { outcome: "L", ourScore: 48, oppScore: 83, label: "L 48-83" },
    },
    {
      opponentKey: "cy-falls",
      opponent: "Cypress Falls",
      date: "Sat, Oct 5",
      time: "6:00 PM",
      homeAway: "Away",
      venue: "Cypress Falls",
      district: true,
      result: { outcome: "L", ourScore: 0, oppScore: 52, label: "L 0-52" },
    },
    {
      opponentKey: "cy-ridge",
      opponent: "Cypress Ridge",
      date: "Fri, Oct 11",
      time: "7:00 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      district: true,
      result: { outcome: "L", ourScore: 17, oppScore: 31, label: "L 17-31" },
    },
    {
      opponentKey: "memorial",
      opponent: "Memorial",
      date: "Sat, Oct 19",
      time: "6:00 PM",
      homeAway: "Away",
      venue: "Memorial",
      district: true,
      result: { outcome: "L", ourScore: 7, oppScore: 30, label: "L 7-30" },
    },
    {
      opponentKey: "cy-fair",
      opponent: "Cy-Fair",
      date: "Fri, Oct 25",
      time: "7:00 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      district: true,
      result: { outcome: "L", ourScore: 0, oppScore: 38, label: "L 0-38" },
    },
    {
      opponentKey: "northbrook",
      opponent: "Northbrook",
      date: "Thu, Oct 31",
      time: "6:30 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      district: true,
      result: { outcome: "W", ourScore: 41, oppScore: 16, label: "W 41-16" },
    },
    {
      opponentKey: "jersey-village",
      opponent: "Jersey Village",
      date: "Sat, Nov 9",
      time: "1:00 PM",
      homeAway: "Away",
      venue: "Jersey Village",
      district: true,
      result: { outcome: "W", ourScore: 50, oppScore: 24, label: "W 50-24" },
    },
  ],
};

/**
 * Public MaxPreps 2025 (25-26) Cy Creek schedule — Overall 3-7, District 3-4 (5th).
 * Source: maxpreps.com …/25-26/schedule/ (retrieved Jul 2026).
 * Used to build the 2025 archive *schedule* (not the MaxPreps prior-year panel).
 */
export const SEEDED_2025_MAXPREPS: MaxPrepsSeasonPayload = {
  seasonYear: 2025,
  team: "Cypress Creek Cougars",
  sourceUrl: CY_CREEK_MAXPREPS.scheduleUrl2025,
  record: { wins: 3, losses: 7 },
  districtRecord: { wins: 3, losses: 4, place: "5th" },
  fetchedAt: "2025-12-15T12:00:00.000Z",
  fromSeed: true,
  games: [
    {
      opponentKey: "jordan",
      opponent: "Jordan",
      date: "Fri, Aug 29",
      time: "7:00 PM",
      homeAway: "Away",
      venue: "Jordan",
      result: { outcome: "L", ourScore: 0, oppScore: 41, label: "L 0-41" },
    },
    {
      opponentKey: "tomball-memorial",
      opponent: "Tomball Memorial",
      date: "Sat, Sep 6",
      time: "6:00 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      result: { outcome: "L", ourScore: 10, oppScore: 40, label: "L 10-40" },
    },
    {
      opponentKey: "cy-woods",
      opponent: "Cypress Woods",
      date: "Fri, Sep 12",
      time: "7:00 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      result: { outcome: "L", ourScore: 10, oppScore: 42, label: "L 10-42" },
    },
    {
      opponentKey: "stratford",
      opponent: "Stratford",
      date: "Thu, Sep 25",
      time: "6:30 PM",
      homeAway: "Away",
      venue: "Stratford",
      district: true,
      result: { outcome: "L", ourScore: 17, oppScore: 42, label: "L 17-42" },
    },
    {
      opponentKey: "cy-falls",
      opponent: "Cypress Falls",
      date: "Fri, Oct 3",
      time: "7:00 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      district: true,
      result: { outcome: "L", ourScore: 17, oppScore: 56, label: "L 17-56" },
    },
    {
      opponentKey: "cy-ridge",
      opponent: "Cypress Ridge",
      date: "Fri, Oct 10",
      time: "7:00 PM",
      homeAway: "Away",
      venue: "Pridgeon Stadium",
      district: true,
      result: { outcome: "W", ourScore: 47, oppScore: 13, label: "W 47-13" },
    },
    {
      opponentKey: "memorial",
      opponent: "Memorial",
      date: "Thu, Oct 16",
      time: "6:30 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      district: true,
      result: { outcome: "L", ourScore: 21, oppScore: 49, label: "L 21-49" },
    },
    {
      opponentKey: "cy-fair",
      opponent: "Cy-Fair",
      date: "Thu, Oct 23",
      time: "6:30 PM",
      homeAway: "Away",
      venue: "Pridgeon Stadium",
      district: true,
      result: { outcome: "L", ourScore: 32, oppScore: 52, label: "L 32-52" },
    },
    {
      opponentKey: "northbrook",
      opponent: "Northbrook",
      date: "Thu, Oct 30",
      time: "6:30 PM",
      homeAway: "Away",
      venue: "Northbrook",
      district: true,
      result: { outcome: "W", ourScore: 40, oppScore: 3, label: "W 40-3" },
    },
    {
      opponentKey: "jersey-village",
      opponent: "Jersey Village",
      date: "Fri, Nov 7",
      time: "7:00 PM",
      homeAway: "Home",
      venue: "Cy Creek",
      district: true,
      result: { outcome: "W", ourScore: 27, oppScore: 20, label: "W 27-20" },
    },
  ],
};

/** Opponent MaxPreps/DCTF metadata for 2025 archive rows. */
const OPPONENT_LOOKUP_2025: Record<
  string,
  ReturnType<typeof opponentMeta>
> = {
  jordan: opponentMeta("jordan", "jordan-warriors", "fulshear", "jordan-warriors"),
  "tomball-memorial": opponentMeta(
    "tomball-memorial",
    "tomball-memorial-wildcats",
    "tomball",
    "tomball-memorial-wildcats",
  ),
  "cy-woods": opponentMeta(
    "cy-woods",
    "cypress-woods-wildcats",
    "cypress",
    "cypress-woods-wildcats",
  ),
  stratford: opponentMeta(
    "stratford",
    "stratford-spartans",
    "houston",
    "stratford-spartans",
  ),
  "cy-falls": opponentMeta(
    "cy-falls",
    "cypress-falls-eagles",
    "houston",
    "cypress-falls-golden-eagles",
  ),
  "cy-ridge": opponentMeta(
    "cy-ridge",
    "cypress-ridge-rams",
    "houston",
    "cypress-ridge-rams",
  ),
  memorial: opponentMeta(
    "memorial",
    "memorial-mustangs",
    "houston",
    "memorial-mustangs",
  ),
  "cy-fair": opponentMeta("cy-fair", "cy-fair-bobcats", "cypress", "cy-fair-bobcats"),
  northbrook: opponentMeta(
    "northbrook",
    "northbrook-raiders",
    "houston",
    "northbrook-raiders",
  ),
  "jersey-village": opponentMeta(
    "jersey-village",
    "jersey-village-falcons",
    "houston",
    "jersey-village-falcons",
  ),
};

/** Full 2025 season Game[] for the archive schedule (MaxPreps-backed). */
export function buildGames2025FromMaxPreps(): Game[] {
  const preseason: Game[] = [
    {
      id: "camp-2a",
      week: 0,
      kind: "two-a-days",
      opponent: "2-a-Days",
      date: "Fri, Aug 8",
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
      date: "Sat, Aug 16",
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
      date: "Sat, Aug 23",
      time: "TBD",
      homeAway: "Away",
      venue: "TBD",
      ...cyCreekMeta,
    },
  ];

  const regular: Game[] = SEEDED_2025_MAXPREPS.games.map((row, i) => {
    const key = row.opponentKey ?? `w${i + 1}`;
    const meta = OPPONENT_LOOKUP_2025[key] ?? {
      opponentKey: key,
      logo: `/logos/opponents/${key}.png`,
      dctfUrl: `${DCTF}/${key}`,
      ...maxPrepsLinks("houston", key),
    };
    const result = row.result;
    return {
      id: `w${i + 1}`,
      week: i + 1,
      kind: "regular" as const,
      opponent: row.opponent,
      date: row.date,
      time: row.time,
      homeAway: row.homeAway,
      venue: row.venue ?? (row.homeAway === "Home" ? "Cy Creek" : row.opponent),
      result: result?.label,
      ourScore: result?.ourScore ?? null,
      oppScore: result?.oppScore ?? null,
      resultSource: "maxpreps" as const,
      ...meta,
    };
  });

  const playoffs: Game[] = [1, 2, 3, 4, 5, 6].map((n) => ({
    id: `po-${n}`,
    week: 10 + n,
    kind: "playoff" as const,
    optional: true,
    opponent:
      n === 1
        ? "Bi-District · TBD"
        : n === 2
          ? "Area · TBD"
          : n === 3
            ? "Regional · TBD"
            : n === 4
              ? "Quarterfinal · TBD"
              : n === 5
                ? "Semifinal · TBD"
                : "State · TBD",
    date: "TBD",
    time: "TBD",
    homeAway: "Home" as const,
    venue: "TBD",
    ...cyCreekMeta,
  }));

  return [...preseason, ...regular, ...playoffs];
}

export function computeRecordFromGames(games: Game[]): {
  wins: number;
  losses: number;
  ties: number;
} {
  let wins = 0;
  let losses = 0;
  let ties = 0;
  for (const g of games) {
    if (g.kind === "two-a-days" || g.kind === "scrimmage") continue;
    const parsed = parseResultLabel(g.result);
    if (!parsed) continue;
    if (parsed.outcome === "W") wins += 1;
    else if (parsed.outcome === "L") losses += 1;
    else ties += 1;
  }
  return { wins, losses, ties };
}

/**
 * Merge MaxPreps rows onto existing schedule games by opponent name.
 * Only updates result fields (and optionally date/time when missing result).
 * Manual results (`resultSource === "manual"`) are preserved unless `force`.
 */
export function applyMaxPrepsResultsToGames(
  schedule: Game[],
  rows: MaxPrepsScheduleRow[],
  opts?: { force?: boolean },
): { games: Game[]; updatedIds: string[] } {
  const updatedIds: string[] = [];
  const games = schedule.map((g) => {
    if (g.kind === "two-a-days" || g.kind === "scrimmage") return g;
    if (!opts?.force && g.resultSource === "manual" && g.result) return g;

    const row = rows.find((r) => opponentsLikelyMatch(r.opponent, g.opponent));
    if (!row?.result) return g;

    const label = row.result.label;
    if (
      g.result === label &&
      g.ourScore === row.result.ourScore &&
      g.oppScore === row.result.oppScore
    ) {
      return g;
    }

    updatedIds.push(g.id);
    return {
      ...g,
      result: label,
      ourScore: row.result.ourScore,
      oppScore: row.result.oppScore,
      resultSource: "maxpreps" as const,
      date: row.date || g.date,
      time: row.time || g.time,
      homeAway: row.homeAway || g.homeAway,
    };
  });
  return { games, updatedIds };
}

/** Best-effort parse of MaxPreps schedule HTML tables. */
export function parseMaxPrepsScheduleHtml(
  html: string,
  seasonYear: number,
): MaxPrepsScheduleRow[] {
  const rows: MaxPrepsScheduleRow[] = [];
  // Strip tags coarsely into text blocks around table rows
  const trBlocks = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  for (const tr of trBlocks) {
    const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
      (m) =>
        m[1]!
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
    );
    if (cells.length < 2) continue;
    const dateTime = cells[0] ?? "";
    const opponentRaw = cells[1] ?? "";
    if (!opponentRaw || /opponent/i.test(opponentRaw)) continue;
    if (!/\d/.test(dateTime) && !/[a-z]/i.test(dateTime)) continue;

    const homeAway: "Home" | "Away" = /@/.test(opponentRaw) ? "Away" : "Home";
    const opponent = opponentRaw
      .replace(/^@\s*/, "")
      .replace(/^vs\s*/i, "")
      .replace(/\*+/g, "")
      .trim();
    if (!opponent || opponent.length < 2) continue;

    const resultCell = cells.find((c) => /^[WLT]\s+\d+/i.test(c));
    let result: MaxPrepsGameResult | null = null;
    if (resultCell) {
      // MaxPreps shows opponent score first sometimes ("L 41-0" = we lost 0-41)
      // Public table for Cy Creek: "L 41-0" means opp 41, us 0 when Away @Jordan.
      const parsed = /^\s*([WLT])\s+(\d+)\s*[-–]\s*(\d+)/i.exec(resultCell);
      if (parsed) {
        const outcome = parsed[1]!.toUpperCase() as "W" | "L" | "T";
        const a = Number(parsed[2]);
        const b = Number(parsed[3]);
        // Convention on MaxPreps box: first number is winner's score when W/L prefixed...
        // Observed: "L 41-0" at Jordan → we scored 0, they 41.
        // "W 47-13" → we 47, they 13.
        const ourScore = outcome === "W" ? Math.max(a, b) : Math.min(a, b);
        const oppScore = outcome === "W" ? Math.min(a, b) : Math.max(a, b);
        // Prefer direct: if outcome W, first is ours when first > second typically
        const our = outcome === "L" ? b : a;
        const opp = outcome === "L" ? a : b;
        void ourScore;
        void oppScore;
        result = {
          outcome,
          ourScore: our,
          oppScore: opp,
          label: `${outcome} ${our}-${opp}`,
        };
      }
    }

    const dateMatch = dateTime.match(/(\d{1,2})\/(\d{1,2})/);
    const timeMatch = dateTime.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    let date = dateTime;
    let time = "TBD";
    if (dateMatch) {
      const month = Number(dateMatch[1]);
      const day = Number(dateMatch[2]);
      const d = new Date(seasonYear, month - 1, day);
      date = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
    if (timeMatch) {
      let hour = Number(timeMatch[1]);
      const minute = timeMatch[2];
      const ap = (timeMatch[3] ?? "pm").toLowerCase();
      if (ap === "pm" && hour < 12) hour += 12;
      if (ap === "am" && hour === 12) hour = 0;
      const h12 = hour % 12 || 12;
      const suffix = hour >= 12 ? "PM" : "AM";
      time = `${h12}:${minute} ${suffix}`;
    }

    rows.push({
      opponent,
      date,
      time,
      homeAway,
      district: /\*/.test(opponentRaw),
      result,
    });
  }
  return rows;
}

export function seedPayloadForYear(year: number): MaxPrepsSeasonPayload {
  if (year <= 2024) {
    return {
      ...SEEDED_2024_MAXPREPS,
      fetchedAt: new Date().toISOString(),
      fromSeed: true,
    };
  }
  if (year === 2025) {
    return {
      ...SEEDED_2025_MAXPREPS,
      fetchedAt: new Date().toISOString(),
      fromSeed: true,
    };
  }
  // 2026+ — empty results until games are played / scraped
  return {
    seasonYear: year,
    team: "Cypress Creek Cougars",
    sourceUrl: CY_CREEK_MAXPREPS.scheduleUrl2026,
    record: { wins: 0, losses: 0 },
    districtRecord: { wins: 0, losses: 0 },
    fetchedAt: new Date().toISOString(),
    fromSeed: true,
    games: [],
  };
}
