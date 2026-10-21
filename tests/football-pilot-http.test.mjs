import test from "node:test";
import assert from "node:assert/strict";

// Opt-in against a local production server; never starts a server or deploys.
const origin = process.env.FOOTBALL_PILOT_URL;
test("football pilot entry hides district promotion and shows placeholders at old demo URLs", { skip: !origin }, async () => {
  const home = await fetch(new URL("/", origin));
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /Cy Creek Football/);
  assert.doesNotMatch(html, /<a\b[^>]*href=["']\/district(?:\/|["'])/i);
  assert.doesNotMatch(html, /<option\b[^>]*>\s*(Volleyball|Basketball|Soccer|Baseball|Softball|Track)\s*<\/option>/i);

  const workout = await fetch(new URL("/workout", origin));
  assert.equal(workout.status, 200);
  assert.doesNotMatch(await workout.text(), /<h1[^>]*>Not released yet<\/h1>/);

  for (const path of ["/district", "/district/", "/district/demo", "/district/demo/", "/district/demo/index.html", "/district/index.html", "/district/login", "/district/app", "/district/app/team/install", "/district/fan/football", "/district/fan/volleyball", "/district/parent", "/district/player", "/district/demo?refresh=1"]) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, path);
    const body = await response.text();
    assert.match(body, /data-product-release="planned"/, path);
    assert.match(body, /<h1[^>]*>Not released yet<\/h1>/, path);
    assert.match(body, /href="\/"/, path);
    assert.match(body, /href="\/workout"/, path);
    assert.doesNotMatch(body, /<option[^>]*>Volleyball<\/option>/, path);
    // A fresh document request models direct-link refresh without relying on client state.
    const refresh = await fetch(new URL(path, origin), { headers: { "cache-control": "no-cache" } });
    assert.match(await refresh.text(), /data-product-release="planned"/, `refresh ${path}`);
  }
});
