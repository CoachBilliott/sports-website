/**
 * Cy-Fair athletics chain of command + permission matrix.
 * Rank 1 = highest authority.
 */

import type { Role } from "./types";

export const ROLE_RANK: Record<Role, number> = {
  district_athletic_director: 1,
  associate_athletic_director: 2,
  district_athletic_coordinator: 3,
  athletic_campus_coordinator: 4,
  assistant_athletic_campus_coordinator: 5,
  head_coach: 6,
  coach: 7,
  parent: 8,
  player: 9,
};

export const ROLE_LABEL: Record<Role, string> = {
  district_athletic_director: "District Athletic Director",
  associate_athletic_director: "Associate Athletic Director",
  district_athletic_coordinator: "District Athletic Coordinator",
  athletic_campus_coordinator: "Athletic Campus Coordinator",
  assistant_athletic_campus_coordinator: "Assistant Athletic Campus Coordinator",
  head_coach: "Head Coach",
  coach: "Coach",
  parent: "Parent",
  player: "Player",
};

export const ROLE_SHORT: Record<Role, string> = {
  district_athletic_director: "DAD",
  associate_athletic_director: "AAD",
  district_athletic_coordinator: "DAC",
  athletic_campus_coordinator: "Campus Coord.",
  assistant_athletic_campus_coordinator: "Asst. Campus Coord.",
  head_coach: "HC",
  coach: "Coach",
  parent: "Parent",
  player: "Player",
};

/** Expected headcount for district athletics leadership */
export const ROLE_HEADCOUNT: Partial<Record<Role, number>> = {
  district_athletic_director: 2,
  associate_athletic_director: 4,
  district_athletic_coordinator: 2,
  athletic_campus_coordinator: 12,
  assistant_athletic_campus_coordinator: 12,
};

/** Chain order for org chart (district leadership only) */
export const DISTRICT_CHAIN: Role[] = [
  "district_athletic_director",
  "associate_athletic_director",
  "district_athletic_coordinator",
  "athletic_campus_coordinator",
  "assistant_athletic_campus_coordinator",
];

export type Permission =
  | "view_district"
  | "manage_district_settings"
  | "manage_sso"
  | "manage_legal"
  | "view_all_campuses"
  | "manage_all_campuses"
  | "manage_own_campus"
  | "manage_members"
  | "invite_below_self"
  | "view_programs"
  | "manage_programs"
  | "manage_roster"
  | "manage_schedule"
  | "manage_announcements"
  | "season_roll"
  | "export_delete"
  | "view_audit"
  | "view_fan_parent"
  | "impersonate_preview";

const ALL: Permission[] = [
  "view_district",
  "manage_district_settings",
  "manage_sso",
  "manage_legal",
  "view_all_campuses",
  "manage_all_campuses",
  "manage_own_campus",
  "manage_members",
  "invite_below_self",
  "view_programs",
  "manage_programs",
  "manage_roster",
  "manage_schedule",
  "manage_announcements",
  "season_roll",
  "export_delete",
  "view_audit",
  "view_fan_parent",
  "impersonate_preview",
];

