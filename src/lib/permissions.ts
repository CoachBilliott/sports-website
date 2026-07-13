import type { AppPage, Role, Side } from "./types";

const staff: Role[] = ["admin", "coordinator", "coach"];

export function canSeeScout(role: Role) {
  return role !== "parent" && role !== "fan";
}

export function canEditContent(role: Role) {
  return staff.includes(role);
}

export function canManageMembers(role: Role) {
  return role === "admin";
}

export function canSeeStaffRoom(role: Role) {
  return staff.includes(role);
}

export function canSeeGradesDetail(role: Role) {
  return role !== "fan";
}

export function canTakeQuizzes(role: Role) {
  return role === "player" || role === "coach" || role === "coordinator" || role === "admin";
}

export function defaultPageForRole(role: Role): AppPage {
  if (role === "fan") return "schedule";
  if (role === "parent") return "this-week";
  if (role === "admin") return "this-week";
  return "this-week";
}

export function programNavForRole(role: Role): { id: AppPage; label: string }[] {
  if (role === "fan") {
    return [{ id: "schedule", label: "Schedule" }];
  }
  if (role === "parent") {
    return [
      { id: "this-week", label: "This Week" },
      { id: "schedule", label: "Schedule" },
      { id: "grades", label: "My Athlete" },
    ];
  }
  const base: { id: AppPage; label: string }[] = [
    { id: "this-week", label: "This Week" },
    { id: "schedule", label: "Schedule" },
    { id: "quizzes", label: "Quizzes" },
    { id: "groups", label: "Groups" },
  ];
  if (canSeeStaffRoom(role)) {
    base.push({ id: "staff", label: "Staff" });
  }
  if (canManageMembers(role)) {
    base.push({ id: "admin", label: "Admin" });
  }
  return base;
}

export function sideNavItems(side: Side): {
  id: AppPage;
  label: string;
  children?: { id: AppPage; label: string }[];
}[] {
  return [
    { id: "unit-home", label: "Unit Home" },
    {
      id: "teach-playbook",
      label: "Teach",
      children: [
        { id: "teach-playbook", label: "Playbook" },
        { id: "teach-install", label: "Install" },
        { id: "teach-practice", label: "Practice" },
        { id: "teach-study", label: "Study Guides" },
        { id: "teach-philosophy", label: "Philosophy" },
      ],
    },
    { id: "scout", label: "Scout" },
    { id: "my-room", label: "My Room" },
    { id: "grades", label: "Grades" },
  ];
}

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  coordinator: "Coordinator",
  coach: "Coach",
  player: "Player",
  parent: "Parent",
  fan: "Fan (public)",
};
