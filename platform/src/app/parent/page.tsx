"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppProvider, useApp, ROLE_SHORT } from "@/components/app/AppProvider";
import { Badge, Panel } from "@/components/ui";

function ParentPortal() {
  const { snap, activeProgram, setActiveProgram, signIn } = useApp();
  const parentMember = snap.members.find((m) => m.role === "parent");
  const isParent = snap.session?.role === "parent";
  const linkedIds = parentMember?.programIds?.length
    ? snap.athletes
        .filter((a) => a.programId === activeProgram.id)
        .map((a) => a.id)
    : [];
  const athletes = snap.athletes.filter((a) => a.programId === activeProgram.id);
  const [childId, setChildId] = useState(athletes[0]?.id ?? "");
  useEffect(() => {
    setChildId(athletes[0]?.id ?? "");
  }, [activeProgram.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const child = useMemo(
    () => athletes.find((a) => a.id === childId) ?? athletes[0],
    [athletes, childId],
  );
  const games = snap.games.filter((g) => g.programId === activeProgram.id);
  const next = games.find((g) => !g.result) ?? games[0];
  const announcements = snap.announcements.filter(
    (a) => a.programId === activeProgram.id && a.audience === "parent",
  );
  const todayAtt = snap.team.attendance.find(
    (a) => a.programId === activeProgram.id,
  );
  const childAtt = child
    ? todayAtt?.records.find((r) => r.athleteId === child.id)?.status
    : null;

  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--cc-navy)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold">
              Parent portal
            </p>
            <p className="text-xs text-white/70">
              {snap.district.name} · {activeProgram.name}
              {snap.session
                ? ` · ${snap.session.name} (${ROLE_SHORT[snap.session.role]})`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={activeProgram.id}
              onChange={(e) => setActiveProgram(e.target.value)}
              className="rounded-md border border-white/30 bg-[var(--cc-navy)] px-2 py-1 text-xs font-semibold"
            >
              {snap.programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {!isParent && parentMember ? (
              <button
                type="button"
                onClick={() => {
                  signIn(parentMember.email);
                }}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold"
              >
                Sign in as parent
              </button>
            ) : null}
            <Link
              href={`/fan/${activeProgram.slug}`}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold"
            >
              Fan site
            </Link>
            <Link
              href="/app"
              className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold"
            >
              Staff app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[90rem] space-y-4 px-4 py-6 sm:px-6">
        {!isParent ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Preview mode — click <strong>Sign in as parent</strong> for the
            guardian session ({parentMember?.email ?? "parent@demo.local"}).
          </div>
        ) : null}

        <Panel
          title="Your athlete"
          action={
            <select
              value={child?.id}
              onChange={(e) => setChildId(e.target.value)}
              className="rounded-lg border border-[var(--cc-line)] px-2 py-1 text-sm font-semibold"
            >
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.jersey} {a.name}
                </option>
              ))}
            </select>
          }
        >
          {child ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold">
                #{child.jersey} {child.name}
              </p>
              <p className="text-sm text-[var(--cc-steel)]">
                {child.pos} · {child.classYear} · {child.level}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="good">Eligible</Badge>
                <Badge tone="good">No full gradebook</Badge>
                {childAtt ? (
                  <Badge tone={childAtt === "present" ? "good" : "warn"}>
                    Today: {childAtt}
                  </Badge>
                ) : (
                  <Badge>Attendance pending</Badge>
                )}
                {snap.safety.blockScoutOnParent ? (
                  <Badge tone="good">No scout</Badge>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--cc-steel)]">No linked athletes.</p>
          )}
        </Panel>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="This week">
            {next ? (
              <>
                <p className="font-[family-name:var(--font-display)] text-xl font-bold">
                  {next.homeAway} vs {next.opponent}
                </p>
                <p className="text-sm text-[var(--cc-steel)]">
                  {next.date} · {next.time}
                </p>
                <Link
                  href={`/fan/${activeProgram.slug}`}
                  className="mt-2 inline-block text-sm font-semibold text-[var(--cc-blue)]"
                >
                  Full Fan schedule →
                </Link>
              </>
            ) : (
              <p className="text-sm text-[var(--cc-steel)]">No upcoming game.</p>
            )}
          </Panel>
          <Panel title="Documents">
            <ul className="space-y-2">
              {snap.parentDocs.map((d) => (
                <li
                  key={d.id}
                  className="flex justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
                >
                  <span>{d.title}</span>
                  <a
                    href={d.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[var(--cc-blue)]"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Announcements">
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="flex gap-3 rounded-xl border border-[var(--cc-line)] px-3 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--cc-navy)] text-[10px] font-bold text-white">
                  {a.dateLabel}
                </div>
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-[var(--cc-steel)]">{a.body}</p>
                </div>
              </li>
            ))}
            {!announcements.length ? (
              <li className="text-sm text-[var(--cc-steel)]">
                No parent announcements yet.
              </li>
            ) : null}
          </ul>
        </Panel>

        <Panel title="Forms & eligibility">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2">
              <span>Physical on file</span>
              <Badge tone="good">Complete</Badge>
            </li>
            <li className="flex justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2">
              <span>UIL acknowledgment</span>
              <Badge tone="good">Complete</Badge>
            </li>
            <li className="flex justify-between rounded-lg border border-[var(--cc-line)] px-3 py-2">
              <span>Emergency contacts</span>
              <Badge tone="warn">Review yearly</Badge>
            </li>
          </ul>
          <p className="mt-2 text-xs text-[var(--cc-steel)]">
            Linked athletes in demo: {linkedIds.length || athletes.length}. No
            grades or scout — safety toggles enforce that.
          </p>
        </Panel>
      </main>
    </div>
  );
}

export default function ParentPage() {
  return (
    <AppProvider>
      <ParentPortal />
    </AppProvider>
  );
}
