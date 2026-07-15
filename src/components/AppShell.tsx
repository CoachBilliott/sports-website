"use client";

import {
  emptyGameWeekAssets,
  lookupPositionScoutReport,
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
  WeeklyQuizWeekPanel,
  useQuizEditorGroupSet,
} from "@/components/WeeklyQuizzes";
import {
  RecruitingProfileFields,
  recruitingStoredValue,
  recruitingValuePatch,
} from "@/components/StaffRecruiting";
import {
  athletesForDepthPosition,
  coachStaff,
  coachesOnSide,
  cloneDepthBoard,
  currentGame,
  getNextUpcomingGame,
  resolveActiveGame,
  depthBoards,
  expandCoachGroupsWith,
  gameSlotLabel,
  gameSlotTitle,
  abbreviateGrade,
  abbreviateTeam,
  gradClassLabels,
  groupsForDepthPosition,
  migrateGroupAbbreviation,
  myRoomProfile,
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
  athleteGuardianFieldKeys,
  emptyAthleteCustomFields,
  compareByLastName,
  composeDisplayName,
  findDemoPlayerAthlete,
  findDemoMember,
  demoMemberIdForRole,
  resolveThisWeekIdentity,
  positionTypes,
  depthSchemeTypeOptions,
  isRecruitingStructuralKey,
  type DepthColumnDef,
  type RecruitingSheetColumn,
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
  canEditPositionGroup,
  canEditPositionGroups,
  editablePositionGroupSet,
  isCoordinatorOrAdmin,
  canCreatePlayerAccounts,
  canSeeCoachesRoster,
  canManageStaffRole,
  canManageCoachAdminFields,
  staffRolesActorCanCreate,
  canManageMembers,
  canManageProgramSeason,
  canImportFromArchive,
  canDeleteArchivedSeason,
  canMoveDepthPlayers,
  canSeeDepthCharts,
  canSeeMyRoom,
  canSeeMyRoomStaff,
  canUseGroupChat,
  canSeePersonnel,
  canSeeScout,
  canSeeStaffRoom,
  canTakeQuizzes,
  canEditScheduleMeta,
  canSeeAdminMenu,
  adminMenuLabel,
  canAccessAdminPage,
  isMyRoomPage,
  isDepthChartPage,
  isAdminPage,
  isStaffPage,
  isUnitPage,
  myRoomMenuItems,
  staffMenuItems,
  adminMenuItems,
  programNavForRole,
  roleLabels,
  sideLabel,
  teamMenuUnits,
  unitMenuItemsForRole,
  canAccessUnitPage,
} from "@/lib/permissions";
import {
  defaultQuickActionIds,
  quickActionCatalogForRole,
  quickActionsOwnerKey,
  resolveQuickActions,
} from "@/lib/quickActions";
import { ImportFromArchiveButton } from "@/components/ImportFromArchive";
import type {
  AppPage,
  CoachDuty,
  Game,
  GradeRow,
  GroupChatSenderRole,
  Role,
  Side,
  WeekAutoAdvanceConfig,
} from "@/lib/types";
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
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
  className = "",
  bodyClassName = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-[0_1px_0_rgba(10,37,64,0.04)] ${className}`}
    >
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl tracking-wide text-[var(--cc-navy)]">
          {title}
        </h2>
        {action}
      </div>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
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
      <span className="whitespace-nowrap font-medium text-[var(--cc-navy)]">
        {name}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openPlayerSettings(resolvedId);
      }}
      className={`whitespace-nowrap text-left ${className}`}
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openCoachSettings(resolvedId);
      }}
      className={`text-left ${className}`}
    >
      {name}
    </button>
  );
}

const athleteGuardianFieldKeySet = new Set<string>(athleteGuardianFieldKeys);

function PlayerSettingsOverlay() {
  const {
    role,
    roster,
    playerSettingsId,
    closePlayerSettings,
    updateAthlete,
    inventorySheetColumns,
    recruitingSheetColumns,
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
          <div className="mt-3 space-y-3">
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
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <label className="text-sm">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Jersey #
                  </span>
                  {canEdit ? (
                    <input
                      value={selected.jerseyNumber ?? ""}
                      onChange={(e) =>
                        updateAthlete(selected.id, {
                          jerseyNumber: e.target.value,
                        })
                      }
                      placeholder="e.g. 11"
                      className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                    />
                  ) : (
                    <p className="mt-1 text-[var(--cc-navy)]">
                      {selected.jerseyNumber || "—"}
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
          </div>
        </Panel>

        {showCustomFields ? (
          <>
            <Panel title="Recruiting">
              <RecruitingProfileFields
                athlete={selected}
                canEdit={canEdit}
                columns={recruitingSheetColumns}
                onUpdate={(patch) => updateAthlete(selected.id, patch)}
              />
            </Panel>
            <Panel title="Parent contact">
              <div className="grid gap-3 sm:grid-cols-2">
                {athleteCustomFieldLabels
                  .filter(({ key }) => athleteGuardianFieldKeySet.has(key))
                  .map(({ key, label }) => (
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
            <Panel title="Equipment">
              <p className="mb-3 text-sm text-[var(--cc-steel)]">
                Managed on{" "}
                <span className="font-semibold">
                  Staff → Inventory → Issued Equipment
                </span>{" "}
                — read-only here.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {inventorySheetColumns.map(({ key, label }) => (
                  <label key={key} className="text-sm">
                    <span className="font-semibold text-[var(--cc-navy)]">
                      {label}
                    </span>
                    <p className="mt-1 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/60 px-3 py-2 text-[var(--cc-navy)]">
                      {fields[key] || "—"}
                    </p>
                  </label>
                ))}
              </div>
            </Panel>
          </>
        ) : (
          <Panel title="Profile">
            <p className="text-sm text-[var(--cc-steel)]">
              Equipment and parent contact fields apply to athletes only.
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
          <div className="mt-3 space-y-3">
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
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <p className="text-sm text-[var(--cc-steel)]">
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
    inventorySheetColumns,
    recruitingSheetColumns,
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
          <div className="mt-3 space-y-3">
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
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                Jersey #
              </span>
              <input
                value={athlete.jerseyNumber ?? ""}
                onChange={(e) =>
                  updateAthlete(athlete.id, { jerseyNumber: e.target.value })
                }
                placeholder="e.g. 11"
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
          </div>
        ) : member ? (
          <div className="mt-3 space-y-3">
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
            <div className="grid grid-cols-2 gap-3">
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
            </div>
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        ) : null}
      </Panel>

      {athlete ? (
        <>
          <Panel title="Recruiting">
            <RecruitingProfileFields
              athlete={athlete}
              canEdit
              columns={recruitingSheetColumns}
              onUpdate={(patch) => updateAthlete(athlete.id, patch)}
            />
          </Panel>
          <Panel title="Parent contact">
            <div className="grid gap-3 sm:grid-cols-2">
              {athleteCustomFieldLabels
                .filter(({ key }) => athleteGuardianFieldKeySet.has(key))
                .map(({ key, label }) => {
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
          <Panel title="Equipment">
            <p className="mb-3 text-sm text-[var(--cc-steel)]">
              Managed on{" "}
              <span className="font-semibold">
                Staff → Inventory → Issued Equipment
              </span>{" "}
              —
              read-only here.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {inventorySheetColumns.map(({ key, label }) => {
                const fields = {
                  ...emptyAthleteCustomFields(),
                  ...athlete.customFields,
                };
                return (
                  <label key={key} className="text-sm">
                    <span className="font-semibold text-[var(--cc-navy)]">
                      {label}
                    </span>
                    <p className="mt-1 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/60 px-3 py-2 text-[var(--cc-navy)]">
                      {fields[key] || "—"}
                    </p>
                  </label>
                );
              })}
            </div>
          </Panel>
        </>
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

function opponentMonogram(opponent: string) {
  const parts = opponent
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  }
  return opponent.slice(0, 2).toUpperCase() || "—";
}

function WeekActionButton({
  label,
  onClick,
  primary = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
          : "rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
      }
    >
      {label}
    </button>
  );
}

function QuickActionsPanel({
  role,
  identityKey,
  goUnit,
  setPage,
}: {
  role: Role;
  identityKey: string;
  goUnit: (page: AppPage, unit?: Side) => void;
  setPage: (p: AppPage) => void;
}) {
  const {
    quickActionsByOwner,
    setQuickActionsForOwner,
    clearQuickActionsForOwner,
    isArchiveMode,
  } = useApp();
  const ownerKey = quickActionsOwnerKey(role, identityKey);
  const custom = quickActionsByOwner[ownerKey];
  const actions = resolveQuickActions(role, custom);
  const catalog = quickActionCatalogForRole(role);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(() =>
    custom && custom.length > 0 ? [...custom] : defaultQuickActionIds(role),
  );

  useEffect(() => {
    if (!editing) {
      setDraft(
        custom && custom.length > 0 ? [...custom] : defaultQuickActionIds(role),
      );
    }
  }, [custom, role, editing]);

  function runAction(id: string) {
    const spec = catalog.find((a) => a.id === id);
    if (!spec) return;
    if (spec.side) goUnit(spec.page, spec.side);
    else setPage(spec.page);
  }

  return (
    <Panel
      title="Quick actions"
      action={
        isArchiveMode ? null : (
          <button
            type="button"
            onClick={() => {
              if (editing) {
                setDraft(
                  custom && custom.length > 0
                    ? [...custom]
                    : defaultQuickActionIds(role),
                );
              }
              setEditing((v) => !v);
            }}
            className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        )
      }
    >
      {editing ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--cc-steel)]">
            Choose shortcuts from pages you can open. Leave empty slots unused.
          </p>
          <div className="space-y-2">
            {draft.map((id, index) => (
              <label
                key={`slot-${index}`}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="w-14 font-semibold text-[var(--cc-navy)]">
                  Slot {index + 1}
                </span>
                <select
                  value={id}
                  onChange={(e) => {
                    const next = [...draft];
                    next[index] = e.target.value;
                    setDraft(next);
                  }}
                  className="min-w-[12rem] flex-1 rounded-lg border border-[var(--cc-line)] px-2 py-1.5"
                >
                  {catalog.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Remove
                </button>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const unused = catalog.find((a) => !draft.includes(a.id));
                setDraft((prev) => [
                  ...prev,
                  unused?.id ?? catalog[0]?.id ?? "schedule",
                ]);
              }}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              + Add slot
            </button>
            <button
              type="button"
              onClick={() => {
                clearQuickActionsForOwner(ownerKey);
                setDraft(defaultQuickActionIds(role));
                setEditing(false);
              }}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickActionsForOwner(
                  ownerKey,
                  draft.filter(Boolean),
                );
                setEditing(false);
              }}
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map((a, i) => (
            <WeekActionButton
              key={a.id}
              label={a.label}
              primary={i === 0}
              onClick={() => runAction(a.id)}
            />
          ))}
          {actions.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No quick actions configured.
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}

function DailyCoachMotivation({ context }: { context?: string }) {
  const [data, setData] = useState<{
    quote: string;
    author: string;
    source: string;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (context) params.set("context", context);
    const q = params.toString();
    fetch(`/api/daily-motivation${q ? `?${q}` : ""}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(
        (json: { quote?: string; author?: string; source?: string }) => {
          if (cancelled) return;
          if (!json.quote || !json.author) {
            setFailed(true);
            return;
          }
          setData({
            quote: json.quote,
            author: json.author,
            source: json.source ?? "calendar",
          });
        },
      )
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [context]);

  if (failed && !data) return null;
  if (!data) {
    return (
      <Panel title="Daily motivation" className="h-full">
        <p className="text-sm text-[var(--cc-steel)]">Loading today’s cue…</p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Daily motivation"
      className="h-full"
      bodyClassName="flex flex-col overflow-hidden"
      action={
        <span className="rounded-full bg-[var(--cc-field)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
          {data.source === "ai" ? "AI · daily" : "Fresh daily"}
        </span>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[var(--cc-field)] to-white">
        <blockquote className="overflow-y-auto p-4">
          <p className="break-words font-[family-name:var(--font-display)] text-xl leading-snug text-[var(--cc-navy)] sm:text-2xl">
            “{data.quote}”
          </p>
          <footer className="mt-3 text-sm font-semibold text-[var(--cc-blue)]">
            — {data.author}
          </footer>
        </blockquote>
      </div>
    </Panel>
  );
}

function ThisWeekScreen() {
  const {
    role,
    side,
    setPage,
    setSide,
    roster,
    teamMembers,
    coachAssignments,
    gameMetaOverrides,
    disabledOptionalGames,
    personalTodosByOwner,
    addPersonalTodo,
    updatePersonalTodo,
    togglePersonalTodo,
    removePersonalTodo,
    activeGameId,
    season,
    isArchiveMode,
    scheduleGames,
  } = useApp();

  const identity = useMemo(
    () =>
      resolveThisWeekIdentity(
        role,
        side,
        teamMembers,
        roster,
        coachAssignments,
      ),
    [role, side, teamMembers, roster, coachAssignments],
  );

  const nextGameId = useSiteActiveGameId();
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [nextGameId]);

  const game = useMemo(() => {
    const visible = visibleScheduleGames(scheduleGames, disabledOptionalGames);
    const base =
      visible.find((g) => g.id === nextGameId) ??
      resolveActiveGame(
        visible,
        activeGameId,
        undefined,
        Number(season) || undefined,
      );
    return mergeGameMeta(base, gameMetaOverrides);
  }, [
    nextGameId,
    gameMetaOverrides,
    disabledOptionalGames,
    activeGameId,
    season,
    scheduleGames,
  ]);

  const greetingName =
    identity.kind === "player"
      ? identity.athlete.firstName || identity.athlete.name
      : identity.kind === "staff"
          ? identity.profile.name
          : identity.member?.firstName || roleLabels[role];

  function goUnit(page: AppPage, unit?: Side) {
    if (unit) setSide(unit);
    setPage(page);
  }

  const quickIdentityKey =
    identity.kind === "player"
      ? identity.athlete.id
      : identity.kind === "staff"
          ? identity.profile.coachId || identity.profile.name
          : demoMemberIdForRole(role);

  // Same personal list as My Stuff → Responsibilities ("My to-dos")
  const personalOwnerKey =
    identity.kind === "staff" ? identity.profile.name : "";
  const personalTodos = personalTodosByOwner[personalOwnerKey] ?? [];
  const doneCount = personalTodos.filter((t) => t.done).length;

  return (
    <div className="space-y-4">
      <Panel
        title={
          game.kind === "regular" || game.kind === "playoff"
            ? "This week's game"
            : "This week"
        }
        action={
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
            Hi, {greetingName}
          </p>
        }
      >
        <div className="flex flex-wrap items-start gap-5">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--cc-line)] bg-[var(--cc-field)] shadow-sm">
            {game.logo && !logoFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.logo}
                alt={`${game.opponent} logo`}
                className="h-full w-full object-contain p-3"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span className="text-3xl font-bold text-[var(--cc-navy)]">
                {opponentMonogram(game.opponent)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--cc-blue)]">
              {gameSlotLabel(game)}
            </p>
            <h3 className="mt-1 flex flex-wrap items-center gap-2 text-3xl font-semibold tracking-tight text-[var(--cc-navy)]">
              {gameSlotTitle(game)}
              <GameResultBadge game={game} />
            </h3>
            <p className="mt-2 text-[var(--cc-steel)]">
              {game.date} · {game.time} · {game.homeAway} · {game.venue}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {canSeeScout(role) && (
                <WeekActionButton
                  label="Open scout"
                  primary
                  onClick={() => setPage("scout")}
                />
              )}
              <WeekActionButton
                label="Full schedule"
                onClick={() => setPage("schedule")}
              />
              <a
                href={
                  game.links2026?.schedule ??
                  game.dctfUrl ??
                  team.maxPrepsUrl
                }
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                Opponent ↗
              </a>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <DailyCoachMotivation
          context={`${gameSlotLabel(game)} · ${gameSlotTitle(game)}`}
        />

        <Panel
          title="To-do"
          className="h-full"
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {personalTodos.length > 0 ? (
                <span className="rounded-full bg-[var(--cc-blue)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--cc-blue)]">
                  {doneCount}/{personalTodos.length} done
                </span>
              ) : null}
              {personalOwnerKey && canEditContent(role, isArchiveMode) ? (
                <button
                  type="button"
                  onClick={() => addPersonalTodo(personalOwnerKey)}
                  className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  + Add
                </button>
              ) : null}
            </div>
          }
        >
          {personalTodos.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              {personalOwnerKey ? (
                <>
                  No to-dos yet. Add one here, or manage them on{" "}
                  <button
                    type="button"
                    onClick={() => setPage("my-room-responsibles")}
                    className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                  >
                    My Stuff → Responsibilities
                  </button>
                  .
                </>
              ) : (
                "No to-dos yet."
              )}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--cc-line)] rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/30">
              {personalTodos.map((item) => (
                <li key={item.id}>
                  <div
                    className={`flex flex-wrap items-center gap-2 px-2.5 py-1.5 transition ${
                      item.done ? "bg-[var(--cc-field)]/80" : "hover:bg-white/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      disabled={isArchiveMode}
                      onChange={() =>
                        togglePersonalTodo(personalOwnerKey, item.id)
                      }
                      className="h-3.5 w-3.5 shrink-0 accent-[var(--cc-blue)]"
                      aria-label={`Mark done: ${item.text}`}
                    />
                    <input
                      type="text"
                      value={item.text}
                      disabled={isArchiveMode}
                      onChange={(e) =>
                        updatePersonalTodo(personalOwnerKey, item.id, {
                          text: e.target.value,
                        })
                      }
                      className={`min-w-[8rem] flex-1 rounded-lg border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm ${
                        item.done
                          ? "text-[var(--cc-steel)] line-through"
                          : "text-[var(--cc-navy)]"
                      }`}
                      aria-label="Edit to-do"
                    />
                    {!isArchiveMode ? (
                      <button
                        type="button"
                        onClick={() =>
                          removePersonalTodo(personalOwnerKey, item.id)
                        }
                        className="shrink-0 rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <QuickActionsPanel
        role={role}
        identityKey={quickIdentityKey}
        goUnit={goUnit}
        setPage={setPage}
      />
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
  specialTeams: keyof GameWeekAssets;
}[] = [
  {
    key: "Mon",
    label: "Monday",
    short: "Mon",
    offense: "offensePracticeMon",
    defense: "defensePracticeMon",
    specialTeams: "specialTeamsPracticeMon",
  },
  {
    key: "Tue",
    label: "Tuesday",
    short: "Tue",
    offense: "offensePracticeTue",
    defense: "defensePracticeTue",
    specialTeams: "specialTeamsPracticeTue",
  },
  {
    key: "Wed",
    label: "Wednesday",
    short: "Wed",
    offense: "offensePracticeWed",
    defense: "defensePracticeWed",
    specialTeams: "specialTeamsPracticeWed",
  },
  {
    key: "Thu",
    label: "Thursday",
    short: "Thu",
    offense: "offensePracticeThu",
    defense: "defensePracticeThu",
    specialTeams: "specialTeamsPracticeThu",
  },
  {
    key: "Fri",
    label: "Friday",
    short: "Fri",
    offense: "offensePracticeFri",
    defense: "defensePracticeFri",
    specialTeams: "specialTeamsPracticeFri",
  },
  {
    key: "Sat",
    label: "Saturday",
    short: "Sat",
    offense: "offensePracticeSat",
    defense: "defensePracticeSat",
    specialTeams: "specialTeamsPracticeSat",
  },
];

function practiceAssetField(
  side: Side,
  day: (typeof ALL_PRACTICE_DAYS)[number],
): keyof GameWeekAssets {
  if (side === "defense") return day.defense;
  if (side === "specialTeams") return day.specialTeams;
  return day.offense;
}

function unitScoutField(side: Side): keyof GameWeekAssets {
  if (side === "defense") return "defenseScout";
  if (side === "specialTeams") return "specialTeamsScout";
  return "offenseScout";
}

function unitCallSheetField(side: Side): keyof GameWeekAssets {
  if (side === "defense") return "defenseCallSheet";
  if (side === "specialTeams") return "specialTeamsCallSheet";
  return "offenseCallSheet";
}

function unitStatsField(side: Side): keyof GameWeekAssets {
  if (side === "defense") return "defenseStats";
  if (side === "specialTeams") return "specialTeamsStats";
  return "offenseStats";
}

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
      result?: string | null;
      ourScore?: number | null;
      oppScore?: number | null;
      resultSource?: "maxpreps" | "manual" | null;
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
    result:
      o.result !== undefined ? o.result || undefined : g.result,
    ourScore: o.ourScore !== undefined ? o.ourScore : g.ourScore,
    oppScore: o.oppScore !== undefined ? o.oppScore : g.oppScore,
    resultSource:
      o.resultSource !== undefined ? o.resultSource : g.resultSource,
  };
}

function gameResultLabel(g: Game): string | null {
  if (g.result?.trim()) return g.result.trim();
  if (
    typeof g.ourScore === "number" &&
    typeof g.oppScore === "number" &&
    Number.isFinite(g.ourScore) &&
    Number.isFinite(g.oppScore)
  ) {
    const outcome =
      g.ourScore > g.oppScore ? "W" : g.ourScore < g.oppScore ? "L" : "T";
    return `${outcome} ${g.ourScore}-${g.oppScore}`;
  }
  return null;
}

function GameResultBadge({ game }: { game: Game }) {
  const label = gameResultLabel(game);
  if (!label) return null;
  const win = label.startsWith("W");
  const loss = label.startsWith("L");
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tracking-wide ${
        win
          ? "bg-emerald-100 text-emerald-800"
          : loss
            ? "bg-rose-100 text-rose-800"
            : "bg-zinc-100 text-zinc-700"
      }`}
    >
      {label}
    </span>
  );
}

function visibleScheduleGames(
  scheduleGames: Game[],
  disabledOptionalGames: Record<string, boolean>,
) {
  return scheduleGames.filter(
    (g) => !(g.optional && disabledOptionalGames[g.id]),
  );
}

/** Site-wide default week: admin `activeGameId` override, else calendar next-up. */
function useSiteActiveGameId() {
  const { activeGameId, disabledOptionalGames, season, scheduleGames } =
    useApp();
  return useMemo(() => {
    const visible = visibleScheduleGames(scheduleGames, disabledOptionalGames);
    const year = Number(season) || undefined;
    return resolveActiveGame(visible, activeGameId, undefined, year).id;
  }, [activeGameId, disabledOptionalGames, season, scheduleGames]);
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
  const { gameMetaOverrides, disabledOptionalGames, scheduleGames } = useApp();
  const visibleGames = useMemo(
    () =>
      visibleScheduleGames(scheduleGames, disabledOptionalGames).filter((g) =>
        gameFilter ? gameFilter(g) : true,
      ),
    [disabledOptionalGames, gameFilter, scheduleGames],
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
                  <p className="flex flex-wrap items-center gap-2 truncate text-base font-bold text-[var(--cc-navy)]">
                    <span className="truncate">{gameSlotTitle(g)}</span>
                    <GameResultBadge game={g} />
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

function ResultsRedirectToSchedule() {
  const { setPage } = useApp();
  useLayoutEffect(() => {
    setPage("schedule");
  }, [setPage]);
  return null;
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
    setGameMeta,
    setOptionalGameEnabled,
    setGameResult,
    syncMaxPrepsResults,
    maxPrepsLastSyncAt,
    isArchiveMode,
    scheduleGames,
  } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const autoSynced = useRef(false);
  const canEdit = canEditContent(role, isArchiveMode);
  const canEditMeta = canEditScheduleMeta(role, isArchiveMode);
  const canEditScores = canEditMeta;
  const canScout = canSeeScout(role);
  const isPlayer = role === "player";
  const showScheduleBundles = canEdit || (canScout && !isPlayer);
  const visibleGames = visibleScheduleGames(scheduleGames, disabledOptionalGames);
  const optionalGames = scheduleGames.filter((g) => g.optional);
  const preseasonOptional = optionalGames.filter((g) => g.kind !== "playoff");
  const playoffOptional = optionalGames.filter((g) => g.kind === "playoff");

  const runSync = async (force = false) => {
    setSyncing(true);
    setSyncMsg(null);
    const res = await syncMaxPrepsResults({ force });
    setSyncMsg(res.message);
    setSyncing(false);
  };

  useEffect(() => {
    autoSynced.current = false;
  }, [season, isArchiveMode]);

  useEffect(() => {
    if (isArchiveMode) return;
    if (autoSynced.current) return;
    autoSynced.current = true;
    void runSync(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot auto pull on schedule load
  }, [season, isArchiveMode]);

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
          <div className="flex flex-wrap items-center justify-end gap-2">
            {canEditMeta ? (
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                {editing ? "Done" : "Edit"}
              </button>
            ) : null}
            {canEditMeta && !isArchiveMode ? (
              <>
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => void runSync(false)}
                  className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)] disabled:opacity-50"
                >
                  {syncing ? "Syncing…" : "Sync MaxPreps"}
                </button>
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Force MaxPreps sync? This overwrites manually entered results.",
                      )
                    ) {
                      return;
                    }
                    void runSync(true);
                  }}
                  className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)] disabled:opacity-50"
                  title="Overwrite manual results with MaxPreps"
                >
                  Force sync
                </button>
              </>
            ) : null}
            <a
              href={branding.maxPrepsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
            >
              Our MaxPreps ↗
            </a>
          </div>
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          {isPlayer
            ? "Open a week for opponent links and scouting reports."
            : "Uploads here sync straight into the matching Offense / Defense folder for that week (scout, call sheet, stats, practice)."}
          {canEditMeta
            ? editing
              ? " Edit optional weeks and event details below — changes sync to Grades, Stats, Scout, Call Sheets, Practice Plans, and Quizzes."
              : " Use Edit to manage optional weeks and event details."
            : ""}
          {!isArchiveMode && maxPrepsLastSyncAt ? (
            <>
              {" "}
              Last MaxPreps sync{" "}
              {new Date(maxPrepsLastSyncAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              .
            </>
          ) : null}
        </p>
        {syncMsg ? (
          <p className="mt-2 text-sm font-medium text-[var(--cc-navy)]">
            {syncMsg}
          </p>
        ) : null}
      </Panel>

      {editing && canEditMeta ? (
        <>
          <Panel title="Optional weeks">
            <p className="mb-3 text-sm text-[var(--cc-steel)]">
              Toggle which optional slots appear everywhere weeks are listed —
              Schedule, Team Grades, Stats, Call Sheets, Practice Plans, Quizzes,
              and Scout. Playoff weeks start hidden.
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
              Edit opponent/event name, date, time, venue, and home/away for
              every slot.
            </p>
            <div className="space-y-3">
              {scheduleGames.map((base) => {
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
                          onClick={() => setOptionalGameEnabled(g.id, hidden)}
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
                      {canEditScores &&
                      (g.kind === "regular" || g.kind === "playoff") ? (
                        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-5">
                          <label className="block text-xs font-semibold text-[var(--cc-steel)]">
                            Our score
                            <input
                              type="number"
                              aria-label={`${g.opponent} our score`}
                              value={g.ourScore ?? ""}
                              onChange={(e) => {
                                const our =
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value);
                                setGameResult(g.id, {
                                  ourScore: our,
                                  oppScore: g.oppScore ?? null,
                                });
                              }}
                              className="mt-1 w-20 rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                            />
                          </label>
                          <label className="block text-xs font-semibold text-[var(--cc-steel)]">
                            Opp score
                            <input
                              type="number"
                              aria-label={`${g.opponent} opponent score`}
                              value={g.oppScore ?? ""}
                              onChange={(e) => {
                                const opp =
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value);
                                setGameResult(g.id, {
                                  ourScore: g.ourScore ?? null,
                                  oppScore: opp,
                                });
                              }}
                              className="mt-1 w-20 rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                            />
                          </label>
                          <button
                            type="button"
                            className="rounded border border-[var(--cc-line)] px-2 py-1.5 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                            onClick={() =>
                              setGameResult(g.id, {
                                result: null,
                                ourScore: null,
                                oppScore: null,
                              })
                            }
                          >
                            Clear result
                          </button>
                          <GameResultBadge game={g} />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      ) : null}

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
                  <p className="flex flex-wrap items-center gap-2 text-base font-bold text-[var(--cc-navy)]">
                    <span className="truncate">{gameSlotTitle(g)}</span>
                    <GameResultBadge game={g} />
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
                  {editing &&
                  canEditScores &&
                  (g.kind === "regular" || g.kind === "playoff") ? (
                    <div className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/40 px-3 py-2">
                      <label className="block text-xs font-semibold text-[var(--cc-steel)]">
                        Our score
                        <input
                          type="number"
                          aria-label={`${g.opponent} our score`}
                          value={g.ourScore ?? ""}
                          onChange={(e) => {
                            const our =
                              e.target.value === ""
                                ? null
                                : Number(e.target.value);
                            setGameResult(g.id, {
                              ourScore: our,
                              oppScore: g.oppScore ?? null,
                            });
                          }}
                          className="mt-1 w-20 rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                        />
                      </label>
                      <label className="block text-xs font-semibold text-[var(--cc-steel)]">
                        Opp score
                        <input
                          type="number"
                          aria-label={`${g.opponent} opponent score`}
                          value={g.oppScore ?? ""}
                          onChange={(e) => {
                            const opp =
                              e.target.value === ""
                                ? null
                                : Number(e.target.value);
                            setGameResult(g.id, {
                              ourScore: g.ourScore ?? null,
                              oppScore: opp,
                            });
                          }}
                          className="mt-1 w-20 rounded-md border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm font-medium text-[var(--cc-navy)]"
                        />
                      </label>
                      <button
                        type="button"
                        className="rounded border border-[var(--cc-line)] px-2 py-1.5 text-xs font-semibold text-[var(--cc-navy)] hover:bg-white"
                        onClick={() =>
                          setGameResult(g.id, {
                            result: null,
                            ourScore: null,
                            oppScore: null,
                          })
                        }
                      >
                        Clear result
                      </button>
                      <GameResultBadge game={g} />
                      {g.resultSource === "manual" ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
                          Manual
                        </span>
                      ) : g.resultSource === "maxpreps" ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
                          MaxPreps
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid gap-3 lg:grid-cols-2">
                    <ScheduleBundle title={`Links — ${season}`}>
                      <div className="flex flex-wrap gap-2">
                        <LinkChip
                          href={
                            Number(season) <= 2025
                              ? g.links2025.schedule
                              : g.links2026.schedule
                          }
                        >
                          Schedule
                        </LinkChip>
                        <LinkChip
                          href={
                            Number(season) <= 2025
                              ? g.links2025.roster
                              : g.links2026.roster
                          }
                        >
                          Roster
                        </LinkChip>
                        <LinkChip
                          href={
                            Number(season) <= 2025
                              ? g.links2025.stats
                              : g.links2026.stats
                          }
                        >
                          Stats
                        </LinkChip>
                        <LinkChip href={g.dctfUrl}>DCTF</LinkChip>
                      </div>
                    </ScheduleBundle>

                    <ScheduleBundle
                      title={`${Number(season) - 1} Season (MaxPreps)`}
                    >
                      <div className="flex flex-wrap gap-2">
                        <LinkChip
                          href={
                            Number(season) <= 2025
                              ? g.links2024.schedule
                              : g.links2025.schedule
                          }
                        >
                          Schedule
                        </LinkChip>
                        <LinkChip
                          href={
                            Number(season) <= 2025
                              ? g.links2024.roster
                              : g.links2025.roster
                          }
                        >
                          Roster
                        </LinkChip>
                        <LinkChip
                          href={
                            Number(season) <= 2025
                              ? g.links2024.stats
                              : g.links2025.stats
                          }
                        >
                          Stats
                        </LinkChip>
                      </div>
                    </ScheduleBundle>
                  </div>

                  {canScout || canEdit ? (
                    <div
                      className={
                        isPlayer
                          ? "grid gap-3"
                          : "grid gap-3 md:grid-cols-2 xl:grid-cols-3"
                      }
                    >
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

                      {showScheduleBundles ? (
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

                      {showScheduleBundles ? (
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

                  {showScheduleBundles ? (
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
  const { role, side, setSide, roster, isArchiveMode } = useApp();
  const unitLabel = sideLabel(side);
  const groupSet = useQuizEditorGroupSet();
  const isPlayer = role === "player";
  const canStaff = canEditContent(role, isArchiveMode);

  useEffect(() => {
    if (!isPlayer) return;
    const athlete = findDemoPlayerAthlete(roster);
    if (!athlete) return;
    const defenseGroups = new Set(["DL", "ILB", "OLB", "DB"]);
    const next: Side = athlete.groups.some((g) =>
      defenseGroups.has(migrateGroupAbbreviation(g)),
    )
      ? "defense"
      : "offense";
    if (side !== next) setSide(next);
  }, [isPlayer, roster, side, setSide]);

  const playerAthlete = isPlayer ? findDemoPlayerAthlete(roster) : undefined;
  const playerGroups = playerAthlete
    ? playerAthlete.groups.map(migrateGroupAbbreviation).join(", ")
    : "";

  // Players: accordion of weeks, own groups only — same visible weeks as Schedule
  if (isPlayer) {
    return (
      <WeekSections
        title="My Quizzes"
        blurb={`Quizzes assigned to your position group${playerGroups ? ` (${playerGroups})` : ""}. Open a week to take or review.`}
      >
        {(g) => (
          <WeeklyQuizWeekPanel
            game={g}
            groupSet={groupSet}
            myGroups={[...groupSet]}
          />
        )}
      </WeekSections>
    );
  }

  // Staff unit page: Schedule-style Open cards; generate stays on My Stuff
  return (
    <div className="space-y-4">
      {canStaff && (role === "admin" || role === "coordinator") ? (
        <div className="flex flex-wrap justify-end gap-2">
          <ImportFromArchiveButton
            presetCategories={["quizzes"]}
            sideScope="current"
            label="Add quizzes from archive"
          />
        </div>
      ) : null}
      <WeekSections
        title={`${unitLabel} · Weekly Quizzes`}
        blurb={`Open a week for unit quiz scores and assignments. Filter by position inside each week. Generate quizzes in My Stuff → Weekly Quizzes.`}
      >
        {(g) => (
          <WeeklyQuizWeekPanel
            game={g}
            groupSet={groupSet}
            mode="unit"
            unitScores={canStaff}
          />
        )}
      </WeekSections>
    </div>
  );
}

function coachesForPositionType(type: PositionType) {
  if (type === "Offense") return coachesOnSide("offense");
  if (type === "Defense") return coachesOnSide("defense");
  return coachStaff.filter((c) => c.role === "coach");
}

function GroupsScreen() {
  const {
    role,
    coachAssignments,
    setCoachOnGroup,
    roster,
    positionGroups,
    addPositionGroup,
    updatePositionGroup,
    removePositionGroup,
  } = useApp();
  const canAssign = canAssignCoachGroups(role);
  const canEdit = canEditPositionGroups(role);
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-4">
      <Panel
        title="Program · Groups"
        action={
          canEdit ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {editing ? (
                <button
                  type="button"
                  onClick={addPositionGroup}
                  className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Add position
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                {editing ? "Done" : "Edit"}
              </button>
            </div>
          ) : null
        }
      >
        <p className="mb-4 text-sm text-[var(--cc-steel)]">
          One group per position, organized by position type. Players assigned
          here control who shows up when filling a depth-chart square for that
          position.
          {canEdit
            ? " Use Edit to add, rename, retype, or delete positions."
            : ""}
          {canAssign
            ? " Admins and coordinators assign coaches to each group below."
            : ""}
        </p>
        {positionGroups.length === 0 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No positions yet
            {canEdit
              ? editing
                ? " — click Add position."
                : " — click Edit, then Add position."
              : "."}
          </p>
        ) : (
          <div className="space-y-8">
            {positionTypes.map((type) => {
              const groups = positionGroups.filter((p) => p.type === type);
              if (groups.length === 0) return null;
              const typeCoaches = coachesForPositionType(type);

              return (
                <section key={type}>
                  <h3 className="mb-3 border-b border-[var(--cc-line)] pb-2 font-[family-name:var(--font-display)] text-lg tracking-wide text-[var(--cc-navy)]">
                    {type}
                  </h3>
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
                          {canEdit && editing ? (
                            <div className="space-y-3">
                              <label className="block text-sm">
                                <span className="font-semibold text-[var(--cc-navy)]">
                                  Name
                                </span>
                                <input
                                  value={pos.name}
                                  onChange={(e) =>
                                    updatePositionGroup(pos.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2"
                                />
                              </label>
                              <label className="block text-sm">
                                <span className="font-semibold text-[var(--cc-navy)]">
                                  Abbreviation
                                </span>
                                <input
                                  value={pos.abbreviation}
                                  onChange={(e) =>
                                    updatePositionGroup(pos.id, {
                                      abbreviation: e.target.value,
                                    })
                                  }
                                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 uppercase"
                                />
                              </label>
                              <label className="block text-sm">
                                <span className="font-semibold text-[var(--cc-navy)]">
                                  Position type
                                </span>
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
                              </label>
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
                                className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50"
                                aria-label={`Delete ${pos.name}`}
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--cc-blue)]">
                                {pos.name}
                              </p>
                              <p className="text-sm font-semibold text-[var(--cc-navy)]">
                                {g}
                              </p>
                            </>
                          )}
                          <p className="mt-2 text-sm text-[var(--cc-steel)]">
                            {inGroup.length} player
                            {inGroup.length === 1 ? "" : "s"}
                          </p>
                          <ul className="mt-2 max-h-28 space-y-0.5 overflow-y-auto text-xs text-[var(--cc-navy)]">
                            {inGroup.map((a) => (
                              <li key={a.id}>
                                <PlayerNameLink
                                  id={a.id}
                                  name={athleteLastFirst(a)}
                                  className="font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
                                />{" "}
                                <span className="text-[var(--cc-steel)]">
                                  · {abbreviateGrade(a.classYear)}
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
                                      id={c!.id}
                                      name={c!.name}
                                      className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                                    />
                                  </Chip>
                                ))}
                              </div>
                            )}

                            {canAssign ? (
                              <div className="mt-2 space-y-1.5">
                                {typeCoaches.map((coach) => {
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
                                      <CoachNameLink
                                        id={coach.id}
                                        name={coach.name}
                                        className="font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
                                      />
                                    </label>
                                  );
                                })}
                                {typeCoaches.length === 0 ? (
                                  <p className="text-xs text-[var(--cc-steel)]">
                                    No coaches available for this type yet.
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

function StaffScreen() {
  const {
    role,
    coachAssignments,
    coachDutiesList,
    updateCoachDuty,
    addCoachDuty,
    removeCoachDuty,
    addCoachDutyResponsibility,
    updateCoachDutyResponsibility,
    removeCoachDutyResponsibility,
    setCoachOnGroup,
    positionGroups,
  } = useApp();
  const canEdit = canAssignCoachGroups(role);
  const [editing, setEditing] = useState(false);

  if (!canSeeStaffRoom(role)) {
    return (
      <Panel title="Responsibilities">
        <p className="text-sm text-[var(--cc-steel)]">
          Staff pages are for coaches, coordinators, and admins.
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
      <Panel
        title="Coach responsibilities"
        action={
          canEdit ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {editing ? (
                <button
                  type="button"
                  onClick={() => addCoachDuty()}
                  className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
                >
                  + Add coach
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                {editing ? "Done" : "Edit"}
              </button>
            </div>
          ) : null
        }
      >
        <p className="mb-4 text-sm text-[var(--cc-steel)]">
          Season-scoped duties with optional deadlines. This feeds My Stuff →
          Responsibilities
          {canEdit
            ? editing
              ? " — pick a coach, assign position groups, and add responsibilities."
              : " — use Edit to manage coaches, groups, and deadlines."
            : "."}
        </p>

        {editing && canEdit ? (
          <div className="space-y-4">
            {coachDutiesList.map((d) => {
              const staff =
                coachStaff.find((c) => c.name === d.coach) ??
                coachStaff.find((c) => c.side === d.side) ??
                null;
              const coachId = staff?.id ?? "";
              const sideForGroups =
                d.side === "offense" || d.side === "defense"
                  ? d.side
                  : "defense";
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
        ) : (
          <div className="space-y-3">
            {coachDutiesList.length === 0 ? (
              <p className="text-sm text-[var(--cc-steel)]">
                No responsibilities yet
                {canEdit ? " — click Edit, then Add coach." : "."}
              </p>
            ) : (
              coachDutiesList.map((d) => {
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
                        <CoachNameLink
                          id={staff?.id}
                          name={d.coach}
                          className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                        />
                      </h3>
                      <Chip>{d.side}</Chip>
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
              })
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

function StaffResourceScreen({
  title,
  blurb,
}: {
  title: string;
  blurb: string;
}) {
  const { role, isArchiveMode } = useApp();
  const canEdit = canEditContent(role, isArchiveMode);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!canSeeStaffRoom(role)) {
    return (
      <Panel title={title}>
        <p className="text-sm text-[var(--cc-steel)]">
          Staff pages are for coaches, coordinators, and admins.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <Panel title={`Staff · ${title}`}>
        <p className="mb-4 text-sm text-[var(--cc-steel)]">{blurb}</p>
        <FileSlot
          label={`${title} file`}
          fileName={fileName}
          canEdit={canEdit}
          onPick={setFileName}
        />
      </Panel>
    </div>
  );
}

const UNIT_RESOURCE_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv,.rtf";

function formatResourceBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resourceIconLabel(mimeType: string, name: string) {
  const lower = name.toLowerCase();
  if (mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/.test(lower))
    return "IMG";
  if (mimeType.includes("pdf") || lower.endsWith(".pdf")) return "PDF";
  if (/\.(docx?|rtf)$/.test(lower) || mimeType.includes("word")) return "DOC";
  if (/\.(xlsx?|csv)$/.test(lower) || mimeType.includes("sheet")) return "XLS";
  if (/\.(pptx?)$/.test(lower) || mimeType.includes("presentation"))
    return "PPT";
  return "FILE";
}

function UnitResourcesScreen() {
  const {
    role,
    side,
    unitResources,
    addUnitResource,
    removeUnitResource,
    teamMembers,
    isArchiveMode,
  } = useApp();
  const canEdit = canEditContent(role, isArchiveMode);
  const unitLabel = sideLabel(side);
  const files = isArchiveMode ? [] : unitResources[side];
  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"list" | "grid">("list");
  const [busy, setBusy] = useState(false);

  async function onFilesChosen(e: ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length || !canEdit) return;
    setBusy(true);
    const uploader =
      findDemoMember(teamMembers, role)?.name ?? roleLabels[role];
    try {
      for (const file of Array.from(list)) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result ?? ""));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        addUnitResource(side, {
          name: file.name,
          size: file.size,
          mimeType: file.type || "application/octet-stream",
          dataUrl,
          uploadedAt: new Date().toISOString(),
          uploadedBy: uploader,
        });
      }
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function openFile(dataUrl: string, name: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = name;
    a.click();
  }

  return (
    <div className="space-y-4">
      <Panel
        title={`${unitLabel} · Resources`}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)] p-0.5">
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  view === "list"
                    ? "bg-white text-[var(--cc-navy)] shadow-sm"
                    : "text-[var(--cc-steel)]"
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  view === "grid"
                    ? "bg-white text-[var(--cc-navy)] shadow-sm"
                    : "text-[var(--cc-steel)]"
                }`}
              >
                Grid
              </button>
            </div>
            {canEdit ? (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={UNIT_RESOURCE_ACCEPT}
                  className="hidden"
                  onChange={(e) => void onFilesChosen(e)}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                  className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {busy ? "Uploading…" : "Upload"}
                </button>
              </>
            ) : null}
          </div>
        }
      >
        <p className="mb-4 text-sm text-[var(--cc-steel)]">
          Shared files for {unitLabel.toLowerCase()} only — separate from other
          units. Upload PDFs, images, and docs; open or download anytime this
          session.
        </p>

        {files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--cc-line)] bg-[var(--cc-field)]/50 px-4 py-10 text-center">
            <p className="font-[family-name:var(--font-display)] text-lg text-[var(--cc-navy)]">
              No files yet
            </p>
            <p className="mt-1 text-sm text-[var(--cc-steel)]">
              {canEdit
                ? "Upload a file to start this unit’s drive."
                : "Coaches can upload resources for this unit."}
            </p>
            {canEdit ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="mt-4 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                Upload files
              </button>
            ) : null}
          </div>
        ) : view === "list" ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--cc-line)]">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-[var(--cc-field)] text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
                <tr>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Size</th>
                  <th className="px-3 py-2.5">Uploaded</th>
                  <th className="px-3 py-2.5">By</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr
                    key={f.id}
                    className="border-t border-[var(--cc-line)] hover:bg-[var(--cc-field)]/40"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-9 items-center justify-center rounded bg-[var(--cc-blue)]/10 text-[10px] font-bold text-[var(--cc-blue)]">
                          {resourceIconLabel(f.mimeType, f.name)}
                        </span>
                        <button
                          type="button"
                          onClick={() => openFile(f.dataUrl, f.name)}
                          className="font-semibold text-[var(--cc-navy)] hover:underline"
                        >
                          {f.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                      {formatResourceBytes(f.size)}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                      {new Date(f.uploadedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                      {f.uploadedBy}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openFile(f.dataUrl, f.name)}
                          className="text-xs font-semibold text-[var(--cc-blue)] hover:underline"
                        >
                          Open
                        </button>
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(`Delete “${f.name}” from ${unitLabel}?`)
                              ) {
                                removeUnitResource(side, f.id);
                              }
                            }}
                            className="text-xs font-semibold text-red-700 hover:underline"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex flex-col rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/40 p-3"
              >
                <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-white border border-[var(--cc-line)]">
                  {f.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.dataUrl}
                      alt=""
                      className="max-h-full max-w-full object-contain p-2"
                    />
                  ) : (
                    <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--cc-blue)]">
                      {resourceIconLabel(f.mimeType, f.name)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openFile(f.dataUrl, f.name)}
                  className="truncate text-left text-sm font-semibold text-[var(--cc-navy)] hover:underline"
                  title={f.name}
                >
                  {f.name}
                </button>
                <p className="mt-1 text-xs text-[var(--cc-steel)]">
                  {formatResourceBytes(f.size)} · {f.uploadedBy}
                </p>
                <p className="text-xs text-[var(--cc-steel)]">
                  {new Date(f.uploadedAt).toLocaleDateString()}
                </p>
                <div className="mt-auto flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => openFile(f.dataUrl, f.name)}
                    className="text-xs font-semibold text-[var(--cc-blue)] hover:underline"
                  >
                    Open
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(`Delete “${f.name}” from ${unitLabel}?`)
                        ) {
                          removeUnitResource(side, f.id);
                        }
                      }}
                      className="text-xs font-semibold text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function athleteMatchesRecruitingQuery(
  a: Athlete,
  query: string,
  columns: RecruitingSheetColumn[],
) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const haystacks: string[] = [
    athleteLastFirst(a),
    a.firstName ?? "",
    a.lastName ?? "",
    a.name ?? "",
    a.groups?.join(" ") ?? "",
    a.groups?.join(", ") ?? "",
    a.classYear ?? "",
    gradClassLabels[a.classYear] ?? "",
    abbreviateGrade(a.classYear),
  ];
  for (const col of columns) {
    if (
      col.key === "name" ||
      col.key === "classYear" ||
      col.key === "position"
    ) {
      continue;
    }
    haystacks.push(String(recruitingStoredValue(a, col.key) ?? ""));
  }
  return haystacks.some((v) => v.toLowerCase().includes(q));
}

function StaffRecruitingScreen() {
  const {
    role,
    roster,
    updateAthlete,
    branding,
    season,
    positionGroups,
    recruitingSheetColumns,
    addRecruitingSheetColumn,
    renameRecruitingSheetColumn,
    removeRecruitingSheetColumn,
    isArchiveMode,
  } = useApp();
  const canEdit = canEditRoster(role) && canEditContent(role, isArchiveMode);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingColumns, setEditingColumns] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState("");
  /** Shared screen + print column visibility (unchecked = hidden until rechecked). */
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(recruitingSheetColumns.map((c) => [c.key, true])),
  );

  useEffect(() => {
    setVisibleFields((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const col of recruitingSheetColumns) {
        if (!(col.key in next)) {
          next[col.key] = true;
          changed = true;
        }
      }
      for (const key of Object.keys(next)) {
        if (!recruitingSheetColumns.some((c) => c.key === key)) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [recruitingSheetColumns]);

  if (!canSeeStaffRoom(role)) {
    return (
      <Panel title="Recruiting">
        <p className="text-sm text-[var(--cc-steel)]">
          Staff pages are for coaches, coordinators, and admins.
        </p>
      </Panel>
    );
  }

  const athletes = roster
    .filter((a) => (a.personnelType ?? "athlete") === "athlete")
    .filter((a) =>
      gradeFilter === "all" ? true : a.classYear === gradeFilter,
    )
    .filter((a) =>
      positionFilter.length === 0
        ? true
        : a.groups.some((g) => positionFilter.includes(g)),
    )
    .filter((a) =>
      athleteMatchesRecruitingQuery(a, query, recruitingSheetColumns),
    )
    .slice()
    .sort((a, b) => {
      const cmp = compareByLastName(a, b);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const visibleColumns = recruitingSheetColumns.filter(
    (col) => visibleFields[col.key],
  );

  function toggleColumn(key: string) {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setAllColumns(selected: boolean) {
    setVisibleFields(
      Object.fromEntries(
        recruitingSheetColumns.map((c) => [c.key, selected]),
      ),
    );
  }

  function submitNewColumn(e: FormEvent) {
    e.preventDefault();
    if (!addRecruitingSheetColumn(newColumnLabel)) return;
    setNewColumnLabel("");
  }

  return (
    <div className="recruiting-print-root">
      <Panel
        title="Staff · Recruiting"
        action={
          <div className="depth-print-hide flex flex-wrap items-center justify-end gap-2">
            {canEdit && role === "admin" ? (
              <ImportFromArchiveButton
                presetCategories={["recruitingFills"]}
                sideScope="all"
                label="Add from archive"
              />
            ) : null}
            {canEdit ? (
              <button
                type="button"
                onClick={() => setEditingColumns((v) => !v)}
                className="rounded bg-[var(--cc-blue)] px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"
              >
                {editingColumns ? "Done" : "Edit columns"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              disabled={visibleColumns.length === 0}
              className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)] disabled:opacity-50"
            >
              Print
            </button>
            <span className="text-xs font-semibold text-[var(--cc-steel)]">
              {athletes.length} prospect{athletes.length === 1 ? "" : "s"}
            </span>
          </div>
        }
      >
        <div className="mb-2 hidden print:block">
          <p className="text-lg font-bold text-black">
            {branding.name} · Recruiting · Season {season}
          </p>
          <p className="text-xs text-zinc-600">
            {athletes.length} prospect{athletes.length === 1 ? "" : "s"}
            {gradeFilter !== "all"
              ? ` · ${gradClassLabels[gradeFilter as GradClass] ?? gradeFilter}`
              : ""}
            {positionFilter.length > 0
              ? ` · ${positionFilter.join(", ")}`
              : ""}
            {query.trim() ? ` · Search: “${query.trim()}”` : ""}
          </p>
        </div>

        <p className="depth-print-hide mb-3 text-sm text-[var(--cc-steel)]">
          Recruiting board for athletes. Names show as Last, First. Edit cells
          here or on the player profile — same roster data.
        </p>

        {canEdit && editingColumns ? (
          <div className="depth-print-hide mb-3 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/40 p-3">
            <p className="mb-2 text-xs font-semibold text-[var(--cc-navy)]">
              Recruiting columns — rename, add, or delete. Changes apply to all
              player profiles. Name cannot be deleted.
            </p>
            <ul className="space-y-1.5">
              {recruitingSheetColumns.map((col) => (
                <li
                  key={col.key}
                  className="flex flex-wrap items-center gap-1.5"
                >
                  <input
                    value={col.label}
                    onChange={(e) =>
                      renameRecruitingSheetColumn(col.key, e.target.value)
                    }
                    onBlur={(e) => {
                      const trimmed = e.target.value.trim();
                      renameRecruitingSheetColumn(
                        col.key,
                        trimmed || "Untitled column",
                      );
                    }}
                    className="min-w-[10rem] flex-1 rounded border border-[var(--cc-line)] bg-white px-2 py-1 text-xs text-[var(--cc-navy)]"
                    aria-label={`Rename ${col.label}`}
                  />
                  {col.key === "name" ? (
                    <span className="px-2 py-1 text-[11px] font-semibold text-[var(--cc-steel)]">
                      Required
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeRecruitingSheetColumn(col.key)}
                      className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-white"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {recruitingSheetColumns.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--cc-steel)]">
                No columns yet. Add one below.
              </p>
            ) : null}
            <form
              onSubmit={submitNewColumn}
              className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[var(--cc-line)] pt-2"
            >
              <input
                value={newColumnLabel}
                onChange={(e) => setNewColumnLabel(e.target.value)}
                placeholder="New column label…"
                className="min-w-[10rem] flex-1 rounded border border-[var(--cc-line)] bg-white px-2 py-1 text-xs text-[var(--cc-navy)]"
                aria-label="New recruiting column label"
              />
              <button
                type="submit"
                disabled={!newColumnLabel.trim()}
                className="rounded bg-[var(--cc-blue)] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Add column
              </button>
            </form>
          </div>
        ) : null}

        <div className="depth-print-hide mb-3 flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all recruiting fields…"
            className="min-w-[14rem] flex-1 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
          />
          <div className="min-w-[11rem]">
            <MultiSelectDropdown
              allLabel="All positions"
              selected={positionFilter}
              onChange={setPositionFilter}
              options={positionGroups.map((pos) => ({
                value: pos.abbreviation,
                label: `${pos.name} (${pos.abbreviation})`,
              }))}
            />
          </div>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-medium text-[var(--cc-navy)]"
          >
            <option value="all">All classifications</option>
            {inventoryGradeOrder.map((g) => (
              <option key={g} value={g}>
                {gradClassLabels[g]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
          >
            Name {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="depth-print-hide mb-3 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/40 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[var(--cc-navy)]">
              Columns — choose which fields appear on the sheet and printout
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setAllColumns(true)}
                className="rounded border border-[var(--cc-line)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setAllColumns(false)}
                className="rounded border border-[var(--cc-line)] bg-white px-2 py-0.5 text-[11px] font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {recruitingSheetColumns.map((col) => (
              <label
                key={col.key}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--cc-navy)]"
              >
                <input
                  type="checkbox"
                  checked={visibleFields[col.key] ?? false}
                  onChange={() => toggleColumn(col.key)}
                  className="rounded border-[var(--cc-line)]"
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>

        <div className="depth-print-hide overflow-x-auto rounded-lg border border-[var(--cc-line)]">
          {visibleColumns.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[var(--cc-steel)]">
              No columns selected. Check a field above to show it on the sheet.
            </p>
          ) : (
            <table className="w-max border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[var(--cc-navy)] text-white">
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className={`${
                        col.key === "name"
                          ? "sticky left-0 z-10 bg-[var(--cc-navy)]"
                          : ""
                      } whitespace-nowrap px-2 py-2 text-xs font-semibold`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {athletes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="px-3 py-6 text-center text-[var(--cc-steel)]"
                    >
                      No athletes match this filter.
                    </td>
                  </tr>
                ) : (
                  athletes.map((a, i) => {
                    const displayName = athleteLastFirst(a);
                    return (
                      <tr
                        key={a.id}
                        className={
                          i % 2 === 0 ? "bg-white" : "bg-[var(--cc-field)]/50"
                        }
                      >
                        {visibleColumns.map((col) => {
                          if (col.key === "name") {
                            return (
                              <td
                                key={col.key}
                                className="sticky left-0 z-10 whitespace-nowrap border-t border-[var(--cc-line)] bg-inherit px-2 py-1 font-semibold text-[var(--cc-navy)]"
                              >
                                <PlayerNameLink
                                  id={a.id}
                                  name={displayName}
                                  className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                                />
                              </td>
                            );
                          }
                          if (isRecruitingStructuralKey(col.key)) {
                            return (
                              <td
                                key={col.key}
                                className="whitespace-nowrap border-t border-[var(--cc-line)] px-2 py-1 text-[var(--cc-steel)]"
                              >
                                {recruitingStoredValue(a, col.key)}
                              </td>
                            );
                          }
                          const value = recruitingStoredValue(a, col.key);
                          const inputWidth = col.inputWidth ?? "w-28";
                          if (col.key === "hudlLink" && !canEdit && value) {
                            return (
                              <td
                                key={col.key}
                                className="max-w-[12rem] truncate border-t border-[var(--cc-line)] px-2 py-1"
                              >
                                <a
                                  href={value}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-medium text-[var(--cc-blue)] underline-offset-2 hover:underline"
                                >
                                  HUDL
                                </a>
                              </td>
                            );
                          }
                          return (
                            <td
                              key={col.key}
                              className="whitespace-nowrap border-t border-[var(--cc-line)] px-1 py-0.5"
                            >
                              {canEdit ? (
                                <input
                                  value={value}
                                  onChange={(e) =>
                                    updateAthlete(
                                      a.id,
                                      recruitingValuePatch(
                                        col.key,
                                        e.target.value,
                                      ),
                                    )
                                  }
                                  className={`${inputWidth} rounded border border-[var(--cc-line)] bg-white px-1 py-0.5 text-xs text-[var(--cc-navy)]`}
                                  aria-label={`${displayName} ${col.label}`}
                                />
                              ) : (
                                <span className="px-1 text-xs text-[var(--cc-navy)]">
                                  {value || "—"}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="hidden print:block">
          {visibleColumns.length === 0 ? (
            <p className="text-sm text-zinc-600">No columns selected.</p>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-zinc-100">
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className="border border-black px-1.5 py-1 font-semibold whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {athletes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="border border-black px-2 py-4 text-center text-zinc-600"
                    >
                      No athletes match this filter.
                    </td>
                  </tr>
                ) : (
                  athletes.map((a) => (
                    <tr key={a.id}>
                      {visibleColumns.map((col) => {
                        const raw = recruitingStoredValue(a, col.key);
                        const text =
                          raw === "" || raw === "—" ? "—" : String(raw);
                        return (
                          <td
                            key={col.key}
                            className="border border-black px-1.5 py-1 align-top"
                          >
                            {text}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
    </div>
  );
}

const inventoryGradeOrder: GradClass[] = [
  "senior",
  "junior",
  "sophomore",
  "freshman",
];

function athleteLastFirst(a: Athlete) {
  const last = a.lastName?.trim() || "";
  const first = a.firstName?.trim() || "";
  if (last && first) return `${last}, ${first}`;
  return a.name;
}

type StockInventoryRow = {
  id: string;
  itemName: string;
  size: string;
  quantityOnHand: string;
  conditionNew: string;
  conditionGood: string;
  conditionFair: string;
  conditionPoor: string;
  /** Selected need replaced: yes | no | "" */
  needReplaced: "" | "yes" | "no";
  replacementNumber: string;
  notes: string;
};

const inventorySizeOptions = [
  "",
  "One size",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "Youth S",
  "Youth M",
  "Youth L",
  "Youth XL",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "Other",
];

const seedStockInventory: StockInventoryRow[] = [
  {
    id: "s1-s",
    itemName: "Helmets",
    size: "S",
    quantityOnHand: "10",
    conditionNew: "3",
    conditionGood: "5",
    conditionFair: "2",
    conditionPoor: "0",
    needReplaced: "no",
    replacementNumber: "",
    notes: "",
  },
  {
    id: "s1-m",
    itemName: "Helmets",
    size: "M",
    quantityOnHand: "18",
    conditionNew: "4",
    conditionGood: "10",
    conditionFair: "3",
    conditionPoor: "1",
    needReplaced: "no",
    replacementNumber: "",
    notes: "",
  },
  {
    id: "s1-l",
    itemName: "Helmets",
    size: "L",
    quantityOnHand: "16",
    conditionNew: "4",
    conditionGood: "9",
    conditionFair: "2",
    conditionPoor: "1",
    needReplaced: "no",
    replacementNumber: "",
    notes: "",
  },
  {
    id: "s1-xl",
    itemName: "Helmets",
    size: "XL",
    quantityOnHand: "8",
    conditionNew: "2",
    conditionGood: "4",
    conditionFair: "2",
    conditionPoor: "0",
    needReplaced: "no",
    replacementNumber: "",
    notes: "",
  },
  {
    id: "s2",
    itemName: "Shoulder pads",
    size: "L",
    quantityOnHand: "40",
    conditionNew: "5",
    conditionGood: "20",
    conditionFair: "10",
    conditionPoor: "5",
    needReplaced: "yes",
    replacementNumber: "PO-1042",
    notes: "Order large sizes",
  },
  {
    id: "s2-m",
    itemName: "Shoulder pads",
    size: "M",
    quantityOnHand: "22",
    conditionNew: "6",
    conditionGood: "12",
    conditionFair: "3",
    conditionPoor: "1",
    needReplaced: "no",
    replacementNumber: "",
    notes: "",
  },
  {
    id: "s3",
    itemName: "Game jerseys",
    size: "L",
    quantityOnHand: "55",
    conditionNew: "40",
    conditionGood: "15",
    conditionFair: "0",
    conditionPoor: "0",
    needReplaced: "no",
    replacementNumber: "",
    notes: "Home white",
  },
  {
    id: "s4",
    itemName: "Practice jerseys",
    size: "XL",
    quantityOnHand: "60",
    conditionNew: "10",
    conditionGood: "35",
    conditionFair: "12",
    conditionPoor: "3",
    needReplaced: "no",
    replacementNumber: "",
    notes: "",
  },
  {
    id: "s5",
    itemName: "Football pants",
    size: "L",
    quantityOnHand: "45",
    conditionNew: "8",
    conditionGood: "25",
    conditionFair: "10",
    conditionPoor: "2",
    needReplaced: "no",
    replacementNumber: "",
    notes: "",
  },
  {
    id: "s6",
    itemName: "Cleats",
    size: "11",
    quantityOnHand: "20",
    conditionNew: "0",
    conditionGood: "4",
    conditionFair: "8",
    conditionPoor: "8",
    needReplaced: "yes",
    replacementNumber: "",
    notes: "Need sizes 10–12",
  },
];

function emptyStockRow(): StockInventoryRow {
  return {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    itemName: "",
    size: "",
    quantityOnHand: "",
    conditionNew: "",
    conditionGood: "",
    conditionFair: "",
    conditionPoor: "",
    needReplaced: "",
    replacementNumber: "",
    notes: "",
  };
}

function StaffIssuedEquipmentScreen() {
  const { role } = useApp();

  if (!canSeeStaffRoom(role)) {
    return (
      <Panel title="Issued Equipment">
        <p className="text-sm text-[var(--cc-steel)]">
          Staff pages are for coaches, coordinators, and admins.
        </p>
      </Panel>
    );
  }

  return <IssuedEquipmentSheet />;
}

function StaffStockInventoryScreen() {
  const { role } = useApp();

  if (!canSeeStaffRoom(role)) {
    return (
      <Panel title="Inventory">
        <p className="text-sm text-[var(--cc-steel)]">
          Staff pages are for coaches, coordinators, and admins.
        </p>
      </Panel>
    );
  }

  return <StockInventorySheet />;
}

function IssuedEquipmentSheet() {
  const {
    role,
    roster,
    updateAthlete,
    teamNames,
    inventorySheetColumns,
    addInventorySheetColumn,
    renameInventorySheetColumn,
    removeInventorySheetColumn,
  } = useApp();
  const canEdit = canEditRoster(role);
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "team" | "grade">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editingFields, setEditingFields] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  function toggleSort(key: "name" | "team" | "grade") {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function sortMarker(key: "name" | "team" | "grade") {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  function submitNewField(e: FormEvent) {
    e.preventDefault();
    if (!addInventorySheetColumn(newFieldLabel)) return;
    setNewFieldLabel("");
  }

  const athletes = roster
    .filter((a) => (a.personnelType ?? "athlete") === "athlete")
    .filter((a) =>
      teamFilter === "all" ? true : (a.teamLevel ?? "") === teamFilter,
    )
    .filter((a) =>
      gradeFilter === "all" ? true : a.classYear === gradeFilter,
    )
    .filter((a) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      const lastFirst = athleteLastFirst(a).toLowerCase();
      const team = (a.teamLevel ?? "").toLowerCase();
      const teamAbbr = a.teamLevel
        ? abbreviateTeam(a.teamLevel).toLowerCase()
        : "";
      const grade = (gradClassLabels[a.classYear] ?? a.classYear).toLowerCase();
      const gradeAbbr = abbreviateGrade(a.classYear).toLowerCase();
      return (
        lastFirst.includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        team.includes(q) ||
        teamAbbr.includes(q) ||
        grade.includes(q) ||
        gradeAbbr.includes(q) ||
        a.classYear.toLowerCase().includes(q)
      );
    })
    .slice()
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = compareByLastName(a, b);
      } else if (sortKey === "team") {
        cmp = (a.teamLevel ?? "").localeCompare(b.teamLevel ?? "", undefined, {
          sensitivity: "base",
        });
        if (cmp === 0) cmp = compareByLastName(a, b);
      } else {
        cmp =
          inventoryGradeOrder.indexOf(a.classYear) -
          inventoryGradeOrder.indexOf(b.classYear);
        if (cmp === 0) cmp = compareByLastName(a, b);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <Panel
      title="Issued Equipment"
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canEdit ? (
            <button
              type="button"
              onClick={() => setEditingFields((v) => !v)}
              className="rounded bg-[var(--cc-blue)] px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90"
            >
              {editingFields ? "Done" : "Edit fields"}
            </button>
          ) : null}
          <span className="text-xs font-semibold text-[var(--cc-steel)]">
            {athletes.length} athlete{athletes.length === 1 ? "" : "s"}
          </span>
        </div>
      }
    >
      <p className="mb-3 text-sm text-[var(--cc-steel)]">
        Sizes issued to each athlete. Search or filter by name, team, or grade.
        Click column headers to sort.
      </p>
      {canEdit && editingFields ? (
        <div className="mb-3 rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)]/40 p-3">
          <p className="mb-2 text-xs font-semibold text-[var(--cc-navy)]">
            Equipment fields — rename, add, or delete. Changes apply to all
            player profiles.
          </p>
          <ul className="space-y-1.5">
            {inventorySheetColumns.map((col) => (
              <li
                key={col.key}
                className="flex flex-wrap items-center gap-1.5"
              >
                <input
                  value={col.label}
                  onChange={(e) =>
                    renameInventorySheetColumn(col.key, e.target.value)
                  }
                  onBlur={(e) => {
                    const trimmed = e.target.value.trim();
                    renameInventorySheetColumn(
                      col.key,
                      trimmed || "Untitled field",
                    );
                  }}
                  className="min-w-[10rem] flex-1 rounded border border-[var(--cc-line)] bg-white px-2 py-1 text-xs text-[var(--cc-navy)]"
                  aria-label={`Rename ${col.label}`}
                />
                <button
                  type="button"
                  onClick={() => removeInventorySheetColumn(col.key)}
                  className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-white"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          {inventorySheetColumns.length === 0 ? (
            <p className="mt-2 text-xs text-[var(--cc-steel)]">
              No equipment fields yet. Add one below.
            </p>
          ) : null}
          <form
            onSubmit={submitNewField}
            className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[var(--cc-line)] pt-2"
          >
            <input
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              placeholder="New field label…"
              className="min-w-[10rem] flex-1 rounded border border-[var(--cc-line)] bg-white px-2 py-1 text-xs text-[var(--cc-navy)]"
              aria-label="New equipment field label"
            />
            <button
              type="submit"
              disabled={!newFieldLabel.trim()}
              className="rounded bg-[var(--cc-blue)] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              Add field
            </button>
          </form>
        </div>
      ) : null}
      <div className="mb-3 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, team, or grade…"
          className="min-w-[14rem] flex-1 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
        />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-medium text-[var(--cc-navy)]"
        >
          <option value="all">All teams</option>
          {teamNames.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-medium text-[var(--cc-navy)]"
        >
          <option value="all">All grades</option>
          {inventoryGradeOrder.map((g) => (
            <option key={g} value={g}>
              {gradClassLabels[g]}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[var(--cc-line)]">
        <table className="w-max border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[var(--cc-navy)] text-white">
              <th className="sticky left-0 z-10 whitespace-nowrap bg-[var(--cc-navy)] px-2 py-2 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="font-semibold hover:underline"
                >
                  Name{sortMarker("name")}
                </button>
              </th>
              <th className="whitespace-nowrap px-1 py-2 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("team")}
                  className="font-semibold hover:underline"
                >
                  Team{sortMarker("team")}
                </button>
              </th>
              <th className="whitespace-nowrap px-1 py-2 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort("grade")}
                  className="font-semibold hover:underline"
                >
                  Grade{sortMarker("grade")}
                </button>
              </th>
              {inventorySheetColumns.map((col) => (
                <th
                  key={col.key}
                  className={`${col.key === "lockerNumber" ? "min-w-14" : "min-w-12"} whitespace-nowrap px-0.5 py-1.5 text-xs leading-tight font-semibold`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {athletes.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + inventorySheetColumns.length}
                  className="px-3 py-6 text-center text-[var(--cc-steel)]"
                >
                  No athletes match this filter.
                </td>
              </tr>
            ) : (
              athletes.map((a, i) => {
                const fields = {
                  ...emptyAthleteCustomFields(),
                  ...a.customFields,
                };
                const displayName = athleteLastFirst(a);
                return (
                  <tr
                    key={a.id}
                    className={
                      i % 2 === 0 ? "bg-white" : "bg-[var(--cc-field)]/50"
                    }
                  >
                    <td className="sticky left-0 z-10 whitespace-nowrap border-t border-[var(--cc-line)] bg-inherit px-2 py-1 font-semibold text-[var(--cc-navy)]">
                      <PlayerNameLink
                        id={a.id}
                        name={displayName}
                        className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                      />
                    </td>
                    <td className="whitespace-nowrap border-t border-[var(--cc-line)] px-1 py-1 text-[var(--cc-steel)]">
                      {a.teamLevel ? abbreviateTeam(a.teamLevel) : "—"}
                    </td>
                    <td className="whitespace-nowrap border-t border-[var(--cc-line)] px-1 py-1 text-[var(--cc-steel)]">
                      {abbreviateGrade(a.classYear)}
                    </td>
                    {inventorySheetColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`${col.key === "lockerNumber" ? "min-w-14" : "min-w-12"} whitespace-nowrap border-t border-[var(--cc-line)] px-0.5 py-0.5`}
                      >
                        {canEdit ? (
                          <input
                            value={fields[col.key] ?? ""}
                            onChange={(e) =>
                              updateAthlete(a.id, {
                                customFields: { [col.key]: e.target.value },
                              })
                            }
                            className={`${col.key === "lockerNumber" ? "w-14" : "w-12"} rounded border border-[var(--cc-line)] bg-white px-px py-0.5 text-xs text-[var(--cc-navy)]`}
                            aria-label={`${displayName} ${col.label}`}
                          />
                        ) : (
                          <span className="px-px text-xs text-[var(--cc-navy)]">
                            {fields[col.key] || "—"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function StockInventorySheet() {
  const { role, branding, season } = useApp();
  const canEdit = canEditRoster(role);
  const [rows, setRows] = useState<StockInventoryRow[]>(() =>
    seedStockInventory.map((r) => ({ ...r })),
  );
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Helmets: true,
  });
  const [newItemName, setNewItemName] = useState("");

  function patchRow(id: string, patch: Partial<StockInventoryRow>) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  function renameItem(oldName: string, nextName: string) {
    const name = nextName.trim();
    if (!name || name === oldName) return;
    setRows((prev) =>
      prev.map((r) => (r.itemName === oldName ? { ...r, itemName: name } : r)),
    );
    setExpanded((prev) => {
      const nextMap = { ...prev };
      nextMap[name] = prev[oldName] ?? true;
      delete nextMap[oldName];
      return nextMap;
    });
  }

  function addItemGroup() {
    const name = newItemName.trim() || "New item";
    const row = { ...emptyStockRow(), itemName: name, size: "M" };
    setRows((prev) => [...prev, row]);
    setExpanded((prev) => ({ ...prev, [name]: true }));
    setNewItemName("");
  }

  function addSizeToItem(itemName: string) {
    setRows((prev) => [
      ...prev,
      { ...emptyStockRow(), itemName, size: "" },
    ]);
    setExpanded((prev) => ({ ...prev, [itemName]: true }));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function removeItemGroup(itemName: string) {
    setRows((prev) => prev.filter((r) => r.itemName !== itemName));
    setExpanded((prev) => {
      const nextMap = { ...prev };
      delete nextMap[itemName];
      return nextMap;
    });
  }

  function toggleItem(itemName: string) {
    setExpanded((prev) => ({ ...prev, [itemName]: !prev[itemName] }));
  }

  const filtered = rows.filter((r) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      r.itemName.toLowerCase().includes(q) ||
      r.size.toLowerCase().includes(q) ||
      r.notes.toLowerCase().includes(q) ||
      r.replacementNumber.toLowerCase().includes(q)
    );
  });

  const groups: { name: string; sizes: StockInventoryRow[] }[] = [];
  const order: string[] = [];
  for (const r of filtered) {
    const key = r.itemName.trim() || "Untitled item";
    if (!order.includes(key)) {
      order.push(key);
      groups.push({ name: key, sizes: [] });
    }
    groups.find((g) => g.name === key)!.sizes.push(r);
  }

  const conditionFields = [
    { key: "conditionNew" as const, label: "New" },
    { key: "conditionGood" as const, label: "Good" },
    { key: "conditionFair" as const, label: "Fair" },
    { key: "conditionPoor" as const, label: "Poor" },
  ];

  function sumQty(sizes: StockInventoryRow[]) {
    return sizes.reduce((n, r) => n + (Number(r.quantityOnHand) || 0), 0);
  }

  function SizeSelect({ row }: { row: StockInventoryRow }) {
    return (
      <div className="flex min-w-[5.5rem] flex-col gap-1">
        <select
          value={
            !row.size
              ? ""
              : inventorySizeOptions.includes(row.size)
                ? row.size
                : "Other"
          }
          onChange={(e) => {
            const nextVal = e.target.value;
            if (nextVal === "Other") {
              patchRow(row.id, {
                size:
                  row.size && !inventorySizeOptions.includes(row.size)
                    ? row.size
                    : "Other",
              });
              return;
            }
            patchRow(row.id, { size: nextVal });
          }}
          className="w-full rounded-md border border-[var(--cc-line)] bg-white px-2 py-1.5 text-sm text-[var(--cc-navy)] print:border-0 print:px-1 print:py-0"
          aria-label={`${row.itemName || "Item"} size`}
        >
          <option value="">Select size</option>
          {inventorySizeOptions
            .filter((s) => s !== "")
            .map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </select>
        {!inventorySizeOptions.includes(row.size) || row.size === "Other" ? (
          <input
            value={row.size === "Other" ? "" : row.size}
            onChange={(e) =>
              patchRow(row.id, { size: e.target.value || "Other" })
            }
            placeholder="Custom size"
            className="depth-print-hide w-full rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-xs text-[var(--cc-navy)]"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="inventory-print-root space-y-3">
      <div className="depth-print-hide flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[var(--cc-navy)]">Inventory</h2>
          <p className="text-sm text-[var(--cc-steel)]">
            Open an item (like Helmets) to see and edit each size underneath.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)]"
        >
          Print
        </button>
      </div>

      <div className="mb-2 hidden print:block">
        <p className="text-lg font-bold text-black">
          {branding.name} · Inventory · Season {season}
        </p>
      </div>

      <div className="depth-print-hide mb-3 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search item, size, notes…"
          className="min-w-[14rem] flex-1 rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
        />
        {canEdit ? (
          <>
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="New item name (e.g. Helmets)"
              className="min-w-[12rem] rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addItemGroup}
              className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white"
            >
              + Add item
            </button>
          </>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <Panel title="No items">
          <p className="text-sm text-[var(--cc-steel)]">
            No inventory items match.
          </p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const open = expanded[group.name] ?? false;
            const total = sumQty(group.sizes);
            return (
              <section
                key={group.name}
                className="overflow-hidden rounded-xl border border-[var(--cc-line)] bg-white shadow-sm print:break-inside-avoid print:shadow-none"
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-[var(--cc-line)] bg-[var(--cc-navy)] px-3 py-2.5 text-white print:bg-black">
                  <button
                    type="button"
                    onClick={() => toggleItem(group.name)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left font-semibold"
                  >
                    <span className="depth-print-hide text-sm">
                      {open ? "▾" : "▸"}
                    </span>
                    {canEdit ? (
                      <input
                        value={group.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const nextVal = e.target.value;
                          setRows((prev) =>
                            prev.map((r) =>
                              r.itemName === group.name
                                ? { ...r, itemName: nextVal }
                                : r,
                            ),
                          );
                        }}
                        onBlur={(e) => {
                          const nextVal =
                            e.target.value.trim() || "Untitled item";
                          if (nextVal !== group.name) {
                            renameItem(group.name, nextVal);
                          }
                        }}
                        className="w-full max-w-xs rounded-md border border-white/30 bg-white/10 px-2 py-1 text-sm font-semibold text-white placeholder:text-white/60 print:border-0 print:bg-transparent"
                      />
                    ) : (
                      <span className="truncate text-base">{group.name}</span>
                    )}
                  </button>
                  <span className="text-xs font-semibold text-white/80">
                    {group.sizes.length} size
                    {group.sizes.length === 1 ? "" : "s"} · {total} on hand
                  </span>
                  {canEdit ? (
                    <div className="depth-print-hide flex gap-2">
                      <button
                        type="button"
                        onClick={() => addSizeToItem(group.name)}
                        className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold hover:bg-white/25"
                      >
                        + Size
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItemGroup(group.name)}
                        className="rounded-md bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-500/30"
                      >
                        Remove item
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className={open ? "block" : "hidden print:block"}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[52rem] border-collapse text-center text-sm print:min-w-0 print:text-xs">
                      <thead>
                        <tr className="bg-[var(--cc-field)] text-[var(--cc-navy)] print:bg-zinc-100">
                          <th className="border border-[var(--cc-line)] px-2 py-2 font-semibold print:border-black">
                            Size
                          </th>
                          <th className="border border-[var(--cc-line)] px-2 py-2 font-semibold print:border-black">
                            Qty on Hand
                          </th>
                          {conditionFields.map((c) => (
                            <th
                              key={c.key}
                              className="border border-[var(--cc-line)] px-2 py-2 text-xs font-semibold print:border-black"
                            >
                              {c.label}
                            </th>
                          ))}
                          <th className="border border-[var(--cc-line)] px-2 py-2 text-xs font-semibold print:border-black">
                            Replace?
                          </th>
                          <th className="border border-[var(--cc-line)] px-2 py-2 font-semibold print:border-black">
                            Replacement #
                          </th>
                          <th className="border border-[var(--cc-line)] px-2 py-2 font-semibold print:border-black">
                            Notes
                          </th>
                          {canEdit ? (
                            <th className="depth-print-hide border border-[var(--cc-line)] px-2 py-2" />
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        {group.sizes.map((r, i) => (
                          <tr
                            key={r.id}
                            className={
                              i % 2 === 0
                                ? "bg-white"
                                : "bg-[var(--cc-field)]/40 print:bg-white"
                            }
                          >
                            <td className="border border-[var(--cc-line)] px-1.5 py-1 print:border-black">
                              {canEdit ? (
                                <SizeSelect row={r} />
                              ) : (
                                <span className="px-2 font-semibold text-[var(--cc-navy)]">
                                  {r.size || "—"}
                                </span>
                              )}
                            </td>
                            <td className="border border-[var(--cc-line)] px-1.5 py-1 print:border-black">
                              {canEdit ? (
                                <input
                                  type="number"
                                  min={0}
                                  value={r.quantityOnHand}
                                  onChange={(e) =>
                                    patchRow(r.id, {
                                      quantityOnHand: e.target.value,
                                    })
                                  }
                                  className="w-full min-w-[4rem] rounded-md border border-[var(--cc-line)] bg-white px-2 py-1.5 text-center text-sm print:border-0"
                                />
                              ) : (
                                <span>{r.quantityOnHand || "—"}</span>
                              )}
                            </td>
                            {conditionFields.map((c) => (
                              <td
                                key={c.key}
                                className="border border-[var(--cc-line)] px-1 py-1 print:border-black"
                              >
                                {canEdit ? (
                                  <input
                                    type="number"
                                    min={0}
                                    value={r[c.key]}
                                    onChange={(e) =>
                                      patchRow(r.id, {
                                        [c.key]: e.target.value,
                                      })
                                    }
                                    className="w-full min-w-[3rem] rounded-md border border-[var(--cc-line)] bg-white px-1.5 py-1.5 text-center text-sm print:border-0"
                                  />
                                ) : (
                                  <span>{r[c.key] || "—"}</span>
                                )}
                              </td>
                            ))}
                            <td className="border border-[var(--cc-line)] px-1 py-1 print:border-black">
                              <div className="flex items-center justify-center gap-2">
                                <label className="inline-flex items-center gap-1 text-xs">
                                  <input
                                    type="radio"
                                    name={`replaced-${r.id}`}
                                    checked={r.needReplaced === "yes"}
                                    disabled={!canEdit}
                                    onChange={() =>
                                      patchRow(r.id, { needReplaced: "yes" })
                                    }
                                  />
                                  Yes
                                </label>
                                <label className="inline-flex items-center gap-1 text-xs">
                                  <input
                                    type="radio"
                                    name={`replaced-${r.id}`}
                                    checked={r.needReplaced === "no"}
                                    disabled={!canEdit}
                                    onChange={() =>
                                      patchRow(r.id, { needReplaced: "no" })
                                    }
                                  />
                                  No
                                </label>
                              </div>
                            </td>
                            <td className="border border-[var(--cc-line)] px-1.5 py-1 print:border-black">
                              {canEdit ? (
                                <input
                                  value={r.replacementNumber}
                                  onChange={(e) =>
                                    patchRow(r.id, {
                                      replacementNumber: e.target.value,
                                    })
                                  }
                                  className="w-full min-w-[5rem] rounded-md border border-[var(--cc-line)] bg-white px-2 py-1.5 text-sm print:border-0"
                                />
                              ) : (
                                <span>{r.replacementNumber || "—"}</span>
                              )}
                            </td>
                            <td className="border border-[var(--cc-line)] px-1.5 py-1 print:border-black">
                              {canEdit ? (
                                <input
                                  value={r.notes}
                                  onChange={(e) =>
                                    patchRow(r.id, { notes: e.target.value })
                                  }
                                  className="w-full min-w-[8rem] rounded-md border border-[var(--cc-line)] bg-white px-2 py-1.5 text-left text-sm print:border-0"
                                />
                              ) : (
                                <span className="text-left">
                                  {r.notes || "—"}
                                </span>
                              )}
                            </td>
                            {canEdit ? (
                              <td className="depth-print-hide border border-[var(--cc-line)] px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => removeRow(r.id)}
                                  className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
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
        `${name} created — they now appear under Staff → Rosters → Athletes.`,
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
                ["coach", "coordinator", "admin", "player"] as Role[]
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
              Player accounts also appear under Staff → Rosters → Athletes.
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
                            <PlayerNameLink id={linkedAthlete.id} name={m.name} />
                          ) : isStaff ? (
                            <CoachNameLink id={m.id} name={m.name} />
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
                            ? (m.assignedTeams ?? [])
                                .map(abbreviateTeam)
                                .join(", ") || "—"
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

function AdminTeamsScreen() {
  const { role, teamNames, setTeamNames } = useApp();

  if (!canManageMembers(role)) {
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

function AdminProgramScreen() {
  const {
    role,
    season,
    currentSeasonId,
    activeGameId,
    setActiveWeek,
    disabledOptionalGames,
    gameMetaOverrides,
    rollToNextSeason,
    archivedSeasons,
    deleteArchivedSeason,
    weekAutoAdvance,
    setWeekAutoAdvance,
    setViewingSeason,
    isArchiveMode,
    scheduleGames,
  } = useApp();
  const [confirmRoll, setConfirmRoll] = useState(false);
  const [autoDay, setAutoDay] = useState(
    () => weekAutoAdvance?.dayOfWeek ?? 1,
  );
  const [autoTime, setAutoTime] = useState(
    () => weekAutoAdvance?.time ?? "08:00",
  );

  useEffect(() => {
    setAutoDay(weekAutoAdvance?.dayOfWeek ?? 1);
    setAutoTime(weekAutoAdvance?.time ?? "08:00");
  }, [weekAutoAdvance]);

  if (!canManageProgramSeason(role)) {
    return (
      <Panel title="Program">
        <p className="text-sm text-[var(--cc-steel)]">Admin only.</p>
      </Panel>
    );
  }

  const weekOptions = visibleScheduleGames(scheduleGames, disabledOptionalGames).map((g) =>
    mergeGameMeta(g, gameMetaOverrides),
  );
  const calendarDefault = resolveActiveGame(
    visibleScheduleGames(scheduleGames, disabledOptionalGames),
    null,
    undefined,
    Number(season) || undefined,
  );

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  function saveAutoAdvance(enabled: boolean) {
    if (!enabled) {
      setWeekAutoAdvance(null);
      return;
    }
    const next: WeekAutoAdvanceConfig = {
      enabled: true,
      dayOfWeek: autoDay,
      time: autoTime,
    };
    setWeekAutoAdvance(next);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-zinc-900">Controls · Program</h1>

      <Panel title="Active schedule week">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Sets the site-wide default for This Week, Game of the week, and My
          Room week selectors. Leave on Auto to follow the next upcoming game by
          date. Manual override still works alongside recurring auto-advance.
        </p>
        <label className="block text-sm">
          <span className="font-semibold text-[var(--cc-navy)]">
            Current week
          </span>
          <select
            value={activeGameId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setActiveWeek(v === "" ? null : v);
            }}
            disabled={isArchiveMode}
            className="mt-1 w-full max-w-md rounded-lg border border-[var(--cc-line)] px-3 py-2 disabled:opacity-60"
          >
            <option value="">
              Auto — {gameSlotTitle(calendarDefault)} ({gameSlotLabel(calendarDefault)})
            </option>
            {weekOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {gameSlotLabel(g)} · {gameSlotTitle(g)} · {g.date}
              </option>
            ))}
          </select>
        </label>
        {activeGameId ? (
          <button
            type="button"
            onClick={() => setActiveWeek(null)}
            disabled={isArchiveMode}
            className="mt-3 rounded border border-[var(--cc-line)] px-3 py-1.5 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)] disabled:opacity-60"
          >
            Clear override (use calendar)
          </button>
        ) : null}
      </Panel>

      <Panel title="Recurring week auto-advance">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          On the chosen local day and time each week, advance the active week to
          the next visible schedule game. Checked on load and every 30 seconds.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Day</span>
            <select
              value={autoDay}
              onChange={(e) => setAutoDay(Number(e.target.value))}
              className="mt-1 block rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              {dayNames.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Time</span>
            <input
              type="time"
              value={autoTime}
              onChange={(e) => setAutoTime(e.target.value)}
              className="mt-1 block rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={() => saveAutoAdvance(true)}
            className="rounded-lg bg-[var(--cc-blue)] px-3 py-2 text-sm font-semibold text-white"
          >
            {weekAutoAdvance?.enabled ? "Update schedule" : "Enable"}
          </button>
          {weekAutoAdvance?.enabled ? (
            <button
              type="button"
              onClick={() => saveAutoAdvance(false)}
              className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              Disable
            </button>
          ) : null}
        </div>
        {weekAutoAdvance?.enabled ? (
          <p className="mt-3 text-sm text-[var(--cc-steel)]">
            Active: every {dayNames[weekAutoAdvance.dayOfWeek]} at{" "}
            {weekAutoAdvance.time} (local).
          </p>
        ) : (
          <p className="mt-3 text-sm text-[var(--cc-steel)]">
            Auto-advance is off.
          </p>
        )}
      </Panel>

      <Panel title="Season">
        <p className="text-sm text-[var(--cc-steel)]">
          Current season:{" "}
          <span className="font-semibold text-[var(--cc-navy)]">
            {currentSeasonId}
          </span>
          . Use the header season dropdown to browse archives. Admins and
          coordinators can upload and edit content while viewing an archive;
          only admins can delete archived seasons.
        </p>
        <button
          type="button"
          onClick={() => setConfirmRoll(true)}
          disabled={isArchiveMode}
          className="mt-4 rounded-lg bg-[var(--cc-navy)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Roll to next season
        </button>
      </Panel>

      <Panel
        title="Import from archive"
        action={
          !isArchiveMode && canImportFromArchive(role) ? (
            <ImportFromArchiveButton
              sideScope="all"
              label="Choose items…"
            />
          ) : null
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Pull last season&apos;s templates into {currentSeasonId}: unit goals,
          quizzes, depth placements, scout notes, week file slots, schedule
          meta, recruiting fills, and grades. Coordinators can also import from
          Goals, Quizzes, Scout, and Depth screens for their unit.
        </p>
        {isArchiveMode ? (
          <p className="mt-2 text-sm text-amber-800">
            Return to the current season to import.
          </p>
        ) : null}
      </Panel>

      <Panel title="Archived seasons">
        {archivedSeasons.length === 0 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No archived seasons yet. Rolling forward creates a snapshot you can
            browse from the season dropdown.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--cc-line)] rounded-xl border border-[var(--cc-line)]">
            {archivedSeasons.map((arch) => (
              <li
                key={arch.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-semibold text-[var(--cc-navy)]">
                    {arch.label}
                  </p>
                  <p className="text-xs text-[var(--cc-steel)]">
                    Archived{" "}
                    {new Date(arch.archivedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingSeason(arch.id)}
                    className="rounded border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
                  >
                    Browse
                  </button>
                  {canDeleteArchivedSeason(role) ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Permanently delete archived ${arch.label}? This cannot be undone.`,
                          )
                        ) {
                          deleteArchivedSeason(arch.id);
                        }
                      }}
                      className="rounded border border-red-200 px-2 py-1 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {confirmRoll ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="roll-season-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--cc-line)] bg-white p-5 shadow-lg">
            <h2
              id="roll-season-title"
              className="text-xl font-bold text-[var(--cc-navy)]"
            >
              Roll to {Number(currentSeasonId) + 1}?
            </h2>
            <p className="mt-2 text-sm text-[var(--cc-steel)]">
              Archives season {currentSeasonId} for browsing from the season
              dropdown, then
              starts a fresh season with the same formats.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm">
                <p className="font-semibold text-emerald-900">Kept</p>
                <ul className="mt-1 list-inside list-disc text-emerald-900/90">
                  <li>Philosophy, Playbook, Install, Resources</li>
                  <li>Staff list, duties, coach assignments</li>
                  <li>Members, roster people, branding</li>
                  <li>Depth schemes / columns (empty fills)</li>
                  <li>Goal templates &amp; sheet columns</li>
                </ul>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm">
                <p className="font-semibold text-amber-950">Cleared &amp; archived</p>
                <ul className="mt-1 list-inside list-disc text-amber-950/90">
                  <li>Schedule files, scout, call sheets, stats</li>
                  <li>Grades, quizzes &amp; attempts</li>
                  <li>Todos, group chat, attendance</li>
                  <li>Depth placements, issued gear fills</li>
                  <li>Recruiting sheet fills</li>
                </ul>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRoll(false)}
                className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  rollToNextSeason();
                  setConfirmRoll(false);
                }}
                className="rounded-lg bg-[var(--cc-navy)] px-3 py-2 text-sm font-semibold text-white"
              >
                Archive &amp; roll forward
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ArchiveBrowseRedirect() {
  const { setPage, archivedSeasons, setViewingSeason, currentSeasonId } =
    useApp();
  useLayoutEffect(() => {
    if (archivedSeasons[0]) setViewingSeason(archivedSeasons[0].id);
    else setViewingSeason(currentSeasonId);
    setPage("this-week");
  }, [
    archivedSeasons,
    setViewingSeason,
    currentSeasonId,
    setPage,
  ]);
  return null;
}

function CallSheetScreen() {
  const { role, side, gameWeekAssets, setGameWeekAsset, isArchiveMode } =
    useApp();
  const canEdit = canEditContent(role, isArchiveMode);
  const field = unitCallSheetField(side);
  const unitLabel = sideLabel(side);

  if (!canSeeScout(role)) {
    return (
      <Panel title={`${unitLabel} · Call Sheet`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Call sheets are hidden for this role.
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
  const { role, side, gameWeekAssets, setGameWeekAsset, isArchiveMode } =
    useApp();
  const canEdit = canEditContent(role, isArchiveMode);
  const field = unitStatsField(side);
  const unitLabel = sideLabel(side);

  if (!canSeeScout(role)) {
    return (
      <Panel title={`${unitLabel} · Stats`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Unit stats are hidden for this role.
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
  const { role, side, gameWeekAssets, setGameWeekAsset, isArchiveMode } =
    useApp();
  const canEdit = canEditContent(role, isArchiveMode);
  const unitLabel = sideLabel(side);

  if (!canSeeScout(role)) {
    return (
      <Panel title={`${unitLabel} · Practice Plans`}>
        <p className="text-sm text-[var(--cc-steel)]">
          Practice plans are hidden for this role.
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
              const field = practiceAssetField(side, day);
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
  const { side, role, isArchiveMode } = useApp();
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
    return <PlaybookTool side={side} canEdit={canEditContent(role, isArchiveMode)} persistLibrary={!isArchiveMode} />;
  }

  if (kind === "teach-call-sheet") {
    return <CallSheetScreen />;
  }

  if (kind === "teach-practice") {
    return <PracticePlansScreen />;
  }

  return (
    <Panel
      title={`${sideLabel(side)} · ${title}`}
      action={
        canEditContent(role, isArchiveMode) ? (
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
  const { role, side, gameWeekAssets, setGameWeekAsset, isArchiveMode } =
    useApp();
  const canEdit = canEditContent(role, isArchiveMode);
  const field = unitScoutField(side);
  const unitLabel = sideLabel(side);

  if (!canSeeScout(role)) {
    return (
      <Panel title="Scouting">
        <p className="text-sm text-[var(--cc-steel)]">
          Scouting is hidden for this role.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {canEdit && (role === "admin" || role === "coordinator") ? (
        <div className="flex flex-wrap justify-end gap-2">
          <ImportFromArchiveButton
            presetCategories={["scoutReports", "weekAssets"]}
            sideScope="current"
            label="Add scout from archive"
          />
        </div>
      ) : null}
      <WeekSections
        title={`${unitLabel} · Scouting Reports`}
        blurb="One scouting report per opponent — same files as Schedule. Players can view."
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
    </div>
  );
}

function useMyRoomContext() {
  const {
    side,
    role,
    coachAssignments,
    offenseGroupCodes,
    defenseGroupCodes,
    roster,
  } = useApp();

  if (role === "player") {
    const athlete = findDemoPlayerAthlete(roster);
    const myGroups = athlete
      ? athlete.groups.map(migrateGroupAbbreviation)
      : [];
    const profile = athlete
      ? {
          name: athlete.name,
          groups: myGroups,
          side,
          coachId: undefined as string | undefined,
        }
      : null;
    return {
      side,
      role,
      profile,
      allowed: false,
      canChat: canUseGroupChat(role) && myGroups.length > 0,
      myGroups,
      groupSet: new Set(myGroups),
      chatSenderId: athlete?.id ?? "",
      chatSenderName: athlete?.name ?? "",
      chatSenderRole: "player" as GroupChatSenderRole,
    };
  }

  const profile = myRoomProfile(role, side, coachAssignments);
  const allowed = canSeeMyRoomStaff(role) && !!profile;
  const myGroups = profile
    ? expandCoachGroupsWith(
        profile.groups,
        profile.side,
        offenseGroupCodes,
        defenseGroupCodes,
      )
    : [];
  const groupSet = new Set(myGroups);
  const chatSenderRole: GroupChatSenderRole = "coach";
  return {
    side,
    role,
    profile,
    allowed,
    canChat: canUseGroupChat(role) && myGroups.length > 0,
    myGroups,
    groupSet,
    chatSenderId: profile?.coachId ?? profile?.name ?? "",
    chatSenderName: profile?.name ?? "",
    chatSenderRole,
  };
}

function MyRoomHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { profile, myGroups, side, role } = useMyRoomContext();
  if (!profile) return null;
  const eyebrow =
    role === "player" ? (
      <>My Stuff · {profile.name}</>
    ) : (
      <>
        My Stuff ·{" "}
        <CoachNameLink
          name={profile.name}
          className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
        />
      </>
    );
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-[var(--cc-navy)]">{title}</h1>
        <p className="mt-1 text-sm text-[var(--cc-steel)]">
          {subtitle ??
            `${sideLabel(side)} · Groups: ${myGroups.join(", ")}`}
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
      <Panel title="My Stuff">
        <p className="text-sm text-[var(--cc-steel)]">
          My Stuff is for coaches and coordinators.
        </p>
      </Panel>
    );
  }
  return <>{children}</>;
}

function formatGroupChatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Survives my-room-chat → my-room-group remount so Chat stays selected. */
let pendingMyRoomGroupTab: "roster" | "chat" | null = null;

function MyRoomGroupChatPanel({
  readOnly = false,
}: {
  readOnly?: boolean;
}) {
  const {
    myGroups,
    canChat,
    role,
    chatSenderId,
    chatSenderName,
    chatSenderRole,
  } = useMyRoomContext();
  const { groupChatMessagesByGroup, sendGroupChatMessage } = useApp();
  const [activeGroup, setActiveGroup] = useState(myGroups[0] ?? "");
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!myGroups.includes(activeGroup)) {
      setActiveGroup(myGroups[0] ?? "");
    }
  }, [myGroups, activeGroup]);

  const messages = activeGroup
    ? (groupChatMessagesByGroup[activeGroup] ?? [])
    : [];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, activeGroup]);

  function send(e?: FormEvent) {
    e?.preventDefault();
    if (readOnly) return;
    const body = draft.trim();
    if (!activeGroup || !body || !canChat || !chatSenderId) return;
    sendGroupChatMessage({
      group: activeGroup,
      senderId: chatSenderId,
      senderName: chatSenderName,
      senderRole: chatSenderRole,
      body,
    });
    setDraft("");
  }

  if (!canChat || myGroups.length === 0) {
    return (
      <Panel title="Chat">
        <p className="text-sm text-[var(--cc-steel)]">
          {role === "player"
            ? "Your roster does not list a position group yet."
            : "You are not assigned to a position group yet."}
        </p>
      </Panel>
    );
  }

  return (
    <Panel title={`${activeGroup || "Group"} · Chat`}>
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
          Group: {activeGroup}
        </p>
      )}

      <ul
        ref={listRef}
        className="mb-4 max-h-[28rem] space-y-3 overflow-y-auto rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-3"
      >
        {messages.length === 0 ? (
          <li className="text-sm text-[var(--cc-steel)]">
            No messages yet
            {readOnly ? "." : `. Start the thread for ${activeGroup}.`}
          </li>
        ) : (
          messages.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-[var(--cc-line)] bg-white px-3 py-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--cc-navy)]">
                  {m.senderName}{" "}
                  <span className="font-medium text-[var(--cc-steel)]">
                    · {m.senderRole === "coach" ? "Coach" : "Player"}
                  </span>
                </p>
                <time
                  className="text-xs text-[var(--cc-steel)]"
                  dateTime={m.createdAt}
                >
                  {formatGroupChatTime(m.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--cc-navy)]">
                {m.body}
              </p>
            </li>
          ))
        )}
      </ul>

      {readOnly ? (
        <p className="text-sm text-[var(--cc-steel)]">
          Archive view — chat is read-only.
        </p>
      ) : (
        <form
          onSubmit={send}
          className="flex flex-wrap items-end gap-2 sm:flex-nowrap"
        >
          <label className="min-w-0 flex-1 text-sm">
            <span className="sr-only">Message</span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder={`Message ${activeGroup}…`}
              className="w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
          </label>
          <button
            type="submit"
            disabled={!draft.trim() || !activeGroup}
            className="rounded-lg bg-[var(--cc-blue)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      )}
    </Panel>
  );
}

function MyRoomGroupScreen({
  initialTab = "roster",
}: {
  initialTab?: "roster" | "chat";
}) {
  const { myGroups, groupSet, role, profile, allowed } = useMyRoomContext();
  const { roster: allAthletes, isArchiveMode } = useApp();
  const [tab, setTab] = useState<"roster" | "chat">(() => {
    if (pendingMyRoomGroupTab) {
      const next = pendingMyRoomGroupTab;
      pendingMyRoomGroupTab = null;
      return next;
    }
    // Players: chat-only Position Group (no Roster tab)
    if (role === "player") return "chat";
    return initialTab;
  });

  const roster = allAthletes
    .filter((a) => a.groups.some((g) => groupSet.has(g)))
    .slice()
    .sort(compareByLastName);

  const canOpen =
    role === "player"
      ? canUseGroupChat(role) && !!profile
      : allowed;

  if (!canOpen) {
    return (
      <Panel title="Position Group">
        <p className="text-sm text-[var(--cc-steel)]">
          {role === "player"
            ? "Group chat is for coaches and players in a position group."
            : "My Stuff is for coaches and coordinators."}
        </p>
      </Panel>
    );
  }

  const isPlayer = role === "player";

  return (
    <div className="space-y-4">
      <MyRoomHeader
        title="Position Group"
        subtitle={
          isPlayer
            ? `Chat · ${myGroups.join(", ") || "—"}`
            : undefined
        }
      />
      {!isPlayer ? (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "roster" as const, label: "Roster" },
              { id: "chat" as const, label: "Chat" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                tab === item.id
                  ? "bg-[var(--cc-blue)] text-white"
                  : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      {isPlayer || tab === "chat" ? (
        <MyRoomGroupChatPanel
          readOnly={isArchiveMode && !canEditContent(role, isArchiveMode)}
        />
      ) : (
        <Panel title={`Roster · ${myGroups.join(", ") || "—"}`}>
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Players assigned to your group(s).
          </p>
          {myGroups.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              You are not assigned to a position group yet.
            </p>
          ) : roster.length === 0 ? (
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
                      name={athleteLastFirst(a)}
                      className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--cc-steel)]">
                    {a.groups.filter((g) => groupSet.has(g)).join(", ")} ·{" "}
                    {abbreviateGrade(a.classYear)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}

/** Legacy deep-link: my-room-chat → Position Group with Chat tab selected. */
function MyRoomChatRedirect() {
  const { setPage } = useApp();
  useLayoutEffect(() => {
    pendingMyRoomGroupTab = "chat";
    setPage("my-room-group");
  }, [setPage]);
  return null;
}

function personalTodoCoversDuty(
  todos: { text: string; done: boolean; sourceResponsibilityId?: string }[],
  dutyId: string,
  dutyText: string,
) {
  const normalized = dutyText.trim().toLowerCase();
  return todos.some(
    (t) =>
      !t.done &&
      (t.sourceResponsibilityId === dutyId ||
        t.text.trim().toLowerCase() === normalized),
  );
}

function MyRoomResponsiblesScreen() {
  const { profile } = useMyRoomContext();
  const {
    coachDutiesList,
    coachAssignments,
    personalTodosByOwner,
    addPersonalTodo,
    updatePersonalTodo,
    togglePersonalTodo,
    removePersonalTodo,
  } = useApp();

  const ownerKey = profile?.name ?? "";
  const personalTodos = personalTodosByOwner[ownerKey] ?? [];
  const doneCount = personalTodos.filter((t) => t.done).length;

  const relevant = coachDutiesList.filter((d) => {
    // My Stuff → Responsibilities shows only the signed-in coach/coordinator’s card
    return !!profile && d.coach === profile.name;
  });

  function quickAddDuty(dutyId: string, text: string) {
    if (!ownerKey) return;
    if (personalTodoCoversDuty(personalTodos, dutyId, text)) return;
    addPersonalTodo(ownerKey, text, { sourceResponsibilityId: dutyId });
  }

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader title="Responsibilities" />
        <Panel title="Your responsibilities">
          <p className="mb-4 text-sm text-[var(--cc-steel)]">
            Your assigned responsibilities and optional deadlines from Staff →
            Responsibilities. Quick-add a duty to your personal to-do list for
            This Week.
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
                        <CoachNameLink
                          id={staff?.id}
                          name={d.coach}
                          className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
                        />
                      </h3>
                      <Chip>{d.role}</Chip>
                      <Chip>
                        {(liveGroups.length ? liveGroups : d.groups).join(
                          ", ",
                        ) || "Unassigned"}
                      </Chip>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-sm text-[var(--cc-steel)]">
                      {d.duties.map((x) => {
                        const onList = personalTodoCoversDuty(
                          personalTodos,
                          x.id,
                          x.text,
                        );
                        return (
                          <li
                            key={x.id}
                            className="flex flex-wrap items-center justify-between gap-2"
                          >
                            <span className="min-w-0 flex-1">· {x.text}</span>
                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              {x.dueBy ? (
                                <span className="text-xs font-semibold text-[var(--cc-navy)]">
                                  Due {x.dueBy}
                                </span>
                              ) : null}
                              <button
                                type="button"
                                disabled={!ownerKey || onList}
                                onClick={() => quickAddDuty(x.id, x.text)}
                                className="rounded-md border border-[var(--cc-line)] bg-white px-2 py-0.5 text-xs font-semibold text-[var(--cc-blue)] hover:bg-[var(--cc-field)] disabled:cursor-default disabled:opacity-50"
                                aria-label={
                                  onList
                                    ? `${x.text} already on my to-dos`
                                    : `Add ${x.text} to my to-dos`
                                }
                              >
                                {onList ? "On list" : "+ Add to my to-dos"}
                              </button>
                            </div>
                          </li>
                        );
                      })}
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

        <Panel
          title="My to-dos"
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {personalTodos.length > 0 ? (
                <span className="rounded-full bg-[var(--cc-blue)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--cc-blue)]">
                  {doneCount}/{personalTodos.length} done
                </span>
              ) : null}
              <button
                type="button"
                disabled={!ownerKey}
                onClick={() => addPersonalTodo(ownerKey)}
                className="rounded-lg bg-[var(--cc-blue)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                + Add
              </button>
            </div>
          }
        >
          <p className="mb-4 text-sm text-[var(--cc-steel)]">
            Personal items for this week — synced with This Week. Check them
            off, edit the text, or remove ones you no longer need.
          </p>
          {personalTodos.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No personal to-dos yet. Use Add, or quick-add from a responsibility
              above.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--cc-line)] rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)]/30">
              {personalTodos.map((item) => (
                <li key={item.id}>
                  <div
                    className={`flex flex-wrap items-center gap-2 px-2.5 py-1.5 transition ${
                      item.done ? "bg-[var(--cc-field)]/80" : "hover:bg-white/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => togglePersonalTodo(ownerKey, item.id)}
                      className="h-3.5 w-3.5 shrink-0 accent-[var(--cc-blue)]"
                      aria-label={`Mark done: ${item.text}`}
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        updatePersonalTodo(ownerKey, item.id, {
                          text: e.target.value,
                        })
                      }
                      className={`min-w-[10rem] flex-1 rounded-lg border border-[var(--cc-line)] bg-white px-2.5 py-1.5 text-sm ${
                        item.done
                          ? "text-[var(--cc-steel)] line-through"
                          : "text-[var(--cc-navy)]"
                      }`}
                      aria-label="Edit to-do"
                    />
                    <button
                      type="button"
                      onClick={() => removePersonalTodo(ownerKey, item.id)}
                      className="shrink-0 rounded border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function MyRoomDepthScreen() {
  const { myGroups, profile, role } = useMyRoomContext();
  const { setPage, teamNames, ensureDepthBoard, isArchiveMode } = useApp();
  // Use the coach's assigned unit, not the global Team side switcher — otherwise
  // a DL coach on Offense sees "No depth-chart columns match."
  const unitSide = profile?.side ?? "defense";
  const schemeId: DepthScheme =
    unitSide === "defense"
      ? "Defense"
      : unitSide === "specialTeams"
        ? "Kick Off"
        : "Offense";
  const teams = teamNames.length ? teamNames : [...teamLevels];
  const canEdit = canMoveDepthPlayers(role) && canEditContent(role, isArchiveMode);

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
              ? " Click a name for profile · click a square to search athletes by group · drag to move/swap."
              : " Click a name to open their profile."}
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
      editableGroups={groupFilter}
      readOnly={!canEdit}
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

function GameOfTheWeekPanel() {
  const {
    gameMetaOverrides,
    disabledOptionalGames,
    setPage,
    season,
    activeGameId,
    scheduleGames,
  } = useApp();
  const [logoFailed, setLogoFailed] = useState(false);

  const weekGame = useMemo(() => {
    const visible = visibleScheduleGames(scheduleGames, disabledOptionalGames);
    const year = Number(season) || undefined;
    return mergeGameMeta(
      resolveActiveGame(visible, activeGameId, undefined, year),
      gameMetaOverrides,
    );
  }, [
    disabledOptionalGames,
    gameMetaOverrides,
    season,
    activeGameId,
    scheduleGames,
  ]);

  useEffect(() => {
    setLogoFailed(false);
  }, [weekGame.id]);

  return (
    <Panel title="Game of the week">
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--cc-line)] bg-[var(--cc-field)]">
          {weekGame.logo && !logoFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={weekGame.logo}
              alt={`${weekGame.opponent} logo`}
              className="h-full w-full object-contain p-2"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="text-2xl font-bold text-[var(--cc-navy)]">
              {opponentMonogram(weekGame.opponent)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--cc-blue)]">
            {gameSlotLabel(weekGame)}
          </p>
          <h3 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold text-[var(--cc-navy)]">
            {gameSlotTitle(weekGame)}
            <GameResultBadge game={weekGame} />
          </h3>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            {weekGame.date} · {weekGame.time} · {weekGame.homeAway} ·{" "}
            {weekGame.venue}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <WeekActionButton
              label="Full schedule"
              onClick={() => setPage("schedule")}
            />
            <a
              href={
                weekGame.links2026?.schedule ??
                weekGame.dctfUrl ??
                team.maxPrepsUrl
              }
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              Opponent ↗
            </a>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function useGameOfTheWeekTitle() {
  const {
    gameMetaOverrides,
    disabledOptionalGames,
    season,
    activeGameId,
    scheduleGames,
  } = useApp();
  return useMemo(() => {
    const visible = visibleScheduleGames(scheduleGames, disabledOptionalGames);
    const year = Number(season) || undefined;
    return gameSlotTitle(
      mergeGameMeta(
        resolveActiveGame(visible, activeGameId, undefined, year),
        gameMetaOverrides,
      ),
    );
  }, [
    disabledOptionalGames,
    gameMetaOverrides,
    season,
    activeGameId,
    scheduleGames,
  ]);
}

function MyRoomScoutScreen() {
  const { side, role, myGroups } = useMyRoomContext();
  const {
    positionScoutReports,
    savePositionScoutReport,
    gameMetaOverrides,
    disabledOptionalGames,
    isArchiveMode,
    scheduleGames,
  } = useApp();
  const canEdit = canEditContent(role, isArchiveMode);
  const [activeGroup, setActiveGroup] = useState(myGroups[0] ?? "");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const weekOptions = useMemo(() => {
    return visibleScheduleGames(scheduleGames, disabledOptionalGames).map((g) =>
      mergeGameMeta(g, gameMetaOverrides),
    );
  }, [disabledOptionalGames, gameMetaOverrides, scheduleGames]);

  const nextGameId = useSiteActiveGameId();

  const [selectedGameId, setSelectedGameId] = useState(nextGameId);

  useEffect(() => {
    setSelectedGameId(nextGameId);
  }, [nextGameId]);

  useEffect(() => {
    if (
      weekOptions.length > 0 &&
      !weekOptions.some((g) => g.id === selectedGameId)
    ) {
      setSelectedGameId(weekOptions[0]!.id);
    }
  }, [weekOptions, selectedGameId]);

  const selectedGame = useMemo(() => {
    return (
      weekOptions.find((g) => g.id === selectedGameId) ??
      mergeGameMeta(
        getNextUpcomingGame(visibleScheduleGames(scheduleGames, disabledOptionalGames)),
        gameMetaOverrides,
      )
    );
  }, [weekOptions, selectedGameId, gameMetaOverrides, disabledOptionalGames]);

  const weekTitle = gameSlotTitle(selectedGame);

  useEffect(() => {
    if (!myGroups.includes(activeGroup)) {
      setActiveGroup(myGroups[0] ?? "");
    }
  }, [myGroups, activeGroup]);

  useEffect(() => {
    if (!activeGroup) return;
    const existing = lookupPositionScoutReport(
      positionScoutReports,
      side,
      activeGroup,
      selectedGame.id,
    );
    setNotes(existing?.notes ?? "");
    setFileName(existing?.fileName ?? null);
    setSavedFlash(false);
  }, [side, activeGroup, positionScoutReports, selectedGame.id]);

  function save() {
    if (!activeGroup) return;
    savePositionScoutReport(
      side,
      activeGroup,
      { notes, fileName },
      selectedGame.id,
    );
    setSavedFlash(true);
  }

  async function onAttachFile(file: File | undefined) {
    if (!file) {
      setFileName(null);
      return;
    }
    setFileName(file.name);
    const isText =
      file.type.startsWith("text/") ||
      /\.(txt|md|csv|json)$/i.test(file.name);
    if (!isText) return;
    try {
      const text = await file.text();
      if (text.trim()) {
        setNotes((prev) => (prev.trim() ? `${prev.trim()}\n\n${text.trim()}` : text.trim()));
      }
    } catch {
      // Filename still saved; coach can paste manually
    }
  }

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader
          title="Weekly Scouting Report"
          subtitle={`Position write-up for ${weekTitle} — quizzes generate from these notes`}
        />
        <GameOfTheWeekPanel />
        <Panel title="Position scout">
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Paste or type this week&apos;s scouting report here. AI weekly quizzes
            read these notes (not PDF/image bytes). Attach a .txt file to pull
            text in automatically; for PDFs, paste the content below.
          </p>

          <label className="mb-4 block text-sm">
            <span className="font-semibold text-[var(--cc-navy)]">Week</span>
            <select
              value={selectedGame.id}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="mt-1 block w-full max-w-md rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm"
            >
              {weekOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {gameSlotLabel(g)} · {gameSlotTitle(g)}
                </option>
              ))}
            </select>
          </label>

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
              Scout notes · {activeGroup || "group"} · Week {selectedGame.week}
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!canEdit || !activeGroup}
              rows={10}
              placeholder="Paste the scouting report: tendencies, formations, keys, fit rules, alerts…"
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2 disabled:bg-[var(--cc-field)]"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {canEdit ? (
              <>
                <label className="cursor-pointer rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--cc-navy)]">
                  {fileName ? "Replace file" : "Attach PDF / doc / txt"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.md,.csv"
                    className="hidden"
                    onChange={(e) => {
                      void onAttachFile(e.target.files?.[0]);
                      e.target.value = "";
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
  const { myGroups, groupSet, role } = useMyRoomContext();
  const {
    setPage,
    gameMetaOverrides,
    disabledOptionalGames,
    isArchiveMode,
    scheduleGames,
  } = useApp();
  const canEdit = canEditContent(role, isArchiveMode);

  const weekOptions = useMemo(() => {
    return visibleScheduleGames(scheduleGames, disabledOptionalGames).map((g) =>
      mergeGameMeta(g, gameMetaOverrides),
    );
  }, [disabledOptionalGames, gameMetaOverrides, scheduleGames]);

  const nextGameId = useSiteActiveGameId();

  const [selectedGameId, setSelectedGameId] = useState(nextGameId);

  useEffect(() => {
    setSelectedGameId(nextGameId);
  }, [nextGameId]);

  useEffect(() => {
    if (
      weekOptions.length > 0 &&
      !weekOptions.some((g) => g.id === selectedGameId)
    ) {
      setSelectedGameId(weekOptions[0]!.id);
    }
  }, [weekOptions, selectedGameId]);

  const selectedGame = useMemo(() => {
    return (
      weekOptions.find((g) => g.id === selectedGameId) ??
      mergeGameMeta(
        getNextUpcomingGame(visibleScheduleGames(scheduleGames, disabledOptionalGames)),
        gameMetaOverrides,
      )
    );
  }, [
    weekOptions,
    selectedGameId,
    gameMetaOverrides,
    disabledOptionalGames,
    scheduleGames,
  ]);

  const weekTitle = gameSlotTitle(selectedGame);

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader
          title="Weekly Quizzes"
          subtitle={
            canEdit
              ? `Scout, quiz, and quiz scores for ${weekTitle}`
              : `Assigned quizzes for ${weekTitle}`
          }
        />
        <Panel
          title={
            canEdit
              ? `Coach sheet · ${myGroups.join(", ") || "Your groups"}`
              : `Quizzes · ${myGroups.join(", ") || "Your groups"}`
          }
          action={
            <div className="flex flex-wrap items-center gap-3">
              {weekOptions.length > 0 ? (
                <label className="flex items-center gap-1.5 text-xs text-[var(--cc-steel)]">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Week
                  </span>
                  <select
                    value={selectedGame.id}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-sm font-semibold text-[var(--cc-navy)]"
                  >
                    {weekOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {gameSlotLabel(g)} · {g.opponent}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => setPage("quizzes")}
                className="text-sm font-semibold text-[var(--cc-blue)]"
              >
                All quizzes →
              </button>
            </div>
          }
        >
          <WeeklyQuizWeekPanel
            game={selectedGame}
            myGroups={myGroups}
            groupSet={groupSet}
            compact
            mode="my-stuff"
            coachSheet={canEdit}
          />
        </Panel>
      </div>
    </MyRoomGate>
  );
}

function gradeNameMatches(gradePlayer: string, athlete: Athlete) {
  if (gradePlayer === athlete.name) return true;
  if (gradePlayer === athleteLastFirst(athlete)) return true;
  const last = athlete.lastName?.trim();
  if (last && gradePlayer.toLowerCase().includes(last.toLowerCase())) {
    return true;
  }
  return false;
}

function MyRoomGradesScreen() {
  const { myGroups, groupSet, role } = useMyRoomContext();
  const {
    setPage,
    gradeRows,
    upsertPlayerGrade,
    roster,
    gameMetaOverrides,
    disabledOptionalGames,
    isArchiveMode,
    scheduleGames,
  } = useApp();
  const canEdit = canEditContent(role, isArchiveMode);

  const weekOptions = useMemo(() => {
    return visibleScheduleGames(scheduleGames, disabledOptionalGames).map((g) =>
      mergeGameMeta(g, gameMetaOverrides),
    );
  }, [disabledOptionalGames, gameMetaOverrides, scheduleGames]);

  const nextGameId = useSiteActiveGameId();

  const [selectedGameId, setSelectedGameId] = useState(nextGameId);

  useEffect(() => {
    setSelectedGameId(nextGameId);
  }, [nextGameId]);

  useEffect(() => {
    if (
      weekOptions.length > 0 &&
      !weekOptions.some((g) => g.id === selectedGameId)
    ) {
      setSelectedGameId(weekOptions[0]!.id);
    }
  }, [weekOptions, selectedGameId]);

  const selectedGame = useMemo(() => {
    return (
      weekOptions.find((g) => g.id === selectedGameId) ??
      mergeGameMeta(
        getNextUpcomingGame(
          visibleScheduleGames(scheduleGames, disabledOptionalGames),
        ),
        gameMetaOverrides,
      )
    );
  }, [
    weekOptions,
    selectedGameId,
    gameMetaOverrides,
    disabledOptionalGames,
    scheduleGames,
  ]);

  const weekNum = selectedGame.week;
  const weekTitle = gameSlotTitle(selectedGame);

  const displayRows = useMemo(() => {
    const weekMatches = (w: number) =>
      w === weekNum || (weekNum <= 1 && w === 0);

    const athletes = roster
      .filter(
        (a) =>
          (a.personnelType ?? "athlete") === "athlete" &&
          a.groups.some((g) => groupSet.has(migrateGroupAbbreviation(g))),
      )
      .sort(compareByLastName);

    const rows: {
      key: string;
      athleteId: string;
      playerKey: string;
      displayName: string;
      group: string;
      week: number;
      practice: number;
      game: number;
      pride: GradeRow["pride"];
    }[] = [];

    for (const a of athletes) {
      for (const raw of a.groups) {
        const group = migrateGroupAbbreviation(raw);
        if (!groupSet.has(group)) continue;
        const found = gradeRows.find(
          (r) =>
            gradeNameMatches(r.player, a) &&
            migrateGroupAbbreviation(r.group) === group &&
            weekMatches(r.week),
        );
        rows.push({
          key: `${a.id}-${group}`,
          athleteId: a.id,
          playerKey: found?.player ?? a.name,
          displayName: athleteLastFirst(a),
          group,
          week: found?.week ?? weekNum,
          practice: found?.practice ?? 0,
          game: found?.game ?? 0,
          pride: found?.pride ?? "C",
        });
      }
    }
    return rows;
  }, [roster, groupSet, gradeRows, weekNum]);

  return (
    <MyRoomGate>
      <div className="space-y-4">
        <MyRoomHeader
          title="Player Grades"
          subtitle={`Group grades for ${weekTitle}`}
        />
        <GameOfTheWeekPanel />
        <Panel
          title={`Grades · ${myGroups.join(", ") || "Your groups"}`}
          action={
            <div className="flex flex-wrap items-center gap-3">
              {weekOptions.length > 0 ? (
                <label className="flex items-center gap-1.5 text-xs text-[var(--cc-steel)]">
                  <span className="font-semibold text-[var(--cc-navy)]">
                    Week
                  </span>
                  <select
                    value={selectedGame.id}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                    className="rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-sm font-semibold text-[var(--cc-navy)]"
                  >
                    {weekOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {gameSlotLabel(g)} · {g.opponent}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => setPage("grades")}
                className="text-sm font-semibold text-[var(--cc-blue)]"
              >
                Full grades →
              </button>
            </div>
          }
        >
          <p className="mb-3 text-sm text-[var(--cc-steel)]">
            Practice 0–10 · Game 0–100 · Cougar Pride A–F
            {canEdit
              ? " — edit scores for your assigned position groups."
              : "."}
          </p>
          {displayRows.length === 0 ? (
            <p className="text-sm text-[var(--cc-steel)]">
              No athletes in your assigned groups yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--cc-line)]">
              <table className="w-full min-w-[36rem] text-left text-sm">
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
                  {displayRows.map((row) => (
                    <tr
                      key={row.key}
                      className="border-t border-[var(--cc-line)]"
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-[var(--cc-navy)]">
                        <PlayerNameLink
                          id={row.athleteId}
                          name={row.displayName}
                        />
                      </td>
                      <td className="px-3 py-2 text-[var(--cc-steel)]">
                        {row.group}
                      </td>
                      <td className="px-3 py-2">
                        {canEditPositionGroup(
                          role,
                          row.group,
                          groupSet,
                          isArchiveMode,
                        ) ? (
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={row.practice}
                            onChange={(e) => {
                              const practice = Math.min(
                                10,
                                Math.max(0, Number(e.target.value) || 0),
                              );
                              upsertPlayerGrade(
                                {
                                  player: row.playerKey,
                                  group: row.group,
                                  week: row.week,
                                },
                                { practice },
                              );
                            }}
                            className="w-16 rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-[var(--cc-navy)]"
                          />
                        ) : (
                          row.practice
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {canEditPositionGroup(
                          role,
                          row.group,
                          groupSet,
                          isArchiveMode,
                        ) ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.game}
                            onChange={(e) => {
                              const game = Math.min(
                                100,
                                Math.max(0, Number(e.target.value) || 0),
                              );
                              upsertPlayerGrade(
                                {
                                  player: row.playerKey,
                                  group: row.group,
                                  week: row.week,
                                },
                                { game },
                              );
                            }}
                            className="w-16 rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-[var(--cc-navy)]"
                          />
                        ) : (
                          row.game || "—"
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {canEditPositionGroup(
                          role,
                          row.group,
                          groupSet,
                          isArchiveMode,
                        ) ? (
                          <select
                            value={row.pride}
                            onChange={(e) =>
                              upsertPlayerGrade(
                                {
                                  player: row.playerKey,
                                  group: row.group,
                                  week: row.week,
                                },
                                {
                                  pride: e.target.value as GradeRow["pride"],
                                },
                              )
                            }
                            className="rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-[var(--cc-navy)]"
                          >
                            {(["A", "B", "C", "D", "F"] as const).map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        ) : (
                          row.pride
                        )}
                      </td>
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

function sidePositionSorts(side: Side, groupCodes: string[]) {
  if (side === "defense") return DEFENSE_POS_SORTS;
  return [
    { id: "all", label: "All", codes: null as string[] | null },
    ...groupCodes
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
  if (side === "specialTeams") {
    const order = ["ST", "K"];
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
  editAction,
}: {
  unitLabel: string;
  goals: UnitGoal[];
  cells: Record<string, GoalCellValue>;
  onToggle: (key: string) => void;
  editAction?: React.ReactNode;
}) {
  const { gameMetaOverrides, disabledOptionalGames, scheduleGames } = useApp();
  const weekGames = useMemo(
    () =>
      visibleScheduleGames(scheduleGames, disabledOptionalGames).map((g) =>
        mergeGameMeta(g, gameMetaOverrides),
      ),
    [disabledOptionalGames, gameMetaOverrides, scheduleGames],
  );

  return (
    <Panel
      title={`${unitLabel} Game Goals · Overall`}
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="text-xs text-[var(--cc-steel)]">
            Same weeks as Schedule · yes ✓ → no ✕ → clear
          </p>
          {editAction}
        </div>
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
    <Panel
      title={`Edit ${unitLabel} goals`}
      action={
        <ImportFromArchiveButton
          presetCategories={["unitGoals"]}
          sideScope="current"
          label="Add goals from archive"
        />
      }
    >
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
  const {
    offenseGroupCodes,
    defenseGroupCodes,
    specialTeamsGroupCodes,
    gradeRows,
    upsertPlayerGrade,
    roster,
    coachAssignments,
    isArchiveMode,
  } = useApp();
  const [posFilter, setPosFilter] = useState("all");
  const sorts = sidePositionSorts(
    side,
    side === "specialTeams" ? specialTeamsGroupCodes : offenseGroupCodes,
  );

  const canEdit = canEditContent(role, isArchiveMode);
  const profile = myRoomProfile(role, side, coachAssignments);
  const editableGroups = useMemo(() => {
    const assigned = profile
      ? expandCoachGroupsWith(
          profile.groups,
          profile.side,
          offenseGroupCodes,
          defenseGroupCodes,
        )
      : [];
    return editablePositionGroupSet(role, assigned, sideGroups, isArchiveMode);
  }, [
    role,
    profile,
    sideGroups,
    offenseGroupCodes,
    defenseGroupCodes,
    isArchiveMode,
  ]);

  const weekGradeRows = useMemo(
    () =>
      gradeRows.filter((row) => {
        const group = migrateGroupAbbreviation(row.group);
        return (
          sideGroups.has(group) &&
          (row.week === game.week || (game.week === 1 && row.week === 0))
        );
      }),
    [gradeRows, sideGroups, game.week],
  );
  const weekAvg = unitGradeAverages(weekGradeRows);

  const demoPlayer = role === "player" ? findDemoPlayerAthlete(roster) : undefined;

  const displayRows = useMemo(() => {
    const weekMatches = (w: number) =>
      w === game.week || (game.week === 1 && w === 0);

    const athletes = roster
      .filter(
        (a) =>
          (a.personnelType ?? "athlete") === "athlete" &&
          a.groups.some((g) =>
            sideGroups.has(migrateGroupAbbreviation(g)),
          ),
      )
      .sort(compareByLastName);

    const rows: {
      key: string;
      athleteId: string;
      playerKey: string;
      displayName: string;
      group: string;
      week: number;
      practice: number;
      game: number;
      pride: GradeRow["pride"];
    }[] = [];

    const matchedKeys = new Set<string>();

    for (const a of athletes) {
      for (const raw of a.groups) {
        const group = migrateGroupAbbreviation(raw);
        if (!sideGroups.has(group)) continue;
        const found = gradeRows.find(
          (r) =>
            gradeNameMatches(r.player, a) &&
            migrateGroupAbbreviation(r.group) === group &&
            weekMatches(r.week),
        );
        if (found) {
          matchedKeys.add(
            `${found.player}::${migrateGroupAbbreviation(found.group)}::${found.week}`,
          );
        }
        rows.push({
          key: `${a.id}-${group}`,
          athleteId: a.id,
          playerKey: found?.player ?? a.name,
          displayName: athleteLastFirst(a),
          group,
          week: found?.week ?? game.week,
          practice: found?.practice ?? 0,
          game: found?.game ?? 0,
          pride: found?.pride ?? "C",
        });
      }
    }

    // Keep orphan grade rows (no roster match) visible for the week/unit.
    for (const r of weekGradeRows) {
      const group = migrateGroupAbbreviation(r.group);
      const key = `${r.player}::${group}::${r.week}`;
      if (matchedKeys.has(key)) continue;
      rows.push({
        key: `orphan-${key}`,
        athleteId: "",
        playerKey: r.player,
        displayName: r.player,
        group,
        week: r.week,
        practice: r.practice,
        game: r.game,
        pride: r.pride,
      });
    }

    return rows;
  }, [roster, sideGroups, gradeRows, weekGradeRows, game.week]);

  const filteredRows = displayRows
    .filter((row) => {
      const selected = sorts.find((s) => s.id === posFilter);
      if (!selected?.codes) return true;
      return selected.codes.includes(row.group);
    })
    .sort((a, b) => {
      const rank =
        positionSortRank(side, a.group) - positionSortRank(side, b.group);
      if (rank !== 0) return rank;
      return a.displayName.localeCompare(b.displayName);
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
        {canEdit ? (
          <p className="mb-2 text-sm text-[var(--cc-steel)]">
            Practice 0–10 · Game 0–100 · Cougar Pride A–F — edit scores for your
            assigned position groups.
          </p>
        ) : null}
        {displayRows.length === 0 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No {unitLabel.toLowerCase()} athletes or grades for this week yet.
          </p>
        ) : filteredRows.length === 0 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            No grades for this position group this week.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--cc-line)]">
            <table className="w-full min-w-[36rem] text-left text-sm">
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
                {filteredRows.map((row) => {
                  const rowEditable = canEditPositionGroup(
                    role,
                    row.group,
                    editableGroups,
                    isArchiveMode,
                  );
                  const hidePeerName =
                    role === "player" &&
                    (!demoPlayer || row.athleteId !== demoPlayer.id);
                  return (
                    <tr
                      key={row.key}
                      className="border-t border-[var(--cc-line)]"
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-[var(--cc-navy)]">
                        {hidePeerName ? (
                          "—"
                        ) : row.athleteId ? (
                          <PlayerNameLink
                            id={row.athleteId}
                            name={row.displayName}
                          />
                        ) : (
                          <PlayerNameLink name={row.displayName} />
                        )}
                      </td>
                      <td className="px-3 py-3 text-[var(--cc-steel)]">
                        {row.group}
                      </td>
                      <td className="px-3 py-3">
                        {rowEditable ? (
                          <input
                            type="number"
                            min={0}
                            max={10}
                            value={row.practice}
                            onChange={(e) => {
                              const practice = Math.min(
                                10,
                                Math.max(0, Number(e.target.value) || 0),
                              );
                              upsertPlayerGrade(
                                {
                                  player: row.playerKey,
                                  group: row.group,
                                  week: row.week,
                                },
                                { practice },
                              );
                            }}
                            className="w-16 rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-[var(--cc-navy)]"
                          />
                        ) : (
                          row.practice
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {rowEditable ? (
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={row.game}
                            onChange={(e) => {
                              const gameVal = Math.min(
                                100,
                                Math.max(0, Number(e.target.value) || 0),
                              );
                              upsertPlayerGrade(
                                {
                                  player: row.playerKey,
                                  group: row.group,
                                  week: row.week,
                                },
                                { game: gameVal },
                              );
                            }}
                            className="w-16 rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-[var(--cc-navy)]"
                          />
                        ) : (
                          row.game || "—"
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {rowEditable ? (
                          <select
                            value={row.pride}
                            onChange={(e) =>
                              upsertPlayerGrade(
                                {
                                  player: row.playerKey,
                                  group: row.group,
                                  week: row.week,
                                },
                                {
                                  pride: e.target
                                    .value as GradeRow["pride"],
                                },
                              )
                            }
                            className="rounded-md border border-[var(--cc-line)] bg-white px-2 py-1 text-[var(--cc-navy)]"
                          >
                            {(["A", "B", "C", "D", "F"] as const).map(
                              (p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          row.pride
                        )}
                      </td>
                    </tr>
                  );
                })}
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
    specialTeamsGroupCodes,
    offenseGoals,
    defenseGoals,
    isArchiveMode,
  } = useApp();
  const [goalCells, setGoalCells] = useState<Record<string, GoalCellValue>>(
    {},
  );
  const [editingGoals, setEditingGoals] = useState(false);
  const unitLabel = sideLabel(side);
  const sideGroups = new Set(
    side === "specialTeams"
      ? specialTeamsGroupCodes
      : side === "defense"
        ? defenseGroupCodes
        : offenseGroupCodes,
  );
  const goals =
    side === "specialTeams"
      ? []
      : side === "defense"
        ? defenseGoals
        : offenseGoals;
  const canEditGoals =
    canEditGameGoals(role) &&
    side !== "specialTeams" &&
    canEditContent(role, isArchiveMode);

  function toggleGoal(key: string) {
    setGoalCells((prev) => ({
      ...prev,
      [key]: cycleGoalCell(prev[key] ?? null),
    }));
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
        editAction={
          canEditGoals ? (
            <button
              type="button"
              onClick={() => setEditingGoals((v) => !v)}
              className="rounded-lg border border-[var(--cc-line)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--cc-navy)] hover:bg-[var(--cc-field)]"
            >
              {editingGoals ? "Done" : "Edit"}
            </button>
          ) : null
        }
      />

      {canEditGoals && editingGoals ? (
        <UnitGoalsEditor side={side} unitLabel={unitLabel} goals={goals} />
      ) : null}
    </div>
  );
}

function UnitHomeScreen() {
  const { side, setPage } = useApp();
  const unit = sideLabel(side);
  return (
    <Panel title={`Cougar ${unit}`}>
      <p className="text-lg text-[var(--cc-navy)]">{team.motto}</p>
      <p className="mt-2 text-sm text-[var(--cc-steel)]">
        {team.season} Season · Varsity {unit}
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
  editableGroups,
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
  /**
   * When set, only these groups' columns are editable (view still uses groupFilter).
   * Admin/coordinator typically omit this; position coaches pass assigned groups.
   */
  editableGroups?: Set<string> | string[];
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
  const canEditBoard = !readOnly && !presentMode && canMoveDepthPlayers(role);
  const editGroupSet = editableGroups
    ? editableGroups instanceof Set
      ? editableGroups
      : new Set(editableGroups)
    : null;
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
  const relevantCols = editGroupSet
    ? visibleCols
        .filter(({ pos }) =>
          groupsForDepthPosition(pos).some((g) => editGroupSet.has(g)),
        )
        .map(({ col }) => col)
    : groupFilter?.length
      ? visibleCols.map(({ col }) => col)
      : undefined;

  function columnEditable(pos: string) {
    if (!canEditBoard) return false;
    if (!editGroupSet) return true;
    return groupsForDepthPosition(pos).some((g) => editGroupSet.has(g));
  }

  function cellPayload(row: number, col: number) {
    return JSON.stringify({ teamIndex, schemeId, row, col });
  }

  function openPicker(row: number, col: number) {
    const pos = board.positions[col] ?? "";
    if (!columnEditable(pos)) return;
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
                  const pos = board.positions[ci] ?? "";
                  const cellEditable = columnEditable(pos);
                  const isTarget =
                    dragOver?.row === ri && dragOver?.col === ci;
                  return (
                    <td
                      key={`${ri}-${ci}`}
                      className={`h-9 border border-zinc-300 p-0.5 ${
                        isTarget
                          ? "bg-sky-100 ring-2 ring-inset ring-[var(--cc-blue)]"
                          : ""
                      } ${cellEditable ? "cursor-pointer" : ""}`}
                      onClick={() => openPicker(ri, ci)}
                      onDragOver={(e) => {
                        if (!cellEditable) return;
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
                        if (!cellEditable) return;
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
                          draggable={cellEditable}
                          onDragStart={(e) => {
                            if (!cellEditable) return;
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
                            cellEditable
                              ? "cursor-grab active:cursor-grabbing"
                              : ""
                          }`}
                          style={{
                            backgroundColor: classColors[cell.classYear],
                          }}
                          title={
                            cellEditable
                              ? "Click name for profile · click square to search · drag to move"
                              : "Click name for profile"
                          }
                        >
                          <PlayerNameLink
                            name={cell.name}
                            className="font-semibold text-zinc-900 underline-offset-2 hover:underline"
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-full min-h-8 items-center justify-center bg-white text-[10px] text-zinc-300 ${
                            cellEditable
                              ? "hover:bg-zinc-50 hover:text-zinc-400"
                              : ""
                          }`}
                          title={
                            cellEditable ? "Click to add athlete" : undefined
                          }
                        >
                          {cellEditable ? "+" : null}
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

  const teamColumns = [
    ...teams.map(abbreviateTeam),
    "No Team",
    "Total",
  ];
  const teamsRows = [
    ...gradeRows.map((g) => {
      const inGrade = athletes.filter((a) => a.classYear === g);
      const values = teams.map(
        (t) => inGrade.filter((a) => (a.teamLevel ?? "") === t).length,
      );
      const noTeam = inGrade.filter((a) => !a.teamLevel).length;
      const total = inGrade.length;
      return {
        label: abbreviateGrade(g),
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

  const positionGradeKeys: GradClass[] = [
    "senior",
    "junior",
    "sophomore",
    "freshman",
  ];
  const positionCols = [
    ...positionGradeKeys.map(abbreviateGrade),
    "Total",
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
    coachAssignments,
    offenseGroupCodes,
    defenseGroupCodes,
    side,
    isArchiveMode,
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
  const canEdit =
    canEditDepthConfig(role) && canEditContent(role, isArchiveMode);
  const canMove = canMoveDepthPlayers(role) && canEditContent(role, isArchiveMode);
  const canEditLayout = canSeeDepthCharts(role);
  const canManageSchemes =
    canEditDepthConfig(role) && canEditContent(role, isArchiveMode);
  const profile = myRoomProfile(role, side, coachAssignments);
  const depthEditableGroups = useMemo(() => {
    if (isCoordinatorOrAdmin(role)) return undefined;
    const assigned = profile
      ? expandCoachGroupsWith(
          profile.groups,
          profile.side,
          offenseGroupCodes,
          defenseGroupCodes,
        )
      : [];
    return editablePositionGroupSet(role, assigned, undefined, isArchiveMode);
  }, [role, profile, offenseGroupCodes, defenseGroupCodes, isArchiveMode]);

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
          {canEdit ? (
            <ImportFromArchiveButton
              presetCategories={["depthBoards"]}
              sideScope="current"
              label="Add from archive"
            />
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

      {canEdit ? (
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
                  editableGroups={depthEditableGroups}
                />
              </div>
            );
          })
        )}
      </div>

      <p className="depth-print-hide text-xs text-zinc-500">
        Charts start with 3 rows; putting anyone on the last row adds another.
        {" Click a name to open their profile."}
        {canMove
          ? isCoordinatorOrAdmin(role)
            ? " Click a square to search athletes by group · drag to move/swap (Coach+)."
            : " Edit only your assigned position-group columns · drag to move/swap."
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
  label?: string;
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
      {label ? (
        <p className="font-semibold text-[var(--cc-navy)]">{label}</p>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${label ? "mt-1" : ""} flex w-full items-center justify-between rounded-lg border border-[var(--cc-line)] bg-white px-3 py-2 text-left text-sm text-[var(--cc-navy)]`}
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
                            {(m.assignedTeams ?? [])
                              .map(abbreviateTeam)
                              .join(", ") || "—"}
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
    coachAssignments,
    offenseGroupCodes,
    defenseGroupCodes,
    side,
    isArchiveMode,
  } = useApp();
  const canEdit = canEditRoster(role) && canEditContent(role, isArchiveMode);
  const canAddAccounts =
    canCreatePlayerAccounts(role) && canEditContent(role, isArchiveMode);
  const profile = myRoomProfile(role, side, coachAssignments);
  const rosterEditableGroups = useMemo(() => {
    const assigned = profile
      ? expandCoachGroupsWith(
          profile.groups,
          profile.side,
          offenseGroupCodes,
          defenseGroupCodes,
        )
      : [];
    return editablePositionGroupSet(role, assigned, undefined, isArchiveMode);
  }, [role, profile, offenseGroupCodes, defenseGroupCodes, isArchiveMode]);
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
        abbreviateGrade(a.classYear).toLowerCase().includes(q) ||
        (a.teamLevel ?? "").toLowerCase().includes(q) ||
        (a.teamLevel
          ? abbreviateTeam(a.teamLevel).toLowerCase().includes(q)
          : false)
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
                <td className="whitespace-nowrap px-3 py-2 align-top">
                  <PlayerNameLink id={a.id} name={athleteLastFirst(a)} />
                </td>
                {isAthlete ? (
                  <td className="px-3 py-2 align-top">
                    {canEdit ? (
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {positionGroups.map((pos) => {
                          const code = migrateGroupAbbreviation(
                            pos.abbreviation,
                          );
                          const on = a.groups.some(
                            (g) => migrateGroupAbbreviation(g) === code,
                          );
                          const groupEditable = canEditPositionGroup(
                            role,
                            code,
                            rosterEditableGroups,
                            isArchiveMode,
                          );
                          return (
                            <label
                              key={pos.id}
                              title={
                                groupEditable
                                  ? pos.name
                                  : `${pos.name} (assigned coaches only)`
                              }
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
                                groupEditable
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed opacity-60"
                              } ${
                                on
                                  ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                                  : "border-[var(--cc-line)] text-[var(--cc-steel)]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={on}
                                disabled={!groupEditable}
                                onChange={(e) => {
                                  if (!groupEditable) return;
                                  const next = e.target.checked
                                    ? [
                                        ...a.groups.filter(
                                          (x) =>
                                            migrateGroupAbbreviation(x) !==
                                            code,
                                        ),
                                        pos.abbreviation,
                                      ]
                                    : a.groups.filter(
                                        (x) =>
                                          migrateGroupAbbreviation(x) !== code,
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
                    <span className="text-[var(--cc-navy)]">
                      {abbreviateGrade(a.classYear)}
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
                        {abbreviateTeam(a.teamLevel ?? "Varsity")}
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

      <div className="overflow-x-auto rounded-xl border border-[var(--cc-line)] bg-white">
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
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--cc-navy)]">
                      <PlayerNameLink id={a.id} name={athleteLastFirst(a)} />
                    </td>
                    {isAthlete ? (
                      <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                        {abbreviateTeam(a.teamLevel ?? "Varsity")}
                      </td>
                    ) : null}
                    {isAthlete ? (
                      <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                        {a.groups.join(", ")}
                      </td>
                    ) : null}
                    <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                      {abbreviateGrade(a.classYear)}
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
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium text-[var(--cc-navy)]">
                          <PlayerNameLink
                            id={person.id}
                            name={athleteLastFirst(person)}
                          />
                        </td>
                        {showTeam ? (
                          <td className="px-3 py-2.5 text-[var(--cc-steel)]">
                            {(person.personnelType ?? "athlete") ===
                            "support-staff"
                              ? "—"
                              : abbreviateTeam(person.teamLevel ?? "Varsity")}
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
  const { page, role } = useApp();

  if (page === "this-week") return <ThisWeekScreen />;
  if (page === "schedule" || page === "admin-schedule") return <ScheduleScreen />;
  if (page === "results") return <ResultsRedirectToSchedule />;
  if (page === "quizzes") {
    if (role === "player") return <QuizzesScreen />;
    return <QuizzesScreen />;
  }
  if (page === "groups" || page === "personnel-program-groups")
    return <GroupsScreen />;
  if (
    page === "admin-staff" ||
    page === "admin-coach-groups" ||
    page === "staff-responsibilities"
  )
    return <StaffScreen />;
  if (page === "staff" || page === "staff-handbook")
    return (
      <StaffResourceScreen
        title="Handbook"
        blurb="Staff handbook, policies, and program expectations. Upload the current season PDF or doc here."
      />
    );
  if (page === "staff-recruiting") return <StaffRecruitingScreen />;
  if (page === "staff-issued-equipment") return <StaffIssuedEquipmentScreen />;
  if (page === "staff-inventory") return <StaffStockInventoryScreen />;
  if (page === "admin" || page === "admin-branding")
    return <AdminScreen section="branding" />;
  if (page === "admin-members") return <AdminScreen section="members" />;
  if (page === "admin-teams") return <AdminTeamsScreen />;
  if (page === "admin-program") return <AdminProgramScreen />;
  if (page === "season-archives") return <ArchiveBrowseRedirect />;
  if (page === "admin-depth-settings") return <DepthChartsScreen />;
  if (page === "admin-team-goals") return <GradesScreen />;
  if (page === "account") return <AccountScreen />;
  if (page === "personnel-program-summary" || page === "personnel-program")
    return <ProgramSummaryScreen />;
  if (
    page === "depth-charts" ||
    page === "personnel-depth" ||
    page === "personnel-program-depth"
  )
    return <DepthChartsScreen />;
  if (page === "teach-resources") return <UnitResourcesScreen />;
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
  if (page === "my-room-quizzes") {
    if (role === "player") return <QuizzesScreen />;
    return <MyRoomQuizzesScreen />;
  }
  if (page === "my-room-grades") return <MyRoomGradesScreen />;
  if (page === "my-room-chat") return <MyRoomChatRedirect />;
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
    currentSeasonId,
    viewingSeasonId,
    setViewingSeason,
    archivedSeasons,
    isArchiveMode,
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

  useEffect(() => {
    if (role !== "player") return;
    if (page === "personnel-program-groups" || page === "groups") {
      setPage("this-week");
      return;
    }
    if (page === "quizzes") {
      setPage("my-room-quizzes");
      return;
    }
    if (isUnitPage(page) && !canAccessUnitPage(role, page)) {
      setPage("this-week");
    }
  }, [role, page, setPage]);

  // Archive mode: keep users on role-allowed surfaces only (nav already scoped)
  useEffect(() => {
    if (!isArchiveMode) return;
    if (isAdminPage(page) && page !== "admin-program") {
      // Allow Program for admin delete; otherwise kick off other admin tools
      if (role !== "admin") setPage("this-week");
    }
  }, [isArchiveMode, page, role, setPage]);

  // Players cannot browse archives — return to live season.
  useEffect(() => {
    if (!isArchiveMode) return;
    if (role === "admin" || role === "coordinator" || role === "coach") return;
    setViewingSeason(currentSeasonId);
  }, [isArchiveMode, role, currentSeasonId, setViewingSeason]);

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
  const unitItems = unitMenuItemsForRole(role);
  const teamUnits = teamMenuUnits();
  const roomItems = myRoomMenuItems(role);
  const staffItems = staffMenuItems(role);
  const adminItems = adminMenuItems(role);
  const showUnitMenus = !presentMode;
  const showMyRoom = !presentMode && canSeeMyRoom(role);
  // Staff / admin chrome stays role-scoped; archive mode is read-only via canEdit
  const showStaff = !presentMode && canSeeStaffRoom(role);
  const showDepthInTeam = showUnitMenus && canSeeDepthCharts(role);
  const showAdmin = !presentMode && canSeeAdminMenu(role);
  const [staffSubmenu, setStaffSubmenu] = useState<string | null>(null);
  const [teamSubmenu, setTeamSubmenu] = useState<Side | null>(null);

  function pickUnitPage(nextSide: Side, nextPage: AppPage) {
    setSide(nextSide);
    setPage(nextPage);
    setOpenNavMenu(null);
    setTeamSubmenu(null);
  }

  function pickMyRoomPage(nextPage: AppPage) {
    setPage(nextPage);
    setOpenNavMenu(null);
  }

  function pickStaffPage(nextPage: AppPage) {
    setPage(nextPage);
    setOpenNavMenu(null);
    setStaffSubmenu(null);
  }

  function pickTeamDepthPage() {
    setPage("personnel-depth");
    setOpenNavMenu(null);
    setTeamSubmenu(null);
  }

  function pickAdminPage(nextPage: AppPage) {
    setPage(nextPage);
    setOpenNavMenu(null);
  }

  const seasonOptions = [
    {
      id: currentSeasonId,
      label: `${currentSeasonId} (current)`,
    },
    // Staff can browse archived seasons; players stay on current.
    ...(role === "admin" ||
    role === "coordinator" ||
    role === "coach"
      ? archivedSeasons.map((a) => ({
          id: a.id,
          label: a.label,
        }))
      : []),
  ];

  return (
    <div className="min-h-screen bg-[var(--cc-field)]">
      <header className="depth-print-hide relative z-50 border-b border-[var(--cc-line)] bg-[var(--cc-navy)] text-white">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
                {isArchiveMode ? " · Archive" : ""}
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
                <label className="text-xs text-white/70">
                  Season{" "}
                  <select
                    value={viewingSeasonId}
                    onChange={(e) => setViewingSeason(e.target.value)}
                    className="ml-1 rounded-md border-0 bg-white/10 px-2 py-1.5 text-sm text-white"
                  >
                    {seasonOptions.map((s) => (
                      <option key={s.id} value={s.id} className="text-black">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-[90rem] flex-wrap gap-1 px-4 pb-2 sm:px-6">
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
                My Stuff ▾
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

          {showStaff && (
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => {
                  const next = openNavMenu === "staff" ? null : "staff";
                  setOpenNavMenu(next);
                  if (!next) setStaffSubmenu(null);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                  isStaffPage(page)
                    ? "bg-white text-[var(--cc-navy)]"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                Staff ▾
              </button>
              {openNavMenu === "staff" && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                  {staffItems.map((item) =>
                    item.children?.length ? (
                      <div
                        key={item.id}
                        className="relative"
                        onMouseEnter={() => setStaffSubmenu(item.id)}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setStaffSubmenu((cur) =>
                              cur === item.id ? null : item.id,
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                            item.children.some((c) => page === c.id) ||
                            staffSubmenu === item.id
                              ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                              : "text-[var(--cc-navy)]"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="ml-3 text-[var(--cc-steel)]">▸</span>
                        </button>
                        {staffSubmenu === item.id && (
                          <div className="absolute top-0 left-full z-50 ml-1 min-w-[200px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => pickStaffPage(child.id)}
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
                        onClick={() => pickStaffPage(item.id)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                          page === item.id ||
                          (item.id === "staff-responsibilities" &&
                            (page === "admin-staff" ||
                              page === "admin-coach-groups"))
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

          {showUnitMenus && (
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => {
                  const next = openNavMenu === "team" ? null : "team";
                  setOpenNavMenu(next);
                  if (!next) setTeamSubmenu(null);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                  isUnitPage(page) || isDepthChartPage(page)
                    ? "bg-white text-[var(--cc-navy)]"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                Team ▾
              </button>
              {openNavMenu === "team" && (
                <div className="absolute top-full left-0 z-50 mt-1 min-w-[180px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                  {showDepthInTeam ? (
                    <button
                      type="button"
                      onClick={() => pickTeamDepthPage()}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                        isDepthChartPage(page)
                          ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                          : "text-[var(--cc-navy)]"
                      }`}
                    >
                      Depth Chart
                    </button>
                  ) : null}
                  {teamUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className="relative"
                      onMouseEnter={() => setTeamSubmenu(unit.id)}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setTeamSubmenu((cur) =>
                            cur === unit.id ? null : unit.id,
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                          (side === unit.id && isUnitPage(page)) ||
                          teamSubmenu === unit.id
                            ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)]"
                            : "text-[var(--cc-navy)]"
                        }`}
                      >
                        <span>{unit.label}</span>
                        <span className="ml-3 text-[var(--cc-steel)]">▸</span>
                      </button>
                      {teamSubmenu === unit.id && (
                        <div className="absolute top-0 left-full z-50 ml-1 min-w-[200px] rounded-xl border border-[var(--cc-line)] bg-white p-1 shadow-lg">
                          {unitItems.map((item) => (
                            <button
                              key={`${unit.id}-${item.id}`}
                              type="button"
                              onClick={() => pickUnitPage(unit.id, item.id)}
                              className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-[var(--cc-field)] ${
                                side === unit.id && page === item.id
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
                  ))}
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

      {isArchiveMode ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950 sm:px-6">
          Viewing archived season{" "}
          <span className="font-semibold">{viewingSeasonId}</span>
          {role === "admin" || role === "coordinator"
            ? " — uploads and edits enabled for backfill."
            : role === "player"
              ? " — view-only (player-visible content)."
              : role === "coach"
                ? " — view-only (coach-scoped)."
                : " — view-only."}{" "}
          <button
            type="button"
            onClick={() => setViewingSeason(currentSeasonId)}
            className="font-semibold text-[var(--cc-blue)] underline-offset-2 hover:underline"
          >
            Return to {currentSeasonId}
          </button>
        </div>
      ) : null}

      <main className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6">
        <ScreenRouter />
      </main>

      <PlayerSettingsOverlay />
      <CoachSettingsOverlay />

      <footer className="depth-print-hide mx-auto max-w-[90rem] px-4 pb-8 text-center text-xs text-[var(--cc-steel)] sm:px-6">
        {presentMode
          ? "Cy Creek Football · Workout board"
          : "UI mock only · no real auth/uploads yet · works alongside Hudl"}
      </footer>
    </div>
  );
}
