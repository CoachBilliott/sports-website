"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { useApp, ROLE_LABEL, ROLE_SHORT } from "@/components/app/AppProvider";
import { Badge, Panel, YesNo } from "@/components/ui";
import {
  DISTRICT_CHAIN,
  PERMISSION_LABELS,
  ROLE_RANK,
  permissionsFor,
  type Permission,
} from "@/lib/data/org";
import type { Role } from "@/lib/data/types";

const MATRIX_PERMS: Permission[] = [
  "manage_district_settings",
  "manage_sso",
  "manage_legal",
  "view_all_campuses",
  "manage_all_campuses",
  "manage_own_campus",
  "manage_members",
  "view_programs",
  "manage_programs",
  "manage_roster",
  "season_roll",
  "export_delete",
  "view_audit",
];

const ALL_ROLES = (Object.keys(ROLE_RANK) as Role[]).sort(
  (a, b) => ROLE_RANK[a] - ROLE_RANK[b],
);

export default function PermissionsPage() {
  const { role, roleLabel, can } = useApp();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Controls"
        description="Permissions follow chain of command. You can only invite and manage roles below you."
      />

      <Panel title={`Signed in as ${roleLabel}`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Use <strong>View as</strong> in the header (DAD/AAD) to preview each
          level. Nav items hide automatically when you lack access.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {MATRIX_PERMS.map((p) => (
            <li key={p}>
              <Badge tone={can(p) ? "good" : "neutral"}>
                {can(p) ? "✓" : "–"} {PERMISSION_LABELS[p]}
              </Badge>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="District leadership ladder">
        <ol className="space-y-2">
          {DISTRICT_CHAIN.map((r, i) => (
            <li
              key={r}
              className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 ${
                role === r
                  ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                  : "border-[var(--cc-line)]"
              }`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cc-navy)] text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-[var(--cc-navy)]">
                  {ROLE_LABEL[r]}{" "}
                  <span className="text-xs font-medium text-[var(--cc-steel)]">
                    ({ROLE_SHORT[r]})
                  </span>
                </p>
                <p className="text-xs text-[var(--cc-steel)]">
                  Rank {ROLE_RANK[r]} · {permissionsFor(r).size} permissions
                </p>
              </div>
              {role === r ? <Badge tone="brand">You</Badge> : null}
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Permission matrix">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-[var(--cc-steel)]">
                <th className="py-2 pr-2">Control</th>
                {ALL_ROLES.filter((r) => ROLE_RANK[r] <= 7).map((r) => (
                  <th key={r} className="px-1 py-2 text-center">
                    {ROLE_SHORT[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_PERMS.map((perm) => (
                <tr key={perm} className="border-b border-[var(--cc-line)]/70">
                  <td className="py-2 pr-2 font-medium text-[var(--cc-navy)]">
                    {PERMISSION_LABELS[perm]}
                  </td>
                  {ALL_ROLES.filter((r) => ROLE_RANK[r] <= 7).map((r) => (
                    <td key={r} className="px-1 py-2 text-center">
                      <YesNo ok={permissionsFor(r).has(perm)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
