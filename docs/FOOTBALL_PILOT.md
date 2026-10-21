# Football first; later sports released deliberately

One website can grow into a broader sports product. The initial entry experience
promotes football only. No final umbrella brand has been selected or applied.

`src/lib/product-release.ts` is the explicit promotion policy. Football is in
`pilot`; every other known sport and the district surface are `planned`. The
football footer consumes that policy and does not advertise the unreleased
Platform link. The default app, workout board and offense workflow remain football.

This is release presentation, not authorization or production security. Changing a
stage does not provide authentication, protect private data, filter stored data,
or qualify a sport for real student data. No backend/account/security work is included.

## District entry boundary during the football pilot

The initial pilot intentionally shows **Not released yet** at all `/district`
entry points, including trailing-slash paths, nested staff/Fan/Parent/Player paths,
and direct static-export `index.html` URLs. The original browser address remains
in place; refreshing it shows the same placeholder. The page links back to Football
and the workout board. It does not erase browser storage or run district demo state.

The existing middleware first checks the district surface stage. While `planned`,
it rewrites `/district` requests to the root `/not-released` page. District static
asset requests also receive the placeholder while planned; this is not a data
security guarantee. Root assets used by the placeholder remain available.

The district source, modules, seed records, sport selectors, existing static-export
rewrite logic, `vercel.json`, and build/copy pipeline are preserved. To deliberately
release district later, change `PRODUCT_RELEASE.surfaces.district` from `planned`
to `pilot` or `released`, validate its acceptance scope, and rebuild/review/deploy.
The placeholder check then yields to the original routing and its promotion link
returns. Other sport stages still require their own deliberate decisions.

This changes historical public district links to a release notice after deployment;
it is not an access-control system or a promise that exported data is private.
Existing standalone Sites remain separate and unchanged. No deployment is included.

## First football pilot acceptance

Use sample coaching content only. Before promoting a pilot, verify:

1. `/` opens Football Team OS and `/workout` renders. Football navigation exposes
   offense, defense and special teams; no district/multi-sport promotion link appears.
2. Save a play in the existing designer; add assignments/front adjustments; install
   it in one season/week; reuse it in a practice period and call-sheet situation
   without retyping its name. Print the install, practice and call sheet.
3. Reload: local saves persist on this browser/origin. A neighboring week/season
   starts separately. Library edits do not alter saved install revisions.
4. Duplicate/order/remove/undo sample periods and calls; confirm install removal
   clears its dependent rows and undo restores them. Empty/error states are usable.
5. Existing diagrams, attachment fields, weekly attachment screens and archive/import
   paths remain available. Browser-local/demo limits are visible to the coach.
6. Both production builds pass. Direct `/district`, demo/login/staff/Fan/Parent/Player
   and static HTML entry URLs show **Not released yet**, including refresh. Their
   Football and workout links work. Root football/workout flows remain available.
7. Confirm future-release tests restore the original district routing decision and
   that district export files still exist. Production auth, persistence and
   student-data readiness need a separate milestone.

## Later sport release

Keep code/data in place while planned. For each sport, agree its pilot scope,
validate its sport-specific workflows and data/privacy requirements, choose its
public entry surface, then update its stage and promotion links deliberately.
Changing a sport stage alone does not automatically add a navigation link or release
the district app. No infrastructure or domain split is required by this policy.

Run release tests with `node --test tests/product-release.test.mjs`; run them with
the offense domain suite using `node --test tests/*.test.mjs` in a POSIX shell (or
list both test files explicitly in PowerShell).

For production HTTP acceptance, start the built root app on localhost and run
`tests/football-pilot-http.test.mjs` with `FOOTBALL_PILOT_URL` set to that origin.
It checks that the football entry has no district link/other-sport selector, while
historical direct district/Fan/HTML URLs return the release notice on first request
and refresh; football/workout stay available. Without the environment
variable this opt-in test skips; it never starts a server or deploys a site.
The local district export must already be built/copied: the check reads its real
script reference and verifies district JS/logo/RSC-style paths show the notice,
while root football CSS/JS/logo remain available and adjacent `/district-other`
does not accidentally receive the notice.
