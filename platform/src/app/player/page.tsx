"use client";

import Link from "next/link";
import { AppProvider, useApp } from "@/components/app/AppProvider";
import { Badge, Panel } from "@/components/ui";

function PlayerPortal() {
  const { snap, activeProgram, signIn } = useApp();
  const player = snap.members.find((m) => m.role === "player");
  const isPlayer = snap.session?.role === "player";
  const me =
    snap.athletes.find(
      (a) =>
        a.programId === activeProgram.id &&
        player &&
        a.name === player.name,
    ) ?? snap.athletes.find((a) => a.programId === activeProgram.id);
  const quiz = snap.team.quizzes.find(
    (q) => q.programId === activeProgram.id,
  );
  const myScore = me
    ? quiz?.scores.find((s) => s.athleteId === me.id)?.score
    : null;
  const att = snap.team.attendance.find(
    (a) => a.programId === activeProgram.id,
  );
  const myAtt = me
    ? att?.records.find((r) => r.athleteId === me.id)?.status
    : null;
  const next = snap.games.find(
    (g) => g.programId === activeProgram.id && !g.result,
  );

  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--cc-navy)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">
              Player portal
            </p>
            <p className="text-xs text-white/70">
              {activeProgram.name} · {snap.district.name}
            </p>
          </div>
          <div className="flex gap-2">
            {!isPlayer && player ? (
              <button
                type="button"
                onClick={() => signIn(player.email)}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold"
              >
                Sign in as player
              </button>
            ) : null}
            <Link
              href="/app/team"
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold"
            >
              Staff
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <Panel title="My card">
          {me ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
                #{me.jersey} {me.name}
              </p>
              <p className="text-sm text-[var(--cc-steel)]">
                {me.pos} · {me.classYear} · {me.level}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {myAtt ? <Badge tone="brand">Today: {myAtt}</Badge> : null}
                {myScore != null ? (
                  <Badge tone="good">Quiz: {myScore}%</Badge>
                ) : (
                  <Badge>No quiz score yet</Badge>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--cc-steel)]">No athlete linked.</p>
          )}
        </Panel>
        <Panel title="This week">
          {next ? (
            <p className="font-semibold text-[var(--cc-navy)]">
              {next.homeAway} vs {next.opponent} · {next.date} {next.time}
            </p>
          ) : (
            <p className="text-sm text-[var(--cc-steel)]">No upcoming game.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-[var(--cc-blue)]">
            <Link href={`/fan/${activeProgram.slug}`}>Fan schedule →</Link>
            <Link href="/app/team/install">Install (staff) →</Link>
          </div>
        </Panel>
      </main>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <AppProvider>
      <PlayerPortal />
    </AppProvider>
  );
}
