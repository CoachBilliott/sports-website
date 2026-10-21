/** Browser-local coaching demo. No athlete records or server persistence. */
export const POSITIONS = ["QB", "RB", "X", "Y", "Z", "H", "LT", "LG", "C", "RG", "RT"] as const;
export type Position = typeof POSITIONS[number];
export type Assignments = Partial<Record<Position, string>>;
export type LibraryItem = {
  id: string;
  type: "formation" | "play" | "misc";
  title: string;
  category: string;
  subcategory: string;
  formation: string;
  description: string;
  coaching: string;
  fileKey: string | null;
  fileName: string | null;
  contentType: string | null;
  diagramData: string | null;
  createdAt: string;
  /** Optional additions: legacy designer records remain valid, at revision 1. */
  revision?: number;
  assignments?: Assignments;
  frontAdjustments?: Record<string, string>;
};
export const WORKFLOW_KEY = "team-os-offense-workflow-v1";
export const LIBRARY_KEY = "team-os-playbook-library-offense";
export type InstallPlay = { id: string; sourceId: string; revision: number; snapshot: LibraryItem };
export type ScriptRep = { id: string; installId: string; reps: number; scoutLook: string };
export type PracticePeriod = { id: string; title: string; minutes: number; calls: ScriptRep[] };
export type CallSection = { id: string; title: string; calls: { id: string; installId: string; note: string }[] };
export type WeekPlan = { plays: InstallPlay[]; periods: PracticePeriod[]; sections: CallSection[] };
export type Workflow = { version: 1; weeks: Record<string, WeekPlan> };
export const emptyWorkflow = (): Workflow => ({ version: 1, weeks: {} });
export const emptyWeek = (): WeekPlan => ({ plays: [], periods: [], sections: [] });
export const newId = () => crypto.randomUUID();
/** Compare before writing, including undo, so another tab's save is never replaced. */
export function replaceStored(storage: Pick<Storage, "getItem" | "setItem" | "removeItem">, key: string, expected: string | null, replacement: string | null) {
  if (storage.getItem(key) !== expected) throw new Error("Saved data changed in another tab. Review it and try again.");
  if (replacement === null) storage.removeItem(key);
  else storage.setItem(key, replacement);
}
export function weekKey(season: string, week: number) {
  if (!/^\d{4}$/.test(season) || !Number.isInteger(week) || week < 0 || week > 30) throw new Error("Choose a four-digit season and week 0–30.");
  return `${season}:${week}`;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function strings(value: unknown) {
  return isRecord(value) && Object.values(value).every(v => typeof v === "string");
}
export function isLibraryItem(value: unknown): value is LibraryItem {
  if (!isRecord(value)) return false;
  return ["id", "title", "category", "subcategory", "formation", "description", "coaching", "createdAt"].every(k => typeof value[k] === "string")
    && ["play", "formation", "misc"].includes(String(value.type))
    && ["fileKey", "fileName", "contentType", "diagramData"].every(k => value[k] === null || typeof value[k] === "string")
    && (value.revision === undefined || (Number.isInteger(value.revision) && Number(value.revision) >= 1))
    && (value.assignments === undefined || strings(value.assignments))
    && (value.frontAdjustments === undefined || strings(value.frontAdjustments));
}
export function parseLibrary(raw: string | null): LibraryItem[] {
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(isLibraryItem) || new Set(value.map(p => p.id)).size !== value.length) throw new Error("The saved play library could not be read. Its data has been left untouched.");
  return value;
}
function uniqueIds(items: { id: string }[]) { return new Set(items.map(p => p.id)).size === items.length; }
function validWeek(value: unknown): value is WeekPlan {
  if (!isRecord(value) || !Array.isArray(value.plays) || !Array.isArray(value.periods) || !Array.isArray(value.sections)) return false;
  if (!value.plays.every(p => isRecord(p) && typeof p.id === "string" && typeof p.sourceId === "string" && Number.isInteger(p.revision) && Number(p.revision) > 0 && isLibraryItem(p.snapshot))) return false;
  const ids = new Set(value.plays.map(p => p.id));
  if (!uniqueIds(value.plays) || new Set(value.plays.map(p => p.sourceId)).size !== value.plays.length) return false;
  const periods = value.periods.every(p => isRecord(p) && typeof p.id === "string" && typeof p.title === "string" && Number.isInteger(p.minutes) && Number(p.minutes) >= 1 && Number(p.minutes) <= 120 && Array.isArray(p.calls) && uniqueIds(p.calls) && p.calls.every(c => isRecord(c) && typeof c.id === "string" && ids.has(c.installId) && Number.isInteger(c.reps) && Number(c.reps) >= 1 && Number(c.reps) <= 100 && typeof c.scoutLook === "string"));
  const sections = value.sections.every(s => isRecord(s) && typeof s.id === "string" && typeof s.title === "string" && Array.isArray(s.calls) && uniqueIds(s.calls) && s.calls.every(c => isRecord(c) && typeof c.id === "string" && ids.has(c.installId) && typeof c.note === "string"));
  return periods && sections && uniqueIds(value.periods) && uniqueIds(value.sections);
}
export function parseWorkflow(raw: string | null): Workflow {
  if (raw === null) return emptyWorkflow();
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.weeks) || !Object.entries(value.weeks).every(([key, week]) => /^\d{4}:(?:[0-9]|[12][0-9]|30)$/.test(key) && validWeek(week))) throw new Error("The saved weekly workflow could not be read. Its data has been left untouched.");
  return value as Workflow;
}
export function updateAssignments(play: LibraryItem, assignments: Assignments, frontAdjustments: Record<string, string>): LibraryItem {
  return { ...play, revision: (play.revision ?? 1) + 1, assignments: structuredClone(assignments), frontAdjustments: { ...frontAdjustments } };
}
export function installPlay(plan: WeekPlan, play: LibraryItem): WeekPlan {
  if (play.type !== "play" || plan.plays.some(p => p.sourceId === play.id)) return plan;
  return { ...plan, plays: [...plan.plays, { id: newId(), sourceId: play.id, revision: play.revision ?? 1, snapshot: structuredClone(play) }] };
}
/** Removing an installed play also removes its script/call references. Undo restores all. */
export function removeInstalledPlay(plan: WeekPlan, id: string): WeekPlan {
  return { ...plan, plays: plan.plays.filter(p => p.id !== id), periods: plan.periods.map(p => ({ ...p, calls: p.calls.filter(c => c.installId !== id) })), sections: plan.sections.map(s => ({ ...s, calls: s.calls.filter(c => c.installId !== id) })) };
}
export function practiceTotals(plan: WeekPlan) {
  return { minutes: plan.periods.reduce((n, p) => n + p.minutes, 0), reps: plan.periods.reduce((n, p) => n + p.calls.reduce((r, c) => r + c.reps, 0), 0) };
}
export function addRep(plan: WeekPlan, periodId: string, installId: string, reps: number, scoutLook: string): WeekPlan {
  if (!plan.periods.some(p => p.id === periodId)) throw new Error("Choose a practice period.");
  if (!plan.plays.some(p => p.id === installId)) throw new Error("Choose a play in this week's install.");
  if (!Number.isInteger(reps) || reps < 1 || reps > 100) throw new Error("Repetitions must be a whole number from 1 to 100.");
  return { ...plan, periods: plan.periods.map(p => p.id === periodId ? { ...p, calls: [...p.calls, { id: newId(), installId, reps, scoutLook: scoutLook.trim() }] } : p) };
}
export function addCall(plan: WeekPlan, sectionId: string, installId: string, note: string): WeekPlan {
  if (!plan.sections.some(s => s.id === sectionId)) throw new Error("Choose a call-sheet section.");
  if (!plan.plays.some(p => p.id === installId)) throw new Error("Choose a play in this week's install.");
  return { ...plan, sections: plan.sections.map(s => s.id === sectionId ? { ...s, calls: [...s.calls, { id: newId(), installId, note: note.trim() }] } : s) };
}
/** Explicit opt-in sample; never seeds or replaces a user's existing library. */
export function samplePlay(): LibraryItem {
  return { id: "team-os-sample-inside-zone-v1", type: "play", title: "Sample · Inside Zone", category: "Run", subcategory: "Tight Zone", formation: "Doubles", description: "Sample coaching content; adapt to your own system.", coaching: "Identify the front. Communicate combinations before the snap.", fileKey: null, fileName: null, contentType: null, diagramData: null, createdAt: "2026-01-01T00:00:00.000Z", revision: 1,
    assignments: { QB: "Read the called key; carry out the fake.", RB: "Press the aiming point, then make one cut.", X: "Stalk the corner.", Y: "Secure the edge by the call.", Z: "Stalk the corner.", H: "Align and block by the formation call.", LT: "Covered/uncovered rules; communicate the combination.", LG: "Work the declared combination to linebacker.", C: "Declare the point and identify the front.", RG: "Work the declared combination to linebacker.", RT: "Covered/uncovered rules; protect the backside." },
    frontAdjustments: { ODD: "Declare the nose combination; confirm the second-level target.", EVEN: "Identify the shaded tackle and communicate the combination." } };
}
