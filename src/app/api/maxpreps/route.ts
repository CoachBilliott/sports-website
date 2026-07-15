import {
  CY_CREEK_MAXPREPS,
  parseMaxPrepsScheduleHtml,
  seedPayloadForYear,
  type MaxPrepsSeasonPayload,
} from "@/lib/maxpreps";

export const dynamic = "force-dynamic";

function scheduleUrlForYear(year: number): string {
  if (year <= 2024) return CY_CREEK_MAXPREPS.scheduleUrl2024;
  if (year === 2025) return CY_CREEK_MAXPREPS.scheduleUrl2025;
  return CY_CREEK_MAXPREPS.scheduleUrl2026;
}

async function fetchMaxPrepsHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TeamOS/1.0; +https://localhost) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      // Avoid Next caching fragile scrape results as static
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.length < 500) return null;
    return text;
  } catch {
    return null;
  }
}

function parseRecordFromHtml(html: string): {
  wins: number;
  losses: number;
} | null {
  const m =
    /Overall\s*(\d+)\s*[-–]\s*(\d+)/i.exec(html) ||
    /Overall[^0-9]*(\d+)\s*[-–]\s*(\d+)/i.exec(html);
  if (!m) return null;
  return { wins: Number(m[1]), losses: Number(m[2]) };
}

/**
 * GET /api/maxpreps?year=2024|2025|2026
 * Best-effort MaxPreps schedule/results scrape with seeded fallback.
 * - 2026 → current/upcoming season
 * - 2025 → 25-26 (archive schedule seed)
 * - 2024 (and below) → 24-25 (prior-year reference when browsing 2025 archive)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = Number(searchParams.get("year") ?? "2026");
  const year = Number.isFinite(yearParam) ? yearParam : 2026;
  const url = scheduleUrlForYear(year);

  const html = await fetchMaxPrepsHtml(url);
  if (html) {
    const games = parseMaxPrepsScheduleHtml(html, year);
    if (games.length > 0) {
      const record = parseRecordFromHtml(html) ?? {
        wins: games.filter((g) => g.result?.outcome === "W").length,
        losses: games.filter((g) => g.result?.outcome === "L").length,
      };
      const payload: MaxPrepsSeasonPayload = {
        seasonYear: year,
        team: "Cypress Creek Cougars",
        sourceUrl: url,
        record,
        fetchedAt: new Date().toISOString(),
        fromSeed: false,
        games,
      };
      return Response.json(payload);
    }
  }

  const seed = seedPayloadForYear(year);
  return Response.json({
    ...seed,
    sourceUrl: url,
    fetchedAt: new Date().toISOString(),
    fromSeed: true,
  } satisfies MaxPrepsSeasonPayload);
}
