import {
  COACH_MOTIVATIONS,
  motivationForDate,
  todayDateKey,
  type DailyMotivationPayload,
} from "@/lib/coachMotivation";

export const dynamic = "force-dynamic";

const dayCache = new Map<string, DailyMotivationPayload>();

async function pickWithAi(
  dateKey: string,
  context: string,
): Promise<DailyMotivationPayload | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const catalog = COACH_MOTIVATIONS.map(
    (q, i) => `${i}. "${q.quote}" — ${q.author}`,
  ).join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MOTIVATION_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You pick ONE football coach motivational quote for a high school team. Reply with JSON only: {\"index\": number} using an index from the provided list. Never invent quotes or authors.",
          },
          {
            role: "user",
            content: `Date: ${dateKey}\nContext: ${context || "general practice week"}\n\nQuotes:\n${catalog}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { index?: number };
    const idx = Number(parsed.index);
    if (!Number.isFinite(idx) || idx < 0 || idx >= COACH_MOTIVATIONS.length) {
      return null;
    }
    const picked = COACH_MOTIVATIONS[idx]!;
    return { ...picked, date: dateKey, source: "ai" };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dateKey = url.searchParams.get("date") || todayDateKey();
  const context = url.searchParams.get("context") || "";

  const cached = dayCache.get(`${dateKey}|${context}`);
  if (cached) {
    return Response.json(cached);
  }

  const ai = await pickWithAi(dateKey, context);
  const payload: DailyMotivationPayload =
    ai ??
    ({
      ...motivationForDate(dateKey),
      date: dateKey,
      source: "calendar",
    } satisfies DailyMotivationPayload);

  dayCache.set(`${dateKey}|${context}`, payload);
  return Response.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
