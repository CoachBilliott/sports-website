"use client";

import Link from "next/link";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton, StatTile } from "@/components/ui";

const QUICK = [
  { href: "/app/team/depth", label: "Depth charts", detail: "Starters & two-deep" },
  { href: "/app/team/scout", label: "Scout", detail: "This week's notes" },
  { href: "/app/team/practice", label: "Practice", detail: "Day plans" },
  { href: "/app/team/call-sheet", label: "Call sheet", detail: "Game-day calls" },
  { href: "/app/team/playbook", label: "Playbook", detail: "Install library" },
  { href: "/app/team/quizzes", label: "Quizzes", detail: "Scout checks" },
  { href: "/app/team/grades", label: "Grades", detail: "Practice & game" },
  { href: "/app/team/attendance", label: "Attendance", detail: "Today's roll" },
];

export default function TeamHomePage() {
  const {
    activeProgram,
    activeAthletes,
    activeGames,
    activeWeek,
    snap,
    activeUnitId,
  } = useApp();

  const next =
    activeGames.find((g) => g.week === activeWeek) ??
    activeGames.find((g) => !g.result) ??
    activeGames[0];
  const openDuties = snap.team.duties.filter(
    (d) => d.programId === activeProgram.id && d.status === "open",
  );
  const todayAtt = snap.team.attendance.find(
    (a) => a.programId === activeProgram.id,
  );
  const present = todayAtt?.records.filter((r) => r.status === "present").length ?? 0;
  const scout = snap.team.weekNotes.find(
    (n) =>
      n.programId === activeProgram.id &&
      n.unitId === activeUnitId &&
      n.week === activeWeek &&
      n.kind === "scout",
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Roster"
          value={String(activeAthletes.length)}
          hint="Athletes on this team"
        />
        <StatTile
          label="Active week"
          value={`W${activeWeek}`}
          hint={next ? `vs ${next.opponent}` : "No game"}
        />
        <StatTile
          label="Present today"
          value={todayAtt ? String(present) : "—"}
          hint={todayAtt ? `${todayAtt.records.length} on roll` : "Take attendance"}
          tone="good"
        />
        <StatTile
          label="Open duties"
          value={String(openDuties.length)}
          hint="Staff responsibilities"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="This week" className="lg:col-span-2">
          {next ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
                {next.homeAway} vs {next.opponent}
              </p>
              <p className="mt-1 text-sm text-[var(--cc-steel)]">
                Week {next.week} · {next.date} · {next.time}
                {next.venue ? ` · ${next.venue}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone={next.result ? "good" : "brand"}>
                  {next.result ?? "Upcoming"}
                </Badge>
                <Link
                  href="/app/schedule"
                  className="text-sm font-semibold text-[var(--cc-blue)]"
                >
                  Edit schedule →
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--cc-steel)]">
              No games yet — add one on Schedule.
            </p>
          )}
          {scout ? (
            <div className="mt-4 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/60 px-3 py-3">
              <p className="text-xs font-bold uppercase text-[var(--cc-steel)]">
                Scout snapshot
              </p>
              <p className="mt-1 font-semibold text-[var(--cc-navy)]">
                {scout.title}
              </p>
              <p className="text-sm text-[var(--cc-steel)]">{scout.body}</p>
              <Link
                href="/app/team/scout"
                className="mt-2 inline-block text-sm font-semibold text-[var(--cc-blue)]"
              >
                Open scout →
              </Link>
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Do next"
          action={
            <Link href="/app/announcements">
              <PrimaryButton>Announce</PrimaryButton>
            </Link>
          }
        >
          <ol className="space-y-2 text-sm">
            {[
              ["Take attendance", "/app/team/attendance"],
              ["Update depth chart", "/app/team/depth"],
              ["Write practice plan", "/app/team/practice"],
              ["Post for parents", "/app/announcements"],
              ["Preview Fan site", `/fan/${activeProgram.slug}`],
            ].map(([label, href], i) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex gap-2 rounded-lg border border-[var(--cc-line)] px-3 py-2 hover:border-[var(--cc-blue)]"
                >
                  <span className="font-bold text-[var(--cc-blue)]">{i + 1}</span>
                  <span className="font-semibold text-[var(--cc-navy)]">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="Team tools">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="rounded-xl border border-[var(--cc-line)] px-3 py-3 transition hover:border-[var(--cc-blue)] hover:bg-[var(--cc-field)]"
            >
              <p className="font-semibold text-[var(--cc-navy)]">{q.label}</p>
              <p className="text-xs text-[var(--cc-steel)]">{q.detail}</p>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
