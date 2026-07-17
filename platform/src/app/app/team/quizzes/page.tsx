"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function QuizzesPage() {
  const {
    snap,
    activeProgram,
    activeUnitId,
    activeWeek,
    activeAthletes,
    upsertQuiz,
    setQuizScore,
  } = useApp();

  const quizzes = useMemo(
    () =>
      snap.team.quizzes.filter(
        (q) =>
          q.programId === activeProgram.id &&
          q.unitId === activeUnitId &&
          q.week === activeWeek,
      ),
    [snap.team.quizzes, activeProgram.id, activeUnitId, activeWeek],
  );

  const [title, setTitle] = useState("");
  const [q1, setQ1] = useState("");
  const [a1, setA1] = useState("");

  return (
    <div className="space-y-4">
      <Panel title={`Week ${activeWeek} quizzes`}>
        {quizzes.map((q) => (
          <div
            key={q.id}
            className="mb-4 rounded-xl border border-[var(--cc-line)] p-3"
          >
            <p className="font-semibold text-[var(--cc-navy)]">{q.title}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--cc-steel)]">
              {q.questions.map((item, i) => (
                <li key={i}>
                  {item.prompt}{" "}
                  <span className="text-[var(--cc-navy)]">
                    ({item.answer})
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[var(--cc-steel)]">
                    <th className="py-1">Athlete</th>
                    <th className="py-1">Score %</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAthletes.slice(0, 10).map((a) => {
                    const score =
                      q.scores.find((s) => s.athleteId === a.id)?.score ?? "";
                    return (
                      <tr key={a.id} className="border-t border-[var(--cc-line)]/60">
                        <td className="py-1.5">
                          #{a.jersey} {a.name}
                        </td>
                        <td className="py-1.5">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={score}
                            onChange={(e) =>
                              setQuizScore(
                                q.id,
                                a.id,
                                Number(e.target.value) || 0,
                              )
                            }
                            className="w-20 rounded-md border border-[var(--cc-line)] px-2 py-1"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {!quizzes.length ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No quiz for this week — create one from scout.
          </p>
        ) : null}
      </Panel>

      <Panel title="Create quiz">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !q1.trim()) return;
            upsertQuiz({
              programId: activeProgram.id,
              unitId: activeUnitId,
              week: activeWeek,
              title: title.trim(),
              questions: [{ prompt: q1.trim(), answer: a1.trim() || "—" }],
              scores: [],
            });
            setTitle("");
            setQ1("");
            setA1("");
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            required
          />
          <input
            value={q1}
            onChange={(e) => setQ1(e.target.value)}
            placeholder="Question"
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            required
          />
          <input
            value={a1}
            onChange={(e) => setA1(e.target.value)}
            placeholder="Answer"
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
          />
          <PrimaryButton type="submit">Create</PrimaryButton>
        </form>
        <p className="mt-2 text-xs text-[var(--cc-steel)]">
          Tip: pull questions from Scout notes for the same week.
        </p>
        {quizzes[0] ? <Badge tone="brand">Active: {quizzes[0].title}</Badge> : null}
      </Panel>
    </div>
  );
}
