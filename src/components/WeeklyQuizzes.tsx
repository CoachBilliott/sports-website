"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  emptyGameWeekAssets,
  lookupPositionScoutReport,
  useApp,
  type GameWeekAssets,
} from "@/context/AppState";
import {
  canEditContent,
  canEditPositionGroup,
  canOpenAthleteProfile,
  canTakeQuizzes,
  editablePositionGroupSet,
  isCoordinatorOrAdmin,
} from "@/lib/permissions";
import {
  compareByLastName,
  expandCoachGroupsWith,
  findDemoPlayerAthlete,
  migrateGroupAbbreviation,
  myRoomProfile,
  type Athlete,
} from "@/lib/mock";
import type { Game, Quiz, QuizQuestion, Role, Side } from "@/lib/types";
import {
  blankCoachQuestion,
  blankQuizShell,
  hasScoutContent,
  loadPlaybookLibrary,
  playbookRelevantToGroup,
  type WeeklyQuizGenerateResponse,
} from "@/lib/weeklyQuiz";

function athleteLastFirst(a: Athlete) {
  const last = a.lastName?.trim() || "";
  const first = a.firstName?.trim() || "";
  if (last && first) return `${last}, ${first}`;
  return a.name;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[var(--cc-blue)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--cc-blue)]">
      {children}
    </span>
  );
}

function unitScoutField(side: Side): keyof GameWeekAssets {
  if (side === "offense") return "offenseScout";
  if (side === "specialTeams") return "specialTeamsScout";
  return "defenseScout";
}

function groupsForSide(
  side: Side,
  offense: string[],
  defense: string[],
  specialTeams: string[],
): string[] {
  if (side === "offense") return offense;
  if (side === "specialTeams") return specialTeams;
  return defense;
}

function canEditQuiz(
  role: Role,
  quiz: Quiz,
  assignedGroups: Iterable<string>,
  archiveMode = false,
): boolean {
  if (!canEditContent(role, archiveMode)) return false;
  if (isCoordinatorOrAdmin(role)) return true;
  return quiz.assignedGroups.some((g) =>
    canEditPositionGroup(
      role,
      migrateGroupAbbreviation(g),
      assignedGroups,
      archiveMode,
    ),
  );
}

function canCreateForGroup(
  role: Role,
  group: string,
  assignedGroups: Iterable<string>,
  archiveMode = false,
): boolean {
  return canEditPositionGroup(
    role,
    migrateGroupAbbreviation(group),
    assignedGroups,
    archiveMode,
  );
}

const DEFAULT_QUESTION_COUNT = 8;
const MIN_QUESTION_COUNT = 3;
const MAX_QUESTION_COUNT = 15;

async function requestQuizGeneration(input: {
  side: Side;
  week: number;
  gameId?: string;
  opponent?: string;
  positionGroup: string;
  scoutNotes?: string;
  scoutFileName?: string | null;
  questionCount?: number;
}): Promise<WeeklyQuizGenerateResponse> {
  const library = loadPlaybookLibrary(input.side);
  // Real playbook library only — never seed stubs as quiz context
  const playbook =
    library.length > 0
      ? playbookRelevantToGroup(library, input.positionGroup)
      : [];

  const questionCount = Math.min(
    Math.max(input.questionCount ?? DEFAULT_QUESTION_COUNT, MIN_QUESTION_COUNT),
    MAX_QUESTION_COUNT,
  );

  const res = await fetch("/api/weekly-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      playbook,
      questionCount,
    }),
  });
  const payload = (await res.json()) as WeeklyQuizGenerateResponse & {
    error?: string;
  };
  if (res.status === 422 || payload.needsScoutContent) {
    return payload;
  }
  if (!res.ok) {
    throw new Error(payload.error || "Quiz generation failed");
  }
  return payload;
}

