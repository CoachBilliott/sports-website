import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Run the real pure TypeScript domain module with the already-locked compiler.
const source = await readFile(new URL("../src/lib/offense-workflow.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const m = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const period = () => ({ id: "team", title: "Team", minutes: 10, calls: [] });
const section = () => ({ id: "openers", title: "Openers", calls: [] });

test("one stable play flows through assignments, install, practice and call sheet without retyping", () => {
  const play = m.updateAssignments(m.samplePlay(), { C: "Declare the point" }, { ODD: "Nose combination" });
  let week = m.installPlay(m.emptyWeek(), play);
  week = { ...week, periods: [period()], sections: [section()] };
  const id = week.plays[0].id;
  week = m.addRep(week, "team", id, 4, "ODD");
  week = m.addCall(week, "openers", id, "Wristband 12");
  assert.equal(week.periods[0].calls[0].installId, id);
  assert.equal(week.sections[0].calls[0].installId, id);
  assert.equal(week.plays[0].sourceId, play.id);
  assert.equal(week.plays[0].snapshot.assignments.C, "Declare the point");
  assert.deepEqual(m.practiceTotals(week), { reps: 4, minutes: 10 });
  const saved = { version: 1, weeks: { [m.weekKey("2026", 8)]: week } };
  assert.deepEqual(m.parseWorkflow(JSON.stringify(saved)), saved);
});
test("legacy library gains optional assignments without losing diagram or attachment fields", () => {
  const old = { ...m.samplePlay(), id: "legacy", diagramData: '{"marks":[1]}', fileKey: "data:application/pdf;base64,AA==", fileName: "card.pdf", contentType: "application/pdf" };
  delete old.assignments; delete old.frontAdjustments; delete old.revision;
  const [read] = m.parseLibrary(JSON.stringify([old]));
  const next = m.updateAssignments(read, { QB: "Read key" }, { EVEN: "Check shade" });
  assert.equal(next.id, old.id); assert.equal(next.revision, 2);
  assert.equal(next.diagramData, old.diagramData); assert.equal(next.fileKey, old.fileKey);
  assert.equal(next.fileName, old.fileName); assert.equal(next.contentType, old.contentType);
  assert.equal(read.revision, undefined);
});
test("saved install is isolated from later edits and source deletion", () => {
  const source = m.samplePlay(); const plan = m.installPlay(m.emptyWeek(), source);
  source.assignments.C = "Changed later"; source.frontAdjustments.ODD = "Changed later";
  assert.notEqual(plan.plays[0].snapshot.assignments.C, source.assignments.C);
  assert.notEqual(plan.plays[0].snapshot.frontAdjustments.ODD, source.frontAdjustments.ODD);
  assert.equal(plan.plays[0].revision, 1);
  assert.equal(m.parseWorkflow(JSON.stringify({ version: 1, weeks: { "2026:1": plan } })).weeks["2026:1"].plays.length, 1);
});
test("install duplicate is prevented; practice intentionally supports repeated plays", () => {
  const play = m.samplePlay(); let plan = m.installPlay(m.emptyWeek(), play);
  assert.equal(m.installPlay(plan, play), plan);
  assert.equal(m.installPlay(plan, { ...play, revision: 2 }), plan);
  assert.equal(m.installPlay(plan, { ...play, id: "formation", type: "formation" }), plan);
  plan = { ...plan, periods: [period()] };
  plan = m.addRep(plan, "team", plan.plays[0].id, 3, "ODD");
  plan = m.addRep(plan, "team", plan.plays[0].id, 2, "EVEN");
  assert.equal(m.practiceTotals(plan).reps, 5);
  assert.notEqual(plan.periods[0].calls[0].id, plan.periods[0].calls[1].id);
});
test("remove cascades references; serialized undo restores the complete plan", () => {
  let plan = m.installPlay(m.emptyWeek(), m.samplePlay());
  plan = { ...plan, periods: [period()], sections: [section()] };
  plan = m.addRep(plan, "team", plan.plays[0].id, 6, "ODD");
  plan = m.addCall(plan, "openers", plan.plays[0].id, "12");
  const before = JSON.stringify(plan);
  const removed = m.removeInstalledPlay(plan, plan.plays[0].id);
  assert.equal(removed.plays.length, 0); assert.equal(removed.periods[0].calls.length, 0); assert.equal(removed.sections[0].calls.length, 0);
  assert.deepEqual(JSON.parse(before), plan);
});
test("season and week boundaries are separate, including preseason", () => {
  const keys = [m.weekKey("2025", 30), m.weekKey("2026", 0), m.weekKey("2026", 1), m.weekKey("2027", 1)];
  assert.equal(new Set(keys).size, 4);
  for (const bad of [-1, 31, 1.5, NaN]) assert.throws(() => m.weekKey("2026", bad));
  assert.throws(() => m.weekKey("bad", 1));
  const state = { version: 1, weeks: Object.fromEntries(keys.map(key => [key, m.emptyWeek()])) };
  state.weeks["2026:1"] = m.installPlay(state.weeks["2026:1"], m.samplePlay());
  const reload = m.parseWorkflow(JSON.stringify(state));
  assert.equal(reload.weeks["2027:1"].plays.length, 0); assert.equal(reload.weeks["2026:1"].plays.length, 1);
});
test("empty and corrupt storage are distinguished; unknown versions fail closed", () => {
  assert.deepEqual(m.parseLibrary(null), []); assert.deepEqual(m.parseWorkflow(null), m.emptyWorkflow());
  for (const raw of ["{broken", "null", '{"version":2,"weeks":{}}', '{"version":1,"weeks":{"2026:31":{}}}']) assert.throws(() => m.parseWorkflow(raw));
  assert.throws(() => m.parseLibrary('[{"id":"partial"}]'));
  assert.throws(() => m.parseLibrary(JSON.stringify([m.samplePlay(), m.samplePlay()])));
});
test("dangling or malformed script references cannot load", () => {
  const plan = m.emptyWeek(); plan.periods = [{ ...period(), calls: [{ id: "bad", installId: "missing", reps: 4, scoutLook: "ODD" }] }];
  assert.throws(() => m.parseWorkflow(JSON.stringify({ version: 1, weeks: { "2026:1": plan } })));
});
test("invalid repetition counts and uninstalled plays are rejected", () => {
  const plan = { ...m.installPlay(m.emptyWeek(), m.samplePlay()), periods: [period()], sections: [section()] };
  for (const n of [0, -1, 101, 1.5, NaN]) assert.throws(() => m.addRep(plan, "team", plan.plays[0].id, n, "ODD"));
  assert.throws(() => m.addRep(plan, "team", "missing", 4, "ODD"));
  assert.throws(() => m.addCall(plan, "openers", "missing", ""));
  assert.throws(() => m.addRep(plan, "missing", plan.plays[0].id, 4, "ODD"));
  assert.throws(() => m.addCall(plan, "missing", plan.plays[0].id, ""));
});
test("storage save/reload/undo and concurrent changes protect existing work", () => {
  const data = new Map(); const storage = { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
  const saved = JSON.stringify({ version: 1, weeks: { "2026:8": m.installPlay(m.emptyWeek(), m.samplePlay()) } });
  m.replaceStored(storage, m.WORKFLOW_KEY, null, saved);
  assert.equal(m.parseWorkflow(storage.getItem(m.WORKFLOW_KEY)).weeks["2026:8"].plays.length, 1);
  assert.throws(() => m.replaceStored(storage, m.WORKFLOW_KEY, null, "stale write"));
  assert.equal(storage.getItem(m.WORKFLOW_KEY), saved);
  m.replaceStored(storage, m.WORKFLOW_KEY, saved, null);
  assert.equal(storage.getItem(m.WORKFLOW_KEY), null);
  const failing = { ...storage, setItem: () => { throw new Error("QuotaExceededError"); } };
  assert.throws(() => m.replaceStored(failing, m.WORKFLOW_KEY, null, saved));
  assert.equal(storage.getItem(m.WORKFLOW_KEY), null);
});
