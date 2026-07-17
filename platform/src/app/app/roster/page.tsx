"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyCampusCallout } from "@/components/app/EmptyCampusCallout";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function RosterPage() {
  const {
    activeProgram,
    activeCampus,
    activeAthletes,
    campusPrograms,
    programOnCampus,
    addAthlete,
    updateAthlete,
    removeAthlete,
    setDirectoryOptOut,
    setActiveProgram,
    can,
  } = useApp();
  const [form, setForm] = useState({
    name: "",
    jersey: "",
    pos: "",
    classYear: "Jr",
    level: "Varsity",
  });

  if (!programOnCampus) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Roster"
          description={`Working campus: ${activeCampus.short}`}
        />
        <EmptyCampusCallout context="Roster needs a team on this campus." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Roster"
        description={`${activeProgram.name} · ${activeCampus.short} · ${activeAthletes.length} athletes`}
        action={
          can("manage_roster") ? (
            <Link href="/app/roster/import">
              <PrimaryButton>Import CSV</PrimaryButton>
            </Link>
          ) : null
        }
      />

      <Panel title="Active program">
        <select
          value={activeProgram.id}
          onChange={(e) => setActiveProgram(e.target.value)}
          className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold"
        >
          {campusPrograms.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Panel>

      <Panel title="Athletes">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2">#</th>
                <th className="py-2">Name</th>
                <th className="py-2">Pos</th>
                <th className="py-2">Class</th>
                <th className="py-2">Level</th>
                <th className="py-2">Fan directory</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {activeAthletes.map((a) => (
                <tr key={a.id} className="border-b border-[var(--cc-line)]/60">
                  <td className="py-2">
                    <input
                      value={a.jersey}
                      onChange={(e) =>
                        updateAthlete(a.id, { jersey: e.target.value })
                      }
                      className="w-12 rounded border border-[var(--cc-line)] px-1 py-0.5 font-semibold"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      value={a.name}
                      onChange={(e) =>
                        updateAthlete(a.id, { name: e.target.value })
                      }
                      className="w-full min-w-[8rem] rounded border border-[var(--cc-line)] px-1 py-0.5"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      value={a.pos}
                      onChange={(e) =>
                        updateAthlete(a.id, { pos: e.target.value })
                      }
                      className="w-14 rounded border border-[var(--cc-line)] px-1 py-0.5"
                    />
                  </td>
                  <td className="py-2">
                    <select
                      value={a.classYear}
                      onChange={(e) =>
                        updateAthlete(a.id, { classYear: e.target.value })
                      }
                      className="rounded border border-[var(--cc-line)] px-1 py-0.5"
                    >
                      {["Fr", "So", "Jr", "Sr"].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <select
                      value={a.level}
                      onChange={(e) =>
                        updateAthlete(a.id, { level: e.target.value })
                      }
                      className="rounded border border-[var(--cc-line)] px-1 py-0.5"
                    >
                      {activeProgram.levels.map((lv) => (
                        <option key={lv}>{lv}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDirectoryOptOut(a.id, !a.directoryOptOut)
                      }
                      className="text-xs font-semibold"
                    >
                      {a.directoryOptOut ? (
                        <Badge tone="warn">Opted out</Badge>
                      ) : (
                        <Badge tone="good">Visible</Badge>
                      )}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeAthlete(a.id)}
                      className="text-xs font-semibold text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Add athlete">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.jersey) return;
            addAthlete(activeProgram.id, form);
            setForm({
              name: "",
              jersey: "",
              pos: "",
              classYear: "Jr",
              level: "Varsity",
            });
          }}
        >
          {(
            [
              ["jersey", "Jersey", "7"],
              ["name", "Name", "Full name"],
              ["pos", "Pos", "QB"],
            ] as const
          ).map(([key, label, ph]) => (
            <label key={key} className="text-sm">
              <span className="font-semibold">{label}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={ph}
                className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
          ))}
          <label className="text-sm">
            <span className="font-semibold">Class</span>
            <select
              value={form.classYear}
              onChange={(e) => setForm({ ...form, classYear: e.target.value })}
              className="mt-1 block rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              {["Fr", "So", "Jr", "Sr"].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold">Level</span>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="mt-1 block rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              {activeProgram.levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <PrimaryButton type="submit">Add</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}