/** Permissions granted at each rank ceiling (rank <= N gets these) */
const BY_MAX_RANK: { maxRank: number; perms: Permission[] }[] = [
  {
    maxRank: 1,
    perms: ALL,
  },
  {
    maxRank: 2,
    perms: [
      "view_district",
      "manage_district_settings",
      "manage_sso",
      "manage_legal",
      "view_all_campuses",
      "manage_all_campuses",
      "manage_own_campus",
      "manage_members",
      "invite_below_self",
      "view_programs",
      "manage_programs",
      "manage_roster",
      "manage_schedule",
      "manage_announcements",
      "season_roll",
      "export_delete",
      "view_audit",
      "view_fan_parent",
      "impersonate_preview",
    ],
  },
  {
    maxRank: 3,
    perms: [
      "view_district",
      "view_all_campuses",
      "manage_own_campus",
      "manage_members",
      "invite_below_self",
      "view_programs",
      "manage_programs",
      "manage_roster",
      "manage_schedule",
      "manage_announcements",
      "season_roll",
      "view_audit",
      "view_fan_parent",
      "impersonate_preview",
    ],
  },
  {
    maxRank: 4,
    perms: [
      "view_district",
      "manage_own_campus",
      "manage_members",
      "invite_below_self",
      "view_programs",
      "manage_programs",
      "manage_roster",
      "manage_schedule",
      "manage_announcements",
      "season_roll",
      "view_fan_parent",
    ],
  },
  {
    maxRank: 5,
    perms: [
      "view_district",
      "manage_own_campus",
      "invite_below_self",
      "view_programs",
      "manage_programs",
      "manage_roster",
      "manage_schedule",
      "manage_announcements",
      "view_fan_parent",
    ],
  },
  {
    maxRank: 6,
    perms: [
      "view_programs",
      "manage_roster",
      "manage_schedule",
      "manage_announcements",
      "view_fan_parent",
    ],
  },
  {
    maxRank: 7,
    perms: [
      "view_programs",
      "manage_roster",
      "manage_schedule",
      "view_fan_parent",
    ],
  },
  {
    maxRank: 8,
    perms: ["view_fan_parent"],
  },
  {
    maxRank: 9,
    perms: ["view_fan_parent"],
  },
];

export function permissionsFor(role: Role): Set<Permission> {
  const rank = ROLE_RANK[role];
  const match = BY_MAX_RANK.find((b) => rank <= b.maxRank) ?? BY_MAX_RANK.at(-1)!;
  return new Set(match.perms);
}

export function can(role: Role | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  return permissionsFor(role).has(perm);
}

export function canInviteRole(actor: Role, target: Role): boolean {
  if (!can(actor, "invite_below_self")) return false;
  return ROLE_RANK[target] > ROLE_RANK[actor];
}

export function invitableRoles(actor: Role): Role[] {
  return (Object.keys(ROLE_RANK) as Role[]).filter((r) => canInviteRole(actor, r));
}

export const CYFAIR_CAMPUSES: {
  id: string;
  name: string;
  mascot: string;
  short: string;
}[] = [
  { id: "camp-cycreek", name: "Cypress Creek High School", mascot: "Cougars", short: "Cy Creek" },
  { id: "camp-cywoods", name: "Cy Woods High School", mascot: "Wildcats", short: "Cy Woods" },
  { id: "camp-cyranch", name: "Cy Ranch High School", mascot: "Mustangs", short: "Cy Ranch" },
  { id: "camp-cyfalls", name: "Cy Falls High School", mascot: "Eagles", short: "Cy Falls" },
  { id: "camp-cylakes", name: "Cy Lakes High School", mascot: "Spartans", short: "Cy Lakes" },
  { id: "camp-cysprings", name: "Cy Springs High School", mascot: "Panthers", short: "Cy Springs" },
  { id: "camp-cyridge", name: "Cy Ridge High School", mascot: "Rams", short: "Cy Ridge" },
  { id: "camp-langham", name: "Langham Creek High School", mascot: "Lobos", short: "Langham Creek" },
  { id: "camp-jv", name: "Jersey Village High School", mascot: "Falcons", short: "Jersey Village" },
  { id: "camp-cyfair", name: "Cy-Fair High School", mascot: "Bobcats", short: "Cy-Fair HS" },
  { id: "camp-bridgeland", name: "Bridgeland High School", mascot: "Bears", short: "Bridgeland" },
  { id: "camp-cypark", name: "Cy Park High School", mascot: "Tigers", short: "Cy Park" },
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_district: "View district org",
  manage_district_settings: "Manage district settings",
  manage_sso: "Manage SSO",
  manage_legal: "Legal & safety controls",
  view_all_campuses: "View all campuses",
  manage_all_campuses: "Manage all campuses",
  manage_own_campus: "Manage assigned campus",
  manage_members: "Manage members",
  invite_below_self: "Invite roles below you",
  view_programs: "View teams",
  manage_programs: "Create / edit teams",
  manage_roster: "Edit roster",
  manage_schedule: "Edit schedule",
  manage_announcements: "Post announcements",
  season_roll: "Season roll",
  export_delete: "Export / offboard data",
  view_audit: "View audit log",
  view_fan_parent: "Open Fan & Parent",
  impersonate_preview: "Preview as other roles",
};
