import test from "node:test";
import assert from "node:assert/strict";

// Opt-in against a local production server; never starts a server or deploys.
const origin = process.env.FOOTBALL_PILOT_URL;
test("football pilot entry hides district promotion and preserves existing direct demos", { skip: !origin }, async () => {
  const home = await fetch(new URL("/", origin));
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /Cy Creek Football/);
  assert.doesNotMatch(html, /<a\b[^>]*href=["']\/district(?:\/|["'])/i);
  assert.doesNotMatch(html, /<option\b[^>]*>\s*(Volleyball|Basketball|Soccer|Baseball|Softball|Track)\s*<\/option>/i);

  for (const path of ["/workout", "/district/demo", "/district/login", "/district/fan/football", "/district/fan/volleyball", "/district/parent"]) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, `${path} must remain available under the preserved direct-link policy`);
    await response.body?.cancel();
  }
});
