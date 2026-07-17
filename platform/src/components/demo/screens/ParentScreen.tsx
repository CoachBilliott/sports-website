"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PARENT_ANNOUNCEMENTS,
  PARENT_DOCS,
  contentForSport,
} from "@/lib/demoContent";
import { usePlatform } from "../PlatformState";
import { Badge, GhostButton, Panel } from "@/components/ui";

export function ParentScreen() {
  const { activeProgram, campus, safetyToggles, setPage, parentOptOuts } =
    usePlatform();
  const content = contentForSport(activeProgram.sport);
  const [childJersey, setChildJersey] = useState(content.roster[0]!.jersey);

  useEffect(() => {
    const next = contentForSport(activeProgram.sport).roster[0];
    if (next) setChildJersey(next.jersey);
  }, [activeProgram.id, activeProgram.sport]);

  const child = useMemo(
    () =>
      content.roster.find((a) => a.jersey === childJersey) ?? content.roster[0]!,
    [childJersey, content.roster],
  );
  const nextGame =
    content.schedule.find((g) => !g.result) ?? content.schedule[0]!;
  const optedOut = parentOptOuts.has(
    `${activeProgram.sport}-${child.jersey}`,
  );

  return (
    <div className="space-y-4">
      <Panel
        title="Parent site"
        action={
          <label className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[var(--cc-steel)]">Child</span>
            <select
              value={childJersey}
              onChange={(e) => setChildJersey(e.target.value)}
              className="rounded-lg border border-[var(--cc-line)] px-2.5 py-1.5 font-semibold text-[var(--cc-navy)]"
            >
              {content.roster.map((a) => (
                <option key={a.jersey + a.name} value={a.jersey}>
                  #{a.jersey} {a.name}
                </option>
              ))}
            </select>
          </label>
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          {campus.name} · {activeProgram.name}. Guardians see schedule and their
          linked athlete — not full staff tools
          {safetyToggles.blockScoutOnParent ? ", scout, or film" : ""}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="good">Linked athlete only</Badge>
          <Badge tone="good">No full gradebook</Badge>
          {safetyToggles.blockScoutOnParent ? (
            <Badge tone="good">No scout / film</Badge>
          ) : (
            <Badge tone="warn">Scout block OFF (demo)</Badge>
          )}
          {optedOut ? (
            <Badge tone="warn">Hidden from Fan directory</Badge>
          ) : (
            <Badge>Visible on Fan (directory)</Badge>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Your athlete">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
            #{child.jersey} {child.name}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            {child.pos} · {child.classYear} · {child.level ?? "Varsity"} ·{" "}
            {activeProgram.name}
          </p>
          <p className="mt-3 inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            Academically eligible
          </p>
        </Panel>
        <Panel title="This week">
          <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cc-navy)]">
            {nextGame.homeAway} vs {nextGame.opponent}
          </p>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            {nextGame.date} · {nextGame.time} · Week {nextGame.week}
          </p>
          {nextGame.venue ? (
            <p className="mt-1 text-xs text-[var(--cc-steel)]">{nextGame.venue}</p>
          ) : null}
          <p className="mt-3 text-xs text-[var(--cc-steel)]">
            Arrival details and bus times appear in announcements below.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Announcements">
          <ul className="space-y-3">
            {PARENT_ANNOUNCEMENTS.map((a) => (
              <li
                key={a.id}
                className="flex gap-3 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/50 px-3 py-3"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[var(--cc-navy)] text-white">
                  <span className="text-[10px] font-bold uppercase leading-none">
                    {a.date}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[var(--cc-navy)]">{a.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--cc-steel)]">{a.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Eligibility">
            <p className="text-sm text-[var(--cc-steel)]">
              Summary only for guardians
              {safetyToggles.requireStaffRoleForGrades
                ? ". Detailed gradebooks stay permission-gated in the staff app."
                : " (staff gradebook gate is OFF in this demo)."}
            </p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--cc-line)] px-3 py-2">
                <dt className="text-xs uppercase text-[var(--cc-steel)]">
                  Status
                </dt>
                <dd className="font-semibold text-emerald-700">Eligible</dd>
              </div>
              <div className="rounded-lg border border-[var(--cc-line)] px-3 py-2">
                <dt className="text-xs uppercase text-[var(--cc-steel)]">
                  Attendance
                </dt>
                <dd className="font-semibold text-[var(--cc-navy)]">Good</dd>
              </div>
              <div className="rounded-lg border border-[var(--cc-line)] px-3 py-2">
                <dt className="text-xs uppercase text-[var(--cc-steel)]">
                  Athlete
                </dt>
                <dd className="font-semibold text-[var(--cc-navy)]">
                  {child.name}
                </dd>
              </div>
              <div className="rounded-lg border border-[var(--cc-line)] px-3 py-2">
                <dt className="text-xs uppercase text-[var(--cc-steel)]">
                  Program
                </dt>
                <dd className="font-semibold text-[var(--cc-navy)]">
                  {activeProgram.name}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Documents">
            <ul className="space-y-2">
              {PARENT_DOCS.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-[var(--cc-navy)]">{d.title}</p>
                    <p className="text-xs text-[var(--cc-steel)]">{d.kind}</p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--cc-blue)]">
                    View
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[var(--cc-steel)]">
              Demo links only — no uploads or personal medical forms here.
            </p>
          </Panel>
        </div>
      </div>

      <Panel title="Week at a glance">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {content.schedule.slice(0, 6).map((g) => (
            <div
              key={g.week}
              className={`rounded-xl border px-3 py-3 ${
                !g.result && g.week === nextGame.week
                  ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                  : "border-[var(--cc-line)]"
              }`}
            >
              <p className="text-[10px] font-bold uppercase text-[var(--cc-steel)]">
                W{g.week} · {g.date}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--cc-navy)]">
                {g.homeAway[0]} vs {g.opponent.split(" ")[0]}
              </p>
              <p className="text-xs text-[var(--cc-steel)]">
                {g.result ?? g.time}
              </p>
            </div>
          ))}
        </div>
        <GhostButton onClick={() => setPage("legal")}>
          See field matrix &amp; safety →
        </GhostButton>
      </Panel>
    </div>
  );
}
