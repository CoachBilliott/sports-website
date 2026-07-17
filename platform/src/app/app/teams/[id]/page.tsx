"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";
import { MODULE_LABELS, configForSport } from "@/lib/programConfig";

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>();
  const { snap, setActiveProgram, updateProgram } = useApp();
  const program = snap.programs.find((p) => p.id === params.id);

  if (!program) {
    return (
      <div>
        <PageHeader title="Program not found" />
        <Link href="/app/teams" className="text-[var(--cc-blue)]">
          ← Back to teams
        </Link>
      </div>
    );
  }

  const cfg = configForSport(program.sport);
  const athletes = snap.athletes.filter((a) => a.programId === program.id);
  const games = snap.games.filter((g) => g.programId === program.id);
  const staff = snap.members.filter((m) => m.programIds.includes(program.id));

  return (
    <div className="space-y-4">
      <PageHeader
        title={program.name}
        description={`${program.sport} · ${program.seasonLabel} · ${program.levels.join(", ")}`}
        action={
          <div className="flex flex-wrap gap-2">
            <PrimaryButton onClick={() => setActiveProgram(program.id)}>
              Set active
            </PrimaryButton>
            <Link
              href={`/fan/${program.slug}`}
              className="rounded-lg border border-[var(--cc-line)] px-4 py-2 text-sm font-semibold"
            >
              Fan site
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Template">
          <p className="text-sm text-[var(--cc-steel)]">
            Units: {cfg.units.map((u) => u.label).join(", ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cfg.enabledModules.map((m) => (
              <Badge key={m}>{MODULE_LABELS[m]}</Badge>
            ))}
          </div>
        </Panel>
        <Panel title="Counts">
          <p className="text-sm">
            Athletes: <strong>{athletes.length}</strong>
          </p>
          <p className="text-sm">
            Staff: <strong>{staff.length}</strong>
          </p>
          <p className="text-sm">
            Games: <strong>{games.length}</strong>
          </p>
        </Panel>
        <Panel title="MaxPreps URL">
          <input
            className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
            value={program.maxPrepsUrl ?? ""}
            onChange={(e) =>
              updateProgram(program.id, { maxPrepsUrl: e.target.value })
            }
            placeholder="https://www.maxpreps.com/..."
          />
          <p className="mt-2 text-xs text-[var(--cc-steel)]">
            Stored on the program — wire schedule sync later.
          </p>
        </Panel>
      </div>

      <Panel title="Roster preview">
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
            {athletes.slice(0, 8).map((a) => (
              <tr key={a.id} className="border-b border-[var(--cc-line)]/60">
                <td className="py-1.5 font-semibold">{a.jersey}</td>
                <td className="py-1.5">{a.name}</td>
                <td className="py-1.5">{a.pos}</td>
                <td className="py-1.5">{a.classYear}</td>
                <td className="py-1.5">{a.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link
          href="/app/roster"
          className="mt-3 inline-block text-sm font-semibold text-[var(--cc-blue)]"
        >
          Manage full roster →
        </Link>
      </Panel>
    </div>
  );
}