function QuizTakeModal({
  quiz,
  mode,
  onClose,
  onScored,
}: {
  quiz: Quiz;
  mode: "take" | "preview";
  onClose: () => void;
  onScored?: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const scorePct = useMemo(() => {
    if (quiz.questions.length === 0) return 0;
    let correct = 0;
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return Math.round((correct / quiz.questions.length) * 100);
  }, [answers, quiz.questions]);

  function submit() {
    setSubmitted(true);
    onScored?.(scorePct);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--cc-navy)]">
              {quiz.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--cc-steel)]">
              {mode === "preview" ? "Preview" : "Take quiz"} · Pass{" "}
              {quiz.passingScore}% · {quiz.questions.length} questions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        {quiz.questions.length === 0 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No questions yet — coach can add or generate some.
          </p>
        ) : (
          <div className="space-y-5">
            {quiz.questions.map((q, qi) => (
              <div
                key={q.id}
                className="rounded-xl border border-[var(--cc-line)] p-4"
              >
                <p className="font-semibold text-[var(--cc-navy)]">
                  {qi + 1}. {q.prompt || "(Untitled)"}
                </p>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    const showKey = submitted || mode === "preview";
                    const isCorrect = oi === q.correctIndex;
                    return (
                      <button
                        key={`${q.id}-${oi}`}
                        type="button"
                        disabled={submitted || mode === "preview"}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                        }
                        className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                          selected
                            ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/10 font-semibold"
                            : "border-[var(--cc-line)]"
                        } ${
                          showKey && isCorrect ? "ring-1 ring-emerald-600" : ""
                        } ${
                          showKey && selected && !isCorrect
                            ? "ring-1 ring-red-500"
                            : ""
                        }`}
                      >
                        {opt || `Option ${oi + 1}`}
                      </button>
                    );
                  })}
                </div>
                {(submitted || mode === "preview") && q.explanation ? (
                  <p className="mt-2 text-xs text-[var(--cc-steel)]">
                    {q.explanation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {mode === "take" && !submitted ? (
            <button
              type="button"
              onClick={submit}
              disabled={quiz.questions.length === 0}
              className="rounded-lg bg-[var(--cc-blue)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Submit
            </button>
          ) : null}
          {submitted ? (
            <p className="text-sm font-semibold text-[var(--cc-navy)]">
              Score {scorePct}% ·{" "}
              {scorePct >= quiz.passingScore ? "Pass" : "Needs retake"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function QuizEditorModal({
  quiz,
  unitGroups,
  editableGroups,
  onClose,
  onSave,
  onGenerate,
  generating,
  showGenerate = true,
}: {
  quiz: Quiz;
  unitGroups: string[];
  editableGroups: Set<string>;
  onClose: () => void;
  onSave: (quiz: Quiz) => void;
  onGenerate: () => void;
  generating: boolean;
  /** My Stuff only — unit pages hide AI regenerate */
  showGenerate?: boolean;
}) {
  const [draft, setDraft] = useState<Quiz>(() => ({
    ...quiz,
    assignedGroups: [...quiz.assignedGroups],
    questions: quiz.questions.map((q) => ({
      ...q,
      options: [...q.options],
    })),
  }));

  useEffect(() => {
    setDraft({
      ...quiz,
      assignedGroups: [...quiz.assignedGroups],
      questions: quiz.questions.map((q) => ({
        ...q,
        options: [...q.options],
      })),
    });
  }, [quiz]);

  function patchQuestion(questionId: string, patch: Partial<QuizQuestion>) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...patch } : q,
      ),
    }));
  }

  function setOption(questionId: string, index: number, value: string) {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => {
        if (q.id !== questionId) return q;
        const options = [...q.options];
        options[index] = value;
        return { ...q, options };
      }),
    }));
  }

  function toggleGroup(group: string) {
    setDraft((prev) => {
      const has = prev.assignedGroups.includes(group);
      if (has && prev.assignedGroups.length === 1) return prev;
      return {
        ...prev,
        assignedGroups: has
          ? prev.assignedGroups.filter((g) => g !== group)
          : [...prev.assignedGroups, group],
      };
    });
  }

  const groupChoices = unitGroups.filter(
    (g) => editableGroups.has(g) || draft.assignedGroups.includes(g),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-xl">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--cc-navy)]">
              Edit quiz
            </h3>
            <p className="mt-1 text-sm text-[var(--cc-steel)]">
              Drafted from this week&apos;s scouting report — edit freely or add
              your own.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {showGenerate ? (
              <button
                type="button"
                onClick={onGenerate}
                disabled={generating}
                className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
              >
                {generating ? "Generating…" : "Regenerate with AI"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Title</span>
            <input
              value={draft.title}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Due</span>
              <input
                value={draft.due}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, due: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Passing score %
              </span>
              <input
                type="number"
                min={50}
                max={100}
                value={draft.passingScore}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    passingScore: Number(e.target.value) || 80,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--cc-navy)]">
              Assigned groups
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {groupChoices.map((g) => {
                const on = draft.assignedGroups.includes(g);
                const locked = !editableGroups.has(g);
                return (
                  <button
                    key={g}
                    type="button"
                    disabled={locked}
                    onClick={() => toggleGroup(g)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                      on
                        ? "bg-[var(--cc-blue)] text-white"
                        : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                    } disabled:opacity-50`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--cc-navy)]">
              Questions ({draft.questions.length})
            </p>
            <button
              type="button"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  questions: [...prev.questions, blankCoachQuestion()],
                  generationSource: prev.generationSource ?? "coach",
                }))
              }
              className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold"
            >
              + Add question
            </button>
          </div>

          {draft.questions.map((q, qi) => (
            <div
              key={q.id}
              className="space-y-3 rounded-xl border border-[var(--cc-line)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--cc-navy)]">
                  Q{qi + 1}{" "}
                  <Chip>{q.source === "ai" ? "AI" : "Coach"}</Chip>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      questions: prev.questions.filter((x) => x.id !== q.id),
                    }))
                  }
                  className="text-sm font-semibold text-red-700"
                >
                  Remove
                </button>
              </div>
              <label className="block text-sm">
                <span className="font-semibold text-[var(--cc-steel)]">
                  Prompt
                </span>
                <textarea
                  value={q.prompt}
                  rows={2}
                  onChange={(e) =>
                    patchQuestion(q.id, {
                      prompt: e.target.value,
                      source: "coach",
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              </label>
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === oi}
                      onChange={() =>
                        patchQuestion(q.id, {
                          correctIndex: oi,
                          source: "coach",
                        })
                      }
                      title="Mark correct"
                    />
                    <input
                      value={opt}
                      onChange={(e) => setOption(q.id, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
              <label className="block text-sm">
                <span className="font-semibold text-[var(--cc-steel)]">
                  Explanation (optional)
                </span>
                <input
                  value={q.explanation ?? ""}
                  onChange={(e) =>
                    patchQuestion(q.id, {
                      explanation: e.target.value,
                      source: "coach",
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type QuizGradeRow = {
  key: string;
  athleteId: string;
  displayName: string;
  group: string;
  quizTitle: string | null;
  score: number | null;
  passed: boolean | null;
  notTaken: boolean;
};

function QuizGradeTable({
  rows,
  roster,
  role,
  openPlayerSettings,
}: {
  rows: QuizGradeRow[];
  roster: Athlete[];
  role: Role;
  openPlayerSettings: (athleteId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="text-[var(--cc-steel)]">
          <tr>
            <th className="px-0 py-2 pr-3 font-semibold">Player</th>
            <th className="px-3 py-2 font-semibold">Group</th>
            <th className="px-3 py-2 font-semibold">Quiz</th>
            <th className="px-3 py-2 font-semibold">Score</th>
            <th className="px-3 py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const athlete = roster.find((a) => a.id === row.athleteId);
            const canOpen = canOpenAthleteProfile(role, athlete);
            return (
              <tr
                key={row.key}
                className="border-t border-[var(--cc-line)]"
              >
                <td className="whitespace-nowrap py-2 pr-3 font-medium text-[var(--cc-navy)]">
                  {canOpen ? (
                    <button
                      type="button"
                      onClick={() => openPlayerSettings(row.athleteId)}
                      className="text-left font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
                    >
                      {row.displayName}
                    </button>
                  ) : (
                    row.displayName
                  )}
                </td>
                <td className="px-3 py-2 text-[var(--cc-steel)]">
                  {row.group}
                </td>
                <td className="px-3 py-2 text-[var(--cc-steel)]">
                  {row.quizTitle ?? "—"}
                </td>
                <td className="px-3 py-2 font-semibold text-[var(--cc-navy)]">
                  {row.score != null ? `${row.score}%` : "—"}
                </td>
                <td className="px-3 py-2 text-[var(--cc-steel)]">
                  {!row.quizTitle
                    ? "No quiz"
                    : row.notTaken
                      ? "Not taken"
                      : row.passed
                        ? "Pass"
                        : "Needs retake"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Per-week quiz list + generate/edit/take for a side. */
export function WeeklyQuizWeekPanel({
  game,
  myGroups,
  groupSet,
  compact,
  coachSheet,
  unitScores,
  mode = "my-stuff",
}: {
  game: Game;
  myGroups?: string[];
  groupSet: Set<string>;
  compact?: boolean;
  /** My Stuff: scout upload + generate + grades on one sheet */
  coachSheet?: boolean;
  /** Unit Weekly Quizzes: show scores for all athletes on this unit */
  unitScores?: boolean;
  /**
   * `unit` — Team Weekly Quizzes: scores + quiz list, no generate.
   * `my-stuff` — My Stuff coach sheet (default when coachSheet).
   */
  mode?: "my-stuff" | "unit";
}) {
  const {
    role,
    side,
    quizzes,
    upsertQuiz,
    updateQuiz,
    removeQuiz,
    gameWeekAssets,
    positionScoutReports,
    savePositionScoutReport,
    offenseGroupCodes,
    defenseGroupCodes,
    specialTeamsGroupCodes,
    quizAttempts,
    recordQuizAttempt,
    roster,
    openPlayerSettings,
    isArchiveMode,
  } = useApp();

  const unitGroups = groupsForSide(
    side,
    offenseGroupCodes,
    defenseGroupCodes,
    specialTeamsGroupCodes,
  );
  const editableGroups = editablePositionGroupSet(
    role,
    groupSet,
    unitGroups,
    isArchiveMode,
  );
  const isUnitMode = mode === "unit" || unitScores;
  /** Generate / blank / AI question count — My Stuff only */
  const showGenerate = Boolean(coachSheet) && !isUnitMode;

  const weekQuizzes = useMemo(() => {
    const list = quizzes.filter((q) => q.side === side && q.week === game.week);
    if (role === "player") {
      // Athletes only see quizzes for their own position groups — never other groups
      if (groupSet.size === 0) return [];
      return list.filter((q) =>
        q.assignedGroups.some((g) =>
          groupSet.has(migrateGroupAbbreviation(g)),
        ),
      );
    }
    if (!myGroups || myGroups.length === 0) return list;
    if (
      myGroups.includes("All D") ||
      myGroups.includes("All O") ||
      isCoordinatorOrAdmin(role)
    ) {
      return list;
    }
    return list.filter((q) =>
      q.assignedGroups.some((g) => groupSet.has(migrateGroupAbbreviation(g))),
    );
  }, [quizzes, side, game.week, myGroups, groupSet, role]);

  const defaultGroup =
    [...editableGroups][0] ??
    myGroups?.find((g) => !g.startsWith("All")) ??
    unitGroups[0] ??
    "DL";

  const [activeGroup, setActiveGroup] = useState(defaultGroup);
  /** Unit page: filter scores + quiz list by position group */
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [takeId, setTakeId] = useState<string | null>(null);
  const [takeMode, setTakeMode] = useState<"take" | "preview">("preview");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scoutNotes, setScoutNotes] = useState("");
  const [scoutFileName, setScoutFileName] = useState<string | null>(null);
  const [scoutSavedFlash, setScoutSavedFlash] = useState(false);
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);

  const filteredWeekQuizzes = useMemo(() => {
    if (!isUnitMode || positionFilter === "All") return weekQuizzes;
    return weekQuizzes.filter((q) =>
      q.assignedGroups.some(
        (g) => migrateGroupAbbreviation(g) === positionFilter,
      ),
    );
  }, [isUnitMode, positionFilter, weekQuizzes]);

  useEffect(() => {
    if (!editableGroups.has(activeGroup) && editableGroups.size > 0) {
      setActiveGroup([...editableGroups][0]!);
    }
  }, [editableGroups, activeGroup]);

  useEffect(() => {
    if (!coachSheet || !activeGroup) return;
    const existing = lookupPositionScoutReport(
      positionScoutReports,
      side,
      activeGroup,
      game.id,
    );
    setScoutNotes(existing?.notes ?? "");
    setScoutFileName(existing?.fileName ?? null);
    setScoutSavedFlash(false);
    // Load when week/group changes only — local textarea is source of truth while editing
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positionScoutReports
  }, [coachSheet, side, activeGroup, game.id]);

  const editingQuiz = editingId
    ? (quizzes.find((q) => q.id === editingId) ?? null)
    : null;
  const takeQuiz = takeId
    ? (quizzes.find((q) => q.id === takeId) ?? null)
    : null;

  const persistScout = useCallback(
    (notes: string, fileName: string | null) => {
      if (!activeGroup) return;
      savePositionScoutReport(
        side,
        activeGroup,
        { notes, fileName },
        game.id,
      );
    },
    [activeGroup, savePositionScoutReport, side, game.id],
  );

  const gatherContext = useCallback(
    (positionGroup: string, notesOverride?: string) => {
      const posScout = lookupPositionScoutReport(
        positionScoutReports,
        side,
        positionGroup,
        game.id,
      );
      const assets = gameWeekAssets[game.id] ?? emptyGameWeekAssets();
      const scoutFile = assets[unitScoutField(side)];
      const liveNotes =
        coachSheet && positionGroup === activeGroup
          ? (notesOverride ?? scoutNotes)
          : undefined;
      // Only coach-pasted/edited report text — never seed/generic copy
      const scoutNotesText =
        liveNotes !== undefined
          ? liveNotes.trim()
          : posScout?.notes?.trim() || "";
      const fileLabel =
        coachSheet && positionGroup === activeGroup
          ? scoutFileName
          : (scoutFile ?? posScout?.fileName ?? null);
      return {
        side,
        week: game.week,
        gameId: game.id,
        opponent: game.opponent,
        positionGroup,
        scoutNotes: scoutNotesText,
        scoutFileName: fileLabel ?? scoutFile ?? posScout?.fileName ?? null,
        hasNotes: hasScoutContent(scoutNotesText),
        hasFileOnly:
          !hasScoutContent(scoutNotesText) &&
          !!(fileLabel || scoutFile || posScout?.fileName),
      };
    },
    [
      side,
      positionScoutReports,
      gameWeekAssets,
      game,
      coachSheet,
      activeGroup,
      scoutNotes,
      scoutFileName,
    ],
  );

  const activeScout = useMemo(
    () => gatherContext(activeGroup),
    [gatherContext, activeGroup],
  );

  const quizGradeRows = useMemo(() => {
    if (!coachSheet && !unitScores) return [];

    const scopeGroups = unitScores
      ? positionFilter === "All"
        ? new Set(unitGroups)
        : new Set([positionFilter])
      : groupSet;

    const athletes = roster
      .filter(
        (a) =>
          (a.personnelType ?? "athlete") === "athlete" &&
          a.groups.some((g) => scopeGroups.has(migrateGroupAbbreviation(g))),
      )
      .sort(compareByLastName);

    const rows: QuizGradeRow[] = [];

    for (const a of athletes) {
      for (const raw of a.groups) {
        const group = migrateGroupAbbreviation(raw);
        if (!scopeGroups.has(group)) continue;
        const quiz = weekQuizzes.find((q) =>
          q.assignedGroups.some(
            (g) => migrateGroupAbbreviation(g) === group,
          ),
        );
        const attempt = quiz
          ? quizAttempts.find(
              (att) =>
                att.athleteId === a.id &&
                att.quizId === quiz.id &&
                att.completed,
            )
          : undefined;
        rows.push({
          key: `${a.id}-${group}`,
          athleteId: a.id,
          displayName: athleteLastFirst(a),
          group,
          quizTitle: quiz?.title ?? null,
          score: attempt?.score ?? null,
          passed:
            attempt && quiz ? attempt.score >= quiz.passingScore : null,
          notTaken: !!quiz && !attempt,
        });
      }
    }
    return rows;
  }, [
    coachSheet,
    unitScores,
    roster,
    groupSet,
    unitGroups,
    weekQuizzes,
    quizAttempts,
    positionFilter,
  ]);

  async function generateForGroup(positionGroup: string, existing?: Quiz) {
    if (!canCreateForGroup(role, positionGroup, groupSet, isArchiveMode)) {
      setError("You can only generate quizzes for your assigned groups.");
      return;
    }
    if (coachSheet && positionGroup === activeGroup) {
      persistScout(scoutNotes, scoutFileName);
    }
    const ctx = gatherContext(
      positionGroup,
      coachSheet && positionGroup === activeGroup ? scoutNotes : undefined,
    );
    if (!ctx.hasNotes) {
      const pasteHere = coachSheet
        ? `Paste or type the report in the scouting report section above for ${positionGroup}, then generate.`
        : `Paste or type the report in My Stuff → Weekly Scouting Report, then generate.`;
      setError(
        ctx.hasFileOnly
          ? `A scout file is attached (${ctx.scoutFileName}), but PDF/image text isn't extracted yet. ${pasteHere}`
          : `No scouting report text for ${positionGroup} vs ${game.opponent}. ${pasteHere} Blank quiz is still available.`,
      );
      setFlash(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = await requestQuizGeneration({
        ...ctx,
        questionCount,
      });
      if (payload.needsScoutContent || payload.questions.length === 0) {
        setError(
          payload.contextSummary ||
            "No scout content available — paste a report before generating.",
        );
        return;
      }
      if (existing) {
        updateQuiz(existing.id, {
          title: payload.title,
          questions: payload.questions,
          generatedAt: new Date().toISOString(),
          generationSource: payload.source,
          status: existing.status === "draft" ? "assigned" : existing.status,
          gameId: game.id,
        });
        setFlash(payload.contextSummary);
        setEditingId(existing.id);
      } else {
        const shell = blankQuizShell({
          side,
          week: game.week,
          gameId: game.id,
          opponent: game.opponent,
          positionGroup,
        });
        const quiz: Quiz = {
          ...shell,
          title: payload.title,
          questions: payload.questions,
          status: "assigned",
          generatedAt: new Date().toISOString(),
          generationSource: payload.source,
        };
        upsertQuiz(quiz);
        setFlash(payload.contextSummary);
        setEditingId(quiz.id);
      }
    } catch {
      setError("Could not generate quiz. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function createBlank() {
    if (!canCreateForGroup(role, activeGroup, groupSet, isArchiveMode)) {
      setError("You can only create quizzes for your assigned groups.");
      return;
    }
    const quiz = blankQuizShell({
      side,
      week: game.week,
      gameId: game.id,
      opponent: game.opponent,
      positionGroup: activeGroup,
    });
    upsertQuiz(quiz);
    setEditingId(quiz.id);
  }

  async function onAttachScoutFile(file: File | undefined) {
    if (!file) {
      setScoutFileName(null);
      return;
    }
    setScoutFileName(file.name);
    const isText =
      file.type.startsWith("text/") ||
      /\.(txt|md|csv|json)$/i.test(file.name);
    if (!isText) return;
    try {
      const text = await file.text();
      if (text.trim()) {
        setScoutNotes((prev) =>
          prev.trim() ? `${prev.trim()}\n\n${text.trim()}` : text.trim(),
        );
      }
    } catch {
      // Filename still kept; coach can paste manually
    }
  }

  function saveScoutReport() {
    if (!activeGroup) return;
    persistScout(scoutNotes, scoutFileName);
    setScoutSavedFlash(true);
    setFlash(null);
    setError(null);
  }

  const canStaffEdit = canEditContent(role, isArchiveMode);
  const groupChoices =
    editableGroups.size > 0 ? [...editableGroups] : unitGroups;

  return (
    <div className={coachSheet ? "space-y-8" : "space-y-3"}>
      {isUnitMode && canStaffEdit ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[var(--cc-navy)]">
            Position
          </span>
          {(["All", ...unitGroups] as string[]).map((g) => {
            const on = positionFilter === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setPositionFilter(g)}
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  on
                    ? "bg-[var(--cc-blue)] text-white"
                    : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      ) : null}

      {canStaffEdit && coachSheet && showGenerate ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-[var(--cc-navy)]">
              Scouting report
            </h3>
            <p className="mt-1 text-sm text-[var(--cc-steel)]">
              Paste or upload this week&apos;s report for {activeGroup}. Quizzes
              generate from these notes (synced with Weekly Scouting Report).
              .txt/.md/.csv attach as text; for PDFs, paste the content.
            </p>
          </div>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              Position group
            </span>
            <select
              value={activeGroup}
              onChange={(e) => setActiveGroup(e.target.value)}
              className="mt-1 block w-full max-w-xs rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
            >
              {groupChoices.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              Scout notes · {activeGroup} · Week {game.week}
            </span>
            <textarea
              value={scoutNotes}
              onChange={(e) => {
                setScoutNotes(e.target.value);
                setScoutSavedFlash(false);
              }}
              disabled={!activeGroup}
              rows={8}
              placeholder="Paste the scouting report: tendencies, formations, keys, fit rules, alerts…"
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 disabled:bg-[var(--cc-field)]"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--cc-navy)]">
              {scoutFileName ? "Replace file" : "Attach PDF / doc / txt"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md,.csv"
                className="hidden"
                onChange={(e) => {
                  void onAttachScoutFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={saveScoutReport}
              disabled={!activeGroup}
              className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Save report
            </button>
            {scoutFileName ? (
              <span className="text-sm text-[var(--cc-steel)]">
                Attached: {scoutFileName}
              </span>
            ) : (
              <span className="text-sm text-[var(--cc-steel)]">No file yet</span>
            )}
            {scoutSavedFlash ? (
              <span className="text-sm font-semibold text-emerald-700">
                Saved
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      {canStaffEdit && showGenerate ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-[var(--cc-navy)]">
              Weekly quiz
            </h3>
            <p className="mt-1 text-sm text-[var(--cc-steel)]">
              Generate from the scout notes above, or start blank and edit.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Questions
              </span>
              <input
                type="number"
                min={MIN_QUESTION_COUNT}
                max={MAX_QUESTION_COUNT}
                value={questionCount}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isNaN(n)) return;
                  setQuestionCount(
                    Math.min(
                      Math.max(Math.round(n), MIN_QUESTION_COUNT),
                      MAX_QUESTION_COUNT,
                    ),
                  );
                }}
                className="mt-1 block w-20 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={
                busy ||
                !canCreateForGroup(role, activeGroup, groupSet, isArchiveMode)
              }
              onClick={() => generateForGroup(activeGroup)}
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Generating…" : "Generate quiz"}
            </button>
            <button
              type="button"
              disabled={
                !canCreateForGroup(role, activeGroup, groupSet, isArchiveMode)
              }
              onClick={createBlank}
              className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Blank quiz
            </button>
            <p className="basis-full text-xs text-[var(--cc-steel)]">
              {activeScout.hasNotes
                ? `Scout report ready for ${activeGroup} vs ${game.opponent}.`
                : activeScout.hasFileOnly
                  ? `File attached (${activeScout.scoutFileName}) but no pasted text — paste the report above before generating.`
                  : `Paste scout notes above before generating, or start a blank quiz.`}
            </p>
          </div>
        </section>
      ) : null}

      {flash ? <p className="text-xs text-emerald-800">{flash}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      {filteredWeekQuizzes.length === 0 ? (
        <p className="text-sm text-[var(--cc-steel)]">
          {isUnitMode && positionFilter !== "All"
            ? `No quiz for ${positionFilter} · Week ${game.week} yet.`
            : `No quiz assigned for Week ${game.week} yet.`}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredWeekQuizzes.map((q) => {
            const editable = canEditQuiz(role, q, groupSet, isArchiveMode);
            const playerAthlete =
              role === "player" ? findDemoPlayerAthlete(roster) : undefined;
            const myAttempt =
              playerAthlete &&
              quizAttempts.find(
                (a) =>
                  a.athleteId === playerAthlete.id &&
                  a.quizId === q.id &&
                  a.completed,
              );
            return (
              <div
                key={q.id}
                className={
                  coachSheet
                    ? "flex flex-wrap items-center justify-between gap-3 border-t border-[var(--cc-line)] py-4 first:border-t-0 first:pt-0"
                    : "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cc-line)] p-4"
                }
              >
                <div>
                  <p className="font-semibold text-[var(--cc-navy)]">{q.title}</p>
                  <p className="mt-1 text-sm text-[var(--cc-steel)]">
                    Due {q.due} · Groups: {q.assignedGroups.join(", ")} · Pass{" "}
                    {q.passingScore}% · {q.questions.length} Qs
                    {q.generationSource
                      ? ` · ${
                          q.generationSource === "ai"
                            ? "AI"
                            : q.generationSource === "stub"
                              ? "AI stub"
                              : "Coach"
                        }`
                      : ""}
                    {myAttempt
                      ? ` · Your score ${myAttempt.score}%`
                      : role === "player"
                        ? " · Not taken"
                        : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip>{q.status}</Chip>
                  {editable ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingId(q.id)}
                        className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold"
                      >
                        Edit
                      </button>
                      {showGenerate ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            generateForGroup(
                              q.assignedGroups[0] ?? activeGroup,
                              q,
                            )
                          }
                          className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          Regenerate
                        </button>
                      ) : null}
                      {!compact ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm("Delete this quiz for the week?")
                            ) {
                              removeQuiz(q.id);
                            }
                          }}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
                        >
                          Delete
                        </button>
                      ) : null}
                    </>
                  ) : null}
                  {canTakeQuizzes(role) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTakeMode(
                          role === "player" && !isArchiveMode
                            ? "take"
                            : "preview",
                        );
                        setTakeId(q.id);
                      }}
                      className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
                    >
                      {role === "player"
                        ? isArchiveMode
                          ? "View quiz"
                          : myAttempt
                            ? "Retake quiz"
                            : "Take quiz"
                        : "Preview"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {coachSheet && canStaffEdit ? (
        <section className="space-y-3 border-t border-[var(--cc-line)] pt-6">
          <div>
            <h3 className="text-base font-bold text-[var(--cc-navy)]">
              Player quiz grades
            </h3>
            <p className="mt-1 text-sm text-[var(--cc-steel)]">
              Quiz scores for athletes in your assigned groups · Week{" "}
              {game.week}.
            </p>
          </div>
          {quizGradeRows.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No athletes in your assigned groups yet.
            </p>
          ) : (
            <QuizGradeTable
              rows={quizGradeRows}
              roster={roster}
              role={role}
              openPlayerSettings={openPlayerSettings}
            />
          )}
        </section>
      ) : null}

      {unitScores && canStaffEdit ? (
        <section
          className={
            filteredWeekQuizzes.length > 0 || isUnitMode
              ? "space-y-3 border-t border-[var(--cc-line)] pt-6"
              : "space-y-3"
          }
        >
          <div>
            <h3 className="text-base font-bold text-[var(--cc-navy)]">
              Unit quiz scores
            </h3>
            <p className="mt-1 text-sm text-[var(--cc-steel)]">
              Scores for{" "}
              {positionFilter === "All"
                ? "all athletes on this unit"
                : `${positionFilter} athletes`}{" "}
              · Week {game.week}.
            </p>
          </div>
          {quizGradeRows.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              {positionFilter === "All"
                ? "No athletes on this unit yet."
                : `No ${positionFilter} athletes on this unit yet.`}
            </p>
          ) : (
            <QuizGradeTable
              rows={quizGradeRows}
              roster={roster}
              role={role}
              openPlayerSettings={openPlayerSettings}
            />
          )}
        </section>
      ) : null}

      {editingQuiz ? (
        <QuizEditorModal
          quiz={editingQuiz}
          unitGroups={unitGroups}
          editableGroups={editableGroups}
          generating={busy}
          showGenerate={showGenerate}
          onClose={() => setEditingId(null)}
          onSave={(next) => {
            upsertQuiz({
              ...next,
              status: next.status === "draft" ? "assigned" : next.status,
            });
            setEditingId(null);
            setFlash("Quiz saved.");
          }}
          onGenerate={() =>
            generateForGroup(
              editingQuiz.assignedGroups[0] ?? activeGroup,
              editingQuiz,
            )
          }
        />
      ) : null}

      {takeQuiz ? (
        <QuizTakeModal
          quiz={takeQuiz}
          mode={takeMode}
          onClose={() => setTakeId(null)}
          onScored={(score) => {
            if (role !== "player" || isArchiveMode) return;
            const athlete = findDemoPlayerAthlete(roster);
            if (!athlete) return;
            recordQuizAttempt({
              athleteId: athlete.id,
              quizId: takeQuiz.id,
              score,
            });
            updateQuiz(takeQuiz.id, {
              score,
              status:
                score >= takeQuiz.passingScore ? "completed" : "assigned",
            });
          }}
        />
      ) : null}
    </div>
  );
}

/** Assigned groups for the current role on the active unit (for quiz permissions). */
export function useQuizEditorGroupSet(): Set<string> {
  const {
    role,
    side,
    coachAssignments,
    offenseGroupCodes,
    defenseGroupCodes,
    specialTeamsGroupCodes,
    roster,
  } = useApp();

  return useMemo(() => {
    if (role === "player") {
      const athlete = findDemoPlayerAthlete(roster);
      if (!athlete) return new Set();
      return new Set(athlete.groups.map(migrateGroupAbbreviation));
    }
    const profile = myRoomProfile(role, side, coachAssignments);
    if (profile) {
      const expanded = expandCoachGroupsWith(
        profile.groups,
        side,
        offenseGroupCodes,
        defenseGroupCodes,
      );
      return new Set(expanded.map(migrateGroupAbbreviation));
    }
    if (isCoordinatorOrAdmin(role)) {
      return new Set(
        groupsForSide(
          side,
          offenseGroupCodes,
          defenseGroupCodes,
          specialTeamsGroupCodes,
        ),
      );
    }
    return new Set();
  }, [
    role,
    side,
    coachAssignments,
    offenseGroupCodes,
    defenseGroupCodes,
    specialTeamsGroupCodes,
    roster,
  ]);
}
