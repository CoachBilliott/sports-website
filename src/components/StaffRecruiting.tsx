"use client";

import {
  abbreviateGrade,
  isRecruitingCoreFieldKey,
  recruitingProfileMainKeys,
  type Athlete,
  type RecruitingSheetColumn,
} from "@/lib/mock";

export function recruitingStoredValue(a: Athlete, key: string): string {
  if (key === "name") {
    const last = a.lastName?.trim() || "";
    const first = a.firstName?.trim() || "";
    if (last && first) return `${last}, ${first}`;
    return a.name;
  }
  if (key === "classYear") return abbreviateGrade(a.classYear);
  if (key === "position") return a.groups.join(", ") || "—";
  if (isRecruitingCoreFieldKey(key)) return a[key] ?? "";
  return a.recruitingFields?.[key] ?? "";
}

export function recruitingValuePatch(
  key: string,
  value: string,
): {
  recruitingFields?: Record<string, string>;
} & Partial<
  Pick<
    Athlete,
    | "jerseyNumber"
    | "height"
    | "weight"
    | "totalGpa"
    | "coreGpa"
    | "actSat"
    | "phone"
    | "email"
    | "twitterHandle"
    | "hudlLink"
  >
> {
  if (isRecruitingCoreFieldKey(key)) {
    return { [key]: value };
  }
  return { recruitingFields: { [key]: value } };
}

export function RecruitingProfileFields({
  athlete,
  canEdit,
  columns,
  onUpdate,
}: {
  athlete: Athlete;
  canEdit: boolean;
  columns: RecruitingSheetColumn[];
  onUpdate: (patch: ReturnType<typeof recruitingValuePatch>) => void;
}) {
  const fields = columns.filter((c) => !recruitingProfileMainKeys.has(c.key));
  if (fields.length === 0) {
    return (
      <p className="text-sm text-[var(--cc-steel)]">
        No recruiting fields on the sheet yet. Add columns from Staff →
        Recruiting.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((col) => {
        const value = recruitingStoredValue(athlete, col.key);
        const wide =
          col.key === "hudlLink" ||
          (col.inputWidth?.includes("w-40") ?? false);
        return (
          <label
            key={col.key}
            className={`text-sm${wide ? " sm:col-span-2" : ""}`}
          >
            <span className="font-semibold text-[var(--cc-navy)]">
              {col.label}
            </span>
            {canEdit ? (
              <input
                value={value}
                onChange={(e) =>
                  onUpdate(recruitingValuePatch(col.key, e.target.value))
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            ) : col.key === "hudlLink" && value ? (
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block break-all font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
              >
                {value}
              </a>
            ) : (
              <p className="mt-1 text-[var(--cc-navy)]">{value || "—"}</p>
            )}
          </label>
        );
      })}
    </div>
  );
}
