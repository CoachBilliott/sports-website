"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";

export default function StudyPage() {
  const { snap, activeProgram, activeUnitId, activeWeek, upsertQuiz } =
    useApp();
  const scout = useMemo(
    () =>
      snap.team.weekNotes.filter(
        (n) =>
          n.programId === activeProgram.id &&
          n.unitId === activeUnitId &&
          n.week === activeWeek &&
          n.kind === "scout",
      ),
    [snap.team.weekNotes, activeProgram.id, activeUnitId, activeWeek],
  );
  const install =
    snap.team.install[`${activeProgram.id}:${activeUnitId}`] ?? "";
  const plays = snap.team.playbook.filter(
    (p) => p.programId === activeProgram.id && p.unitId === activeUnitId,
  );

  return (
    <div className="space-y-4">
      <Panel title={`Week ${activeWeek} study pack`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Auto-builds from Scout + Install + Playbook for the active unit.
        </p>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[var(--cc-line)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              Scout
            </p>
            {scout.length ? (
              scout.map((s) => (
                <div key={s.id} className="mt-2">
                  <p className="font-semibold text-[var(--cc-navy)]">{s.title}</p>
                  <p className="text-sm text-[var(--cc-steel)]">{s.body}</p>
                </div>
              ))
            ) : (
              <p className="mt-1 text-sm text-[var(--cc-steel)]">No scout notes.</p>
            )}
          </div>
          <div className="rounded-xl border border-[var(--cc-line)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              Install
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--cc-navy)]">
              {install || "No install package."}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--cc-line)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--cc-steel)]">
              Playbook ({plays.length})
            </p>
            <ul className="mt-1 list-disc pl-5 text-sm text-[var(--cc-steel)]">
              {plays.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <strong className="text-[var(--cc-navy)]">{p.title}</strong> —{" "}
                  {p.body}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => {
              const prompts = [
                ...scout.map((s) => ({
                  prompt: `From scout "${s.title}": key takeaway?`,
                  answer: s.body.slice(0, 80),
                })),
                ...plays.slice(0, 2).map((p) => ({
                  prompt: `Coaching points for ${p.title}?`,
                  answer: p.body.slice(0, 80),
                })),
              ];
              if (!prompts.length) {
                alert("Add scout notes or plays first.");
                return;
              }
              upsertQuiz({
                programId: activeProgram.id,
                unitId: activeUnitId,
                week: activeWeek,
                title: `Week ${activeWeek} study quiz`,
                questions: prompts.slice(0, 5),
                scores: [],
              });
            }}
          >
            Generate quiz from study pack
          </PrimaryButton>
          <Link
            href="/app/team/quizzes"
            className="rounded-lg border border-[var(--cc-line)] px-4 py-2 text-sm font-semibold"
          >
            Open quizzes
          </Link>
        </div>
      </Panel>
    </div>
  );
}
