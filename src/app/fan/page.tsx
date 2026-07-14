import Link from "next/link";
import { currentGame, games, potw, team } from "@/lib/mock";

export default function FanPage() {
  return (
    <div className="min-h-screen bg-[var(--cc-field)]">
      <header className="border-b border-[var(--cc-line)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--cc-blue)] font-bold">
              {team.logoLetter}
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl tracking-wide">
                {team.name}
              </p>
              <p className="text-xs text-white/70">Public fan view · no account</p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
          >
            Staff / login mock
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <section className="rounded-2xl border border-[var(--cc-line)] bg-white p-6 text-center">
          <p className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--cc-blue)]">
            {team.name}
          </p>
          <p className="mt-2 text-[var(--cc-steel)]">{team.motto}</p>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            {team.season} Football
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--cc-line)] bg-white p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--cc-navy)]">
            This week
          </h2>
          <p className="mt-2 text-lg font-semibold text-[var(--cc-navy)]">
            Week {currentGame.week} vs {currentGame.opponent}
          </p>
          <p className="text-sm text-[var(--cc-steel)]">
            {currentGame.date} · {currentGame.time} · {currentGame.homeAway} ·{" "}
            {currentGame.venue}
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--cc-line)] bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--cc-navy)]">
              Schedule
            </h2>
            <a
              href={team.maxPrepsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[var(--cc-blue)]"
            >
              MaxPreps ↗
            </a>
          </div>
          <ul className="space-y-2 text-sm">
            {games.slice(0, 5).map((g) => (
              <li
                key={g.id}
                className="flex justify-between gap-3 border-b border-[var(--cc-line)] py-2"
              >
                <span className="font-medium text-[var(--cc-navy)]">
                  W{g.week} {g.opponent}
                </span>
                <span className="text-[var(--cc-steel)]">
                  {g.date} · {g.homeAway}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--cc-line)] bg-white p-5">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--cc-navy)]">
            Players of the Week
          </h2>
          <p className="mt-1 text-xs text-[var(--cc-steel)]">Names only — no grades</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-[var(--cc-field)] p-3">
              Varsity · {potw.varsity}
            </div>
            <div className="rounded-lg bg-[var(--cc-field)] p-3">
              Scout · {potw.scout}
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-[var(--cc-steel)]">
          Fans never see playbook, install, scout, quizzes, or grades.
        </p>
      </main>
    </div>
  );
}
