import {
  buildStubWeeklyQuiz,
  emptyScoutQuizResponse,
  hasScoutContent,
  type WeeklyQuizGenerateRequest,
  type WeeklyQuizGenerateResponse,
} from "@/lib/weeklyQuiz";
import type { QuizQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

function newQuestionId() {
  return `qq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseBody(raw: unknown): WeeklyQuizGenerateRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const side = b.side;
  if (side !== "offense" && side !== "defense" && side !== "specialTeams") {
    return null;
  }
  const positionGroup =
    typeof b.positionGroup === "string" ? b.positionGroup.trim() : "";
  if (!positionGroup) return null;
  const week = Number(b.week);
  if (!Number.isFinite(week)) return null;

  const playbook = Array.isArray(b.playbook)
    ? b.playbook
        .filter((p): p is Record<string, unknown> => !!p && typeof p === "object")
        .map((p) => ({
          title: String(p.title ?? "Untitled"),
          category: String(p.category ?? ""),
          subcategory: String(p.subcategory ?? ""),
          description: String(p.description ?? ""),
          coaching: String(p.coaching ?? ""),
        }))
    : undefined;

  return {
    side,
    week,
    gameId: typeof b.gameId === "string" ? b.gameId : undefined,
    opponent: typeof b.opponent === "string" ? b.opponent : undefined,
    positionGroup,
    scoutNotes: typeof b.scoutNotes === "string" ? b.scoutNotes : undefined,
    scoutFileName:
      typeof b.scoutFileName === "string"
        ? b.scoutFileName
        : b.scoutFileName === null
          ? null
          : undefined,
    playbook,
    questionCount:
      typeof b.questionCount === "number" ? b.questionCount : undefined,
  };
}

async function generateWithAi(
  req: WeeklyQuizGenerateRequest,
): Promise<WeeklyQuizGenerateResponse | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const scout = req.scoutNotes?.trim() ?? "";
  if (!hasScoutContent(scout)) return null;

  const playbookText = (req.playbook ?? [])
    .slice(0, 8)
    .map(
      (p, i) =>
        `${i + 1}. ${p.title} [${p.category}/${p.subcategory}]: ${p.description} Coaching: ${p.coaching}`,
    )
    .join("\n");

  const count = Math.min(Math.max(req.questionCount ?? 8, 3), 15);
  const opponent = req.opponent || "the opponent";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_QUIZ_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              'You write high-school football weekly quizzes for one position group. Reply with JSON only: {"title": string, "questions": [{"prompt": string, "options": string[4], "correctIndex": number, "explanation"?: string}]}. correctIndex is 0-based. PRIMARY source is the coach scouting report — every question must test a fact, tendency, key, scheme, fit, or alert from that report. Playbook excerpts are secondary only. Do NOT invent generic football trivia, Cover 3 definitions, or schemes not mentioned in the scout. If the scout is short, write fewer questions rather than padding with unrelated content.',
          },
          {
            role: "user",
            content: `Week ${req.week} · Side: ${req.side} · Group: ${req.positionGroup} · Opponent: ${opponent}
Question count: up to ${count} (fewer is OK if scout is thin)

PRIMARY — Coach scouting report (required):
${scout}

Scout file name (metadata only, may have no extracted text): ${req.scoutFileName || "none"}

SECONDARY — Playbook excerpts (optional; only use if they reinforce scout install):
${playbookText || "(none)"}`,
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
    const parsed = JSON.parse(match[0]) as {
      title?: string;
      questions?: Array<{
        prompt?: string;
        options?: string[];
        correctIndex?: number;
        explanation?: string;
      }>;
    };
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return null;
    }

    const questions: QuizQuestion[] = parsed.questions
      .slice(0, count)
      .map((q) => {
        const options = Array.isArray(q.options)
          ? q.options.map((o) => String(o)).filter(Boolean).slice(0, 4)
          : [];
        while (options.length < 2) options.push("Option");
        const correctIndex = Math.min(
          Math.max(Number(q.correctIndex) || 0, 0),
          options.length - 1,
        );
        return {
          id: newQuestionId(),
          prompt: String(q.prompt ?? "").trim() || "Untitled question",
          options,
          correctIndex,
          source: "ai" as const,
          explanation: q.explanation ? String(q.explanation) : undefined,
        };
      });

    if (questions.length === 0) return null;

    return {
      title:
        parsed.title?.trim() ||
        `Week ${req.week} ${req.positionGroup} · ${opponent}`,
      questions,
      source: "ai",
      contextSummary: `AI quiz for ${req.positionGroup} vs ${opponent} grounded in this week's scouting report.`,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = parseBody(raw);
  if (!body) {
    return Response.json(
      { error: "side, week, and positionGroup are required" },
      { status: 400 },
    );
  }

  if (!hasScoutContent(body.scoutNotes)) {
    return Response.json(emptyScoutQuizResponse(body), { status: 422 });
  }

  const ai = await generateWithAi(body);
  const payload = ai ?? buildStubWeeklyQuiz(body);
  return Response.json(payload);
}
