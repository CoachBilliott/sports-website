import type { AppPage, Role, Side } from "./types";
import {
  canSeeDepthCharts,
  canSeeMyRoom,
  canSeePersonnel,
  canSeeScout,
  canTakeQuizzes,
  unitMenuItemsForRole,
} from "./permissions";

/** A navigable quick-action target filtered by role access. */
export type QuickActionSpec = {
  id: string;
  label: string;
  page: AppPage;
  /** When set, switches unit side before navigating. */
  side?: Side;
};

/** Stable owner key for per-user quick-action prefs. */
export function quickActionsOwnerKey(
  role: Role,
  identityKey: string,
): string {
  return `${role}:${identityKey || "default"}`;
}

function unitActions(role: Role): QuickActionSpec[] {
  const items = unitMenuItemsForRole(role);
  const sides: Side[] =
    role === "player"
      ? ["offense", "defense"]
      : ["offense", "defense", "specialTeams"];
  const sideLabel = (s: Side) =>
    s === "defense" ? "Defense" : s === "specialTeams" ? "ST" : "Offense";
  const out: QuickActionSpec[] = [];
  for (const item of items) {
    for (const s of sides) {
      out.push({
        id: `unit:${s}:${item.id}`,
        label: `${sideLabel(s)} · ${item.label}`,
        page: item.id,
        side: s,
      });
    }
  }
  return out;
}

/** Allowlist of pages/features this role can put on Quick Actions. */
export function quickActionCatalogForRole(role: Role): QuickActionSpec[] {
  const catalog: QuickActionSpec[] = [];

  catalog.push({ id: "this-week", label: "This Week", page: "this-week" });
  catalog.push({ id: "schedule", label: "Schedule", page: "schedule" });

  if (role === "player") {
    catalog.push(
      { id: "my-room-group", label: "Position Group", page: "my-room-group" },
      { id: "my-room-quizzes", label: "Quizzes", page: "my-room-quizzes" },
    );
    catalog.push(...unitActions(role));
    return catalog;
  }

  // Staff
  if (canSeeMyRoom(role)) {
    catalog.push(
      { id: "my-room-depth", label: "My Stuff · Depth", page: "my-room-depth" },
      {
        id: "my-room-responsibles",
        label: "Responsibilities",
        page: "my-room-responsibles",
      },
      { id: "my-room-scout", label: "My Stuff · Scout", page: "my-room-scout" },
      {
        id: "my-room-quizzes",
        label: "My Stuff · Quizzes",
        page: "my-room-quizzes",
      },
      { id: "my-room-grades", label: "My Stuff · Grades", page: "my-room-grades" },
      { id: "my-room-group", label: "Position Group", page: "my-room-group" },
    );
  }

  if (canSeeDepthCharts(role)) {
    catalog.push({
      id: "personnel-depth",
      label: "Depth chart",
      page: "personnel-depth",
    });
  }

  if (canSeePersonnel(role)) {
    catalog.push(
      {
        id: "personnel-attendance-athletes",
        label: "Attendance",
        page: "personnel-attendance-athletes",
      },
      {
        id: "personnel-roster-athletes",
        label: "Rosters",
        page: "personnel-roster-athletes",
      },
    );
  }

  if (canTakeQuizzes(role)) {
    catalog.push({ id: "quizzes", label: "Unit Quizzes", page: "quizzes" });
  }

  if (canSeeScout(role)) {
    catalog.push({
      id: "scout-offense",
      label: "Offense · Scout",
      page: "scout",
      side: "offense",
    });
  }

  catalog.push(
    {
      id: "install-offense",
      label: "Offense · Install",
      page: "teach-install",
      side: "offense",
    },
    {
      id: "install-defense",
      label: "Defense · Install",
      page: "teach-install",
      side: "defense",
    },
    {
      id: "install-st",
      label: "Special Teams · Install",
      page: "teach-install",
      side: "specialTeams",
    },
    {
      id: "call-sheet",
      label: "Call sheet",
      page: "teach-call-sheet",
    },
  );

  catalog.push(...unitActions(role));

  // Deduplicate by id
  const seen = new Set<string>();
  return catalog.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

/** Built-in defaults until the user customizes. */
export function defaultQuickActionIds(role: Role): string[] {
  switch (role) {
    case "player":
      return [
        "my-room-quizzes",
        "unit:offense:teach-playbook",
        "unit:offense:scout",
        "schedule",
      ];
    case "coach":
      return [
        "my-room-depth",
        "personnel-depth",
        "personnel-attendance-athletes",
        "install-offense",
        "quizzes",
        "my-room-responsibles",
      ];
    case "coordinator":
      return [
        "install-offense",
        "scout-offense",
        "call-sheet",
        "personnel-depth",
        "personnel-attendance-athletes",
        "quizzes",
        "my-room-responsibles",
      ];
    case "admin":
      return [
        "personnel-depth",
        "install-offense",
        "install-defense",
        "install-st",
        "personnel-attendance-athletes",
        "personnel-roster-athletes",
        "schedule",
      ];
  }
}

export function resolveQuickActions(
  role: Role,
  customIds: string[] | undefined | null,
): QuickActionSpec[] {
  const catalog = quickActionCatalogForRole(role);
  const byId = new Map(catalog.map((a) => [a.id, a]));
  const ids =
    customIds && customIds.length > 0
      ? customIds
      : defaultQuickActionIds(role);
  return ids
    .map((id) => byId.get(id))
    .filter((a): a is QuickActionSpec => !!a);
}
