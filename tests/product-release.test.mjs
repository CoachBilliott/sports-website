import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/product-release.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const release = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("initial rollout promotes football alone", () => {
  assert.equal(release.PRODUCT_RELEASE.sports.football, "pilot");
  assert.deepEqual(release.releasedSportIds(), ["football"]);
  for (const sport of ["volleyball", "basketball", "soccer", "baseball", "softball", "track", "generic", "unknown", "__proto__"]) {
    assert.equal(release.isSportPromoted(sport), false, sport);
  }
});

test("football entry does not promote unreleased district surfaces", () => {
  assert.equal(release.isSurfacePromoted("football"), true);
  assert.equal(release.isSurfacePromoted("district"), false);
  assert.deepEqual(release.footballProductLinks(), []);
});

test("unrecognized product surfaces cannot be promoted by a missing setting", () => {
  for (const surface of ["unknown", "volleyball", "constructor", "__proto__", ""]) {
    assert.equal(release.isSurfacePromoted(surface), false, surface);
  }
});
