"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Panel } from "@/components/ui";
import { logoForOpponent } from "@/lib/demoContent";

export default function SchedulePage() {
  const { activeProgram, activeGames } = useApp();
  const next = activeGames.find((g) => !g.result);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Schedule"
        description={`${activeProgram.name} · ${activeProgram.seasonLabel}. MaxPreps URL sync can plug into this list later.`}
      />

      <Panel title="Games">
        <ul className="space-y-2">
          {activeGames.map((g) => {
            const logo = logoForOpponent(g.opponent);
            const isNext = next?.id === g.id;
            return (
              <li
                key={g.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                  isNext
                    ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                    : "border-[var(--cc-line)]"
                }`}
              >
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
                      {g.homeAway} vs {g.opponent}
                    </p>
                    <p className="text-xs text-[var(--cc-steel)]">
                      W{g.week} · {g.date} · {g.time}
                      {g.venue ? ` · ${g.venue}` : ""}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">
                  {g.result ?? (isNext ? "Next" : "TBD")}
                </span>
              </li>
            );
          })}
        </ul>
        {activeProgram.maxPrepsUrl ? (
          <p className="mt-3 text-xs text-[var(--cc-steel)]">
            MaxPreps: {activeProgram.maxPrepsUrl}
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
