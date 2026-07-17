"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";
import { ROSTER_IMPORT_SAMPLE } from "@/lib/data/importSample";

export default function RosterImportPage() {
  const { activeProgram, importAthletes } = useApp();
  const [mode, setMode] = useState<"merge" | "replace">("merge");
  const [raw, setRaw] = useState(
    "name,jersey,classYear,position,level\n" +
      ROSTER_IMPORT_SAMPLE.map(
        (r) =>
          `${r.name},${r.jersey},${r.classYear},${r.pos},${r.level}`,
      ).join("\n"),
  );
  const [done, setDone] = useState(false);

  const parsed = useMemo(() => {
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const header = lines[0]!.toLowerCase().split(",").map((h) => h.trim());
    const idx = {
      name: header.indexOf("name"),
      jersey: header.indexOf("jersey"),
      classYear: header.indexOf("classyear"),
      pos: Math.max(header.indexOf("position"), header.indexOf("pos")),
      level: header.indexOf("level"),
    };
    return lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        name: cols[idx.name] ?? "",
        jersey: cols[idx.jersey] ?? "",
        classYear: cols[idx.classYear] ?? "",
        pos: cols[idx.pos] ?? "",
        level: cols[idx.level] ?? "Varsity",
      };
    });
  }, [raw]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Import roster"
        description={`CSV import for ${activeProgram.name}. Column mapping is fixed for name, jersey, classYear, position, level.`}
        action={
          <Link
            href="/app/roster"
            className="text-sm font-semibold text-[var(--cc-blue)]"
          >
            ← Roster
          </Link>
        }
      />

      <Panel title="Paste CSV">
        <textarea
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setDone(false);
          }}
          rows={10}
          className="w-full rounded-xl border border-[var(--cc-line)] px-3 py-2 font-mono text-xs"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold">
            Mode{" "}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "merge" | "replace")}
              className="ml-2 rounded-lg border border-[var(--cc-line)] px-2 py-1"
            >
              <option value="merge">Merge</option>
              <option value="replace">Replace</option>
            </select>
          </label>
          <PrimaryButton
            onClick={() => {
              importAthletes(activeProgram.id, parsed, mode);
              setDone(true);
            }}
          >
            Run import ({parsed.length} rows)
          </PrimaryButton>
          {done ? (
            <span className="text-sm font-semibold text-emerald-700">
              Import applied
            </span>
          ) : null}
        </div>
      </Panel>

      <Panel title="Dry-run preview">
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
            {parsed.map((r, i) => (
              <tr key={i} className="border-b border-[var(--cc-line)]/60">
                <td className="py-1.5">{r.jersey}</td>
                <td className="py-1.5">{r.name}</td>
                <td className="py-1.5">{r.pos}</td>
                <td className="py-1.5">{r.classYear}</td>
                <td className="py-1.5">{r.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
