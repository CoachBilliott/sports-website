"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppProvider, useApp } from "@/components/app/AppProvider";
import { Badge } from "@/components/ui";
import { FAN_NEWS, logoForOpponent } from "@/lib/demoContent";
import { contentForSport } from "@/lib/demoContent";
import { asset } from "@/lib/asset";

function FanPublic() {
  const params = useParams<{ programId: string }>();
  const { snap } = useApp();
  const program =
    snap.programs.find((p) => p.slug === params.programId) ??
    snap.programs.find((p) => p.id === params.programId) ??
    snap.programs[0]!;
  const campus = snap.campuses.find((c) => c.id === program.campusId);
  const athletes = snap.athletes.filter(
    (a) =>
      a.programId === program.id &&
      !(snap.safety.honorDirectoryOptOut && a.directoryOptOut),
  );
  const games = snap.games.filter((g) => g.programId === program.id);
  const next = games.find((g) => !g.result) ?? games[games.length - 1];
  const standings = contentForSport(program.sport).standings;
  const record = contentForSport(program.sport).recordLabel;
  const publicNews = snap.announcements.filter(
    (a) => a.programId === program.id && a.audience === "public",
  );
  const newsCards =
    publicNews.length > 0
      ? publicNews.map((a) => ({
          id: a.id,
          tag: "Update",
          title: a.title,
          blurb: a.body,
        }))
      : FAN_NEWS;

  return (
    <div className="min-h-full bg-[var(--cc-field)]">
      <div className="border-b border-[var(--cc-line)] bg-white px-4 py-2 text-center text-xs text-[var(--cc-steel)]">
        Public Fan site ·{" "}
        <Link href="/parent" className="font-semibold text-[var(--cc-blue)]">
          Parent
        </Link>
        {" · "}
        <Link href="/app" className="font-semibold text-[var(--cc-blue)]">
          Staff app
        </Link>
      </div>
      <div className="mx-auto max-w-[90rem] px-3 py-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--cc-line)] bg-white shadow-sm">
          <div className="fan-hero relative overflow-hidden px-6 py-12 text-white sm:px-10 sm:py-16">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, #0a2540 0%, #0b3d91 48%, #1a5bb5 100%)",
              }}
            />
            <div className="fan-hero-grid absolute inset-0 opacity-30" />
            <div className="relative flex flex-wrap items-end gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(snap.brandLogoUrl || "/cypress-creek-logo.png")}
                    alt=""
                    className="h-20 w-20 rounded-2xl bg-white/10 object-contain p-1.5"
                  />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/75">
                      {campus?.name} · {snap.district.name}
                    </p>
                    <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-6xl">
                      {campus?.mascot ?? "Team"}
                    </h1>
                    <p className="mt-1 text-lg text-white/90">
                      {program.name} · {program.seasonLabel} · {record}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="invert">Public</Badge>
                  <Badge tone="invert">No grades</Badge>
                  <Badge tone="invert">No contacts</Badge>
                </div>
              </div>
              {next ? (
                <div className="fan-next-game w-full max-w-md rounded-2xl border border-white/25 bg-white/10 p-5 sm:w-auto">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                    Next game
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">
                    {next.homeAway} vs {next.opponent}
                  </p>
                  <p className="mt-1 text-sm text-white/85">
                    {next.date} · {next.time}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-b border-[var(--cc-line)] bg-[var(--cc-field)]/80 px-6 py-4">
            <div className="fan-news-strip flex gap-3 overflow-x-auto">
              {newsCards.map((n) => (
                <article
                  key={n.id}
                  className="min-w-[220px] shrink-0 rounded-xl border border-[var(--cc-line)] bg-white p-3"
                >
                  <p className="text-[10px] font-bold uppercase text-[var(--cc-blue)]">
                    {n.tag}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{n.title}</p>
                  <p className="mt-1 text-xs text-[var(--cc-steel)]">{n.blurb}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
                Schedule
              </h2>
              <ul className="mt-3 space-y-2">
                {games.map((g) => {
                  const logo = logoForOpponent(g.opponent);
                  return (
                    <li
                      key={g.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--cc-line)] px-3 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logo}
                            alt=""
                            className="h-8 w-8 rounded-full object-contain"
                          />
                        ) : null}
                        <span>
                          {g.homeAway} vs {g.opponent}
                          <span className="block text-xs text-[var(--cc-steel)]">
                            {g.date} · {g.time}
                          </span>
                        </span>
                      </div>
                      <span className="font-semibold">
                        {g.result ?? "TBD"}
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
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-[var(--cc-steel)]">
                    <th className="py-1 text-left">Team</th>
                    <th className="py-1">W</th>
                    <th className="py-1">L</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((r) => (
                    <tr key={r.team} className="border-b border-[var(--cc-line)]/60">
                      <td className="py-1.5">{r.team}</td>
                      <td className="py-1.5 text-center">{r.w}</td>
                      <td className="py-1.5 text-center">{r.l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-[var(--cc-line)] p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Roster
            </h2>
            <p className="text-xs text-[var(--cc-steel)]">
              Directory fields only
            </p>
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-[var(--cc-steel)]">
                  <th className="py-1">#</th>
                  <th className="py-1">Name</th>
                  <th className="py-1">Pos</th>
                  <th className="py-1">Class</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--cc-line)]/60">
                    <td className="py-1.5 font-semibold">{a.jersey}</td>
                    <td className="py-1.5">{a.name}</td>
                    <td className="py-1.5">{a.pos}</td>
                    <td className="py-1.5">{a.classYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FanPage() {
  return (
    <AppProvider>
      <FanPublic />
    </AppProvider>
  );
}
