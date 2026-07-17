"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyCampusCallout } from "@/components/app/EmptyCampusCallout";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";
import { logoForOpponent } from "@/lib/demoContent";

export default function SchedulePage() {
  const {
    activeProgram,
    activeCampus,
    activeGames,
    programOnCampus,
    updateGame,
    addGame,
    can,
    setActiveWeek,
  } = useApp();
  const next = activeGames.find((g) => !g.result);
  const [form, setForm] = useState({
    week: String((activeGames.at(-1)?.week ?? 0) + 1),
    date: "",
    time: "7:00 PM",
    opponent: "",
    homeAway: "Home" as "Home" | "Away",
  });

  if (!programOnCampus) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Schedule"
          description={`Working campus: ${activeCampus.short}`}
        />
        <EmptyCampusCallout context="Schedule needs a team on this campus." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Schedule"
        description={`${activeProgram.name} · ${activeCampus.short} · ${activeProgram.seasonLabel}`}
        action={
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--cc-blue)]">
            <Link href="/app/team">Team desk →</Link>
            <Link href={`/fan/${activeProgram.slug}`}>Preview Fan →</Link>
          </div>
        }
      />

      <Panel title="Games">
        <ul className="space-y-2">
          {activeGames.map((g) => {
            const logo = logoForOpponent(g.opponent);
            const isNext = next?.id === g.id;
            return (
              <li
                key={g.id}
                className={`rounded-xl border px-3 py-2.5 ${
                  isNext
                    ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                    : "border-[var(--cc-line)]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt=""
                        className="h-9 w-9 rounded-full bg-[var(--cc-field)] object-contain p-0.5"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cc-field)] text-[10px] font-bold">
                        {g.opponent.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-semibold text-[var(--cc-navy)]">
                        W{g.week} · {g.homeAway} vs {g.opponent}
                      </p>
                      <p className="text-xs text-[var(--cc-steel)]">
                        {g.date} · {g.time}
                        {g.venue ? ` · ${g.venue}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveWeek(g.week)}
                      className="text-xs font-semibold text-[var(--cc-blue)]"
                    >
                      Work week {g.week}
                    </button>
                    {can("manage_schedule") ? (
                      <input
                        value={g.result ?? ""}
                        placeholder="Result"
                        onChange={(e) =>
                          updateGame(g.id, {
                            result: e.target.value || null,
                          })
                        }
                        className="w-24 rounded-md border border-[var(--cc-line)] px-2 py-1 text-sm font-semibold"
                      />
                    ) : (
                      <span className="font-semibold">
                        {g.result ?? (isNext ? "Next" : "TBD")}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {activeProgram.maxPrepsUrl ? (
          <p className="mt-3 text-xs text-[var(--cc-steel)]">
            MaxPreps:{" "}
            <a
              href={activeProgram.maxPrepsUrl}
              className="font-semibold text-[var(--cc-blue)]"
              target="_blank"
              rel="noreferrer"
            >
              {activeProgram.maxPrepsUrl}
            </a>
          </p>
        ) : null}
      </Panel>

      {can("manage_schedule") ? (
        <Panel title="Add game">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.opponent.trim()) return;
              addGame({
                programId: activeProgram.id,
                week: Number(form.week) || 1,
                date: form.date || "TBD",
                time: form.time,
                opponent: form.opponent.trim(),
                homeAway: form.homeAway,
                result: null,
              });
              setForm({
                ...form,
                week: String(Number(form.week) + 1),
                opponent: "",
              });
            }}
          >
            <input
              value={form.week}
              onChange={(e) => setForm({ ...form, week: e.target.value })}
              className="w-16 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              placeholder="Wk"
            />
            <input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-28 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              placeholder="Date"
            />
            <input
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-28 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
            <input
              value={form.opponent}
              onChange={(e) => setForm({ ...form, opponent: e.target.value })}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-2"
              placeholder="Opponent"
              required
            />
            <select
              value={form.homeAway}
              onChange={(e) =>
                setForm({
                  ...form,
                  homeAway: e.target.value as "Home" | "Away",
                })
              }
              className="rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <option value="Home">Home</option>
              <option value="Away">Away</option>
            </select>
            <PrimaryButton type="submit">Add</PrimaryButton>
          </form>
        </Panel>
      ) : null}
    </div>
  );
}
