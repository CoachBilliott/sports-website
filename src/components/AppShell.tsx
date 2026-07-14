"use client";

import Link from "next/link";
import {
  emptyGameWeekAssets,
  useApp,
  type AttendanceStatus,
  type BrandingConfig,
  type DepthChartPanel,
  type GameWeekAssets,
  type SchemeConfig,
} from "@/context/AppState";
import { PlaybookTool } from "@/components/playbook/PlaybookTool";
import "@/components/playbook/playbook.css";
import {
  athletesForDepthPosition,
  coachStaff,
  coachesOnSide,
  cloneDepthBoard,
  currentGame,
  depthBoards,
  expandCoachGroupsWith,
  games,
  gameSlotLabel,
  gameSlotTitle,
  grades,
  gradClassLabels,
  groupsForDepthPosition,
  migrateGroupAbbreviation,
  myRoomProfile,
  potw,
  quizzes,
  syncDepthBoardRows,
  team,
  teamLevels,
  type Athlete,
  type DepthChartBoard,
  type DepthScheme,
  type GradClass,
  type PersonnelType,
  type PositionType,
  type UnitGoal,
  athleteCustomFieldLabels,
  emptyAthleteCustomFields,
  compareByLastName,
  composeDisplayName,
  findDemoPlayerAthlete,
  findDemoMember,
  positionTypes,
  depthSchemeTypeOptions,
  type DepthColumnDef,
} from "@/lib/mock";
import {
  canAssignCoachGroups,
  canEditContent,
  canEditDepthConfig,
  canEditGameGoals,
  canEditRoster,
  canEditAthleteProfile,
  canOpenAthleteProfile,
  isOwnAccountMember,
  canEditPositionGroups,
  canCreatePlayerAccounts,
  canSeeCoachesRoster,
  canManageStaffRole,
  canManageCoachAdminFields,
  staffRolesActorCanCreate,
  canManageMembers,
  canMoveDepthPlayers,
  canSeeDepthCharts,
  canSeeMyRoom,
  canSeePersonnel,
  canSeeScout,
  canSeeStaffRoom,
  canTakeQuizzes,
  canEditScheduleMeta,
  canSeeAdminMenu,
  adminMenuLabel,
  canAccessAdminPage,
  isMyRoomPage,
  isPersonnelPage,
  isAdminPage,
  isUnitPage,
  myRoomMenuItems,
  adminMenuItems,
  personnelMenuItems,
  programNavForRole,
  roleLabels,
  unitMenuItems,
} from "@/lib/permissions";
import type { AppPage, CoachDuty, Game, GradeRow, Role, Side } from "@/lib/types";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[var(--cc-blue)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--cc-blue)]">
      {children}
    </span>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-[0_1px_0_rgba(10,37,64,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--cc-navy)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function headshotInitials(firstName: string, lastName: string, name: string) {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  if (a || b) return `${a}${b}`.toUpperCase();
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function HeadshotField({
  url,
  fileName,
  initials,
  canEdit,
  onChange,
}: {
  url?: string | null;
  fileName?: string | null;
  initials: string;
  canEdit: boolean;
  onChange: (next: {
    headshotUrl: string | null;
    headshotFileName: string | null;
  }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--cc-line)] bg-[var(--cc-field)] text-xl font-bold text-[var(--cc-navy)]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{initials || "?"}</span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-semibold text-[var(--cc-navy)]">Headshot</p>
        {fileName ? (
          <p className="truncate text-xs text-[var(--cc-steel)]">{fileName}</p>
        ) : (
          <p className="text-xs text-[var(--cc-steel)]">
            {url ? "Photo on file" : "No photo yet"}
          </p>
        )}
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-xs font-semibold text-white">
              Upload photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    onChange({
                      headshotUrl: String(reader.result),
                      headshotFileName: file.name,
                    });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {url ? (
              <button
                type="button"
                onClick={() =>
                  onChange({ headshotUrl: null, headshotFileName: null })
                }
                className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LogoUploadField({
  label,
  url,
  fileName,
  fallbackLetter,
  onChange,
}: {
  label: string;
  url?: string | null;
  fileName?: string | null;
  fallbackLetter: string;
  onChange: (next: {
    url: string | null;
    fileName: string | null;
  }) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3">
      <p className="text-sm font-semibold text-[var(--cc-navy)]">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--cc-line)] bg-white text-lg font-bold text-[var(--cc-navy)]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <span aria-hidden>{fallbackLetter || "?"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {fileName ? (
            <p className="truncate text-xs text-[var(--cc-steel)]">{fileName}</p>
          ) : (
            <p className="text-xs text-[var(--cc-steel)]">
              {url ? "Logo on file" : "No logo yet"}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-xs font-semibold text-white">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    onChange({
                      url: String(reader.result),
                      fileName: file.name,
                    });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {url ? (
              <button
                type="button"
                onClick={() => onChange({ url: null, fileName: null })}
                className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-xs font-semibold text-[var(--cc-navy)] hover:bg-white"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-3 py-2">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide hover:text-[var(--cc-navy)]"
      >
        {label}
        {active ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );
}

function compareSortValues(
  a: string | number,
  b: string | number,
  dir: "asc" | "desc",
) {
  const mul = dir === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * mul;
  }
  const as = String(a).toLowerCase();
  const bs = String(b).toLowerCase();
  if (as < bs) return -1 * mul;
  if (as > bs) return 1 * mul;
  return 0;
}

/** Resolve roster id from display name ("Martinez, J" or "J. Martinez") */
function findAthleteIdByName(roster: Athlete[], name: string): string | null {
  const raw = name.trim();
  if (!raw || raw === "—") return null;
  const q = raw.toLowerCase();
  const exact = roster.find((a) => a.name.toLowerCase() === q);
  if (exact) return exact.id;
  const tokens = q
    .replace(/[.,]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return null;
  const hit = roster.find((a) => {
    const parts = a.name
      .toLowerCase()
      .replace(/[.,]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    return tokens.every((t) =>
      parts.some((p) => p.startsWith(t) || t.startsWith(p)),
    );
  });
  return hit?.id ?? null;
}

function PlayerNameLink({
  id,
  name,
  className = "font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline",
}: {
  id?: string;
  name: string;
  className?: string;
}) {
  const { role, roster, openPlayerSettings } = useApp();
  const resolvedId = id ?? findAthleteIdByName(roster, name);
  const athlete = resolvedId
    ? roster.find((a) => a.id === resolvedId)
    : undefined;
  const canOpen = canOpenAthleteProfile(role, athlete);
  if (!canOpen || !resolvedId) {
    return (
      <span className="font-medium text-[var(--cc-navy)]">{name}</span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openPlayerSettings(resolvedId)}
      className={`text-left ${className}`}
    >
      {name}
    </button>
  );
}

function CoachNameLink({
  id,
  name,
  className = "font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline",
}: {
  id?: string;
  name: string;
  className?: string;
}) {
  const { role, teamMembers, openCoachSettings } = useApp();
  const canOpen = canSeeCoachesRoster(role);
  const resolvedId =
    id ??
    teamMembers.find(
      (m) =>
        (m.role === "coach" ||
          m.role === "coordinator" ||
          m.role === "admin") &&
        m.name.toLowerCase() === name.trim().toLowerCase(),
    )?.id;
  if (!canOpen || !resolvedId) {
    return <span className="font-medium text-[var(--cc-navy)]">{name}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => openCoachSettings(resolvedId)}
      className={`text-left ${className}`}
    >
      {name}
    </button>
  );
}

function PlayerSettingsOverlay() {
  const {
    role,
    roster,
    playerSettingsId,
    closePlayerSettings,
    updateAthlete,
  } = useApp();
  const selected = playerSettingsId
    ? roster.find((a) => a.id === playerSettingsId)
    : undefined;

  if (
    !playerSettingsId ||
    !selected ||
    !canOpenAthleteProfile(role, selected)
  ) {
    return null;
  }

  const canEdit = canEditAthleteProfile(role, selected);
  const fields = {
    ...emptyAthleteCustomFields(),
    ...selected.customFields,
  };
  const showCustomFields =
    (selected.personnelType ?? "athlete") === "athlete";
  const showBodyMetrics = showCustomFields;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 sm:pt-20">
      <div
        className="absolute inset-0"
        onClick={closePlayerSettings}
        aria-hidden
      />
      <div className="relative mb-8 w-full max-w-3xl space-y-4">
        <Panel
          title={`${selected.name} · Settings`}
          action={
            <button
              type="button"
              onClick={closePlayerSettings}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              Close
            </button>
          }
        >
          <p className="text-sm text-[var(--cc-steel)]">
            Player profile settings
            {canEdit
              ? role === "player"
                ? " — you can edit your profile."
                : " — Coach+ can edit."
              : "."}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <HeadshotField
              url={selected.headshotUrl}
              fileName={selected.headshotFileName}
              initials={headshotInitials(
                selected.firstName,
                selected.lastName,
                selected.name,
              )}
              canEdit={canEdit}
              onChange={(next) => updateAthlete(selected.id, next)}
            />
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                First name
              </span>
              {canEdit ? (
                <input
                  value={selected.firstName}
                  onChange={(e) =>
                    updateAthlete(selected.id, { firstName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 font-medium text-[var(--cc-navy)]">
                  {selected.firstName}
                </p>
              )}
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Last name
              </span>
              {canEdit ? (
                <input
                  value={selected.lastName}
                  onChange={(e) =>
                    updateAthlete(selected.id, { lastName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 font-medium text-[var(--cc-navy)]">
                  {selected.lastName}
                </p>
              )}
            </label>
            {showBodyMetrics ? (
              <>
                <label className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Height
                  </span>
                  {canEdit ? (
                    <input
                      value={selected.height ?? ""}
                      onChange={(e) =>
                        updateAthlete(selected.id, { height: e.target.value })
                      }
                      placeholder={`e.g. 6'1"`}
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                    />
                  ) : (
                    <p className="mt-1 text-[var(--cc-navy)]">
                      {selected.height || "—"}
                    </p>
                  )}
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Weight (lbs)
                  </span>
                  {canEdit ? (
                    <input
                      value={selected.weight ?? ""}
                      onChange={(e) =>
                        updateAthlete(selected.id, { weight: e.target.value })
                      }
                      placeholder="e.g. 195"
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                    />
                  ) : (
                    <p className="mt-1 text-[var(--cc-navy)]">
                      {selected.weight || "—"}
                    </p>
                  )}
                </label>
              </>
            ) : null}
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Phone number
              </span>
              {canEdit ? (
                <input
                  value={selected.phone ?? ""}
                  onChange={(e) =>
                    updateAthlete(selected.id, { phone: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-[var(--cc-navy)]">
                  {selected.phone || "—"}
                </p>
              )}
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Email</span>
              {canEdit ? (
                <input
                  value={selected.email ?? ""}
                  onChange={(e) =>
                    updateAthlete(selected.id, { email: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-[var(--cc-navy)]">
                  {selected.email || "—"}
                </p>
              )}
            </label>
          </div>
        </Panel>

        {showCustomFields ? (
          <Panel title="Custom Athlete Fields">
            <div className="grid gap-3 sm:grid-cols-2">
              {athleteCustomFieldLabels.map(({ key, label }) => (
                <label key={key} className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    {label}
                  </span>
                  {canEdit ? (
                    <input
                      value={fields[key]}
                      onChange={(e) =>
                        updateAthlete(selected.id, {
                          customFields: { [key]: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                    />
                  ) : (
                    <p className="mt-1 text-[var(--cc-navy)]">
                      {fields[key] || "—"}
                    </p>
                  )}
                </label>
              ))}
            </div>
          </Panel>
        ) : (
          <Panel title="Profile">
            <p className="text-sm text-[var(--cc-steel)]">
              Equipment and guardian fields apply to athletes only.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}

function CoachSettingsOverlay() {
  const {
    role,
    teamMembers,
    teamNames,
    coachSettingsId,
    closeCoachSettings,
    updateMember,
  } = useApp();
  const selected = coachSettingsId
    ? teamMembers.find((m) => m.id === coachSettingsId)
    : undefined;

  if (
    !coachSettingsId ||
    !selected ||
    !canSeeCoachesRoster(role) ||
    (selected.role !== "coach" &&
      selected.role !== "coordinator" &&
      selected.role !== "admin")
  ) {
    return null;
  }

  const canEditContact =
    canManageStaffRole(role, selected.role) ||
    isOwnAccountMember(role, selected.id) ||
    (role === "admin" && selected.role === "admin");
  const canEditHeadshot = canEditContact || role === "admin";
  const showAdminFields =
    canManageCoachAdminFields(role) &&
    (selected.role === "coach" || selected.role === "coordinator");
  const teams = teamNames.length ? teamNames : [...teamLevels];

  function toggleTeam(t: string) {
    const current = selected!.assignedTeams ?? [];
    const next = current.includes(t)
      ? current.filter((x) => x !== t)
      : [...current, t];
    updateMember(selected!.id, { assignedTeams: next });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-16 sm:pt-20">
      <div
        className="absolute inset-0"
        onClick={closeCoachSettings}
        aria-hidden
      />
      <div className="relative mb-8 w-full max-w-3xl space-y-4">
        <Panel
          title={`${selected.name} · ${selected.role === "admin" ? "Admin" : "Coach"} profile`}
          action={
            <button
              type="button"
              onClick={closeCoachSettings}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              Close
            </button>
          }
        >
          <p className="text-sm text-[var(--cc-steel)]">
            {selected.role === "admin"
              ? "Admin profile — headshot and contact."
              : showAdminFields
                ? "Admin view — contact plus teams, duties, notes, and athletic period."
                : "Staff contact — name, number, and email."}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <HeadshotField
              url={selected.headshotUrl}
              fileName={selected.headshotFileName}
              initials={headshotInitials(
                selected.firstName,
                selected.lastName,
                selected.name,
              )}
              canEdit={canEditHeadshot}
              onChange={(next) => updateMember(selected.id, next)}
            />
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                First name
              </span>
              {canEditContact ? (
                <input
                  value={selected.firstName}
                  onChange={(e) =>
                    updateMember(selected.id, { firstName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 font-medium text-[var(--cc-navy)]">
                  {selected.firstName}
                </p>
              )}
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Last name
              </span>
              {canEditContact ? (
                <input
                  value={selected.lastName}
                  onChange={(e) =>
                    updateMember(selected.id, { lastName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 font-medium text-[var(--cc-navy)]">
                  {selected.lastName}
                </p>
              )}
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Number</span>
              {canEditContact ? (
                <input
                  value={selected.phone ?? ""}
                  onChange={(e) =>
                    updateMember(selected.id, { phone: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-[var(--cc-navy)]">
                  {selected.phone || "—"}
                </p>
              )}
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Email</span>
              {canEditContact ? (
                <input
                  value={selected.email ?? ""}
                  onChange={(e) =>
                    updateMember(selected.id, { email: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-[var(--cc-navy)]">
                  {selected.email || "—"}
                </p>
              )}
            </label>
            <p className="text-sm text-[var(--cc-steel)] sm:col-span-2">
              Role · {roleLabels[selected.role]}
            </p>
          </div>
        </Panel>

        {showAdminFields ? (
          <Panel title="Admin staff details">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[var(--cc-navy)]">
                  Teams
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teams.map((t) => {
                    const on = (selected.assignedTeams ?? []).includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTeam(t)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          on
                            ? "bg-[var(--cc-blue)] text-white"
                            : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="block text-sm">
                <span className="font-semibold text-[var(--cc-navy)]">
                  Duties
                </span>
                <input
                  value={selected.duties ?? ""}
                  onChange={(e) =>
                    updateMember(selected.id, { duties: e.target.value })
                  }
                  placeholder="e.g. DL, special teams"
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-[var(--cc-navy)]">
                  Athletic period
                </span>
                <input
                  value={selected.athleticPeriod ?? ""}
                  onChange={(e) =>
                    updateMember(selected.id, {
                      athleticPeriod: e.target.value,
                    })
                  }
                  placeholder="e.g. 7th period"
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-[var(--cc-navy)]">Notes</span>
                <textarea
                  value={selected.notes ?? ""}
                  onChange={(e) =>
                    updateMember(selected.id, { notes: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              </label>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

function AccountScreen() {
  const {
    role,
    roster,
    teamMembers,
    teamNames,
    updateAthlete,
    updateMember,
  } = useApp();
  const member = findDemoMember(teamMembers, role);
  const athlete =
    role === "player" ? findDemoPlayerAthlete(roster) : undefined;
  const teams = teamNames.length ? teamNames : [...teamLevels];
  const showStaffDetails =
    role === "coach" || role === "coordinator" || role === "admin";
  const canEditStaffDetails = canManageCoachAdminFields(role);

  if (!member && !athlete) {
    return (
      <Panel title="Account">
        <p className="text-sm text-[var(--cc-steel)]">
          No account profile is linked for this role yet.
        </p>
      </Panel>
    );
  }

  function syncMemberFromAthlete(
    patch: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      headshotUrl: string | null;
      headshotFileName: string | null;
    }>,
  ) {
    if (!member || !athlete) return;
    updateMember(member.id, patch);
  }

  return (
    <div className="space-y-4">
      <Panel title="Account">
        <p className="text-sm text-[var(--cc-steel)]">
          Your profile — edit your own settings anytime.
        </p>
        <p className="mt-1 text-sm text-[var(--cc-steel)]">
          Role · {roleLabels[role]}
        </p>

        {athlete ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <HeadshotField
              url={athlete.headshotUrl}
              fileName={athlete.headshotFileName}
              initials={headshotInitials(
                athlete.firstName,
                athlete.lastName,
                athlete.name,
              )}
              canEdit
              onChange={(next) => {
                updateAthlete(athlete.id, next);
                syncMemberFromAthlete(next);
              }}
            />
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                First name
              </span>
              <input
                value={athlete.firstName}
                onChange={(e) => {
                  const firstName = e.target.value;
                  updateAthlete(athlete.id, { firstName });
                  syncMemberFromAthlete({ firstName });
                }}
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Last name
              </span>
              <input
                value={athlete.lastName}
                onChange={(e) => {
                  const lastName = e.target.value;
                  updateAthlete(athlete.id, { lastName });
                  syncMemberFromAthlete({ lastName });
                }}
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Height</span>
              <input
                value={athlete.height ?? ""}
                onChange={(e) =>
                  updateAthlete(athlete.id, { height: e.target.value })
                }
                placeholder={`e.g. 6'1"`}
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Weight (lbs)
              </span>
              <input
                value={athlete.weight ?? ""}
                onChange={(e) =>
                  updateAthlete(athlete.id, { weight: e.target.value })
                }
                placeholder="e.g. 195"
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Phone number
              </span>
              <input
                value={athlete.phone ?? ""}
                onChange={(e) => {
                  const phone = e.target.value;
                  updateAthlete(athlete.id, { phone });
                  syncMemberFromAthlete({ phone });
                }}
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Email</span>
              <input
                value={athlete.email ?? ""}
                onChange={(e) => {
                  const email = e.target.value;
                  updateAthlete(athlete.id, { email });
                  syncMemberFromAthlete({ email });
                }}
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
          </div>
        ) : member ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <HeadshotField
              url={member.headshotUrl}
              fileName={member.headshotFileName}
              initials={headshotInitials(
                member.firstName,
                member.lastName,
                member.name,
              )}
              canEdit
              onChange={(next) => updateMember(member.id, next)}
            />
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                First name
              </span>
              <input
                value={member.firstName}
                onChange={(e) =>
                  updateMember(member.id, { firstName: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Last name
              </span>
              <input
                value={member.lastName}
                onChange={(e) =>
                  updateMember(member.id, { lastName: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Phone number
              </span>
              <input
                value={member.phone ?? ""}
                onChange={(e) =>
                  updateMember(member.id, { phone: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Email</span>
              <input
                value={member.email ?? ""}
                onChange={(e) =>
                  updateMember(member.id, { email: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
          </div>
        ) : null}
      </Panel>

      {athlete ? (
        <Panel title="Athlete fields">
          <div className="grid gap-3 sm:grid-cols-2">
            {athleteCustomFieldLabels.map(({ key, label }) => {
              const fields = {
                ...emptyAthleteCustomFields(),
                ...athlete.customFields,
              };
              return (
                <label key={key} className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    {label}
                  </span>
                  <input
                    value={fields[key]}
                    onChange={(e) =>
                      updateAthlete(athlete.id, {
                        customFields: { [key]: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                  />
                </label>
              );
            })}
          </div>
        </Panel>
      ) : null}

      {member && showStaffDetails ? (
        <Panel title="Staff details">
          {!canEditStaffDetails ? (
            <p className="mb-3 text-sm text-[var(--cc-steel)]">
              Only Admin can edit teams, duties, athletic period, and notes.
            </p>
          ) : null}
          <div className="space-y-3">
            {role === "coach" || role === "coordinator" ? (
              <div>
                <p className="text-sm font-semibold text-[var(--cc-navy)]">
                  Teams
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teams.map((t) => {
                    const on = (member.assignedTeams ?? []).includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={!canEditStaffDetails}
                        onClick={() => {
                          if (!canEditStaffDetails) return;
                          const current = member.assignedTeams ?? [];
                          const next = current.includes(t)
                            ? current.filter((x) => x !== t)
                            : [...current, t];
                          updateMember(member.id, { assignedTeams: next });
                        }}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          on
                            ? "bg-[var(--cc-blue)] text-white"
                            : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                        } ${!canEditStaffDetails ? "cursor-default opacity-90" : ""}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <label className="block text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Duties</span>
              {canEditStaffDetails ? (
                <input
                  value={member.duties ?? ""}
                  onChange={(e) =>
                    updateMember(member.id, { duties: e.target.value })
                  }
                  placeholder="e.g. DL, special teams"
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-[var(--cc-navy)]">
                  {member.duties || "—"}
                </p>
              )}
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Athletic period
              </span>
              {canEditStaffDetails ? (
                <input
                  value={member.athleticPeriod ?? ""}
                  onChange={(e) =>
                    updateMember(member.id, { athleticPeriod: e.target.value })
                  }
                  placeholder="e.g. 7th period"
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 text-[var(--cc-navy)]">
                  {member.athleticPeriod || "—"}
                </p>
              )}
            </label>
            <label className="block text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Notes</span>
              {canEditStaffDetails ? (
                <textarea
                  value={member.notes ?? ""}
                  onChange={(e) =>
                    updateMember(member.id, { notes: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                />
              ) : (
                <p className="mt-1 whitespace-pre-wrap text-[var(--cc-navy)]">
                  {member.notes || "—"}
                </p>
              )}
            </label>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function ThisWeekScreen() {
  const { role, side, setPage, defenseGoals, offenseGoals } = useApp();
  const parentLimited = role === "parent";
  const sideGoals = side === "defense" ? defenseGoals : offenseGoals;

  return (
    <div className="space-y-4">
      <Panel title="This Week's Opponent">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--cc-steel)] text-lg font-bold text-white">
            MR
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--cc-blue)]">
              Week {currentGame.week} · Fall Camp
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--cc-navy)]">
              vs {currentGame.opponent}
            </h3>
            <p className="mt-1 text-[var(--cc-steel)]">
              {currentGame.date} · {currentGame.time} · {currentGame.homeAway} ·{" "}
              {currentGame.venue}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!parentLimited && canSeeScout(role) && (
                <button
                  type="button"
                  onClick={() => setPage("scout")}
                  className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
                >
                  Open scout
                </button>
              )}
              <button
                type="button"
                onClick={() => setPage("schedule")}
                className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)]"
              >
                Full schedule
              </button>
              <a
                href={team.maxPrepsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)]"
              >
                MaxPreps ↗
              </a>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {!parentLimited && (
          <Panel title={`${side === "defense" ? "Defense" : "Offense"} focus`}>
            <ul className="space-y-2 text-sm text-[var(--cc-steel)]">
              <li>
                <strong className="text-[var(--cc-navy)]">Install:</strong>{" "}
                {side === "defense" ? "#1 Foundation — Tite front" : "#1 Base run game"}
              </li>
              <li>
                <strong className="text-[var(--cc-navy)]">Quiz:</strong>{" "}
                {quizzes.find((q) => q.side === side)?.title ?? "None"} · due{" "}
                {quizzes.find((q) => q.side === side)?.due}
              </li>
              <li>
                <strong className="text-[var(--cc-navy)]">Scout:</strong>{" "}
                {canSeeScout(role)
                  ? "Report upload ready for Week 1"
                  : "Hidden for this role"}
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPage("teach-install")}
                className="text-sm font-semibold text-[var(--cc-blue)]"
              >
                View install →
              </button>
              {canTakeQuizzes(role) && (
                <button
                  type="button"
                  onClick={() => setPage("quizzes")}
                  className="text-sm font-semibold text-[var(--cc-blue)]"
                >
                  Take quiz →
                </button>
              )}
            </div>
          </Panel>
        )}

        <Panel title="Players of the Week">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {(
              [
                ["Varsity D", potw.varsity],
                ["Scout", potw.scout],
                ["JV", potw.jv],
                ["Freshmen", potw.freshmen],
              ] as const
            ).map(([label, name]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3"
              >
                <p className="text-xs uppercase tracking-wide text-[var(--cc-steel)]">
                  {label}
                </p>
                <p className="mt-1 font-semibold text-[var(--cc-navy)]">{name}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {role !== "parent" && (
        <Panel
          title={
            side === "defense"
              ? "Defensive Game Goals"
              : "Offensive Game Goals"
          }
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {sideGoals.map((g) => (
              <li
                key={g.id}
                className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm text-[var(--cc-navy)]"
              >
                {g.text}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function LinkChip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-xs font-semibold text-[var(--cc-blue)] hover:bg-[var(--cc-field)]"
    >
      {children}
    </a>
  );
}

function FileSlot({
  label,
  fileName,
  canEdit,
  onPick,
  compact = false,
  folderHint,
  onOpenFolder,
}: {
  label: string;
  fileName: string | null;
  canEdit: boolean;
  onPick: (name: string | null) => void;
  compact?: boolean;
  /** Where this file lives in Offense / Defense menus */
  folderHint?: string;
  onOpenFolder?: () => void;
}) {
  if (compact) {
    return (
      <div className="inline-flex max-w-full flex-col gap-0.5">
        <div className="inline-flex max-w-full items-center gap-2 rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
            {label}
          </span>
          <span className="max-w-[10rem] truncate text-sm text-[var(--cc-navy)] sm:max-w-[14rem]">
            {fileName ? fileName : "None"}
          </span>
          {canEdit ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <label className="cursor-pointer rounded-md bg-[var(--cc-blue)] px-2 py-0.5 text-xs font-semibold text-white">
                Upload
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    onPick(file?.name ?? null);
                  }}
                />
              </label>
              {fileName ? (
                <button
                  type="button"
                  onClick={() => onPick(null)}
                  className="rounded-md border border-[var(--cc-line)] px-2 py-0.5 text-xs font-semibold text-red-700"
                >
                  Clear
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        {folderHint && onOpenFolder ? (
          <button
            type="button"
            onClick={onOpenFolder}
            className="self-start text-[10px] font-semibold text-[var(--cc-blue)] hover:underline"
          >
            {fileName ? `In ${folderHint} →` : `Goes to ${folderHint} →`}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[var(--cc-navy)]">
        {fileName ? fileName : "Nothing uploaded yet"}
      </p>
      {folderHint ? (
        <p className="mt-1 text-xs text-[var(--cc-steel)]">
          Synced with Schedule · {folderHint}
        </p>
      ) : null}
      {canEdit ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-md bg-[var(--cc-blue)] px-2.5 py-1 text-xs font-semibold text-white">
            Upload
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                onPick(file?.name ?? null);
              }}
            />
          </label>
          {fileName ? (
            <button
              type="button"
              onClick={() => onPick(null)}
              className="rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1 text-xs font-semibold text-red-700"
            >
              Clear
            </button>
          ) : null}
          {onOpenFolder ? (
            <button
              type="button"
              onClick={onOpenFolder}
              className="rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--cc-blue)]"
            >
              Open folder
            </button>
          ) : null}
        </div>
      ) : onOpenFolder ? (
        <button
          type="button"
          onClick={onOpenFolder}
          className="mt-2 text-xs font-semibold text-[var(--cc-blue)] hover:underline"
        >
          Open folder →
        </button>
      ) : null}
    </div>
  );
}

/** Grouped card on Schedule — one title, then compact Offense / Defense (or day) uploads. */
function ScheduleBundle({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)] px-3 py-2">
      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--cc-navy)]">
        {title}
      </h3>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

type PracticeDayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

const ALL_PRACTICE_DAYS: {
  key: PracticeDayKey;
  label: string;
  short: string;
  offense: keyof GameWeekAssets;
  defense: keyof GameWeekAssets;
}[] = [
  {
    key: "Mon",
    label: "Monday",
    short: "Mon",
    offense: "offensePracticeMon",
    defense: "defensePracticeMon",
  },
  {
    key: "Tue",
    label: "Tuesday",
    short: "Tue",
    offense: "offensePracticeTue",
    defense: "defensePracticeTue",
  },
  {
    key: "Wed",
    label: "Wednesday",
    short: "Wed",
    offense: "offensePracticeWed",
    defense: "defensePracticeWed",
  },
  {
    key: "Thu",
    label: "Thursday",
    short: "Thu",
    offense: "offensePracticeThu",
    defense: "defensePracticeThu",
  },
  {
    key: "Fri",
    label: "Friday",
    short: "Fri",
    offense: "offensePracticeFri",
    defense: "defensePracticeFri",
  },
  {
    key: "Sat",
    label: "Saturday",
    short: "Sat",
    offense: "offensePracticeSat",
    defense: "defensePracticeSat",
  },
];

/** Practice days = Monday through the day before kickoff (preseason = Mon–Sat). */
function practiceDaysBeforeGame(date: string, kind?: Game["kind"]) {
  if (kind === "two-a-days" || kind === "scrimmage") {
    return ALL_PRACTICE_DAYS;
  }
  const day = date.split(",")[0]?.trim().toLowerCase() ?? "";
  const countByGameDay: Record<string, number> = {
    thu: 3,
    thursday: 3,
    fri: 4,
    friday: 4,
    sat: 5,
    saturday: 5,
  };
  const count = countByGameDay[day] ?? 4;
  return ALL_PRACTICE_DAYS.slice(0, count);
}

function mergeGameMeta(
  g: Game,
  overrides: Record<
    string,
    {
      opponent?: string;
      date?: string;
      time?: string;
      venue?: string;
      homeAway?: "Home" | "Away";
    }
  >,
): Game {
  const o = overrides[g.id];
  if (!o) return g;
  return {
    ...g,
    opponent: o.opponent ?? g.opponent,
    date: o.date ?? g.date,
    time: o.time ?? g.time,
    venue: o.venue ?? g.venue,
    homeAway: o.homeAway ?? g.homeAway,
  };
}

function visibleScheduleGames(disabledOptionalGames: Record<string, boolean>) {
  return games.filter((g) => !(g.optional && disabledOptionalGames[g.id]));
}

/** Schedule weeks as accordions — header only, no MaxPreps / full schedule extras. */
function WeekSections({
  title,
  blurb,
  gameFilter,
  children,
}: {
  title: string;
  blurb?: React.ReactNode;
  gameFilter?: (game: Game) => boolean;
  children: (game: Game) => React.ReactNode;
}) {
  const { gameMetaOverrides, disabledOptionalGames } = useApp();
  const visibleGames = useMemo(
    () =>
      visibleScheduleGames(disabledOptionalGames).filter((g) =>
        gameFilter ? gameFilter(g) : true,
      ),
    [disabledOptionalGames, gameFilter],
  );
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (visibleGames.length === 0) {
      setOpenId(null);
      return;
    }
    // Drop selection only if that week was removed; allow all closed.
    if (openId && !visibleGames.some((g) => g.id === openId)) {
      setOpenId(null);
    }
  }, [visibleGames, openId]);

  return (
    <div className="space-y-4">
      <Panel title={title}>
        {blurb ? (
          <p className="text-sm text-[var(--cc-steel)]">{blurb}</p>
        ) : null}
      </Panel>
      <div className="space-y-3">
        {visibleGames.map((base) => {
          const g = mergeGameMeta(base, gameMetaOverrides);
          const open = openId === g.id;
          return (
            <section
              key={g.id}
              className="overflow-hidden rounded-xl border border-[var(--cc-line)] bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : g.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[var(--cc-field)]/60"
              >
                <OpponentLogo src={g.logo} alt={g.opponent} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-blue)]">
                    {gameSlotLabel(g)}
                  </p>
                  <p className="truncate text-base font-bold text-[var(--cc-navy)]">
                    {gameSlotTitle(g)}
                  </p>
                  <p className="text-sm text-[var(--cc-steel)]">
                    {g.date} · {g.homeAway}
                    {g.venue ? ` · ${g.venue}` : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--cc-steel)]">
                  {open ? "Hide ▴" : "Open ▾"}
                </span>
              </button>
              {open ? (
                <div className="border-t border-[var(--cc-line)] px-3 py-4">
                  {children(g)}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleScreen() {
  const {
    role,
    season,
    gameWeekAssets,
    setGameWeekAsset,
    gameMetaOverrides,
    disabledOptionalGames,
    setSide,
    setPage,
    branding,
  } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const canEdit = canEditContent(role);
  const canScout = canSeeScout(role);
  const visibleGames = visibleScheduleGames(disabledOptionalGames);

  useEffect(() => {
    if (visibleGames.length === 0) {
      setOpenId(null);
      return;
    }
    if (openId && !visibleGames.some((g) => g.id === openId)) {
      setOpenId(null);
    }
  }, [visibleGames, openId]);

  function openFolder(unit: Side, page: AppPage) {
    setSide(unit);
    setPage(page);
  }

  return (
    <div className="space-y-4">
      <Panel
        title={`${season} Schedule`}
        action={
          <a
            href={branding.maxPrepsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
          >
            Our MaxPreps ↗
          </a>
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Uploads here sync straight into the matching Offense / Defense folder
          for that week (scout, call sheet, stats, practice). Event details and
          optional weeks are managed in{" "}
          <span className="font-semibold">
            {role === "admin"
              ? "Admin"
              : role === "coordinator"
                ? "Controls"
                : "Admin / Controls"}{" "}
            → Schedule
          </span>{" "}
          and sync to Schedule, Grades, Stats, Scout, Call Sheets, Practice
          Plans, and Quizzes.
        </p>
      </Panel>

      <div className="space-y-3">
        {visibleGames.map((base) => {
          const g = mergeGameMeta(base, gameMetaOverrides);
          const open = openId === g.id;
          const practiceDays = practiceDaysBeforeGame(g.date, g.kind);
          const practiceRange =
            practiceDays.length === 1
              ? practiceDays[0].short
              : `${practiceDays[0].short}–${practiceDays[practiceDays.length - 1].short}`;
          const assets = gameWeekAssets[g.id] ?? emptyGameWeekAssets();
          return (
            <section
              key={g.id}
              className="overflow-hidden rounded-xl border border-[var(--cc-line)] bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : g.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[var(--cc-field)]/60"
              >
                <img
                  src={g.logo}
                  alt={`${g.opponent} logo`}
                  className="h-12 w-12 rounded-full border border-[var(--cc-line)] bg-white object-contain p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-blue)]">
                    {gameSlotLabel(g)}
                  </p>
                  <p className="truncate text-base font-bold text-[var(--cc-navy)]">
                    {gameSlotTitle(g)}
                  </p>
                  <p className="text-sm text-[var(--cc-steel)]">
                    {g.date} · {g.time} · {g.homeAway} · {g.venue}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--cc-steel)]">
                  {open ? "Close ▴" : "Open ▾"}
                </span>
              </button>

              {open ? (
                <div className="space-y-3 border-t border-[var(--cc-line)] px-3 py-4">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <ScheduleBundle title={`Links — ${season}`}>
                      <div className="flex flex-wrap gap-2">
                        <LinkChip href={g.links2026.schedule}>
                          Schedule
                        </LinkChip>
                        <LinkChip href={g.links2026.roster}>Roster</LinkChip>
                        <LinkChip href={g.links2026.stats}>Stats</LinkChip>
                        <LinkChip href={g.dctfUrl}>DCTF</LinkChip>
                      </div>
                    </ScheduleBundle>

                    <ScheduleBundle title="2025 Season (MaxPreps)">
                      <div className="flex flex-wrap gap-2">
                        <LinkChip href={g.links2025.schedule}>
                          Schedule
                        </LinkChip>
                        <LinkChip href={g.links2025.roster}>Roster</LinkChip>
                        <LinkChip href={g.links2025.stats}>Stats</LinkChip>
                      </div>
                    </ScheduleBundle>
                  </div>

                  {canScout || canEdit ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {canScout ? (
                        <ScheduleBundle title="Scouting reports">
                          <div className="flex flex-wrap gap-1.5">
                            <FileSlot
                              compact
                              label="Offense"
                              fileName={assets.offenseScout}
                              canEdit={canEdit}
                              folderHint="Offense · Scouting"
                              onOpenFolder={() => openFolder("offense", "scout")}
                              onPick={(name) =>
                                setGameWeekAsset(g.id, "offenseScout", name)
                              }
                            />
                            <FileSlot
                              compact
                              label="Defense"
                              fileName={assets.defenseScout}
                              canEdit={canEdit}
                              folderHint="Defense · Scouting"
                              onOpenFolder={() => openFolder("defense", "scout")}
                              onPick={(name) =>
                                setGameWeekAsset(g.id, "defenseScout", name)
                              }
                            />
                          </div>
                        </ScheduleBundle>
                      ) : null}

                      {canEdit || canScout ? (
                        <ScheduleBundle title="Game-day call sheets">
                          <div className="flex flex-wrap gap-1.5">
                            <FileSlot
                              compact
                              label="Offense"
                              fileName={assets.offenseCallSheet}
                              canEdit={canEdit}
                              folderHint="Offense · Call Sheet"
                              onOpenFolder={() =>
                                openFolder("offense", "teach-call-sheet")
                              }
                              onPick={(name) =>
                                setGameWeekAsset(g.id, "offenseCallSheet", name)
                              }
                            />
                            <FileSlot
                              compact
                              label="Defense"
                              fileName={assets.defenseCallSheet}
                              canEdit={canEdit}
                              folderHint="Defense · Call Sheet"
                              onOpenFolder={() =>
                                openFolder("defense", "teach-call-sheet")
                              }
                              onPick={(name) =>
                                setGameWeekAsset(g.id, "defenseCallSheet", name)
                              }
                            />
                          </div>
                        </ScheduleBundle>
                      ) : null}

                      {canEdit || canScout ? (
                        <ScheduleBundle title="Stat sheets">
                          <div className="flex flex-wrap gap-1.5">
                            <FileSlot
                              compact
                              label="Offense"
                              fileName={assets.offenseStats}
                              canEdit={canEdit}
                              folderHint="Offense · Stats"
                              onOpenFolder={() => openFolder("offense", "stats")}
                              onPick={(name) =>
                                setGameWeekAsset(g.id, "offenseStats", name)
                              }
                            />
                            <FileSlot
                              compact
                              label="Defense"
                              fileName={assets.defenseStats}
                              canEdit={canEdit}
                              folderHint="Defense · Stats"
                              onOpenFolder={() => openFolder("defense", "stats")}
                              onPick={(name) =>
                                setGameWeekAsset(g.id, "defenseStats", name)
                              }
                            />
                          </div>
                        </ScheduleBundle>
                      ) : null}
                    </div>
                  ) : null}

                  {canEdit || canScout ? (
                    <ScheduleBundle title={`Practice plans · ${practiceRange}`}>
                      <div className="mb-1.5 flex flex-wrap gap-3 text-[10px] font-semibold text-[var(--cc-blue)]">
                        <button
                          type="button"
                          onClick={() => openFolder("offense", "teach-practice")}
                          className="hover:underline"
                        >
                          → Offense · Practice
                        </button>
                        <button
                          type="button"
                          onClick={() => openFolder("defense", "teach-practice")}
                          className="hover:underline"
                        >
                          → Defense · Practice
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {practiceDays.map((day) => (
                          <div
                            key={day.key}
                            className="flex flex-wrap items-center gap-1.5"
                          >
                            <span className="w-8 shrink-0 text-[11px] font-bold uppercase tracking-wide text-[var(--cc-steel)]">
                              {day.short}
                            </span>
                            <FileSlot
                              compact
                              label="O"
                              fileName={assets[day.offense]}
                              canEdit={canEdit}
                              onPick={(name) =>
                                setGameWeekAsset(g.id, day.offense, name)
                              }
                            />
                            <FileSlot
                              compact
                              label="D"
                              fileName={assets[day.defense]}
                              canEdit={canEdit}
                              onPick={(name) =>
                                setGameWeekAsset(g.id, day.defense, name)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </ScheduleBundle>
                  ) : null}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function QuizzesScreen() {
  const { role, side } = useApp();
  const unitLabel = side === "defense" ? "Defense" : "Offense";

  if (!canTakeQuizzes(role) && role === "parent") {
    return (
      <Panel title={`${unitLabel} · Weekly Quizzes`}>
        <p className="mb-4 text-sm text-[var(--cc-steel)]">
          Completion summary only — no question content.
        </p>
        <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4 text-sm">
          <p className="font-semibold text-[var(--cc-navy)]">Child quiz summary</p>
          <p className="mt-1 text-[var(--cc-steel)]">
            Week 1 Defense Scout — Not started · Due Mon Aug 25
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <WeekSections
      title={`${unitLabel} · Weekly Quizzes`}
      blurb="Built from that week's scout + install. Passing score default 80%."
    >
      {(g) => {
        const weekQuizzes = quizzes.filter(
          (q) => q.side === side && q.week === g.week,
        );
        if (weekQuizzes.length === 0) {
          return (
            <div className="space-y-3">
              <p className="text-sm text-[var(--cc-steel)]">
                No quiz assigned for Week {g.week} yet.
              </p>
              {canEditContent(role) ? (
                <button
                  type="button"
                  className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
                >
                  Create quiz
                </button>
              ) : null}
            </div>
          );
        }
        return (
          <div className="space-y-3">
            {weekQuizzes.map((q) => (
              <div
                key={q.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cc-line)] p-4"
              >
                <div>
                  <p className="font-semibold text-[var(--cc-navy)]">{q.title}</p>
                  <p className="mt-1 text-sm text-[var(--cc-steel)]">
                    Due {q.due} · Groups: {q.assignedGroups.join(", ")} · Pass{" "}
                    {q.passingScore}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Chip>{q.status}</Chip>
                  {canEditContent(role) ? (
                    <button
                      type="button"
                      className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold"
                    >
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
                  >
                    {role === "player" ? "Take quiz" : "Preview"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      }}
    </WeekSections>
  );
}

function GroupsScreen() {
  const {
    side,
    role,
    coachAssignments,
    setCoachOnGroup,
    roster,
    positionGroups,
  } = useApp();
  const groups = positionGroups.filter((p) =>
    side === "defense" ? p.type === "Defense" : p.type === "Offense",
  );
  const canAssign = canAssignCoachGroups(role);
  const sideCoaches = coachesOnSide(side);

  return (
    <div className="space-y-4">
      <Panel title="Program · Groups">
        <p className="mb-4 text-sm text-[var(--cc-steel)]">
          Players assigned here control who shows up when filling a depth-chart
          square for that position. Switch Offense / Defense in the header to
          view each side.
          {canAssign
            ? " Admins and coordinators assign coaches to each group below."
            : ""}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((pos) => {
            const g = pos.abbreviation;
            const inGroup = roster
              .filter((a) => a.groups.includes(g))
              .slice()
              .sort(compareByLastName);
            const assignedIds = coachAssignments[g] ?? [];
            const assignedCoaches = assignedIds
              .map((id) => coachStaff.find((c) => c.id === id))
              .filter(Boolean);

            return (
              <div
                key={pos.id}
                className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4"
              >
                <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--cc-blue)]">
                  {pos.name}
                </p>
                <p className="text-sm font-semibold text-[var(--cc-navy)]">
                  {g}
                </p>
                <p className="mt-2 text-sm text-[var(--cc-steel)]">
                  {inGroup.length} player{inGroup.length === 1 ? "" : "s"}
                </p>
                <ul className="mt-2 max-h-28 space-y-0.5 overflow-y-auto text-xs text-[var(--cc-navy)]">
                  {inGroup.map((a) => (
                    <li key={a.id}>
                      <PlayerNameLink
                        id={a.id}
                        name={a.name}
                        className="font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
                      />{" "}
                      <span className="text-[var(--cc-steel)]">
                        · {a.classYear}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 border-t border-[var(--cc-line)] pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
                    Coach assignment
                  </p>
                  {assignedCoaches.length === 0 ? (
                    <p className="mt-1 text-xs text-[var(--cc-steel)]">
                      No coach assigned
                    </p>
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {assignedCoaches.map((c) => (
                        <Chip key={c!.id}>
                          <CoachNameLink
                            name={c!.name}
                            className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                          />
                        </Chip>
                      ))}
                    </div>
                  )}

                  {canAssign ? (
                    <div className="mt-2 space-y-1.5">
                      {sideCoaches.map((coach) => {
                        const checked = assignedIds.includes(coach.id);
                        return (
                          <label
                            key={coach.id}
                            className="flex cursor-pointer items-center gap-2 text-sm text-[var(--cc-navy)]"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setCoachOnGroup(
                                  g,
                                  coach.id,
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 accent-[var(--cc-blue)]"
                            />
                            {coach.name}
                          </label>
                        );
                      })}
                      {sideCoaches.length === 0 ? (
                        <p className="text-xs text-[var(--cc-steel)]">
                          No coaches on this side yet.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function StaffScreen() {
  const { role, coachAssignments, coachDutiesList } = useApp();
  if (!canSeeStaffRoom(role)) {
    return (
      <Panel title="Staff">
        <p className="text-sm text-[var(--cc-steel)]">
          Staff room is for coaches only.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="Coach responsibilities">
      <p className="mb-4 text-sm text-[var(--cc-steel)]">
        Season-scoped duties. Admins and coordinators manage these under{" "}
        <span className="font-semibold">Controls → Coaches Responsibilities</span>.
      </p>
      <div className="space-y-3">
        {coachDutiesList.map((d) => {
          const staff = coachStaff.find((c) => c.name === d.coach);
          const liveGroups = staff
            ? Object.entries(coachAssignments)
                .filter(([, ids]) => ids.includes(staff.id))
                .map(([g]) => g)
            : d.groups;

          return (
            <div
              key={d.id}
              className="rounded-xl border border-[var(--cc-line)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[var(--cc-navy)]">{d.coach}</h3>
                <Chip>{d.side}</Chip>
                <Chip>
                  {(liveGroups.length ? liveGroups : d.groups).join(", ") ||
                    "Unassigned"}
                </Chip>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--cc-steel)]">
                {d.duties.map((x) => (
                  <li
                    key={x.id}
                    className="flex flex-wrap items-baseline justify-between gap-2"
                  >
                    <span>· {x.text}</span>
                    {x.dueBy ? (
                      <span className="text-xs font-semibold text-[var(--cc-navy)]">
                        Due {x.dueBy}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {d.notes ? (
                <p className="mt-2 text-sm text-[var(--cc-navy)]">{d.notes}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function AdminStaffScreen() {
  const {
    role,
    coachDutiesList,
    updateCoachDuty,
    addCoachDuty,
    removeCoachDuty,
    addCoachDutyResponsibility,
    updateCoachDutyResponsibility,
    removeCoachDutyResponsibility,
    coachAssignments,
    setCoachOnGroup,
    positionGroups,
  } = useApp();

  if (!canAssignCoachGroups(role)) {
    return (
      <Panel title="Coaches Responsibilities">
        <p className="text-sm text-[var(--cc-steel)]">
          Admins and coordinators only.
        </p>
      </Panel>
    );
  }

  function selectCoach(dutyId: string, coachId: string) {
    const staff = coachStaff.find((c) => c.id === coachId);
    if (!staff) return;
    updateCoachDuty(dutyId, {
      coach: staff.name,
      role: staff.role,
      side: staff.side,
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">
        Controls · Coaches Responsibilities
      </h1>
      <Panel
        title="Responsibilities & group assignments"
        action={
          <button
            type="button"
            onClick={() => addCoachDuty()}
            className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
          >
            + Add coach
          </button>
        }
      >
        <p className="mb-4 text-sm text-[var(--cc-steel)]">
          Pick a coach, assign position groups, and add responsibilities with
          optional deadlines. This feeds My Group and depth chart ownership.
        </p>
        <div className="space-y-4">
          {coachDutiesList.map((d) => {
            const staff =
              coachStaff.find((c) => c.name === d.coach) ??
              coachStaff.find((c) => c.side === d.side) ??
              null;
            const coachId = staff?.id ?? "";
            const sideForGroups =
              d.side === "offense" || d.side === "defense" ? d.side : "defense";
            const groups = positionGroups.filter((p) =>
              sideForGroups === "defense"
                ? p.type === "Defense"
                : p.type === "Offense",
            );

            return (
              <div
                key={d.id}
                className="space-y-3 rounded-xl border border-[var(--cc-line)] p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="font-semibold text-[var(--cc-navy)]">
                      Coach
                    </span>
                    <select
                      value={coachId}
                      onChange={(e) => selectCoach(d.id, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                    >
                      <option value="">Select coach…</option>
                      {coachStaff.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.role === "coordinator" ? " (Coordinator)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-wrap items-end gap-2 text-sm">
                    <Chip>{d.side}</Chip>
                    <Chip>{d.role}</Chip>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
                    Position groups
                  </p>
                  {!coachId ? (
                    <p className="text-xs text-[var(--cc-steel)]">
                      Select a coach to assign groups.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {groups.map((pos) => {
                        const g = pos.abbreviation;
                        const assigned = (
                          coachAssignments[g] ?? []
                        ).includes(coachId);
                        return (
                          <label
                            key={pos.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm ${
                              assigned
                                ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/10 text-[var(--cc-navy)]"
                                : "border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={assigned}
                              onChange={(e) =>
                                setCoachOnGroup(g, coachId, e.target.checked)
                              }
                              className="h-4 w-4 accent-[var(--cc-blue)]"
                            />
                            {pos.name} ({g})
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
                      Responsibilities
                    </p>
                    <button
                      type="button"
                      onClick={() => addCoachDutyResponsibility(d.id)}
                      className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                    >
                      + Add responsibility
                    </button>
                  </div>
                  <div className="space-y-2">
                    {d.duties.length === 0 ? (
                      <p className="text-xs text-[var(--cc-steel)]">
                        No responsibilities yet.
                      </p>
                    ) : (
                      d.duties.map((resp) => (
                        <div
                          key={resp.id}
                          className="grid gap-2 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/40 p-2 sm:grid-cols-[1fr_11rem_auto]"
                        >
                          <input
                            type="text"
                            value={resp.text}
                            onChange={(e) =>
                              updateCoachDutyResponsibility(d.id, resp.id, {
                                text: e.target.value,
                              })
                            }
                            placeholder="Responsibility"
                            className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={resp.dueBy ?? ""}
                            onChange={(e) =>
                              updateCoachDutyResponsibility(d.id, resp.id, {
                                dueBy: e.target.value,
                              })
                            }
                            placeholder="Deadline (optional)"
                            className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeCoachDutyResponsibility(d.id, resp.id)
                            }
                            className="rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <label className="block text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Notes
                  </span>
                  <input
                    value={d.notes}
                    onChange={(e) =>
                      updateCoachDuty(d.id, { notes: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeCoachDuty(d.id)}
                  className="rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Remove coach card
                </button>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function AdminBrandingScreen() {
  const { role, branding, setBranding } = useApp();

  if (!canManageMembers(role)) {
    return (
      <Panel title="Branding">
        <p className="text-sm text-[var(--cc-steel)]">Admin only.</p>
      </Panel>
    );
  }

  function patch(partial: Partial<BrandingConfig>) {
    setBranding((prev) => ({ ...prev, ...partial }));
  }

  function patchColor(
    key: keyof BrandingConfig["colors"],
    value: string,
  ) {
    setBranding((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">Controls · Branding</h1>
      <Panel title="Program identity">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              Team name
            </span>
            <input
              value={branding.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Motto</span>
            <input
              value={branding.motto}
              onChange={(e) => patch({ motto: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              Logo letter
            </span>
            <input
              value={branding.logoLetter}
              onChange={(e) => patch({ logoLetter: e.target.value.slice(0, 3) })}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              maxLength={3}
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Unit</span>
            <input
              value={branding.unit}
              onChange={(e) => patch({ unit: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-semibold text-[var(--cc-navy)]">
              MaxPreps team URL
            </span>
            <input
              value={branding.maxPrepsUrl}
              onChange={(e) => patch({ maxPrepsUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
        </div>
      </Panel>

      <Panel title="Logos">
        <div className="grid gap-3 sm:grid-cols-2">
          <LogoUploadField
            label="Team logo"
            url={branding.teamLogoUrl}
            fileName={branding.teamLogoFileName}
            fallbackLetter={branding.logoLetter}
            onChange={({ url, fileName }) =>
              patch({
                teamLogoUrl: url,
                teamLogoFileName: fileName,
              })
            }
          />
          <LogoUploadField
            label="School logo"
            url={branding.schoolLogoUrl}
            fileName={branding.schoolLogoFileName}
            fallbackLetter={branding.logoLetter}
            onChange={({ url, fileName }) =>
              patch({
                schoolLogoUrl: url,
                schoolLogoFileName: fileName,
              })
            }
          />
        </div>
      </Panel>

      <Panel title="Brand colors">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          These update the app chrome (buttons, nav accents, backgrounds).
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["primary", "Primary"],
              ["navy", "Navy"],
              ["steel", "Steel"],
              ["field", "Field / page bg"],
              ["accent", "Accent"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-sm">
              <span className="mb-1 block font-semibold text-[var(--cc-navy)]">
                {label}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={branding.colors[key]}
                  onChange={(e) => patchColor(key, e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-[var(--cc-line)] bg-white p-1"
                />
                <input
                  value={branding.colors[key]}
                  onChange={(e) => patchColor(key, e.target.value)}
                  className="w-full rounded border border-[var(--cc-line)] px-3 py-2 font-mono text-xs uppercase"
                />
              </div>
            </label>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AdminScreen({ section }: { section: "branding" | "members" }) {
  const {
    role,
    teamMembers,
    createMemberAccount,
    deleteMember,
    updateMember,
    teamNames,
    setPage,
    roster,
    openPlayerSettings,
    openCoachSettings,
  } = useApp();
  const [inviteFirst, setInviteFirst] = useState("");
  const [inviteLast, setInviteLast] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("coach");
  const [inviteFlash, setInviteFlash] = useState<string | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberSort, setMemberSort] = useState<
    "name" | "role" | "status" | "phone" | "email" | "duties" | "teams"
  >("name");
  const [memberSortDir, setMemberSortDir] = useState<"asc" | "desc">("asc");
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const teams = teamNames.length ? teamNames : [...teamLevels];

  function submitInvite() {
    const firstName = inviteFirst.trim();
    const lastName = inviteLast.trim();
    if (!firstName || !lastName) return;
    const name = composeDisplayName(firstName, lastName);
    const created = createMemberAccount({
      firstName,
      lastName,
      role: inviteRole,
      phone: invitePhone,
      email: inviteEmail,
    });
    setInviteFirst("");
    setInviteLast("");
    setInvitePhone("");
    setInviteEmail("");
    if (inviteRole === "player" && created.athleteId) {
      setInviteFlash(
        `${name} created — they now appear under Personnel → Rosters → Athletes.`,
      );
    } else {
      setInviteFlash(`${name} (${roleLabels[inviteRole]}) account created.`);
    }
  }

  function toggleSort(
    key: "name" | "role" | "status" | "phone" | "email" | "duties" | "teams",
  ) {
    if (memberSort === key) {
      setMemberSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setMemberSort(key);
      setMemberSortDir("asc");
    }
  }

  const adminCount = teamMembers.filter((m) => m.role === "admin").length;
  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    let list = teamMembers;
    if (q) {
      list = list.filter((m) => {
        const hay = [
          m.name,
          m.firstName,
          m.lastName,
          m.email,
          m.phone,
          m.role,
          roleLabels[m.role],
          m.status,
          m.duties ?? "",
          (m.assignedTeams ?? []).join(" "),
          m.athleticPeriod ?? "",
          m.notes ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      const valueFor = (m: (typeof teamMembers)[number]) => {
        switch (memberSort) {
          case "role":
            return roleLabels[m.role];
          case "status":
            return m.status;
          case "phone":
            return m.phone || "";
          case "email":
            return m.email || "";
          case "duties":
            return m.duties || "";
          case "teams":
            return (m.assignedTeams ?? []).join(", ");
          default:
            return m.name;
        }
      };
      const primary = compareSortValues(
        valueFor(a),
        valueFor(b),
        memberSortDir,
      );
      return primary || compareSortValues(a.name, b.name, "asc");
    });
  }, [teamMembers, memberQuery, memberSort, memberSortDir]);

  if (!canManageMembers(role)) {
    return (
      <Panel title="Admin">
        <p className="text-sm text-[var(--cc-steel)]">
          Admin only — branding & membership.
        </p>
      </Panel>
    );
  }

  if (section === "branding") {
    return <AdminBrandingScreen />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">Controls · Members</h1>
      <Panel title="Add member">
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3">
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              First name
            </span>
            <input
              value={inviteFirst}
              onChange={(e) => setInviteFirst(e.target.value)}
              placeholder="First"
              className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              Last name
            </span>
            <input
              value={inviteLast}
              onChange={(e) => setInviteLast(e.target.value)}
              placeholder="Last"
              className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Phone</span>
            <input
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              placeholder="281-555-0100"
              className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Email</span>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@email.com"
              className="mt-1 block w-48 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Role</span>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="mt-1 block rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
            >
              {(
                ["coach", "coordinator", "admin", "player", "parent"] as Role[]
              ).map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={submitInvite}
            className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
          >
            Add member
          </button>
          {inviteRole === "player" ? (
            <p className="w-full text-xs text-[var(--cc-steel)]">
              Player accounts also appear under Personnel → Rosters → Athletes.
            </p>
          ) : null}
          {inviteFlash ? (
            <p className="w-full text-sm font-medium text-[var(--cc-blue)]">
              {inviteFlash}{" "}
              {inviteRole === "player" ? (
                <button
                  type="button"
                  className="underline"
                  onClick={() => setPage("personnel-roster-athletes")}
                >
                  Open Rosters
                </button>
              ) : null}
            </p>
          ) : null}
        </div>
      </Panel>

      <Panel title="All members">
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <label className="min-w-[220px] flex-1 text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Search</span>
            <input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Name, email, phone, role, duties, teams…"
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <p className="pb-2 text-xs text-[var(--cc-steel)]">
            {filteredMembers.length} of {teamMembers.length}
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[var(--cc-line)]">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="bg-[var(--cc-field)] text-[var(--cc-steel)]">
              <tr>
                {(
                  [
                    ["name", "Name"],
                    ["role", "Role"],
                    ["status", "Status"],
                    ["phone", "Phone"],
                    ["email", "Email"],
                    ["duties", "Duties"],
                    ["teams", "Teams"],
                  ] as const
                ).map(([key, label]) => (
                  <SortHeader
                    key={key}
                    label={label}
                    active={memberSort === key}
                    dir={memberSortDir}
                    onClick={() => toggleSort(key)}
                  />
                ))}
                <th className="px-3 py-2 font-semibold uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-sm text-[var(--cc-steel)]"
                  >
                    No members match your search.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const linkedAthlete =
                    m.role === "player"
                      ? roster.find((a) => a.accountId === m.id)
                      : undefined;
                  const isStaff =
                    m.role === "coach" ||
                    m.role === "coordinator" ||
                    m.role === "admin";
                  const canDeleteMember =
                    m.role !== "admin" || adminCount > 1;
                  const expanded = expandedStaffId === m.id;
                  return (
                    <Fragment key={m.id}>
                      <tr className="border-t border-[var(--cc-line)]">
                        <td className="px-3 py-3 font-medium text-[var(--cc-navy)]">
                          {linkedAthlete ? (
                            <button
                              type="button"
                              onClick={() =>
                                openPlayerSettings(linkedAthlete.id)
                              }
                              className="text-left font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
                            >
                              {m.name}
                            </button>
                          ) : isStaff ? (
                            <button
                              type="button"
                              onClick={() => openCoachSettings(m.id)}
                              className="text-left font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
                            >
                              {m.name}
                            </button>
                          ) : (
                            m.name
                          )}
                        </td>
                        <td className="px-3 py-3">{roleLabels[m.role]}</td>
                        <td className="px-3 py-3 capitalize">{m.status}</td>
                        <td className="px-3 py-3 text-[var(--cc-steel)]">
                          {m.phone || "—"}
                        </td>
                        <td className="px-3 py-3 text-[var(--cc-steel)]">
                          {m.email || "—"}
                        </td>
                        <td className="px-3 py-3 text-[var(--cc-steel)]">
                          {isStaff ? m.duties || "—" : "—"}
                        </td>
                        <td className="px-3 py-3 text-[var(--cc-steel)]">
                          {isStaff
                            ? (m.assignedTeams ?? []).join(", ") || "—"
                            : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            {isStaff ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedStaffId((id) =>
                                      id === m.id ? null : m.id,
                                    )
                                  }
                                  className="rounded-md border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                                >
                                  {expanded ? "Hide details" : "Edit staff"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openCoachSettings(m.id)}
                                  className="rounded-md border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                                >
                                  Profile
                                </button>
                              </>
                            ) : linkedAthlete ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openPlayerSettings(linkedAthlete.id)
                                }
                                className="rounded-md border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                              >
                                Profile
                              </button>
                            ) : null}
                            <button
                              type="button"
                              disabled={!canDeleteMember}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete ${m.name} (${roleLabels[m.role]})? This cannot be undone.`,
                                  )
                                ) {
                                  deleteMember(m.id);
                                }
                              }}
                              className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isStaff && expanded ? (
                        <tr className="border-t border-[var(--cc-line)] bg-[var(--cc-field)]/60">
                          <td colSpan={8} className="px-3 py-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="text-sm sm:col-span-2">
                                <span className="font-semibold text-[var(--cc-navy)]">
                                  Assigned teams
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {teams.map((t) => {
                                    const on = (m.assignedTeams ?? []).includes(
                                      t,
                                    );
                                    return (
                                      <button
                                        key={t}
                                        type="button"
                                        onClick={() => {
                                          const current = m.assignedTeams ?? [];
                                          const next = on
                                            ? current.filter((x) => x !== t)
                                            : [...current, t];
                                          updateMember(m.id, {
                                            assignedTeams: next,
                                          });
                                        }}
                                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                          on
                                            ? "bg-[var(--cc-blue)] text-white"
                                            : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                                        }`}
                                      >
                                        {t}
                                      </button>
                                    );
                                  })}
                                </div>
                              </label>
                              <label className="text-sm">
                                <span className="font-semibold text-[var(--cc-navy)]">
                                  Duties
                                </span>
                                <input
                                  value={m.duties ?? ""}
                                  onChange={(e) =>
                                    updateMember(m.id, {
                                      duties: e.target.value,
                                    })
                                  }
                                  placeholder="e.g. DL, special teams"
                                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                                />
                              </label>
                              <label className="text-sm">
                                <span className="font-semibold text-[var(--cc-navy)]">
                                  Athletic period
                                </span>
                                <input
                                  value={m.athleticPeriod ?? ""}
                                  onChange={(e) =>
                                    updateMember(m.id, {
                                      athleticPeriod: e.target.value,
                                    })
                                  }
                                  placeholder="e.g. 7th period"
                                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                                />
                              </label>
                              <label className="text-sm sm:col-span-2">
                                <span className="font-semibold text-[var(--cc-navy)]">
                                  Notes
                                </span>
                                <textarea
                                  value={m.notes ?? ""}
                                  onChange={(e) =>
                                    updateMember(m.id, {
                                      notes: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                                />
                              </label>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AdminScheduleScreen() {
  const {
    role,
    season,
    gameMetaOverrides,
    setGameMeta,
    disabledOptionalGames,
    setOptionalGameEnabled,
  } = useApp();

  if (!canEditScheduleMeta(role)) {
    return (
      <Panel title="Schedule">
        <p className="text-sm text-[var(--cc-steel)]">
          Admins and coordinators only.
        </p>
      </Panel>
    );
  }

  const optionalGames = games.filter((g) => g.optional);
  const preseasonOptional = optionalGames.filter((g) => g.kind !== "playoff");
  const playoffOptional = optionalGames.filter((g) => g.kind === "playoff");
  const heading = "Controls · Schedule";

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">{heading}</h1>
      <Panel title="Optional weeks">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Toggle which optional slots appear everywhere weeks are listed —
          Schedule, Team Grades, Stats, Call Sheets, Practice Plans, Quizzes,
          and Scout (Offense and Defense). Playoff weeks start hidden.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
              Preseason
            </p>
            <div className="mt-2 space-y-2">
              {preseasonOptional.map((g) => (
                <label
                  key={g.id}
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--cc-navy)]"
                >
                  <input
                    type="checkbox"
                    checked={!disabledOptionalGames[g.id]}
                    onChange={(e) =>
                      setOptionalGameEnabled(g.id, e.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--cc-blue)]"
                  />
                  {gameSlotTitle(g)}
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
              Playoffs (6 weeks)
            </p>
            <div className="mt-2 space-y-2">
              {playoffOptional.map((g) => (
                <label
                  key={g.id}
                  className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--cc-navy)]"
                >
                  <input
                    type="checkbox"
                    checked={!disabledOptionalGames[g.id]}
                    onChange={(e) =>
                      setOptionalGameEnabled(g.id, e.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--cc-blue)]"
                  />
                  {gameSlotLabel(g)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title={`${season} event details`}>
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Edit opponent/event name, date, time, venue, and home/away for every
          slot.
        </p>
        <div className="space-y-3">
          {games.map((base) => {
            const g = mergeGameMeta(base, gameMetaOverrides);
            const hidden = !!(g.optional && disabledOptionalGames[g.id]);
            return (
              <div
                key={g.id}
                className={`rounded-xl border border-[var(--cc-line)] p-3 ${
                  hidden ? "bg-zinc-50 opacity-70" : "bg-white"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-blue)]">
                      {gameSlotLabel(g)}
                      {g.optional ? " · Optional" : ""}
                      {hidden ? " · Hidden" : ""}
                    </p>
                    <p className="text-sm font-bold text-[var(--cc-navy)]">
                      {gameSlotTitle(g)}
                    </p>
                  </div>
                  {g.optional ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOptionalGameEnabled(g.id, hidden)
                      }
                      className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                    >
                      {hidden ? "Show" : "Hide"}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  <label className="block text-xs font-semibold text-[var(--cc-steel)] lg:col-span-2">
                    Opponent / event
                    <input
                      value={g.opponent}
                      onChange={(e) =>
                        setGameMeta(g.id, { opponent: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[var(--cc-steel)]">
                    Date
                    <input
                      value={g.date}
                      onChange={(e) =>
                        setGameMeta(g.id, { date: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[var(--cc-steel)]">
                    Time
                    <input
                      value={g.time}
                      onChange={(e) =>
                        setGameMeta(g.id, { time: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[var(--cc-steel)]">
                    Home / Away
                    <select
                      value={g.homeAway}
                      onChange={(e) =>
                        setGameMeta(g.id, {
                          homeAway: e.target.value as "Home" | "Away",
                        })
                      }
                      className="mt-1 w-full rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                    >
                      <option value="Home">Home</option>
                      <option value="Away">Away</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-[var(--cc-steel)] sm:col-span-2 lg:col-span-5">
                    Venue
                    <input
                      value={g.venue}
                      onChange={(e) =>
                        setGameMeta(g.id, { venue: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function AdminTeamsScreen() {
  const { role, teamNames, setTeamNames } = useApp();

  if (!canManageMembers(role) && !canEditDepthConfig(role)) {
    return (
      <Panel title="Teams">
        <p className="text-sm text-[var(--cc-steel)]">Admin only.</p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">Controls · Teams</h1>
      <Panel title="Team names">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          These names appear on depth charts, attendance, and roster filters.
        </p>
        <div className="space-y-2">
          {teamNames.map((name, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                value={name}
                onChange={(e) => {
                  const next = e.target.value;
                  setTeamNames((prev) =>
                    prev.map((t, idx) => (idx === i ? next : t)),
                  );
                }}
                className="min-w-[200px] flex-1 rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
                placeholder={`Team ${i + 1}`}
              />
              <button
                type="button"
                disabled={teamNames.length <= 1}
                onClick={() =>
                  setTeamNames((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="rounded border border-red-200 px-2 py-2 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setTeamNames((prev) => [...prev, `Team ${prev.length + 1}`])
          }
          className="mt-4 rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
        >
          + Add team
        </button>
      </Panel>
    </div>
  );
}

function AdminTeamGoalsScreen() {
  const { role, offenseGoals, defenseGoals } = useApp();

  if (!canEditGameGoals(role)) {
    return (
      <Panel title="Team Goals">
        <p className="text-sm text-[var(--cc-steel)]">
          Admins and coordinators only.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">
        Controls · Team Goals
      </h1>
      <p className="text-sm text-[var(--cc-steel)]">
        Edit offense and defense team goals used on Team Grades and This Week.
      </p>
      <UnitGoalsEditor
        side="offense"
        unitLabel="Offense"
        goals={offenseGoals}
      />
      <UnitGoalsEditor
        side="defense"
        unitLabel="Defense"
        goals={defenseGoals}
      />
    </div>
  );
}

function AdminDepthSettingsScreen() {
  const { role, schemes, classColors, setClassColors, deleteDepthScheme } =
    useApp();
  const [editorScheme, setEditorScheme] = useState<SchemeConfig | null | "new">(
    null,
  );

  if (!canEditDepthConfig(role)) {
    return (
      <Panel title="Depth Chart Settings">
        <p className="text-sm text-[var(--cc-steel)]">
          Admins and coordinators only.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">
        Controls · Depth Chart Settings
      </h1>
      <Panel
        title="Schemes"
        action={
          <button
            type="button"
            onClick={() => setEditorScheme("new")}
            className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
          >
            + New scheme
          </button>
        }
      >
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Add, edit, or delete depth chart schemes (positions, filters, Game Day
          / Practice).
        </p>
        <div className="space-y-2">
          {schemes.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">No schemes yet.</p>
          ) : (
            schemes.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-[var(--cc-navy)]">
                    {s.label}
                  </p>
                  <p className="text-xs text-[var(--cc-steel)]">
                    {s.schemeType} · {s.columns.length} position
                    {s.columns.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorScheme(s)}
                    className="rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-xs font-semibold text-[var(--cc-navy)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete scheme “${s.label}”? This cannot be undone.`,
                        )
                      ) {
                        deleteDepthScheme(s.id);
                      }
                    }}
                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
      <Panel title="Depth chart colors by graduating class">
        <p className="mb-3 text-xs text-zinc-500">
          Defaults from My GA Online (Cy Creek): Senior #59aaf5, Junior #d1cece,
          Sophomore #a4e8aa, Freshmen #e1eb6d
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {gradClassOrder.map((key) => (
            <label key={key} className="text-sm">
              <span className="mb-1 block font-semibold text-zinc-800">
                {gradClassLabels[key]}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={classColors[key]}
                  onChange={(e) => {
                    const hex = e.target.value;
                    setClassColors((prev) => ({ ...prev, [key]: hex }));
                  }}
                  className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1"
                />
                <input
                  value={classColors[key]}
                  onChange={(e) => {
                    const hex = e.target.value;
                    setClassColors((prev) => ({ ...prev, [key]: hex }));
                  }}
                  className="w-full rounded border border-zinc-300 px-3 py-2 font-mono text-xs uppercase"
                />
              </div>
              <div
                className="mt-2 rounded px-2 py-1.5 text-center text-xs font-semibold text-zinc-900"
                style={{ backgroundColor: classColors[key] }}
              >
                Sample name
              </div>
            </label>
          ))}
        </div>
      </Panel>
      {editorScheme !== null ? (
        <DepthChartEditorOverlay
          initial={editorScheme === "new" ? null : editorScheme}
          onClose={() => setEditorScheme(null)}
        />
      ) : null}
    </div>
  );
}

function CallSheetScreen() {
  const { role, side, gameWeekAssets, setGameWeekAsset } = useApp();
  const canEdit = canEditContent(role);
  const field = side === "defense" ? "defenseCallSheet" : "offenseCallSheet";
  const unitLabel = side === "defense" ? "Defense" : "Offense";

  if (!canSeeScout(role)) {
    return (
      <Panel title={`${unitLabel} · Call Sheet`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Call sheets are hidden for parents and fans.
        </p>
      </Panel>
    );
  }

  return (
    <WeekSections
      title={`${unitLabel} · Call Sheet`}
      blurb={`Game-day ${unitLabel.toLowerCase()} call sheets by week — same files as Schedule.`}
    >
      {(g) => (
        <FileSlot
          label={`${unitLabel} call sheet`}
          fileName={gameWeekAssets[g.id]?.[field] ?? null}
          canEdit={canEdit}
          folderHint="Schedule"
          onPick={(name) => setGameWeekAsset(g.id, field, name)}
        />
      )}
    </WeekSections>
  );
}

function StatsScreen() {
  const { role, side, gameWeekAssets, setGameWeekAsset } = useApp();
  const canEdit = canEditContent(role);
  const field = side === "defense" ? "defenseStats" : "offenseStats";
  const unitLabel = side === "defense" ? "Defense" : "Offense";

  if (!canSeeScout(role)) {
    return (
      <Panel title={`${unitLabel} · Stats`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Unit stats are hidden for parents and fans.
        </p>
      </Panel>
    );
  }

  return (
    <WeekSections
      title={`${unitLabel} · Stats`}
      blurb={`${unitLabel} stats sheets by week — same files as Schedule. MaxPreps stays the public box score source.`}
    >
      {(g) => (
        <FileSlot
          label={`${unitLabel} stats`}
          fileName={gameWeekAssets[g.id]?.[field] ?? null}
          canEdit={canEdit}
          folderHint="Schedule"
          onPick={(name) => setGameWeekAsset(g.id, field, name)}
        />
      )}
    </WeekSections>
  );
}

function PracticePlansScreen() {
  const { role, side, gameWeekAssets, setGameWeekAsset } = useApp();
  const canEdit = canEditContent(role);
  const unitLabel = side === "defense" ? "Defense" : "Offense";

  if (!canSeeScout(role)) {
    return (
      <Panel title={`${unitLabel} · Practice Plans`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Practice plans are hidden for parents and fans.
        </p>
      </Panel>
    );
  }

  return (
    <WeekSections
      title={`${unitLabel} · Practice Plans`}
      blurb="Practice days for each game week — same files as Schedule (Monday through the day before kickoff)."
    >
      {(g) => {
        const practiceDays = practiceDaysBeforeGame(g.date, g.kind);
        const assets = gameWeekAssets[g.id];
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            {practiceDays.map((day) => {
              const field = side === "defense" ? day.defense : day.offense;
              return (
                <FileSlot
                  key={day.key}
                  label={day.label}
                  fileName={assets?.[field] ?? null}
                  canEdit={canEdit}
                  folderHint="Schedule"
                  onPick={(name) => setGameWeekAsset(g.id, field, name)}
                />
              );
            })}
          </div>
        );
      }}
    </WeekSections>
  );
}

function TeachScreen({ kind }: { kind: string }) {
  const { side, role } = useApp();
  const titles: Record<string, string> = {
    "teach-playbook": "Playbook",
    "teach-playbook-builder": "Playbook Builder",
    "teach-install": "Install",
    "teach-practice": "Practice Plans",
    "teach-call-sheet": "Call Sheet",
    "teach-study": "Study Guides",
    "teach-philosophy": "Philosophy",
  };
  const title = titles[kind] ?? "Teach";

  if (kind === "teach-playbook-builder") {
    return <PlaybookTool side={side} canEdit={canEditContent(role)} />;
  }

  if (kind === "teach-call-sheet") {
    return <CallSheetScreen />;
  }

  if (kind === "teach-practice") {
    return <PracticePlansScreen />;
  }

  return (
    <Panel
      title={`${side === "defense" ? "Defense" : "Offense"} · ${title}`}
      action={
        canEditContent(role) ? (
          <button
            type="button"
            className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
          >
            Upload / edit
          </button>
        ) : null
      }
    >
      <p className="text-sm text-[var(--cc-steel)]">
        Mock content library for {title.toLowerCase()}. Short teach clips OK — full film
        stays in Hudl.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {["Document A", "Diagram set", "Week focus notes"].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-dashed border-[var(--cc-line)] bg-[var(--cc-field)] p-4 text-sm font-medium text-[var(--cc-navy)]"
          >
            {item}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ScoutScreen() {
  const { role, side, gameWeekAssets, setGameWeekAsset } = useApp();
  const canEdit = canEditContent(role);
  const field = side === "defense" ? "defenseScout" : "offenseScout";
  const unitLabel = side === "defense" ? "Defense" : "Offense";

  if (!canSeeScout(role)) {
    return (
      <Panel title="Scouting">
        <p className="text-sm text-[var(--cc-steel)]">
          Scouting is hidden for parents and fans.
        </p>
      </Panel>
    );
  }

  return (
    <WeekSections
      title={`${unitLabel} · Scouting Reports`}
      blurb="One scouting report per opponent — same files as Schedule. Players can view; parents/fans cannot."
    >
      {(g) => (
        <FileSlot
          label={`${unitLabel} scouting report`}
          fileName={gameWeekAssets[g.id]?.[field] ?? null}
          canEdit={canEdit}
          folderHint="Schedule"
          onPick={(name) => setGameWeekAsset(g.id, field, name)}
        />
      )}
    </WeekSections>
  );
}

function useMyRoomContext() {
  const { side, role, coachAssignments, offenseGroupCodes, defenseGroupCodes } =
    useApp();
  const profile = myRoomProfile(role, side, coachAssignments);
  const allowed = canSeeMyRoom(role) && profile;
  const myGroups = profile
    ? expandCoachGroupsWith(
        profile.groups,
        side,
        offenseGroupCodes,
        defenseGroupCodes,
      )
    : [];
  const groupSet = new Set(myGroups);
  return { side, role, profile, allowed, myGroups, groupSet };
}

function MyRoomHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { profile, myGroups, side } = useMyRoomContext();
  if (!profile) return null;
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
          My Group · {profile.name}
        </p>
        <h1 className="text-2xl font-bold text-[var(--cc-navy)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--cc-steel)]">
          {subtitle ??
            `${side === "defense" ? "Defense" : "Offense"} · Groups: ${myGroups.join(", ")}`}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {myGroups.map((g) => (
          <Chip key={g}>{g}</Chip>
        ))}
      </div>
    </div>
  );
}

function MyRoomGate({ children }: { children: React.ReactNode }) {
  const { allowed } = useMyRoomContext();
  if (!allowed) {
    return (
      <Panel title="My Group">
        <p className="text-sm text-[var(--cc-steel)]">
          My Group is for coaches and coordinators.
        </p>
      </Panel>
    );
  }
  return <>{children}</>;
}

function MyRoomGroupScreen() {
  const { myGroups, groupSet } = useMyRoomContext();
  const { roster: allAthletes } = useApp();
  const roster = allAthletes
    .filter((a) => a.groups.some((g) => groupSet.has(g)))
    .slice()
    .sort(compareByLastName);

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader title="Position Group" />
        <Panel title={`Roster · ${myGroups.join(", ")}`}>
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Players assigned to your group(s).
          </p>
          {roster.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No players in this group yet.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {roster.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-[var(--cc-navy)]">
                    <PlayerNameLink
                      id={a.id}
                      name={a.name}
                      className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--cc-steel)]">
                    {a.groups.filter((g) => groupSet.has(g)).join(", ")} ·{" "}
                    {a.classYear}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function MyRoomResponsiblesScreen() {
  const { profile } = useMyRoomContext();
  const { coachDutiesList, coachAssignments } = useApp();

  const relevant = coachDutiesList.filter((d) => {
    // My Group → Responsibilities shows only the signed-in coach/coordinator’s card
    return !!profile && d.coach === profile.name;
  });

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader title="Responsibilities" />
        <Panel title="Your responsibilities">
          <p className="mb-4 text-sm text-[var(--cc-steel)]">
            Your assigned responsibilities and optional deadlines from Controls →
            Coaches Responsibilities.
          </p>
          {relevant.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No responsibilities assigned to you yet.
            </p>
          ) : (
            <div className="space-y-3">
              {relevant.map((d) => {
                const staff = coachStaff.find((c) => c.name === d.coach);
                const liveGroups = staff
                  ? Object.entries(coachAssignments)
                      .filter(([, ids]) => ids.includes(staff.id))
                      .map(([g]) => g)
                  : d.groups;
                return (
                  <div
                    key={d.id}
                    className="rounded-xl border border-[var(--cc-line)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--cc-navy)]">
                        {d.coach}
                      </h3>
                      <Chip>{d.role}</Chip>
                      <Chip>
                        {(liveGroups.length ? liveGroups : d.groups).join(
                          ", ",
                        ) || "Unassigned"}
                      </Chip>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-sm text-[var(--cc-steel)]">
                      {d.duties.map((x) => (
                        <li
                          key={x.id}
                          className="flex flex-wrap items-baseline justify-between gap-2"
                        >
                          <span>· {x.text}</span>
                          {x.dueBy ? (
                            <span className="text-xs font-semibold text-[var(--cc-navy)]">
                              Due {x.dueBy}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {d.notes ? (
                      <p className="mt-2 text-sm text-[var(--cc-navy)]">
                        {d.notes}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function MyRoomDepthScreen() {
  const { myGroups, side, role } = useMyRoomContext();
  const { setPage, teamNames, ensureDepthBoard } = useApp();
  const schemeId: DepthScheme = side === "defense" ? "Defense" : "Offense";
  const teams = teamNames.length ? teamNames : [...teamLevels];
  const canEdit = canMoveDepthPlayers(role);

  useEffect(() => {
    teams.forEach((_, teamIndex) => {
      ensureDepthBoard(teamIndex, schemeId);
    });
  }, [teams, schemeId, ensureDepthBoard]);

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader title="Depth Chart" />
        <Panel
          title="Your positions"
          action={
            <button
              type="button"
              onClick={() => setPage("personnel-depth")}
              className="text-sm font-semibold text-[var(--cc-blue)]"
            >
              Full depth charts →
            </button>
          }
        >
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            {schemeId} columns for {myGroups.join(", ")} across every team.
            Edits stay on your chart until you Save — then they update the main
            depth chart. Charts start with 3 rows; putting anyone on the last
            row adds another.
          </p>
          <div className="space-y-5">
            {teams.map((teamName, teamIndex) => (
              <MyRoomDepthTeamEditor
                key={`${teamName}-${teamIndex}`}
                level={teamName}
                teamIndex={teamIndex}
                schemeId={schemeId}
                schemeLabel={schemeId}
                groupFilter={myGroups}
                canEdit={canEdit}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--cc-steel)]">
            Charts start with 3 rows; putting anyone on the last row adds another.
            {canEdit
              ? " Click a square to search athletes by group · drag to move/swap."
              : ""}
          </p>
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function MyRoomDepthTeamEditor({
  level,
  teamIndex,
  schemeId,
  schemeLabel,
  groupFilter,
  canEdit,
}: {
  level: string;
  teamIndex: number;
  schemeId: DepthScheme;
  schemeLabel: string;
  groupFilter: string[];
  canEdit: boolean;
}) {
  const { getBoard, saveDepthBoard } = useApp();
  const mainBoard = getBoard(teamIndex, schemeId);
  const mainSig = JSON.stringify(mainBoard);

  function relevantColsFor(board: DepthChartBoard) {
    if (!groupFilter.length) return undefined;
    const allowed = new Set(groupFilter);
    return board.positions
      .map((pos, col) => ({ pos, col }))
      .filter(({ pos }) =>
        groupsForDepthPosition(pos).some((g) => allowed.has(g)),
      )
      .map(({ col }) => col);
  }

  const [draft, setDraft] = useState(() =>
    syncDepthBoardRows(
      cloneDepthBoard(mainBoard),
      relevantColsFor(mainBoard),
    ),
  );
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!dirty) {
      const main = getBoard(teamIndex, schemeId);
      setDraft(
        syncDepthBoardRows(
          cloneDepthBoard(main),
          relevantColsFor(main),
        ),
      );
    }
  }, [mainSig, dirty, teamIndex, schemeId, getBoard]);

  function setDraftCell(
    ref: { teamIndex: number; schemeId: DepthScheme; row: number; col: number },
    player: { name: string; classYear: GradClass } | null,
    cols?: number[],
  ) {
    setDraft((prev) => {
      const rows = prev.rows.map((row) => [...row]);
      if (!rows[ref.row]) return prev;
      rows[ref.row] = [...rows[ref.row]];
      rows[ref.row][ref.col] = player ? { ...player } : null;
      return syncDepthBoardRows(
        { positions: [...prev.positions], rows },
        cols,
      );
    });
    setDirty(true);
  }

  function moveDraftPlayer(
    from: { teamIndex: number; schemeId: DepthScheme; row: number; col: number },
    to: { teamIndex: number; schemeId: DepthScheme; row: number; col: number },
    cols?: number[],
  ) {
    if (
      from.teamIndex !== to.teamIndex ||
      from.schemeId !== to.schemeId ||
      (from.row === to.row && from.col === to.col)
    ) {
      return;
    }
    setDraft((prev) => {
      const rows = prev.rows.map((row) => [...row]);
      const a = rows[from.row]?.[from.col];
      if (!a) return prev;
      const b = rows[to.row]?.[to.col] ?? null;
      rows[from.row] = [...rows[from.row]];
      rows[to.row] = [...rows[to.row]];
      rows[from.row][from.col] = b;
      rows[to.row][to.col] = a;
      return syncDepthBoardRows(
        { positions: [...prev.positions], rows },
        cols,
      );
    });
    setDirty(true);
  }

  function handleSave() {
    saveDepthBoard(teamIndex, schemeId, draft);
    setDirty(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }

  function handleDiscard() {
    const main = getBoard(teamIndex, schemeId);
    setDraft(
      syncDepthBoardRows(
        cloneDepthBoard(main),
        relevantColsFor(main),
      ),
    );
    setDirty(false);
  }

  return (
    <MyGaDepthTable
      level={level}
      teamIndex={teamIndex}
      schemeId={schemeId}
      schemeLabel={schemeLabel}
      groupFilter={groupFilter}
      board={draft}
      onSetDepthCell={setDraftCell}
      onMoveDepthPlayer={moveDraftPlayer}
      headerAction={
        canEdit ? (
          <div className="flex items-center justify-end gap-2">
            {dirty ? (
              <button
                type="button"
                onClick={handleDiscard}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800"
              >
                Discard
              </button>
            ) : null}
            {savedFlash && !dirty ? (
              <span className="text-xs font-semibold text-emerald-700">
                Saved
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty}
              className="rounded-md bg-[var(--cc-navy)] px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
          </div>
        ) : null
      }
    />
  );
}

function MyRoomScoutScreen() {
  const { side, role, myGroups } = useMyRoomContext();
  const { positionScoutReports, savePositionScoutReport } = useApp();
  const canEdit = canEditContent(role);
  const [activeGroup, setActiveGroup] = useState(myGroups[0] ?? "");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!myGroups.includes(activeGroup)) {
      setActiveGroup(myGroups[0] ?? "");
    }
  }, [myGroups, activeGroup]);

  useEffect(() => {
    if (!activeGroup) return;
    const key = `${side}::${activeGroup}`;
    const existing = positionScoutReports[key];
    setNotes(existing?.notes ?? "");
    setFileName(existing?.fileName ?? null);
    setSavedFlash(false);
  }, [side, activeGroup, positionScoutReports]);

  function save() {
    if (!activeGroup) return;
    savePositionScoutReport(side, activeGroup, { notes, fileName });
    setSavedFlash(true);
  }

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader
          title="Weekly Scouting Report"
          subtitle={`vs ${currentGame.opponent} · Week ${currentGame.week} · your position write-up`}
        />
        <Panel title="Position scout">
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Add notes and a file for your group&apos;s look this week. Players in
            your room can use this with install.
          </p>

          {myGroups.length > 1 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {myGroups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGroup(g)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    activeGroup === g
                      ? "bg-[var(--cc-blue)] text-white"
                      : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          ) : (
            <p className="mb-3 text-sm font-semibold text-[var(--cc-navy)]">
              Group: {activeGroup || "—"}
            </p>
          )}

          <label className="block text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              Scout notes · {activeGroup || "group"}
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!canEdit || !activeGroup}
              rows={8}
              placeholder="Tendencies, formations, keys, fit rules…"
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 disabled:bg-[var(--cc-field)]"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {canEdit ? (
              <>
                <label className="cursor-pointer rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--cc-navy)]">
                  {fileName ? "Replace file" : "Attach PDF / doc"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setFileName(file?.name ?? null);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={save}
                  disabled={!activeGroup}
                  className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save report
                </button>
              </>
            ) : null}
            {fileName ? (
              <span className="text-sm text-[var(--cc-steel)]">
                Attached: {fileName}
              </span>
            ) : (
              <span className="text-sm text-[var(--cc-steel)]">No file yet</span>
            )}
            {savedFlash ? (
              <span className="text-sm font-semibold text-emerald-700">
                Saved
              </span>
            ) : null}
          </div>
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function MyRoomQuizzesScreen() {
  const { side, profile, myGroups, groupSet } = useMyRoomContext();
  const { setPage } = useApp();
  const myQuizzes = quizzes.filter(
    (q) =>
      q.side === side &&
      (profile?.groups.includes("All D") ||
        profile?.groups.includes("All O") ||
        q.assignedGroups.some((g) => groupSet.has(g))),
  );

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader title="Weekly Quizzes" />
        <Panel
          title={`Quizzes · ${myGroups.join(", ")}`}
          action={
            <button
              type="button"
              onClick={() => setPage("quizzes")}
              className="text-sm font-semibold text-[var(--cc-blue)]"
            >
              All quizzes →
            </button>
          }
        >
          {myQuizzes.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No quizzes assigned to your groups this week.
            </p>
          ) : (
            <div className="space-y-3">
              {myQuizzes.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--cc-line)] p-4"
                >
                  <div>
                    <p className="font-semibold text-[var(--cc-navy)]">
                      {q.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--cc-steel)]">
                      Due {q.due} · Groups: {q.assignedGroups.join(", ")} · Pass{" "}
                      {q.passingScore}%
                    </p>
                  </div>
                  <Chip>{q.status}</Chip>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function MyRoomGradesScreen() {
  const { myGroups, groupSet } = useMyRoomContext();
  const { setPage } = useApp();
  const myGrades = grades.filter((g) => groupSet.has(g.group));

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader title="Player Grades" />
        <Panel
          title={`Grades · ${myGroups.join(", ")}`}
          action={
            <button
              type="button"
              onClick={() => setPage("grades")}
              className="text-sm font-semibold text-[var(--cc-blue)]"
            >
              Full grades →
            </button>
          }
        >
          {myGrades.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No grades entered for your groups yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--cc-line)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--cc-field)] text-[var(--cc-steel)]">
                  <tr>
                    <th className="px-3 py-2">Player</th>
                    <th className="px-3 py-2">Group</th>
                    <th className="px-3 py-2">Practice</th>
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">Pride</th>
                  </tr>
                </thead>
                <tbody>
                  {myGrades.map((g) => (
                    <tr
                      key={g.player}
                      className="border-t border-[var(--cc-line)]"
                    >
                      <td className="px-3 py-3 font-medium text-[var(--cc-navy)]">
                        <PlayerNameLink name={g.player} />
                      </td>
                      <td className="px-3 py-3">{g.group}</td>
                      <td className="px-3 py-3">{g.practice}</td>
                      <td className="px-3 py-3">{g.game || "—"}</td>
                      <td className="px-3 py-3">{g.pride}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function prideToPoints(pride: GradeRow["pride"]) {
  const map: Record<GradeRow["pride"], number> = {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
    F: 0,
  };
  return map[pride];
}

function pointsToPride(avg: number): GradeRow["pride"] {
  if (avg >= 3.5) return "A";
  if (avg >= 2.5) return "B";
  if (avg >= 1.5) return "C";
  if (avg >= 0.5) return "D";
  return "F";
}

function unitGradeAverages(
  rows: GradeRow[],
): {
  count: number;
  practice: number | null;
  game: number | null;
  pride: GradeRow["pride"] | null;
  prideAvg: number | null;
} {
  if (rows.length === 0) {
    return {
      count: 0,
      practice: null,
      game: null,
      pride: null,
      prideAvg: null,
    };
  }
  const practice =
    rows.reduce((sum, r) => sum + r.practice, 0) / rows.length;
  const gameRows = rows.filter((r) => r.game > 0);
  const game =
    gameRows.length > 0
      ? gameRows.reduce((sum, r) => sum + r.game, 0) / gameRows.length
      : null;
  const prideAvg =
    rows.reduce((sum, r) => sum + prideToPoints(r.pride), 0) / rows.length;
  return {
    count: rows.length,
    practice: Math.round(practice * 10) / 10,
    game: game === null ? null : Math.round(game * 10) / 10,
    pride: pointsToPride(prideAvg),
    prideAvg: Math.round(prideAvg * 100) / 100,
  };
}

type GoalCellValue = "yes" | "no" | null;

function cycleGoalCell(value: GoalCellValue): GoalCellValue {
  if (value === null) return "yes";
  if (value === "yes") return "no";
  return null;
}

function goalCellKey(goalId: string, gameId: string) {
  return `${goalId}::${gameId}`;
}

function OpponentLogo({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md";
}) {
  const box =
    size === "sm"
      ? "h-6 w-6 p-0.5"
      : "h-10 w-10 p-1";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      title={alt}
      className={`${box} shrink-0 rounded-full border border-[var(--cc-line)] bg-white object-contain`}
    />
  );
}

function GoalToggleButton({
  value,
  label,
  onCycle,
  size = "md",
}: {
  value: GoalCellValue;
  label: string;
  onCycle: () => void;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-base";
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`${label}: ${
        value === "yes" ? "yes" : value === "no" ? "no" : "clear"
      }`}
      className={`inline-flex shrink-0 items-center justify-center rounded-md border font-bold transition ${box} ${
        value === "yes"
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : value === "no"
            ? "border-rose-300 bg-rose-50 text-rose-700"
            : "border-[var(--cc-line)] bg-[var(--cc-field)] text-transparent hover:border-[var(--cc-blue)]/40"
      }`}
    >
      {value === "yes" ? "✓" : value === "no" ? "✕" : "·"}
    </button>
  );
}

const DEFENSE_POS_SORTS: { id: string; label: string; codes: string[] | null }[] =
  [
    { id: "all", label: "All", codes: null },
    { id: "DL", label: "D-Line", codes: ["DL"] },
    { id: "LB", label: "LBs", codes: ["LB"] },
    { id: "DB", label: "Secondary", codes: ["DB"] },
  ];

const OFFENSE_POS_ORDER = ["OL", "QB", "RB", "TE", "WR"];

function sidePositionSorts(side: Side, offenseCodes: string[]) {
  if (side === "defense") return DEFENSE_POS_SORTS;
  return [
    { id: "all", label: "All", codes: null as string[] | null },
    ...offenseCodes
      .slice()
      .sort(
        (a, b) =>
          (OFFENSE_POS_ORDER.indexOf(a) === -1
            ? 99
            : OFFENSE_POS_ORDER.indexOf(a)) -
          (OFFENSE_POS_ORDER.indexOf(b) === -1
            ? 99
            : OFFENSE_POS_ORDER.indexOf(b)),
      )
      .map((code) => ({ id: code, label: code, codes: [code] as string[] })),
  ];
}

function positionSortRank(side: Side, group: string) {
  const code = migrateGroupAbbreviation(group);
  if (side === "defense") {
    const order = ["DL", "LB", "DB"];
    const i = order.indexOf(code);
    return i === -1 ? 99 : i;
  }
  const i = OFFENSE_POS_ORDER.indexOf(code);
  return i === -1 ? 99 : i;
}

function UnitWeekGoals({
  unitLabel,
  goals,
  gameId,
  weekLabel,
  cells,
  onToggle,
}: {
  unitLabel: string;
  goals: UnitGoal[];
  gameId: string;
  weekLabel: string;
  cells: Record<string, GoalCellValue>;
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
          {unitLabel} team goals
        </p>
        <p className="text-[11px] text-[var(--cc-steel)]">
          yes ✓ → no ✕ → clear
        </p>
      </div>
      {goals.length === 0 ? (
        <p className="text-sm text-[var(--cc-steel)]">
          No goals set yet. Admins and coordinators can add them below.
        </p>
      ) : (
        <div className="grid gap-1 sm:grid-cols-2">
          {goals.map((goal) => {
            const key = goalCellKey(goal.id, gameId);
            const value = cells[key] ?? null;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onToggle(key)}
                aria-label={`${goal.text} · ${weekLabel}: ${
                  value === "yes" ? "yes" : value === "no" ? "no" : "clear"
                }`}
                className="flex items-start gap-2 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/40 px-2 py-1.5 text-left hover:bg-[var(--cc-field)]"
              >
                <span
                  aria-hidden
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                    value === "yes"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : value === "no"
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-[var(--cc-line)] bg-white text-transparent"
                  }`}
                >
                  {value === "yes" ? "✓" : value === "no" ? "✕" : "·"}
                </span>
                <span className="pt-0.5 text-xs font-medium leading-snug text-[var(--cc-navy)]">
                  {goal.text}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function overallGoalColumnLabel(g: Game) {
  if (g.kind === "playoff") {
    const short = gameSlotLabel(g).replace(/^Playoff ·\s*/i, "");
    return short.split(" ")[0] ?? `W${g.week}`;
  }
  if (g.kind === "scrimmage") return "Scrim";
  if (g.kind === "two-a-days") return "Camp";
  return `Wk ${g.week}`;
}

function UnitGameGoalsOverall({
  unitLabel,
  goals,
  cells,
  onToggle,
}: {
  unitLabel: string;
  goals: UnitGoal[];
  cells: Record<string, GoalCellValue>;
  onToggle: (key: string) => void;
}) {
  const { gameMetaOverrides, disabledOptionalGames } = useApp();
  const regularWeeks = Array.from({ length: 10 }, (_, i) => {
    const week = i + 1;
    const base = games.find((g) => g.id === `w${week}`) ?? null;
    return base ? mergeGameMeta(base, gameMetaOverrides) : null;
  }).filter((g): g is Game => g !== null);

  const visible = visibleScheduleGames(disabledOptionalGames).map((g) =>
    mergeGameMeta(g, gameMetaOverrides),
  );
  const scrimmages = visible.filter((g) => g.kind === "scrimmage");
  const playoffs = visible.filter((g) => g.kind === "playoff");
  const weekGames = [...scrimmages, ...regularWeeks, ...playoffs];

  return (
    <Panel
      title={`${unitLabel} Game Goals · Overall`}
      action={
        <p className="text-xs text-[var(--cc-steel)]">
          Scrimmages · Weeks 1–10 · playoffs · yes ✓ → no ✕ → clear
        </p>
      }
    >
      {goals.length === 0 ? (
        <p className="text-sm text-[var(--cc-steel)]">
          No goals set yet. Admins and coordinators can add them in Edit goals.
        </p>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-[var(--cc-line)]">
          <table
            className="w-full border-collapse text-left text-xs"
            style={{
              minWidth: `${Math.max(40, 12 + weekGames.length * 3.25)}rem`,
            }}
          >
            <thead>
              <tr className="border-b border-[var(--cc-line)] bg-[var(--cc-field)]">
                <th className="sticky left-0 z-10 min-w-[12rem] bg-[var(--cc-field)] px-2 py-2 text-left font-semibold text-[var(--cc-navy)]">
                  Goal
                </th>
                {weekGames.map((g) => (
                  <th
                    key={g.id}
                    className="min-w-[3.25rem] px-1 py-2 text-center font-semibold text-[var(--cc-blue)]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] leading-none whitespace-nowrap sm:text-xs">
                        {overallGoalColumnLabel(g)}
                      </span>
                      <OpponentLogo src={g.logo} alt={g.opponent} size="sm" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goals.map((goal) => (
                <tr
                  key={goal.id}
                  className="border-b border-[var(--cc-line)] last:border-b-0"
                >
                  <td className="sticky left-0 z-10 bg-white px-2 py-1.5 font-medium leading-snug text-[var(--cc-navy)]">
                    {goal.text}
                  </td>
                  {weekGames.map((g) => {
                    const key = goalCellKey(goal.id, g.id);
                    return (
                      <td key={g.id} className="px-1 py-1.5 text-center">
                        <GoalToggleButton
                          value={cells[key] ?? null}
                          label={`${goal.text} · ${overallGoalColumnLabel(g)}`}
                          onCycle={() => onToggle(key)}
                          size="sm"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function UnitGoalsEditor({
  side,
  unitLabel,
  goals,
}: {
  side: Side;
  unitLabel: string;
  goals: UnitGoal[];
}) {
  const { setUnitGoalText, addUnitGoal, removeUnitGoal, moveUnitGoal } =
    useApp();

  return (
    <Panel title={`Edit ${unitLabel} goals`}>
      <p className="mb-3 text-sm text-[var(--cc-steel)]">
        Admins and coordinators can add, edit, reorder, or remove team goals.
        Changes apply to every week and the overall tracker.
      </p>
      <div className="space-y-2">
        {goals.map((goal, i) => (
          <div
            key={goal.id}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/30 p-2"
          >
            <span className="w-6 text-center text-xs font-semibold text-[var(--cc-steel)]">
              {i + 1}
            </span>
            <input
              type="text"
              value={goal.text}
              onChange={(e) => setUnitGoalText(side, goal.id, e.target.value)}
              className="min-w-[12rem] flex-1 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm text-[var(--cc-navy)]"
            />
            <div className="flex gap-1">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => moveUnitGoal(side, goal.id, "up")}
                className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={i === goals.length - 1}
                onClick={() => moveUnitGoal(side, goal.id, "down")}
                className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeUnitGoal(side, goal.id)}
                className="rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => addUnitGoal(side)}
        className="mt-3 rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
      >
        Add goal
      </button>
    </Panel>
  );
}

function TeamGradesWeekContent({
  game,
  unitLabel,
  side,
  sideGroups,
  role,
  goals,
  goalCells,
  onToggleGoal,
}: {
  game: Game;
  unitLabel: string;
  side: Side;
  sideGroups: Set<string>;
  role: Role;
  goals: UnitGoal[];
  goalCells: Record<string, GoalCellValue>;
  onToggleGoal: (key: string) => void;
}) {
  const { offenseGroupCodes } = useApp();
  const [posFilter, setPosFilter] = useState("all");
  const sorts = sidePositionSorts(side, offenseGroupCodes);

  const weekRows = grades.filter((row) => {
    const group = migrateGroupAbbreviation(row.group);
    return (
      sideGroups.has(group) &&
      (row.week === game.week || (game.week === 1 && row.week === 0))
    );
  });
  const weekAvg = unitGradeAverages(weekRows);

  const filteredRows = weekRows
    .filter((row) => {
      const selected = sorts.find((s) => s.id === posFilter);
      if (!selected?.codes) return true;
      return selected.codes.includes(migrateGroupAbbreviation(row.group));
    })
    .sort((a, b) => {
      const rank =
        positionSortRank(side, a.group) - positionSortRank(side, b.group);
      if (rank !== 0) return rank;
      return a.player.localeCompare(b.player);
    });

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
          {unitLabel} average
        </p>
        <div className="overflow-hidden rounded-xl border border-[var(--cc-line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--cc-field)] text-[var(--cc-steel)]">
              <tr>
                <th className="px-3 py-2 font-semibold">Unit</th>
                <th className="px-3 py-2 font-semibold">Graded</th>
                <th className="px-3 py-2 font-semibold">Practice avg</th>
                <th className="px-3 py-2 font-semibold">Game avg</th>
                <th className="px-3 py-2 font-semibold">Pride avg</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--cc-line)]">
                <td className="px-3 py-3 font-semibold text-[var(--cc-navy)]">
                  {unitLabel}
                </td>
                <td className="px-3 py-3 text-[var(--cc-steel)]">
                  {weekAvg.count}
                </td>
                <td className="px-3 py-3 font-medium text-[var(--cc-navy)]">
                  {weekAvg.practice === null ? "—" : weekAvg.practice}
                </td>
                <td className="px-3 py-3 font-medium text-[var(--cc-navy)]">
                  {weekAvg.game === null ? "—" : weekAvg.game}
                </td>
                <td className="px-3 py-3 font-medium text-[var(--cc-navy)]">
                  {weekAvg.pride === null
                    ? "—"
                    : `${weekAvg.pride}${
                        weekAvg.prideAvg !== null
                          ? ` (${weekAvg.prideAvg.toFixed(2)})`
                          : ""
                      }`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <UnitWeekGoals
        unitLabel={unitLabel}
        goals={goals}
        gameId={game.id}
        weekLabel={gameSlotTitle(game)}
        cells={goalCells}
        onToggle={onToggleGoal}
      />

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
            {unitLabel} player grades
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sorts.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPosFilter(opt.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  posFilter === opt.id
                    ? "bg-[var(--cc-blue)] text-white"
                    : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {weekRows.length === 0 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No {unitLabel.toLowerCase()} grades entered for this week yet.
          </p>
        ) : filteredRows.length === 0 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No grades for this position group this week.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--cc-line)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--cc-field)] text-[var(--cc-steel)]">
                <tr>
                  <th className="px-3 py-2 font-semibold">Player</th>
                  <th className="px-3 py-2 font-semibold">Group</th>
                  <th className="px-3 py-2 font-semibold">Practice</th>
                  <th className="px-3 py-2 font-semibold">Game</th>
                  <th className="px-3 py-2 font-semibold">Pride</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={`${row.player}-${row.group}-${row.week}`}
                    className="border-t border-[var(--cc-line)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--cc-navy)]">
                      {role === "player" &&
                      row.player !== "Jordan Martinez" ? (
                        "—"
                      ) : (
                        <PlayerNameLink name={row.player} />
                      )}
                    </td>
                    <td className="px-3 py-3 text-[var(--cc-steel)]">
                      {migrateGroupAbbreviation(row.group)}
                    </td>
                    <td className="px-3 py-3">{row.practice}</td>
                    <td className="px-3 py-3">{row.game || "—"}</td>
                    <td className="px-3 py-3">{row.pride}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function GradesScreen() {
  const {
    role,
    side,
    offenseGroupCodes,
    defenseGroupCodes,
    offenseGoals,
    defenseGoals,
  } = useApp();
  const [goalCells, setGoalCells] = useState<Record<string, GoalCellValue>>(
    {},
  );
  const unitLabel = side === "defense" ? "Defense" : "Offense";
  const sideGroups = new Set(
    side === "defense" ? defenseGroupCodes : offenseGroupCodes,
  );
  const goals = side === "defense" ? defenseGoals : offenseGoals;
  const canEditGoals = canEditGameGoals(role);

  function toggleGoal(key: string) {
    setGoalCells((prev) => ({
      ...prev,
      [key]: cycleGoalCell(prev[key] ?? null),
    }));
  }

  if (role === "parent") {
    return (
      <Panel title="My Athlete">
        <p className="text-sm text-[var(--cc-steel)]">
          Summary only — no peer grades.
        </p>
        <div className="mt-4 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
          <p className="font-semibold text-[var(--cc-navy)]">
            Jordan Martinez · DL
          </p>
          <p className="mt-2 text-sm">
            Practice 8/10 · Pride B · Quiz not started
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <WeekSections
        title={`${unitLabel} · Team Grades`}
        blurb={`${unitLabel} unit average, team goals, and player grades by week (Practice 0–10 · Game 0–100 · Cougar Pride A–F).`}
      >
        {(g) => (
          <TeamGradesWeekContent
            game={g}
            unitLabel={unitLabel}
            side={side}
            sideGroups={sideGroups}
            role={role}
            goals={goals}
            goalCells={goalCells}
            onToggleGoal={toggleGoal}
          />
        )}
      </WeekSections>

      <UnitGameGoalsOverall
        unitLabel={unitLabel}
        goals={goals}
        cells={goalCells}
        onToggle={toggleGoal}
      />

      {canEditGoals ? (
        <UnitGoalsEditor side={side} unitLabel={unitLabel} goals={goals} />
      ) : null}
    </div>
  );
}

function UnitHomeScreen() {
  const { side, setPage } = useApp();
  return (
    <Panel title={`${side === "defense" ? "Cougar Defense" : "Cougar Offense"}`}>
      <p className="text-lg text-[var(--cc-navy)]">{team.motto}</p>
      <p className="mt-2 text-sm text-[var(--cc-steel)]">
        {team.season} Season · Varsity {side === "defense" ? "Defense" : "Offense"}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPage("teach-philosophy")}
          className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold"
        >
          Philosophy
        </button>
        <button
          type="button"
          onClick={() => setPage("scout")}
          className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold"
        >
          Scout
        </button>
        <button
          type="button"
          onClick={() => setPage("teach-install")}
          className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
        >
          Install
        </button>
      </div>
    </Panel>
  );
}

function AthletePicker({
  position,
  positionFilter = "any",
  currentName,
  onPick,
  onClear,
  onClose,
}: {
  position: string;
  positionFilter?: string;
  currentName?: string;
  onPick: (athlete: Athlete) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const { roster } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const allowedGroups =
    positionFilter && positionFilter !== "any"
      ? [positionFilter]
      : groupsForDepthPosition(position);
  const eligible = useMemo(() => {
    if (positionFilter && positionFilter !== "any") {
      return roster.filter((a) => a.groups.includes(positionFilter));
    }
    return athletesForDepthPosition(position, roster);
  }, [position, positionFilter, roster]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? eligible
      : eligible.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.groups.some((g) => g.toLowerCase().includes(q)),
        );
    return [...list].sort(compareByLastName);
  }, [eligible, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Add athlete for ${position}`}
      >
        <div className="border-b border-zinc-200 px-4 py-3">
          <p className="text-sm font-bold text-zinc-900">
            {position} — find athlete
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Showing players in{" "}
            <span className="font-semibold text-zinc-700">
              {allowedGroups.join(", ")}
            </span>{" "}
            (from Groups)
          </p>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name…"
            className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-zinc-500">
              No matching athletes in {allowedGroups.join(" / ")}.
            </li>
          ) : (
            filtered.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onPick(a)}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-zinc-50 ${
                    currentName === a.name ? "bg-sky-50" : ""
                  }`}
                >
                  <span className="font-semibold text-zinc-900">{a.name}</span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {a.groups.join(", ")} · {a.classYear}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3">
          <button
            type="button"
            onClick={onClear}
            disabled={!currentName}
            className="text-sm font-semibold text-red-700 disabled:opacity-40"
          >
            Clear square
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function MyGaDepthTable({
  level,
  teamIndex,
  schemeId,
  schemeLabel,
  groupFilter,
  readOnly = false,
  board: boardProp,
  onSetDepthCell,
  onMoveDepthPlayer,
  headerAction,
}: {
  level: string;
  teamIndex: number;
  schemeId: DepthScheme;
  schemeLabel: string;
  /** When set, only show columns whose position maps to these groups */
  groupFilter?: string[];
  /** Presentation mode — no drag/search edits */
  readOnly?: boolean;
  /** Controlled board (e.g. coach draft). Falls back to shared app board. */
  board?: DepthChartBoard;
  onSetDepthCell?: (
    ref: { teamIndex: number; schemeId: DepthScheme; row: number; col: number },
    player: { name: string; classYear: GradClass } | null,
    relevantCols?: number[],
  ) => void;
  onMoveDepthPlayer?: (
    from: { teamIndex: number; schemeId: DepthScheme; row: number; col: number },
    to: { teamIndex: number; schemeId: DepthScheme; row: number; col: number },
    relevantCols?: number[],
  ) => void;
  headerAction?: React.ReactNode;
}) {
  const {
    role,
    classColors,
    getBoard,
    moveDepthPlayer: appMoveDepthPlayer,
    setDepthCell: appSetDepthCell,
    schemes,
    presentMode,
  } = useApp();
  const board = boardProp ?? getBoard(teamIndex, schemeId);
  const setDepthCell = onSetDepthCell ?? appSetDepthCell;
  const moveDepthPlayer = onMoveDepthPlayer ?? appMoveDepthPlayer;
  const scheme = schemes.find((s) => s.id === schemeId);
  const chartUse =
    scheme?.schemeType === "Game Day" || scheme?.schemeType === "Practice"
      ? scheme.schemeType
      : "Practice";
  const canEdit = !readOnly && !presentMode && canMoveDepthPlayers(role);
  const [dragOver, setDragOver] = useState<{ row: number; col: number } | null>(
    null,
  );
  const [picker, setPicker] = useState<{
    row: number;
    col: number;
    position: string;
    positionFilter: string;
  } | null>(null);
  const didDrag = useRef(false);

  const visibleCols = board.positions
    .map((pos, col) => ({ pos, col }))
    .filter(({ pos }) => {
      if (!groupFilter?.length) return true;
      const allowed = new Set(groupFilter);
      return groupsForDepthPosition(pos).some((g) => allowed.has(g));
    });
  const relevantCols = groupFilter?.length
    ? visibleCols.map(({ col }) => col)
    : undefined;

  function cellPayload(row: number, col: number) {
    return JSON.stringify({ teamIndex, schemeId, row, col });
  }

  function openPicker(row: number, col: number) {
    if (!canEdit) return;
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    const colDef = scheme?.columns[col];
    setPicker({
      row,
      col,
      position: board.positions[col] ?? colDef?.name ?? "POS",
      positionFilter: colDef?.positionFilter ?? "any",
    });
  }

  if (visibleCols.length === 0) {
    return (
      <p className="text-sm text-zinc-600">
        No depth-chart columns match your position groups.
      </p>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm">
      <div className="grid grid-cols-3 items-center gap-2 border-b border-zinc-200 px-3 py-2.5">
        <p className="truncate text-left text-base font-semibold text-zinc-700">
          {level}
        </p>
        <h3 className="truncate text-center text-base font-semibold text-[var(--cc-navy)]">
          {schemeLabel}
        </h3>
        <div className="flex min-w-0 items-center justify-end gap-2">
          {headerAction}
          <p className="truncate text-right text-base font-semibold text-zinc-700">
            {chartUse}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="present-depth w-full min-w-[320px] border-collapse text-center text-xs">
          <thead>
            <tr className="bg-zinc-900 text-white">
              {visibleCols.map(({ pos, col }) => (
                <th
                  key={`${pos}-${col}`}
                  className="border border-zinc-700 px-2 py-2 font-bold tracking-wide"
                  title={`Groups: ${
                    (scheme?.columns[col]?.positionFilter ?? "any") === "any"
                      ? groupsForDepthPosition(pos).join(", ")
                      : scheme?.columns[col]?.positionFilter
                  }`}
                >
                  {pos}
                  {scheme?.columns[col]?.twoDeepLabel ? (
                    <span className="mt-0.5 block text-[10px] font-normal text-zinc-300">
                      {scheme.columns[col]!.twoDeepLabel}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {board.rows.map((row, ri) => (
              <tr key={ri}>
                {visibleCols.map(({ col: ci }) => {
                  const cell = row[ci];
                  const isTarget =
                    dragOver?.row === ri && dragOver?.col === ci;
                  return (
                    <td
                      key={`${ri}-${ci}`}
                      className={`h-9 border border-zinc-300 p-0.5 ${
                        isTarget
                          ? "bg-sky-100 ring-2 ring-inset ring-[var(--cc-blue)]"
                          : ""
                      } ${canEdit ? "cursor-pointer" : ""}`}
                      onClick={() => openPicker(ri, ci)}
                      onDragOver={(e) => {
                        if (!canEdit) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDragOver({ row: ri, col: ci });
                      }}
                      onDragLeave={() => {
                        setDragOver((prev) =>
                          prev?.row === ri && prev?.col === ci ? null : prev,
                        );
                      }}
                      onDrop={(e) => {
                        if (!canEdit) return;
                        e.preventDefault();
                        setDragOver(null);
                        didDrag.current = true;
                        try {
                          const from = JSON.parse(
                            e.dataTransfer.getData("application/depth-cell"),
                          ) as {
                            teamIndex: number;
                            schemeId: DepthScheme;
                            row: number;
                            col: number;
                          };
                          moveDepthPlayer(
                            from,
                            {
                              teamIndex,
                              schemeId,
                              row: ri,
                              col: ci,
                            },
                            relevantCols,
                          );
                        } catch {
                          /* ignore bad payload */
                        }
                      }}
                    >
                      {cell ? (
                        <div
                          draggable={canEdit}
                          onDragStart={(e) => {
                            if (!canEdit) return;
                            didDrag.current = true;
                            e.dataTransfer.setData(
                              "application/depth-cell",
                              cellPayload(ri, ci),
                            );
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDragOver(null);
                            window.setTimeout(() => {
                              didDrag.current = false;
                            }, 0);
                          }}
                          className={`present-depth-name flex h-full min-h-8 items-center justify-center px-1 font-semibold text-zinc-900 ${
                            canEdit
                              ? "cursor-grab active:cursor-grabbing"
                              : ""
                          }`}
                          style={{
                            backgroundColor: classColors[cell.classYear],
                          }}
                          title={
                            canEdit
                              ? "Click to search · drag to move"
                              : undefined
                          }
                        >
                          {cell.name}
                        </div>
                      ) : (
                        <div
                          className={`flex h-full min-h-8 items-center justify-center bg-white text-[10px] text-zinc-300 ${
                            canEdit ? "hover:bg-zinc-50 hover:text-zinc-400" : ""
                          }`}
                          title={canEdit ? "Click to add athlete" : undefined}
                        >
                          {canEdit ? "+" : null}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {picker && (
        <AthletePicker
          position={picker.position}
          positionFilter={picker.positionFilter}
          currentName={board.rows[picker.row]?.[picker.col]?.name}
          onClose={() => setPicker(null)}
          onClear={() => {
            setDepthCell(
              { teamIndex, schemeId, row: picker.row, col: picker.col },
              null,
              relevantCols,
            );
            setPicker(null);
          }}
          onPick={(athlete) => {
            setDepthCell(
              { teamIndex, schemeId, row: picker.row, col: picker.col },
              { name: athlete.name, classYear: athlete.classYear },
              relevantCols,
            );
            setPicker(null);
          }}
        />
      )}
    </section>
  );
}

const gradClassOrder: GradClass[] = [
  "senior",
  "junior",
  "sophomore",
  "freshman",
];

function DepthConfigPanel() {
  const {
    teamNames,
    setTeamNames,
    schemes,
    setSchemes,
    classColors,
    setClassColors,
  } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-300 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-3 text-left"
      >
        <div>
          <p className="text-sm font-bold text-zinc-900">
            Depth chart settings
          </p>
          <p className="text-xs text-zinc-500">
            Edit team names, scheme labels, and graduating-class colors (Admin /
            Coordinator)
          </p>
        </div>
        <span className="text-sm font-semibold text-[var(--cc-blue)]">
          {open ? "Hide" : "Edit"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-zinc-200 px-3 py-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Team names
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {teamNames.map((name, i) => (
                <label key={i} className="text-sm">
                  <span className="sr-only">Team {i + 1}</span>
                  <input
                    value={name}
                    onChange={(e) => {
                      const next = e.target.value;
                      setTeamNames((prev) =>
                        prev.map((t, idx) => (idx === i ? next : t)),
                      );
                    }}
                    className="w-full rounded border border-zinc-300 px-3 py-2"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Scheme names
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {schemes.map((s) => (
                <label key={s.id} className="text-sm">
                  <span className="mb-1 block text-[11px] text-zinc-500">
                    {s.id}
                  </span>
                  <input
                    value={s.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setSchemes((prev) =>
                        prev.map((x) =>
                          x.id === s.id ? { ...x, label } : x,
                        ),
                      );
                    }}
                    className="w-full rounded border border-zinc-300 px-3 py-2"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Depth chart colors by graduating class
            </p>
            <p className="mb-3 text-xs text-zinc-500">
              Defaults from My GA Online (Cy Creek): Senior #59aaf5, Junior
              #d1cece, Sophomore #a4e8aa, Freshmen #e1eb6d
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {gradClassOrder.map((key) => (
                <label key={key} className="text-sm">
                  <span className="mb-1 block font-semibold text-zinc-800">
                    {gradClassLabels[key]}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={classColors[key]}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setClassColors((prev) => ({ ...prev, [key]: hex }));
                      }}
                      className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1"
                    />
                    <input
                      value={classColors[key]}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setClassColors((prev) => ({ ...prev, [key]: hex }));
                      }}
                      className="w-full rounded border border-zinc-300 px-3 py-2 font-mono text-xs uppercase"
                    />
                  </div>
                  <div
                    className="mt-2 rounded px-2 py-1.5 text-center text-xs font-semibold text-zinc-900"
                    style={{ backgroundColor: classColors[key] }}
                  >
                    Sample name
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCountTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: { label: string; values: number[]; bold?: boolean }[];
}) {
  return (
    <Panel title={title}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--cc-line)] text-[var(--cc-steel)]">
              <th className="px-2 py-2 font-semibold" />
              {columns.map((c) => (
                <th
                  key={c}
                  className={`px-2 py-2 font-semibold ${
                    c === "Total" ? "font-bold text-[var(--cc-navy)]" : ""
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label || "blank"}
                className="border-b border-[var(--cc-line)] last:border-0"
              >
                <td
                  className={`px-2 py-2 text-[var(--cc-navy)] ${
                    row.bold ? "font-bold" : "font-medium"
                  }`}
                >
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={`${row.label}-${i}`}
                    className={`px-2 py-2 ${
                      row.bold || columns[i] === "Total"
                        ? "font-bold text-[var(--cc-navy)]"
                        : "text-[var(--cc-steel)]"
                    }`}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ProgramSummaryScreen() {
  const { role, roster, teamNames, positionGroups } = useApp();

  if (!canSeePersonnel(role)) {
    return (
      <Panel title="Program · Summary">
        <p className="text-sm text-[var(--cc-steel)]">
          Program summary is for coaches and above.
        </p>
      </Panel>
    );
  }

  const teams = teamNames.length ? teamNames : [...teamLevels];
  const gradeRows: GradClass[] = [
    "senior",
    "junior",
    "sophomore",
    "freshman",
  ];
  const athletes = roster.filter(
    (a) => (a.personnelType ?? "athlete") === "athlete",
  );
  const support = roster.filter(
    (a) => (a.personnelType ?? "athlete") === "support-staff",
  );

  const teamColumns = [...teams, "No Team", "Total"];
  const teamsRows = [
    ...gradeRows.map((g) => {
      const inGrade = athletes.filter((a) => a.classYear === g);
      const values = teams.map(
        (t) => inGrade.filter((a) => (a.teamLevel ?? "") === t).length,
      );
      const noTeam = inGrade.filter((a) => !a.teamLevel).length;
      const total = inGrade.length;
      return {
        label: gradClassLabels[g],
        values: [...values, noTeam, total],
      };
    }),
    {
      label: "Total",
      bold: true,
      values: [
        ...teams.map(
          (t) => athletes.filter((a) => (a.teamLevel ?? "") === t).length,
        ),
        athletes.filter((a) => !a.teamLevel).length,
        athletes.length,
      ],
    },
  ];

  const positionCols = ["Senior", "Junior", "Sophomore", "Freshman", "Total"];
  const positionGradeKeys: GradClass[] = [
    "senior",
    "junior",
    "sophomore",
    "freshman",
  ];
  const positionsSorted = [...positionGroups].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const positionRows = [
    ...positionsSorted.map((pos) => {
      const inPos = athletes.filter((a) =>
        a.groups.includes(pos.abbreviation),
      );
      const values = positionGradeKeys.map(
        (g) => inPos.filter((a) => a.classYear === g).length,
      );
      return {
        label: pos.name,
        values: [...values, inPos.length],
      };
    }),
    {
      label: "Total",
      bold: true,
      values: [
        ...positionGradeKeys.map(
          (g) => athletes.filter((a) => a.classYear === g).length,
        ),
        athletes.length,
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <Panel title="Program · Summary">
        <p className="text-sm text-[var(--cc-steel)]">
          Live counts from the roster — teams and positions. Manage position
          groups under <span className="font-semibold">Program → Groups</span>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <Chip>Athletes · {athletes.length}</Chip>
          <Chip>Support staff · {support.length}</Chip>
          <Chip>Total · {roster.length}</Chip>
        </div>
      </Panel>

      <SummaryCountTable
        title="Teams"
        columns={teamColumns}
        rows={teamsRows}
      />
      <SummaryCountTable
        title="Positions"
        columns={positionCols}
        rows={positionRows}
      />
    </div>
  );
}

function ProgramPositionsScreen() {
  const {
    role,
    positionGroups,
    addPositionGroup,
    updatePositionGroup,
    removePositionGroup,
  } = useApp();
  const canEdit = canEditPositionGroups(role);

  if (!canSeePersonnel(role)) {
    return (
      <Panel title="Positions">
        <p className="text-sm text-[var(--cc-steel)]">
          Positions are for coaches and above.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Positions"
        action={
          canEdit ? (
            <button
              type="button"
              onClick={addPositionGroup}
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
            >
              Add position
            </button>
          ) : null
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Edit name, abbreviation, and type here — updates roster groups,
          attendance filters, and Program → Groups across the site
          {canEdit ? "." : " (Coach+ only to edit)."}
        </p>

        <div className="mt-4 space-y-3">
          {positionGroups.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No positions yet
              {canEdit ? " — click Add position." : "."}
            </p>
          ) : (
            positionGroups.map((pos) => (
              <div
                key={pos.id}
                className="grid gap-3 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3 sm:grid-cols-[1.4fr_0.7fr_1fr_auto] sm:items-end"
              >
                <label className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Name
                  </span>
                  {canEdit ? (
                    <input
                      value={pos.name}
                      onChange={(e) =>
                        updatePositionGroup(pos.id, { name: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                    />
                  ) : (
                    <p className="mt-1 font-medium text-[var(--cc-navy)]">
                      {pos.name}
                    </p>
                  )}
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Abbreviation
                  </span>
                  {canEdit ? (
                    <input
                      value={pos.abbreviation}
                      onChange={(e) =>
                        updatePositionGroup(pos.id, {
                          abbreviation: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 uppercase"
                    />
                  ) : (
                    <p className="mt-1 font-medium text-[var(--cc-navy)]">
                      {pos.abbreviation}
                    </p>
                  )}
                </label>
                <label className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Position type
                  </span>
                  {canEdit ? (
                    <select
                      value={pos.type}
                      onChange={(e) =>
                        updatePositionGroup(pos.id, {
                          type: e.target.value as PositionType,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                    >
                      {positionTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 font-medium text-[var(--cc-navy)]">
                      {pos.type}
                    </p>
                  )}
                </label>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete ${pos.name} (${pos.abbreviation})?`,
                        )
                      ) {
                        removePositionGroup(pos.id);
                      }
                    }}
                    className="justify-self-start rounded-md border border-red-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50 sm:justify-self-end"
                    aria-label={`Delete ${pos.name}`}
                  >
                    Delete
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

function DepthChartEditorOverlay({
  initial,
  onClose,
}: {
  initial: SchemeConfig | null;
  onClose: () => void;
}) {
  const { allPositionCodes, saveDepthScheme, deleteDepthScheme } = useApp();
  const isNew = !initial;
  const [name, setName] = useState(initial?.label ?? "");
  const [schemeType, setSchemeType] = useState(
    initial?.schemeType === "Game Day" || initial?.schemeType === "Practice"
      ? initial.schemeType
      : "Practice",
  );
  const [columns, setColumns] = useState<DepthColumnDef[]>(
    () =>
      initial?.columns?.length
        ? initial.columns.map((c) => ({ ...c }))
        : [
            {
              id: `col-${Date.now()}`,
              name: "",
              positionFilter: "any",
              twoDeepLabel: "",
            },
          ],
  );
  const schemeId = initial?.id ?? `scheme-${Date.now()}`;

  function moveColumn(index: number, dir: -1 | 1) {
    setColumns((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[index]!;
      next[index] = next[j]!;
      next[j] = tmp;
      return next;
    });
  }

  function updateColumn(
    index: number,
    patch: Partial<DepthColumnDef>,
  ) {
    setColumns((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  }

  function save() {
    if (!name.trim()) {
      window.alert("Name is required.");
      return;
    }
    if (!schemeType.trim()) {
      window.alert("Scheme is required.");
      return;
    }
    const cleaned = columns
      .map((c) => ({
        ...c,
        name: c.name.trim(),
        twoDeepLabel: c.twoDeepLabel.trim(),
        positionFilter: c.positionFilter || "any",
      }))
      .filter((c) => c.name);
    if (!cleaned.length) {
      window.alert("Add at least one named depth chart position.");
      return;
    }
    saveDepthScheme({
      id: schemeId,
      label: name.trim(),
      schemeType: schemeType.trim(),
      columns: cleaned,
    });
    onClose();
  }

  function removeScheme() {
    if (isNew) {
      onClose();
      return;
    }
    if (
      window.confirm(
        `Delete depth chart “${initial?.label ?? name}”? This cannot be undone.`,
      )
    ) {
      deleteDepthScheme(schemeId);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative mb-8 w-full max-w-3xl rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-xl">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--cc-navy)]">
          {isNew ? "New Depth Chart" : "Edit Depth Chart"}
        </h2>
        <div className="mt-1 h-px w-full bg-[var(--cc-line)]" />

        <div className="mt-4 space-y-4">
          <span className="inline-flex rounded bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-600">
            {schemeType || "Practice"}
          </span>

          <label className="block text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              * Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              placeholder="Depth chart name"
            />
          </label>

          <label className="block text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">
              * Game Day / Practice
            </span>
            <select
              value={schemeType}
              onChange={(e) => setSchemeType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              {depthSchemeTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="text-sm font-semibold text-[var(--cc-navy)]">
              Depth Chart Positions
            </p>
            <div className="mt-3 space-y-3">
              {columns.map((col, index) => (
                <div
                  key={col.id}
                  className="grid gap-2 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-end"
                >
                  <div className="flex gap-1 sm:flex-col">
                    <button
                      type="button"
                      onClick={() => moveColumn(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-[var(--cc-line)] bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveColumn(index, 1)}
                      disabled={index === columns.length - 1}
                      className="rounded border border-[var(--cc-line)] bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </div>
                  <label className="text-sm">
                    <span className="font-semibold text-[var(--cc-navy)]">
                      * Name
                    </span>
                    <input
                      value={col.name}
                      onChange={(e) =>
                        updateColumn(index, { name: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                      placeholder="e.g. X"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="font-semibold text-[var(--cc-navy)]">
                      Position
                    </span>
                    <select
                      value={col.positionFilter}
                      onChange={(e) =>
                        updateColumn(index, {
                          positionFilter: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                    >
                      <option value="any">Any/All</option>
                      {allPositionCodes.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="font-semibold text-[var(--cc-navy)]">
                      Two deep label
                    </span>
                    <input
                      value={col.twoDeepLabel}
                      onChange={(e) =>
                        updateColumn(index, { twoDeepLabel: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                      placeholder="Optional"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setColumns((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="rounded-md border border-red-200 px-2 py-2 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50"
                    aria-label="Delete position"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setColumns((prev) => [
                  ...prev,
                  {
                    id: `col-${Date.now()}`,
                    name: "",
                    positionFilter: "any",
                    twoDeepLabel: "",
                  },
                ])
              }
              className="mt-3 rounded-lg border border-[var(--cc-blue)] bg-[var(--cc-blue)]/10 px-3 py-2 text-sm font-semibold text-[var(--cc-blue)]"
            >
              Add Position
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--cc-line)] pt-4">
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-[var(--cc-navy)] px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--cc-line)] px-4 py-2 text-sm font-semibold text-[var(--cc-navy)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={removeScheme}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepthChartsScreen() {
  const {
    role,
    teamNames,
    schemes,
    classColors,
    depthChartPanels,
    setDepthChartPanels,
    presentMode,
    setPresentMode,
    setPage,
  } = useApp();
  const [selectedTeamIndexes, setSelectedTeamIndexes] = useState<number[]>(() =>
    [...new Set(depthChartPanels.map((p) => p.teamIndex))].sort((a, b) => a - b),
  );
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>(() => {
    const ids: string[] = [];
    for (const p of depthChartPanels) {
      if (!ids.includes(p.schemeId)) ids.push(p.schemeId);
    }
    return ids;
  });
  const [chartUseFilter, setChartUseFilter] = useState<
    "both" | "game-day" | "practice"
  >("both");
  const [editorScheme, setEditorScheme] = useState<SchemeConfig | null | "new">(
    null,
  );
  const [editSchemesOpen, setEditSchemesOpen] = useState(false);
  const [editTeamIndex, setEditTeamIndex] = useState<number | null>(null);
  const canEdit = canEditDepthConfig(role);
  const canMove = canMoveDepthPlayers(role);
  const canEditLayout = canSeeDepthCharts(role);
  const canManageSchemes = canMoveDepthPlayers(role);

  useEffect(() => {
    setSelectedTeamIndexes((prev) =>
      prev
        .filter((i) => i >= 0 && i < teamNames.length)
        .map((i) => Math.min(i, Math.max(0, teamNames.length - 1))),
    );
  }, [teamNames]);

  useEffect(() => {
    setSelectedSchemeIds((prev) => {
      const valid = prev.filter((id) => schemes.some((s) => s.id === id));
      return valid.length === prev.length ? prev : valid;
    });
  }, [schemes]);

  useEffect(() => {
    const schemeOrder = selectedSchemeIds.filter((id) => {
      const s = schemes.find((x) => x.id === id);
      if (!s) return false;
      const use =
        s.schemeType === "Game Day" || s.schemeType === "Practice"
          ? s.schemeType
          : "Practice";
      if (chartUseFilter === "game-day") return use === "Game Day";
      if (chartUseFilter === "practice") return use === "Practice";
      return true;
    });
    const next: DepthChartPanel[] = [];
    for (const teamIndex of selectedTeamIndexes) {
      if (teamIndex < 0 || teamIndex >= teamNames.length) continue;
      for (const schemeId of schemeOrder) {
        next.push({
          id: `panel-${teamIndex}-${schemeId}`,
          teamIndex,
          schemeId,
        });
      }
    }
    setDepthChartPanels((prev) => {
      if (
        prev.length === next.length &&
        prev.every(
          (p, i) =>
            p.id === next[i]!.id &&
            p.teamIndex === next[i]!.teamIndex &&
            p.schemeId === next[i]!.schemeId,
        )
      ) {
        return prev;
      }
      return next;
    });
  }, [
    selectedTeamIndexes,
    selectedSchemeIds,
    chartUseFilter,
    schemes,
    teamNames,
    setDepthChartPanels,
  ]);

  if (!canSeeDepthCharts(role)) {
    return (
      <Panel title="Depth Charts">
        <p className="text-sm text-[var(--cc-steel)]">
          Staff only (Coach, Coordinator, Admin).
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="depth-print-hide flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-zinc-900">Depth Chart</h1>
        <div className="flex flex-wrap gap-2">
          {!presentMode ? (
            <button
              type="button"
              onClick={() => {
                setPresentMode(true);
                setPage("personnel-depth");
                void document.documentElement.requestFullscreen?.().catch(
                  () => undefined,
                );
              }}
              className="rounded bg-[var(--cc-navy)] px-3 py-2 text-sm font-semibold text-white"
            >
              Show team
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800"
          >
            Print
          </button>
          {canManageSchemes && !presentMode ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setEditSchemesOpen((o) => !o);
                    setEditTeamIndex(null);
                  }}
                  className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800"
                >
                  Edit Schemes ▾
                </button>
                {editSchemesOpen ? (
                  <div className="absolute right-0 z-20 mt-1 flex rounded-xl border border-[var(--cc-line)] bg-white shadow-lg">
                    <div className="min-w-[160px] border-r border-[var(--cc-line)] p-1">
                      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                        Teams
                      </p>
                      {teamNames.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-zinc-500">
                          No teams.
                        </p>
                      ) : (
                        teamNames.map((t, i) => (
                          <button
                            key={`${t}-${i}`}
                            type="button"
                            onMouseEnter={() => setEditTeamIndex(i)}
                            onClick={() => setEditTeamIndex(i)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                              editTeamIndex === i
                                ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                                : "text-[var(--cc-navy)]"
                            }`}
                          >
                            <span>{t}</span>
                            <span className="text-[var(--cc-steel)]">▸</span>
                          </button>
                        ))
                      )}
                    </div>
                    {editTeamIndex !== null ? (
                      <div className="max-h-72 min-w-[180px] overflow-y-auto p-1">
                        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                          Schemes · {teamNames[editTeamIndex]}
                        </p>
                        {schemes.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-zinc-500">
                            No schemes yet.
                          </p>
                        ) : (
                          schemes.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setEditorScheme(s);
                                setEditSchemesOpen(false);
                                setEditTeamIndex(null);
                              }}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                            >
                              {s.label}
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="flex min-w-[160px] items-center px-3 py-6 text-sm text-zinc-500">
                        Choose a team
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setEditorScheme("new")}
                className="rounded bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
              >
                + New Depth Chart
              </button>
            </>
          ) : null}
        </div>
      </div>

      {canEdit && !canManageMembers(role) ? (
        <div className="depth-print-hide">
          <DepthConfigPanel />
        </div>
      ) : null}

      {canEditLayout ? (
        <div className="depth-print-hide rounded-lg border border-zinc-300 bg-white p-3 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <ChipMultiSelect
              label="Team(s)"
              options={teamNames.map((t, i) => ({
                value: String(i),
                label: t,
              }))}
              selected={selectedTeamIndexes.map(String)}
              onChange={(next) =>
                setSelectedTeamIndexes(
                  next
                    .map(Number)
                    .filter((i) => i >= 0 && i < teamNames.length)
                    .sort((a, b) => a - b),
                )
              }
            />
            <ChipMultiSelect
              label="Scheme(s)"
              options={schemes.map((s) => ({
                value: s.id,
                label: s.label,
              }))}
              selected={selectedSchemeIds}
              onChange={setSelectedSchemeIds}
            />
            <label className="block text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Game Day/Practice
              </span>
              <select
                value={chartUseFilter}
                onChange={(e) =>
                  setChartUseFilter(
                    e.target.value as "both" | "game-day" | "practice",
                  )
                }
                className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800"
              >
                <option value="both">Both</option>
                <option value="game-day">Game Day Only</option>
                <option value="practice">Practice Only</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-3">
            {gradClassOrder.map((key) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span
                  className="inline-block h-4 w-4 rounded border border-zinc-300"
                  style={{ backgroundColor: classColors[key] }}
                />
                <span className="font-medium text-zinc-700">
                  {gradClassLabels[key].replace(" Class Color", "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        {depthChartPanels.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Select team(s) and scheme(s) above to build your depth chart layout.
          </p>
        ) : (
          depthChartPanels.map((panel) => {
            const teamName =
              teamNames[panel.teamIndex] ?? `Team ${panel.teamIndex + 1}`;
            const schemeLabel =
              schemes.find((s) => s.id === panel.schemeId)?.label ??
              panel.schemeId;
            return (
              <div key={panel.id} className="depth-print-panel">
                <MyGaDepthTable
                  level={teamName}
                  teamIndex={panel.teamIndex}
                  schemeId={panel.schemeId}
                  schemeLabel={schemeLabel}
                />
              </div>
            );
          })
        )}
      </div>

      <p className="depth-print-hide text-xs text-zinc-500">
        Charts start with 3 rows; putting anyone on the last row adds another.
        {canMove
          ? " Click a square to search athletes by group · drag to move/swap (Coach+)."
          : ""}
      </p>

      {editorScheme !== null ? (
        <DepthChartEditorOverlay
          initial={editorScheme === "new" ? null : editorScheme}
          onClose={() => setEditorScheme(null)}
        />
      ) : null}
    </div>
  );
}

const GRADE_OPTIONS: { id: GradClass; label: string }[] = [
  { id: "alumni", label: "Alumni" },
  { id: "senior", label: "Senior" },
  { id: "junior", label: "Junior" },
  { id: "sophomore", label: "Sophomore" },
  { id: "freshman", label: "Freshman" },
];

const ATTENDANCE_OPTIONS: { id: AttendanceStatus; label: string }[] = [
  { id: "present", label: "Present" },
  { id: "late", label: "Late" },
  { id: "absent", label: "Absent" },
  { id: "excused", label: "Excused" },
];

function ChipMultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selectedOptions = options.filter((o) => selected.includes(o.value));

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((x) => x !== value)
        : [...selected, value],
    );
  }

  function remove(value: string, e: ReactMouseEvent) {
    e.stopPropagation();
    onChange(selected.filter((x) => x !== value));
  }

  return (
    <div ref={rootRef} className="relative text-sm">
      <p className="font-semibold text-zinc-800">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded border border-zinc-300 bg-white px-2 py-1.5 text-left"
      >
        {selectedOptions.length === 0 ? (
          <span className="px-1 text-zinc-400">Select…</span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-xs font-semibold text-zinc-800"
            >
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => remove(opt.value, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(selected.filter((x) => x !== opt.value));
                  }
                }}
                className="cursor-pointer text-zinc-500 hover:text-zinc-900"
                aria-label={`Remove ${opt.label}`}
              >
                ×
              </span>
              {opt.label}
            </span>
          ))
        )}
      </button>
      {open ? (
        <div className="absolute z-40 mt-1 max-h-56 w-full overflow-y-auto rounded border border-zinc-300 bg-white p-1 shadow-lg">
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-zinc-500">No options</p>
          ) : (
            options.map((opt) => {
              const on = selected.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50"
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(opt.value)}
                    className="h-4 w-4 accent-[var(--cc-blue)]"
                  />
                  {opt.label}
                </label>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  allLabel = "All",
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const summary =
    selected.length === 0
      ? allLabel
      : selected.length <= 2
        ? options
            .filter((o) => selected.includes(o.value))
            .map((o) => o.label)
            .join(", ")
        : `${selected.length} selected`;

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((x) => x !== value)
        : [...selected, value],
    );
  }

  return (
    <div ref={rootRef} className="relative text-sm">
      <p className="font-semibold text-[var(--cc-navy)]">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-left text-sm text-[var(--cc-navy)]"
      >
        <span className="truncate">{summary}</span>
        <span className="ml-2 shrink-0 text-[var(--cc-steel)]">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open ? (
        <div className="absolute z-40 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[var(--cc-line)] bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`mb-0.5 block w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold ${
              selected.length === 0
                ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                : "text-[var(--cc-steel)] hover:bg-[var(--cc-field)]"
            }`}
          >
            {allLabel}
          </button>
          {options.map((opt) => {
            const on = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(opt.value)}
                  className="h-4 w-4 accent-[var(--cc-blue)]"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CoachesRosterScreen() {
  const {
    role,
    teamMembers,
    createMemberAccount,
    deleteMember,
    updateMember,
    teamNames,
    openCoachSettings,
  } = useApp();
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const creatable = staffRolesActorCanCreate(role);
  const [newRole, setNewRole] = useState<Role>("coach");
  const [flash, setFlash] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "phone" | "email" | "role" | "teams" | "duties"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const teams = teamNames.length ? teamNames : [...teamLevels];
  const canAdminFields = canManageCoachAdminFields(role);

  useEffect(() => {
    const allowed = staffRolesActorCanCreate(role);
    if (allowed.length && !allowed.includes(newRole)) {
      setNewRole(allowed[0]);
    }
  }, [role, newRole]);

  if (!canSeeCoachesRoster(role)) {
    return (
      <Panel title="Rosters · Coaches">
        <p className="text-sm text-[var(--cc-steel)]">
          Coaches directory is for coaches and above.
        </p>
      </Panel>
    );
  }

  function toggleSort(
    key: "name" | "phone" | "email" | "role" | "teams" | "duties",
  ) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const staffList = teamMembers
    .filter((m) => m.role === "coach" || m.role === "coordinator")
    .filter((m) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [
        m.name,
        m.phone,
        m.email,
        roleLabels[m.role],
        m.duties ?? "",
        (m.assignedTeams ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    })
    .slice()
    .sort((a, b) => {
      const valueFor = (m: (typeof teamMembers)[number]) => {
        switch (sortKey) {
          case "phone":
            return m.phone || "";
          case "email":
            return m.email || "";
          case "role":
            return roleLabels[m.role];
          case "teams":
            return (m.assignedTeams ?? []).join(", ");
          case "duties":
            return m.duties || "";
          default:
            return m.name;
        }
      };
      const primary = compareSortValues(valueFor(a), valueFor(b), sortDir);
      return primary || compareByLastName(a, b);
    });

  function submitStaff() {
    const firstName = newFirst.trim();
    const lastName = newLast.trim();
    if (!firstName || !lastName || !creatable.includes(newRole)) return;
    const name = composeDisplayName(firstName, lastName);
    createMemberAccount({
      firstName,
      lastName,
      role: newRole,
      phone: newPhone,
      email: newEmail,
    });
    setNewFirst("");
    setNewLast("");
    setNewPhone("");
    setNewEmail("");
    setFlash(`${name} (${roleLabels[newRole]}) account created.`);
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Rosters · Coaches"
        action={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coaches…"
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
          />
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Click headers to sort. Click a name to open their profile.
          {canAdminFields
            ? " Use Edit staff to manage teams, duties, notes, and athletic period."
            : ""}
          {creatable.length
            ? role === "admin"
              ? " Admins can add coordinators and coaches."
              : " Coordinators can add coaches."
            : ""}
        </p>
        {creatable.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3">
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                First name
              </span>
              <input
                value={newFirst}
                onChange={(e) => setNewFirst(e.target.value)}
                placeholder="First"
                className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Last name
              </span>
              <input
                value={newLast}
                onChange={(e) => setNewLast(e.target.value)}
                placeholder="Last"
                className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Number</span>
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="281-555-0100"
                className="mt-1 block w-40 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Email</span>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="coach@cycreek.edu"
                className="mt-1 block w-52 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Role</span>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="mt-1 block rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              >
                {creatable.map((r) => (
                  <option key={r} value={r}>
                    {roleLabels[r]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={submitStaff}
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
            >
              Add account
            </button>
            {flash ? (
              <p className="w-full text-sm font-medium text-[var(--cc-blue)]">
                {flash}
              </p>
            ) : null}
          </div>
        ) : null}
      </Panel>

      <div className="overflow-x-auto rounded-xl border border-[var(--cc-line)] bg-white">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-[var(--cc-field)] text-xs text-[var(--cc-steel)]">
            <tr>
              <SortHeader
                label="Name"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggleSort("name")}
              />
              <SortHeader
                label="Number"
                active={sortKey === "phone"}
                dir={sortDir}
                onClick={() => toggleSort("phone")}
              />
              <SortHeader
                label="Email"
                active={sortKey === "email"}
                dir={sortDir}
                onClick={() => toggleSort("email")}
              />
              <SortHeader
                label="Role"
                active={sortKey === "role"}
                dir={sortDir}
                onClick={() => toggleSort("role")}
              />
              {canAdminFields ? (
                <>
                  <SortHeader
                    label="Teams"
                    active={sortKey === "teams"}
                    dir={sortDir}
                    onClick={() => toggleSort("teams")}
                  />
                  <SortHeader
                    label="Duties"
                    active={sortKey === "duties"}
                    dir={sortDir}
                    onClick={() => toggleSort("duties")}
                  />
                </>
              ) : null}
              <th className="px-3 py-2 font-semibold uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td
                  colSpan={canAdminFields ? 7 : 5}
                  className="px-3 py-6 text-center text-sm text-[var(--cc-steel)]"
                >
                  No coaches or coordinators yet.
                </td>
              </tr>
            ) : (
              staffList.map((m) => {
                const canManage = canManageStaffRole(role, m.role);
                const expanded = expandedId === m.id;
                return (
                  <Fragment key={m.id}>
                    <tr className="border-t border-[var(--cc-line)]">
                      <td className="px-3 py-2 align-top">
                        <CoachNameLink id={m.id} name={m.name} />
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--cc-steel)]">
                        {m.phone || "—"}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--cc-steel)]">
                        {m.email || "—"}
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--cc-navy)]">
                        {roleLabels[m.role]}
                      </td>
                      {canAdminFields ? (
                        <>
                          <td className="px-3 py-2 align-top text-[var(--cc-steel)]">
                            {(m.assignedTeams ?? []).join(", ") || "—"}
                          </td>
                          <td className="px-3 py-2 align-top text-[var(--cc-steel)]">
                            {m.duties || "—"}
                          </td>
                        </>
                      ) : null}
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openCoachSettings(m.id)}
                            className="rounded-md border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                          >
                            Profile
                          </button>
                          {canAdminFields ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId((id) =>
                                  id === m.id ? null : m.id,
                                )
                              }
                              className="rounded-md border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                            >
                              {expanded ? "Hide" : "Edit staff"}
                            </button>
                          ) : null}
                          {canManage ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Remove ${m.name} (${roleLabels[m.role]})?`,
                                  )
                                ) {
                                  deleteMember(m.id);
                                }
                              }}
                              className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {canAdminFields && expanded ? (
                      <tr className="border-t border-[var(--cc-line)] bg-[var(--cc-field)]/60">
                        <td
                          colSpan={canAdminFields ? 7 : 5}
                          className="px-3 py-4"
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-sm sm:col-span-2">
                              <span className="font-semibold text-[var(--cc-navy)]">
                                Assigned teams
                              </span>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {teams.map((t) => {
                                  const on = (m.assignedTeams ?? []).includes(
                                    t,
                                  );
                                  return (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => {
                                        const current = m.assignedTeams ?? [];
                                        const next = on
                                          ? current.filter((x) => x !== t)
                                          : [...current, t];
                                        updateMember(m.id, {
                                          assignedTeams: next,
                                        });
                                      }}
                                      className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                        on
                                          ? "bg-[var(--cc-blue)] text-white"
                                          : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
                                      }`}
                                    >
                                      {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </label>
                            <label className="text-sm">
                              <span className="font-semibold text-[var(--cc-navy)]">
                                Duties
                              </span>
                              <input
                                value={m.duties ?? ""}
                                onChange={(e) =>
                                  updateMember(m.id, { duties: e.target.value })
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                              />
                            </label>
                            <label className="text-sm">
                              <span className="font-semibold text-[var(--cc-navy)]">
                                Athletic period
                              </span>
                              <input
                                value={m.athleticPeriod ?? ""}
                                onChange={(e) =>
                                  updateMember(m.id, {
                                    athleticPeriod: e.target.value,
                                  })
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                              />
                            </label>
                            <label className="text-sm sm:col-span-2">
                              <span className="font-semibold text-[var(--cc-navy)]">
                                Notes
                              </span>
                              <textarea
                                value={m.notes ?? ""}
                                onChange={(e) =>
                                  updateMember(m.id, { notes: e.target.value })
                                }
                                rows={2}
                                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                              />
                            </label>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayersScreen({
  personnelType,
}: {
  personnelType: PersonnelType;
}) {
  const {
    role,
    roster,
    updateAthlete,
    deleteAthlete,
    teamNames,
    createMemberAccount,
    positionGroups,
  } = useApp();
  const canEdit = canEditRoster(role);
  const canAddAccounts = canCreatePlayerAccounts(role);
  const [query, setQuery] = useState("");
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addFlash, setAddFlash] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<
    "name" | "group" | "grade" | "team" | "type" | "account"
  >("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const typeLabel =
    personnelType === "athlete" ? "Athletes" : "Student support staff";
  const isAthlete = personnelType === "athlete";

  if (!canSeePersonnel(role)) {
    return (
      <Panel title={`Rosters · ${typeLabel}`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Rosters are for coaches and above.
        </p>
      </Panel>
    );
  }

  function submitNewAccount() {
    const firstName = newFirst.trim();
    const lastName = newLast.trim();
    if (!firstName || !lastName) return;
    const name = composeDisplayName(firstName, lastName);
    createMemberAccount({
      firstName,
      lastName,
      role: "player",
      personnelType,
      phone: newPhone,
      email: newEmail,
    });
    setNewFirst("");
    setNewLast("");
    setNewPhone("");
    setNewEmail("");
    setAddFlash(`${name} account created and added to this roster.`);
  }

  function toggleSort(
    key: "name" | "group" | "grade" | "team" | "type" | "account",
  ) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = roster
    .filter((a) => (a.personnelType ?? "athlete") === personnelType)
    .filter((a) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        (a.phone ?? "").toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (isAthlete &&
          a.groups.some((g) => g.toLowerCase().includes(q))) ||
        a.classYear.toLowerCase().includes(q) ||
        (a.teamLevel ?? "").toLowerCase().includes(q)
      );
    })
    .slice()
    .sort((a, b) => {
      const valueFor = (x: Athlete) => {
        switch (sortKey) {
          case "group":
            return x.groups.join(", ");
          case "grade":
            return x.classYear;
          case "team":
            return x.teamLevel || "";
          case "type":
            return x.personnelType || "athlete";
          case "account":
            return x.accountId ? "1" : "0";
          default:
            return x.lastName || x.name;
        }
      };
      const primary = compareSortValues(valueFor(a), valueFor(b), sortDir);
      return primary || compareByLastName(a, b);
    });

  return (
    <div className="space-y-4">
      <Panel
        title={`Rosters · ${typeLabel}`}
        action={
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAthlete ? "Search name or group…" : "Search name…"}
            className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
          />
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Click column headers to sort. Click a name to open settings
          {canEdit ? " (Coach+ can edit)." : "."}
        </p>
        {canAddAccounts ? (
          <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3">
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                First name
              </span>
              <input
                value={newFirst}
                onChange={(e) => setNewFirst(e.target.value)}
                placeholder="First"
                className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Last name
              </span>
              <input
                value={newLast}
                onChange={(e) => setNewLast(e.target.value)}
                placeholder="Last"
                className="mt-1 block w-36 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">
                Phone number
              </span>
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="281-555-0100"
                className="mt-1 block w-40 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Email</span>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="player@email.com"
                className="mt-1 block w-48 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={submitNewAccount}
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
            >
              Add account
            </button>
            {addFlash ? (
              <p className="w-full text-sm font-medium text-[var(--cc-blue)]">
                {addFlash}
              </p>
            ) : (
              <p className="w-full text-xs text-[var(--cc-steel)]">
                Creates a linked player login and adds them to this roster.
              </p>
            )}
          </div>
        ) : null}
      </Panel>

      <div className="overflow-hidden rounded-xl border border-[var(--cc-line)] bg-white">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-[var(--cc-field)] text-xs text-[var(--cc-steel)]">
            <tr>
              <SortHeader
                label="Name"
                active={sortKey === "name"}
                dir={sortDir}
                onClick={() => toggleSort("name")}
              />
              {isAthlete ? (
                <SortHeader
                  label="Group / Position"
                  active={sortKey === "group"}
                  dir={sortDir}
                  onClick={() => toggleSort("group")}
                />
              ) : null}
              <SortHeader
                label="Grade"
                active={sortKey === "grade"}
                dir={sortDir}
                onClick={() => toggleSort("grade")}
              />
              {isAthlete ? (
                <SortHeader
                  label="Team"
                  active={sortKey === "team"}
                  dir={sortDir}
                  onClick={() => toggleSort("team")}
                />
              ) : null}
              <SortHeader
                label="Type"
                active={sortKey === "type"}
                dir={sortDir}
                onClick={() => toggleSort("type")}
              />
              <SortHeader
                label="Account"
                active={sortKey === "account"}
                dir={sortDir}
                onClick={() => toggleSort("account")}
              />
              {canEdit ? (
                <th className="px-3 py-2 font-semibold uppercase tracking-wide">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t border-[var(--cc-line)]">
                <td className="px-3 py-2 align-top">
                  <PlayerNameLink id={a.id} name={a.name} />
                </td>
                {isAthlete ? (
                  <td className="px-3 py-2 align-top">
                    {canEdit ? (
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {positionGroups.map((pos) => {
                          const on = a.groups.includes(pos.abbreviation);
                          return (
                            <label
                              key={pos.id}
                              title={pos.name}
                              className={`inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
                                on
                                  ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                                  : "border-[var(--cc-line)] text-[var(--cc-steel)]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={on}
                                onChange={(e) => {
                                  const next = e.target.checked
                                    ? [...a.groups, pos.abbreviation]
                                    : a.groups.filter(
                                        (x) => x !== pos.abbreviation,
                                      );
                                  updateAthlete(a.id, {
                                    groups: next.length ? next : a.groups,
                                  });
                                }}
                              />
                              {pos.abbreviation}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[var(--cc-steel)]">
                        {a.groups.join(", ")}
                      </span>
                    )}
                  </td>
                ) : null}
                <td className="px-3 py-2 align-top">
                  {canEdit ? (
                    <select
                      value={a.classYear}
                      onChange={(e) =>
                        updateAthlete(a.id, {
                          classYear: e.target.value as GradClass,
                        })
                      }
                      className="rounded-md border border-[var(--cc-line)] px-2 py-1.5 text-[var(--cc-navy)]"
                    >
                      {GRADE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="capitalize text-[var(--cc-navy)]">
                      {a.classYear}
                    </span>
                  )}
                </td>
                {isAthlete ? (
                  <td className="px-3 py-2 align-top">
                    {canEdit ? (
                      <select
                        value={a.teamLevel ?? "Varsity"}
                        onChange={(e) =>
                          updateAthlete(a.id, { teamLevel: e.target.value })
                        }
                        className="rounded-md border border-[var(--cc-line)] px-2 py-1.5 text-[var(--cc-navy)]"
                      >
                        {(teamNames.length ? teamNames : [...teamLevels]).map(
                          (t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ),
                        )}
                      </select>
                    ) : (
                      <span className="text-[var(--cc-navy)]">
                        {a.teamLevel ?? "Varsity"}
                      </span>
                    )}
                  </td>
                ) : null}
                <td className="px-3 py-2 align-top">
                  {canEdit ? (
                    <select
                      value={a.personnelType ?? "athlete"}
                      onChange={(e) => {
                        updateAthlete(a.id, {
                          personnelType: e.target.value as PersonnelType,
                        });
                      }}
                      className="max-w-[9rem] rounded-md border border-[var(--cc-line)] px-2 py-1.5 text-[var(--cc-navy)]"
                    >
                      <option value="athlete">Athlete</option>
                      <option value="support-staff">
                        Student support staff
                      </option>
                    </select>
                  ) : (
                    <span className="text-[var(--cc-navy)]">
                      {(a.personnelType ?? "athlete") === "athlete"
                        ? "Athlete"
                        : "Student support staff"}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-top text-xs text-[var(--cc-steel)]">
                  {a.accountId ? "Linked" : "Roster only"}
                </td>
                {canEdit ? (
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${a.name} from personnel? Use this for duplicate accounts.`,
                          )
                        ) {
                          deleteAthlete(a.id);
                        }
                      }}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceScreen({
  personnelType,
}: {
  personnelType: PersonnelType;
}) {
  const {
    role,
    roster,
    attendance,
    setAttendance,
    attendanceDate,
    setAttendanceDate,
    teamNames,
    positionGroups,
  } = useApp();

  const typeLabel =
    personnelType === "athlete" ? "Athletes" : "Student support staff";
  const isAthlete = personnelType === "athlete";

  const [draftDate, setDraftDate] = useState(attendanceDate);
  const [draftTeam, setDraftTeam] = useState("all");
  const [draftPositions, setDraftPositions] = useState<string[]>([]);
  const [draftGrades, setDraftGrades] = useState<string[]>([]);
  const [appliedTeam, setAppliedTeam] = useState("all");
  const [appliedPositions, setAppliedPositions] = useState<string[]>([]);
  const [appliedGrades, setAppliedGrades] = useState<string[]>([]);

  if (!canSeePersonnel(role)) {
    return (
      <Panel title={`Attendance · ${typeLabel}`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Attendance is for coaches and above.
        </p>
      </Panel>
    );
  }

  const canEdit = canEditRoster(role);
  const teamOptions = teamNames.length ? teamNames : [...teamLevels];

  function runSearch() {
    setAttendanceDate(draftDate);
    setAppliedTeam(isAthlete ? draftTeam : "all");
    setAppliedPositions(isAthlete ? [...draftPositions] : []);
    setAppliedGrades([...draftGrades]);
  }

  function resetFilters() {
    setDraftDate(attendanceDate);
    setDraftTeam("all");
    setDraftPositions([]);
    setDraftGrades([]);
    setAppliedTeam("all");
    setAppliedPositions([]);
    setAppliedGrades([]);
  }

  const sorted = roster
    .filter((a) => (a.personnelType ?? "athlete") === personnelType)
    .filter((a) => {
      if (isAthlete) {
        const team = a.teamLevel ?? "Varsity";
        if (appliedTeam !== "all" && team !== appliedTeam) return false;
      }
      if (
        appliedGrades.length > 0 &&
        !appliedGrades.includes(a.classYear)
      ) {
        return false;
      }
      if (
        isAthlete &&
        appliedPositions.length > 0 &&
        !a.groups.some((g) => appliedPositions.includes(g))
      ) {
        return false;
      }
      return true;
    })
    .slice()
    .sort(compareByLastName);

  const counts = ATTENDANCE_OPTIONS.reduce(
    (acc, opt) => {
      acc[opt.id] = sorted.filter((a) => attendance[a.id] === opt.id).length;
      return acc;
    },
    {} as Record<AttendanceStatus, number>,
  );
  const unmarked = sorted.filter((a) => !attendance[a.id]).length;
  const filterCols = isAthlete ? "lg:grid-cols-4" : "lg:grid-cols-2";
  const tableCols = isAthlete ? 5 : 3;

  return (
    <div className="space-y-4">
      <Panel title={`Attendance · ${typeLabel}`}>
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Search {typeLabel.toLowerCase()} by date
          {isAthlete ? ", team, position," : ""} and grade, then mark
          attendance.
          {canEdit ? " Coach+ can edit." : ""}
        </p>
        <div className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3">
          <div className={`grid gap-3 sm:grid-cols-2 ${filterCols}`}>
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Date</span>
              <input
                type="date"
                value={draftDate}
                onChange={(e) => setDraftDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
              />
            </label>
            {isAthlete ? (
              <label className="text-sm">
                <span className="font-semibold text-[var(--cc-navy)]">Team</span>
                <select
                  value={draftTeam}
                  onChange={(e) => setDraftTeam(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
                >
                  <option value="all">All teams</option>
                  {teamOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {isAthlete ? (
              <MultiSelectDropdown
                label="Positions"
                allLabel="All positions"
                selected={draftPositions}
                onChange={setDraftPositions}
                options={positionGroups.map((pos) => ({
                  value: pos.abbreviation,
                  label: `${pos.name} (${pos.abbreviation})`,
                }))}
              />
            ) : null}
            <MultiSelectDropdown
              label="Grades"
              allLabel="All grades"
              selected={draftGrades}
              onChange={setDraftGrades}
              options={GRADE_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runSearch}
              className="rounded-lg bg-[var(--cc-blue)] px-4 py-2 text-sm font-semibold text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-[var(--cc-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--cc-navy)]"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <Chip>Date · {attendanceDate}</Chip>
          {ATTENDANCE_OPTIONS.map((opt) => (
            <Chip key={opt.id}>
              {opt.label} · {counts[opt.id]}
            </Chip>
          ))}
          <Chip>Unmarked · {unmarked}</Chip>
          <Chip>Showing · {sorted.length}</Chip>
        </div>
      </Panel>

      <div className="overflow-hidden rounded-xl border border-[var(--cc-line)] bg-white">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-[var(--cc-field)] text-xs uppercase tracking-wide text-[var(--cc-steel)]">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              {isAthlete ? (
                <th className="px-3 py-2 font-semibold">Team</th>
              ) : null}
              {isAthlete ? (
                <th className="px-3 py-2 font-semibold">Group</th>
              ) : null}
              <th className="px-3 py-2 font-semibold">Grade</th>
              <th className="px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={tableCols}
                  className="px-3 py-6 text-center text-sm text-[var(--cc-steel)]"
                >
                  No people match these filters. Try Reset or adjust Search.
                </td>
              </tr>
            ) : (
              sorted.map((a) => {
                const status = attendance[a.id];
                return (
                  <tr key={a.id} className="border-t border-[var(--cc-line)]">
                    <td className="px-3 py-2.5 font-medium text-[var(--cc-navy)]">
                      <PlayerNameLink id={a.id} name={a.name} />
                    </td>
                    {isAthlete ? (
                      <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                        {a.teamLevel ?? "Varsity"}
                      </td>
                    ) : null}
                    {isAthlete ? (
                      <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                        {a.groups.join(", ")}
                      </td>
                    ) : null}
                    <td className="px-3 py-2.5 capitalize text-[var(--cc-steel)]">
                      {a.classYear}
                    </td>
                    <td className="px-3 py-2.5">
                      {canEdit ? (
                        <div className="flex flex-wrap gap-1">
                          {ATTENDANCE_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setAttendance(a.id, opt.id)}
                              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                status === opt.id
                                  ? "bg-[var(--cc-blue)] text-white"
                                  : "border border-[var(--cc-line)] text-[var(--cc-steel)] hover:bg-[var(--cc-field)]"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="capitalize text-[var(--cc-navy)]">
                          {status ?? "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceReportScreen() {
  const { role, roster, attendanceByDate, teamNames } = useApp();
  const [ran, setRan] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | PersonnelType>("all");

  if (!canSeePersonnel(role)) {
    return (
      <Panel title="Report">
        <p className="text-sm text-[var(--cc-steel)]">
          Attendance reports are for coaches and above.
        </p>
      </Panel>
    );
  }

  function datesInRange(start: string, end: string) {
    const out: string[] = [];
    const a = new Date(`${start}T12:00:00`);
    const b = new Date(`${end}T12:00:00`);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) {
      return out;
    }
    for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }

  const rangeDates = datesInRange(startDate, endDate);
  const teamOptions = teamNames.length ? teamNames : [...teamLevels];

  const filteredPeople = roster
    .filter((a) => {
      const type = a.personnelType ?? "athlete";
      if (typeFilter !== "all" && type !== typeFilter) return false;
      if (
        type === "athlete" &&
        teamFilter !== "all" &&
        (a.teamLevel ?? "Varsity") !== teamFilter
      ) {
        return false;
      }
      return true;
    })
    .slice()
    .sort(compareByLastName);

  const rows = filteredPeople.map((person) => {
    const counts = {
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      unmarked: 0,
    };
    for (const date of rangeDates) {
      const status = attendanceByDate[date]?.[person.id];
      if (!status) counts.unmarked += 1;
      else counts[status] += 1;
    }
    return { person, counts };
  });

  const summary = rows.reduce(
    (acc, row) => {
      acc.present += row.counts.present;
      acc.late += row.counts.late;
      acc.absent += row.counts.absent;
      acc.excused += row.counts.excused;
      acc.unmarked += row.counts.unmarked;
      return acc;
    },
    { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 },
  );

  const typeLabel =
    typeFilter === "all"
      ? "All types"
      : typeFilter === "athlete"
        ? "Athlete"
        : "Student support staff";
  const showTeam = typeFilter !== "support-staff";
  const teamLabel = !showTeam
    ? null
    : teamFilter === "all"
      ? "All teams"
      : teamFilter;

  return (
    <div className="space-y-4">
      <Panel title="Attendance report">
        <p className="text-sm text-[var(--cc-steel)]">
          Pull attendance from a start date through an end date, filtered by
          type{showTeam ? " and team" : ""}.
        </p>
        <div
          className={`mt-3 grid gap-3 sm:grid-cols-2 ${
            showTeam ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Type</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                const next = e.target.value as "all" | PersonnelType;
                setTypeFilter(next);
                if (next === "support-staff") setTeamFilter("all");
              }}
              className="mt-1 block w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
            >
              <option value="all">All types</option>
              <option value="athlete">Athlete</option>
              <option value="support-staff">Student support staff</option>
            </select>
          </label>
          {showTeam ? (
            <label className="text-sm">
              <span className="font-semibold text-[var(--cc-navy)]">Team</span>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
              >
                <option value="all">All teams</option>
                {teamOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={() => setRan(true)}
          className="mt-3 rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
        >
          Run report
        </button>
      </Panel>

      {ran ? (
        <Panel
          title={`Report · ${typeLabel}${
            teamLabel ? ` · ${teamLabel}` : ""
          } · ${startDate} → ${endDate}`}
        >
          {rangeDates.length === 0 ? (
            <p className="text-sm text-red-700">
              Invalid date range — end date must be on or after start date.
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs text-[var(--cc-steel)]">
                {rangeDates.length} day{rangeDates.length === 1 ? "" : "s"} ·{" "}
                {filteredPeople.length} people
              </p>
              <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
                <Chip>Present · {summary.present}</Chip>
                <Chip>Late · {summary.late}</Chip>
                <Chip>Absent · {summary.absent}</Chip>
                <Chip>Excused · {summary.excused}</Chip>
                <Chip>Unmarked · {summary.unmarked}</Chip>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[var(--cc-line)]">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <thead className="bg-[var(--cc-field)] text-xs uppercase tracking-wide text-[var(--cc-steel)]">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Name</th>
                      {showTeam ? (
                        <th className="px-3 py-2 font-semibold">Team</th>
                      ) : null}
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Present</th>
                      <th className="px-3 py-2 font-semibold">Late</th>
                      <th className="px-3 py-2 font-semibold">Absent</th>
                      <th className="px-3 py-2 font-semibold">Excused</th>
                      <th className="px-3 py-2 font-semibold">Unmarked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ person, counts }) => (
                      <tr
                        key={person.id}
                        className="border-t border-[var(--cc-line)]"
                      >
                        <td className="px-3 py-2.5 font-medium text-[var(--cc-navy)]">
                          <PlayerNameLink id={person.id} name={person.name} />
                        </td>
                        {showTeam ? (
                          <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                            {(person.personnelType ?? "athlete") ===
                            "support-staff"
                              ? "—"
                              : (person.teamLevel ?? "Varsity")}
                          </td>
                        ) : null}
                        <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                          {(person.personnelType ?? "athlete") === "athlete"
                            ? "Athlete"
                            : "Student support staff"}
                        </td>
                        <td className="px-3 py-2.5">{counts.present}</td>
                        <td className="px-3 py-2.5">{counts.late}</td>
                        <td className="px-3 py-2.5">{counts.absent}</td>
                        <td className="px-3 py-2.5">{counts.excused}</td>
                        <td className="px-3 py-2.5">{counts.unmarked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Panel>
      ) : (
        <Panel title="No report yet">
          <p className="text-sm text-[var(--cc-steel)]">
            Set the date range and type
            {showTeam ? ", and team," : ","} then click Run report.
          </p>
        </Panel>
      )}
    </div>
  );
}

export function ScreenRouter() {
  const { page } = useApp();

  if (page === "this-week") return <ThisWeekScreen />;
  if (page === "schedule") return <ScheduleScreen />;
  if (page === "quizzes") return <QuizzesScreen />;
  if (page === "groups" || page === "personnel-program-groups")
    return <GroupsScreen />;
  if (page === "staff" || page === "admin-staff" || page === "admin-coach-groups")
    return <AdminStaffScreen />;
  if (page === "admin" || page === "admin-branding")
    return <AdminScreen section="branding" />;
  if (page === "admin-members") return <AdminScreen section="members" />;
  if (page === "admin-teams") return <AdminTeamsScreen />;
  if (page === "admin-schedule") return <AdminScheduleScreen />;
  if (page === "admin-depth-settings") return <AdminDepthSettingsScreen />;
  if (page === "admin-team-goals") return <AdminTeamGoalsScreen />;
  if (page === "account") return <AccountScreen />;
  if (page === "personnel-program-summary" || page === "personnel-program")
    return <ProgramSummaryScreen />;
  if (page === "personnel-program-positions")
    return <ProgramPositionsScreen />;
  if (
    page === "depth-charts" ||
    page === "personnel-depth" ||
    page === "personnel-program-depth"
  )
    return <DepthChartsScreen />;
  if (
    page === "personnel-roster-athletes" ||
    page === "personnel-players"
  )
    return <PlayersScreen personnelType="athlete" />;
  if (page === "personnel-roster-support")
    return <PlayersScreen personnelType="support-staff" />;
  if (page === "personnel-roster-coaches") return <CoachesRosterScreen />;
  if (
    page === "personnel-attendance-athletes" ||
    page === "personnel-attendance"
  )
    return <AttendanceScreen personnelType="athlete" />;
  if (page === "personnel-attendance-support")
    return <AttendanceScreen personnelType="support-staff" />;
  if (page === "personnel-report") return <AttendanceReportScreen />;
  if (page === "scout") return <ScoutScreen />;
  if (page === "stats") return <StatsScreen />;
  if (page === "my-room-group") return <MyRoomGroupScreen />;
  if (page === "my-room-responsibles") return <MyRoomResponsiblesScreen />;
  if (page === "my-room-depth") return <MyRoomDepthScreen />;
  if (page === "my-room-scout") return <MyRoomScoutScreen />;
  if (page === "my-room-quizzes") return <MyRoomQuizzesScreen />;
  if (page === "my-room-grades") return <MyRoomGradesScreen />;
  if (page === "grades") return <GradesScreen />;
  if (page === "unit-home") return <UnitHomeScreen />;
  if (page.startsWith("teach-")) return <TeachScreen kind={page} />;
  return <ThisWeekScreen />;
}

export function AppShell() {
  const {
    role,
    setRole,
    side,
    setSide,
    page,
    setPage,
    season,
    openNavMenu,
    setOpenNavMenu,
    branding,
    presentMode,
    setPresentMode,
  } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--cc-blue", branding.colors.primary);
    root.style.setProperty("--cc-navy", branding.colors.navy);
    root.style.setProperty("--cc-steel", branding.colors.steel);
    root.style.setProperty("--cc-field", branding.colors.field);
    root.style.setProperty("--cc-accent", branding.colors.accent);
  }, [branding.colors]);

  useEffect(() => {
    document.documentElement.classList.toggle("present-mode", presentMode);
    return () => document.documentElement.classList.remove("present-mode");
  }, [presentMode]);

  async function enterPresent() {
    setPresentMode(true);
    setPage("personnel-depth");
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* fullscreen optional */
    }
  }

  async function exitPresent() {
    setPresentMode(false);
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
  }

  const programNav = programNavForRole(role);
  const unitItems = unitMenuItems();
  const roomItems = myRoomMenuItems();
  const personalItems = personnelMenuItems(role);
  const adminItems = adminMenuItems(role);
  const showUnitMenus =
    !presentMode && role !== "fan" && role !== "parent";
  const showMyRoom = !presentMode && canSeeMyRoom(role);
  const showPersonal = !presentMode && canSeePersonnel(role);
  const showAdmin = !presentMode && canSeeAdminMenu(role);
  const [personnelSubmenu, setPersonnelSubmenu] = useState<string | null>(
    null,
  );

  function pickUnitPage(nextSide: Side, nextPage: AppPage) {
    setSide(nextSide);
    setPage(nextPage);
    setOpenNavMenu(null);
  }

  function pickMyRoomPage(nextPage: AppPage) {
    setPage(nextPage);
    setOpenNavMenu(null);
  }

  function pickPersonalPage(nextPage: AppPage) {
    setPage(nextPage);
    setOpenNavMenu(null);
    setPersonnelSubmenu(null);
  }

  function pickAdminPage(nextPage: AppPage) {
    setPage(nextPage);
    setOpenNavMenu(null);
  }

  return (
    <div className="min-h-screen bg-[var(--cc-field)]">
      <header className="depth-print-hide relative z-50 border-b border-[var(--cc-line)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--cc-blue)] font-bold">
              {branding.teamLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={branding.teamLogoUrl}
                  alt=""
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                branding.logoLetter
              )}
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl leading-none tracking-wide">
                {branding.name}
              </p>
              <p className="text-xs text-white/70">
                {branding.unit} · Season {season}
                {presentMode ? " · Workout board" : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {presentMode ? (
              <button
                type="button"
                onClick={() => void exitPresent()}
                className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-white/90"
              >
                Exit present
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void enterPresent()}
                  className="rounded-md bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--cc-blue)]/90"
                >
                  Show team
                </button>
                <label className="text-xs text-white/70">
                  View as{" "}
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="ml-1 rounded-md border-0 bg-white/10 px-2 py-1.5 text-sm text-white"
                  >
                    {(Object.keys(roleLabels) as Role[]).map((r) => (
                      <option key={r} value={r} className="text-black">
                        {roleLabels[r]}
                      </option>
                    ))}
                  </select>
                </label>
                <Link
                  href="/fan"
                  className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20"
                >
                  Open Fan page
                </Link>
              </>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 pb-2">
          {(presentMode
            ? [
                { id: "this-week" as const, label: "This Week" },
                { id: "schedule" as const, label: "Schedule" },
                { id: "personnel-depth" as const, label: "Depth Charts" },
              ]
            : programNav
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPage(item.id);
                setOpenNavMenu(null);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                page === item.id
                  ? "bg-white text-[var(--cc-navy)]"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}

          {showMyRoom && (
            <div className="relative z-50">
              <button
                type="button"
                onClick={() =>
                  setOpenNavMenu(
                    openNavMenu === "my-room" ? null : "my-room",
                  )
                }
                className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                  isMyRoomPage(page)
                    ? "bg-white text-[var(--cc-navy)]"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                My Group ▾
              </button>
              {openNavMenu === "my-room" && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-[220px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                  {roomItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => pickMyRoomPage(item.id)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                        page === item.id
                          ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                          : "text-[var(--cc-navy)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {showUnitMenus &&
            (["offense", "defense"] as const).map((unit) => {
              const open = openNavMenu === unit;
              const active = side === unit && isUnitPage(page);
              return (
                <div key={unit} className="relative z-50">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenNavMenu(open ? null : unit)
                    }
                    className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize whitespace-nowrap ${
                      active
                        ? "bg-white text-[var(--cc-navy)]"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {unit} ▾
                  </button>
                  {open && (
                    <div className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                      {unitItems.map((item) => (
                        <button
                          key={`${unit}-${item.id}`}
                          type="button"
                          onClick={() => pickUnitPage(unit, item.id)}
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                            side === unit && page === item.id
                              ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                              : "text-[var(--cc-navy)]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

          {showPersonal && (
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => {
                  const next =
                    openNavMenu === "personnel" ? null : "personnel";
                  setOpenNavMenu(next);
                  if (!next) setPersonnelSubmenu(null);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                  isPersonnelPage(page)
                    ? "bg-white text-[var(--cc-navy)]"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                Personnel ▾
              </button>
              {openNavMenu === "personnel" && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                  {personalItems.map((item) =>
                    item.children?.length ? (
                      <div
                        key={item.id}
                        className="relative"
                        onMouseEnter={() => setPersonnelSubmenu(item.id)}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setPersonnelSubmenu((cur) =>
                              cur === item.id ? null : item.id,
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                            item.children.some((c) => page === c.id) ||
                            personnelSubmenu === item.id
                              ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                              : "text-[var(--cc-navy)]"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="ml-3 text-[var(--cc-steel)]">▸</span>
                        </button>
                        {personnelSubmenu === item.id && (
                          <div className="absolute top-0 left-full z-50 ml-1 min-w-[200px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => pickPersonalPage(child.id)}
                                className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                                  page === child.id
                                    ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                                    : "text-[var(--cc-navy)]"
                                }`}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => pickPersonalPage(item.id)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                          page === item.id ||
                          (item.id === "personnel-depth" &&
                            page === "depth-charts")
                            ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                            : "text-[var(--cc-navy)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          {showAdmin && (
            <div className="relative z-50">
              <button
                type="button"
                onClick={() =>
                  setOpenNavMenu(openNavMenu === "admin" ? null : "admin")
                }
                className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                  isAdminPage(page) && canAccessAdminPage(role, page)
                    ? "bg-white text-[var(--cc-navy)]"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                {adminMenuLabel(role)} ▾
              </button>
              {openNavMenu === "admin" && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-[220px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                  {adminItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => pickAdminPage(item.id)}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                        page === item.id ||
                        (item.id === "admin-branding" && page === "admin")
                          ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                          : "text-[var(--cc-navy)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setPage("account");
              setOpenNavMenu(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
              page === "account"
                ? "bg-white text-[var(--cc-navy)]"
                : "text-white/80 hover:bg-white/10"
            }`}
          >
            Account
          </button>
        </nav>
      </header>

      <main
        className={`mx-auto px-4 py-6 ${presentMode ? "max-w-7xl" : "max-w-6xl"}`}
      >
        <ScreenRouter />
      </main>

      <PlayerSettingsOverlay />
      <CoachSettingsOverlay />

      <footer className="depth-print-hide mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-[var(--cc-steel)]">
        {presentMode
          ? "Cy Creek Football · Workout board"
          : "UI mock only · no real auth/uploads yet · works alongside Hudl"}
      </footer>
    </div>
  );
}
