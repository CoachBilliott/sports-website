"use client";

import { FAN_NEWS, contentForSport } from "@/lib/demoContent";
import { usePlatform } from "../PlatformState";
import { Badge, GhostButton } from "../ui";

export function FanScreen() {
  const {
    activeProgram,
    campus,
    district,
    parentOptOuts,
    safetyToggles,
    setPage,
    presentMode,
    setPresentMode,
  } = usePlatform();

  const content = contentForSport(activeProgram.sport);
  const nextGame =
    content.schedule.find((g) => !g.result) ??
    content.schedule[content.schedule.length - 1]!;
  const recentResult = content.schedule.filter((g) => g.result).at(-1);
  const honorOptOut = safetyToggles.honorDirectoryOptOut;
  const publicRoster = content.roster.filter(
    (a) => !(honorOptOut && parentOptOuts.has(`${activeProgram.sport}-${a.jersey}`)),
  );
  const hiddenCount = content.roster.length - publicRoster.length;
  const mascot = "Cougars";

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--cc-line)] bg-white shadow-sm">
      {presentMode ? (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--cc-line)] bg-[var(--cc-field)] px-4 py-2">
          <p className="text-xs font-semibold text-[var(--cc-steel)]">
            Presenting public Fan site · admin chrome hidden
          </p>
          <button
            type="button"
            onClick={() => setPresentMode(false)}
            className="rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1 text-xs font-semibold"
          >
            Exit present
          </button>
        </div>
      ) : null}

      <div className="fan-hero relative overflow-hidden px-6 py-12 text-white sm:px-10 sm:py-16">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0a2540 0%, #0b3d91 48%, #1a5bb5 100%)",
          }}
        />
        <div className="fan-hero-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative flex flex-wrap items-end gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cypress-creek-logo.png"
                alt=""
                className="h-20 w-20 rounded-2xl bg-white/10 object-contain p-1.5 ring-1 ring-white/20"
              />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-white/75">
                  {campus.name} · {district.name}
                </p>
                <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight sm:text-6xl">
                  {mascot}
                </h1>
                <p className="mt-1 text-lg text-white/90">
                  {activeProgram.name} · {activeProgram.seasonLabel} · Record{" "}
                  {content.recordLabel}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="invert">Public Fan site</Badge>
              <Badge tone="invert">No grades</Badge>
              <Badge tone="invert">No contacts</Badge>
              <Badge tone="invert">No scout</Badge>
              {!safetyToggles.blockGradesOnFan ? (
                <span className="rounded-md bg-amber-400/90 px-2.5 py-1 text-xs font-bold text-[var(--cc-navy)]">
                  Demo: grades block OFF
                </span>
              ) : null}
            </div>
          </div>

          <div className="fan-next-game w-full max-w-md rounded-2xl border border-white/25 bg-white/10 p-5 backdrop-blur-sm sm:w-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
              Next game
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
              {nextGame.homeAway} vs {nextGame.opponent}
            </p>
            <p className="mt-1 text-sm text-white/85">
              {nextGame.date} · {nextGame.time} · Week {nextGame.week}
            </p>
            {nextGame.venue ? (
              <p className="mt-1 text-xs text-white/70">{nextGame.venue}</p>
            ) : null}
            {recentResult ? (
              <p className="mt-3 text-xs font-semibold text-emerald-200">
                Last: W{recentResult.week} {recentResult.result} vs{" "}
                {recentResult.opponent}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--cc-line)] bg-[var(--cc-field)]/80 px-6 py-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
          News
        </p>
        <div className="fan-news-strip flex gap-3 overflow-x-auto pb-1">
          {FAN_NEWS.map((n) => (
            <article
              key={n.id}
              className="min-w-[220px] max-w-[280px] shrink-0 rounded-xl border border-[var(--cc-line)] bg-white p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--cc-blue)]">
                {n.tag}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--cc-navy)]">
                {n.title}
              </p>
              <p className="mt-1 text-xs text-[var(--cc-steel)]">{n.blurb}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Schedule &amp; results
          </h2>
          <ul className="mt-3 space-y-2">
            {content.schedule.map((g) => {
              const isNext = g.week === nextGame.week && !g.result;
              return (
                <li
                  key={`${g.week}-${g.opponent}`}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                    isNext
                      ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                      : "border-[var(--cc-line)]"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-[var(--cc-navy)]">
                      <span
                        className={`mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          g.homeAway === "Home"
                            ? "bg-[var(--cc-navy)] text-white"
                            : "bg-[var(--cc-field)] text-[var(--cc-steel)]"
                        }`}
                      >
                        {g.homeAway}
                      </span>
                      vs {g.opponent}
                    </p>
                    <p className="text-xs text-[var(--cc-steel)]">
                      W{g.week} · {g.date} · {g.time}
                      {g.venue ? ` · ${g.venue}` : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-[var(--cc-navy)]">
                    {g.result ?? (isNext ? "Next" : "TBD")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
            Standings
          </h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-1">Team</th>
                <th className="py-1">W</th>
                <th className="py-1">L</th>
              </tr>
            </thead>
            <tbody>
              {content.standings.map((row) => (
                <tr
                  key={row.team}
                  className={`border-b border-[var(--cc-line)]/60 ${
                    row.team.includes("Creek") ? "bg-[var(--cc-blue)]/5 font-semibold" : ""
                  }`}
                >
                  <td className="py-1.5">{row.team}</td>
                  <td className="py-1.5">{row.w}</td>
                  <td className="py-1.5">{row.l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-[var(--cc-line)] p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Roster
            </h2>
            <p className="mt-1 text-xs text-[var(--cc-steel)]">
              Directory fields only — #, name, position, class
              {hiddenCount > 0
                ? ` · ${hiddenCount} hidden by parent opt-out`
                : ""}
            </p>
          </div>
          {!presentMode ? (
            <GhostButton onClick={() => setPage("legal")}>
              Manage opt-outs &amp; safety →
            </GhostButton>
          ) : null}
        </div>
        {!safetyToggles.blockContactsOnFan ? (
          <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">
            Safety demo: contacts block is OFF — production keeps this on.
          </p>
        ) : null}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-1">#</th>
                <th className="py-1">Name</th>
                <th className="py-1">Pos</th>
                <th className="py-1">Class</th>
                <th className="py-1">Level</th>
              </tr>
            </thead>
            <tbody>
              {publicRoster.map((a) => (
                <tr
                  key={a.jersey + a.name}
                  className="border-b border-[var(--cc-line)]/60"
                >
                  <td className="py-1.5 font-semibold">{a.jersey}</td>
                  <td className="py-1.5">{a.name}</td>
                  <td className="py-1.5">{a.pos}</td>
                  <td className="py-1.5">{a.classYear}</td>
                  <td className="py-1.5 text-[var(--cc-steel)]">
                    {a.level ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-[var(--cc-steel)]">
          Public directory only. Grades, contacts, and scout stay off this page.
        </p>
      </div>
    </div>
  );
}
