"use client";

import { useApp } from "@/context/AppState";
import {
  ARCHIVE_IMPORT_CATEGORY_META,
  archiveHasCategoryContent,
  liveHasCategoryContent,
  type ArchiveImportCategory,
  type ArchiveImportMode,
} from "@/lib/seasonArchive";
import { canImportFromArchive, sideLabel } from "@/lib/permissions";
import type { Side } from "@/lib/types";
import { useMemo, useState } from "react";

const ALL_CATEGORIES = Object.keys(
  ARCHIVE_IMPORT_CATEGORY_META,
) as ArchiveImportCategory[];

export function ImportFromArchiveButton({
  presetCategories,
  sideScope = "current",
  label = "Add from archive",
  className = "",
}: {
  /** Pre-select these categories when opening (e.g. contextual screens). */
  presetCategories?: ArchiveImportCategory[];
  /** `current` locks side filter to the active unit; `all` lets admin choose. */
  sideScope?: "current" | "all";
  label?: string;
  className?: string;
}) {
  const { role, isArchiveMode, archivedSeasons } = useApp();
  const [open, setOpen] = useState(false);

  if (!canImportFromArchive(role) || isArchiveMode) return null;
  if (archivedSeasons.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
        }
      >
        {label}
      </button>
      {open ? (
        <ImportFromArchiveModal
          presetCategories={presetCategories}
          sideScope={sideScope}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function ImportFromArchiveModal({
  presetCategories,
  sideScope,
  onClose,
}: {
  presetCategories?: ArchiveImportCategory[];
  sideScope: "current" | "all";
  onClose: () => void;
}) {
  const {
    role,
    side,
    archivedSeasons,
    importFromArchivedSeason,
    offenseGoals,
    defenseGoals,
    quizzes,
    getBoard,
    teamNames,
    schemes,
    positionScoutReports,
    gameWeekAssets,
    gameMetaOverrides,
    gradeRows,
    roster,
  } = useApp();

  const defaultSeasonId = archivedSeasons[0]?.id ?? "2025";
  const [seasonId, setSeasonId] = useState(defaultSeasonId);
  const [categories, setCategories] = useState<ArchiveImportCategory[]>(
    () => presetCategories ?? [...ALL_CATEGORIES],
  );
  const [mode, setMode] = useState<ArchiveImportMode>("merge");
  const [sideFilter, setSideFilter] = useState<Side | "all">(() =>
    sideScope === "current" && role === "coordinator" ? side : sideScope === "current" ? side : "all",
  );
  const [status, setStatus] = useState<string | null>(null);

  const arch = archivedSeasons.find((a) => a.id === seasonId);

  const depthBoardsLive = useMemo(() => {
    const out: Record<string, ReturnType<typeof getBoard>> = {};
    for (let ti = 0; ti < teamNames.length; ti++) {
      for (const scheme of schemes) {
        out[`${ti}::${scheme.id}`] = getBoard(ti, scheme.id);
      }
    }
    return out;
  }, [getBoard, teamNames, schemes]);

  const recruitingLive = useMemo(
    () =>
      Object.fromEntries(
        roster.map((a) => [a.id, a.recruitingFields]),
      ) as Record<string, Record<string, string> | undefined>,
    [roster],
  );

  const availableCategories = useMemo(() => {
    if (!arch) return [] as ArchiveImportCategory[];
    return ALL_CATEGORIES.filter((c) => {
      if (role === "coordinator") {
        const meta = ARCHIVE_IMPORT_CATEGORY_META[c];
        // Coordinators: side-scoped items + no schedule-wide / recruiting admin board
        if (c === "scheduleMeta" || c === "recruitingFills") return false;
        if (meta.sideScoped && sideFilter === "specialTeams" && c === "unitGoals")
          return false;
      }
      return archiveHasCategoryContent(arch.snapshot, c, sideFilter);
    });
  }, [arch, role, sideFilter]);

  const conflicts = useMemo(() => {
    return categories.filter((c) =>
      liveHasCategoryContent({
        category: c,
        sideFilter,
        offenseGoals,
        defenseGoals,
        quizzes,
        depthBoards: depthBoardsLive,
        positionScoutReports,
        gameWeekAssets,
        gameMetaOverrides,
        athleteRecruitingFields: recruitingLive,
        gradeRows,
      }),
    );
  }, [
    categories,
    sideFilter,
    offenseGoals,
    defenseGoals,
    quizzes,
    depthBoardsLive,
    positionScoutReports,
    gameWeekAssets,
    gameMetaOverrides,
    recruitingLive,
    gradeRows,
  ]);

  function toggleCategory(c: ArchiveImportCategory) {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  function runImport() {
    const selected = categories.filter((c) => availableCategories.includes(c));
    if (selected.length === 0) {
      setStatus("Select at least one available item.");
      return;
    }
    if (conflicts.length > 0 && mode === "replace") {
      const ok = window.confirm(
        `Replace existing content for: ${conflicts
          .map((c) => ARCHIVE_IMPORT_CATEGORY_META[c].label)
          .join(", ")}?\n\nThis overwrites matching live data.`,
      );
      if (!ok) return;
    } else if (conflicts.length > 0 && mode === "merge") {
      const ok = window.confirm(
        `Live season already has content in: ${conflicts
          .map((c) => ARCHIVE_IMPORT_CATEGORY_META[c].label)
          .join(", ")}.\n\nMerge will add/fill without wiping existing entries. Continue?`,
      );
      if (!ok) return;
    }

    const result = importFromArchivedSeason({
      seasonId,
      categories: selected,
      sideFilter,
      mode,
    });
    setStatus(result.message);
    if (result.ok) {
      window.setTimeout(() => onClose(), 900);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-archive-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--cc-line)] bg-white p-5 shadow-lg">
        <h2
          id="import-archive-title"
          className="text-xl font-bold text-[var(--cc-navy)]"
        >
          Import from archive
        </h2>
        <p className="mt-2 text-sm text-[var(--cc-steel)]">
          Copy templates and last-season content into the current season.
          {role === "coordinator"
            ? " Coordinators import for their unit only."
            : null}
        </p>

        <label className="mt-4 block text-sm">
          <span className="font-semibold text-[var(--cc-navy)]">Archive</span>
          <select
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
          >
            {archivedSeasons.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        {role === "admin" && sideScope === "all" ? (
          <label className="mt-3 block text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Unit scope</span>
            <select
              value={sideFilter}
              onChange={(e) =>
                setSideFilter(e.target.value as Side | "all")
              }
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              <option value="all">All units</option>
              <option value="offense">{sideLabel("offense")}</option>
              <option value="defense">{sideLabel("defense")}</option>
              <option value="specialTeams">{sideLabel("specialTeams")}</option>
            </select>
          </label>
        ) : (
          <p className="mt-3 text-sm text-[var(--cc-steel)]">
            Scope:{" "}
            <span className="font-semibold text-[var(--cc-navy)]">
              {sideFilter === "all" ? "All units" : sideLabel(sideFilter)}
            </span>
          </p>
        )}

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--cc-navy)]">
            What to import
          </legend>
          <ul className="mt-2 space-y-2">
            {availableCategories.map((c) => {
              const meta = ARCHIVE_IMPORT_CATEGORY_META[c];
              const hasConflict = conflicts.includes(c);
              return (
                <li key={c}>
                  <label className="flex cursor-pointer gap-2 rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm hover:bg-[var(--cc-field)]/40">
                    <input
                      type="checkbox"
                      checked={categories.includes(c)}
                      onChange={() => toggleCategory(c)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-semibold text-[var(--cc-navy)]">
                        {meta.label}
                      </span>
                      {hasConflict ? (
                        <span className="ml-2 text-xs font-semibold text-amber-700">
                          exists in live
                        </span>
                      ) : null}
                      <span className="mt-0.5 block text-xs text-[var(--cc-steel)]">
                        {meta.description}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {availableCategories.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--cc-steel)]">
              No importable content in this archive for the selected scope.
            </p>
          ) : null}
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--cc-navy)]">
            If content already exists
          </legend>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="import-mode"
                checked={mode === "merge"}
                onChange={() => setMode("merge")}
              />
              Merge / fill empty
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="import-mode"
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
              />
              Replace matching
            </label>
          </div>
        </fieldset>

        {status ? (
          <p className="mt-3 text-sm font-semibold text-[var(--cc-navy)]">
            {status}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={runImport}
            className="rounded-lg bg-[var(--cc-navy)] px-3 py-2 text-sm font-semibold text-white"
          >
            Import selected
          </button>
        </div>
      </div>
    </div>
  );
}
