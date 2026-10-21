# Football first; later sports released deliberately

One website can grow into a broader sports product. The initial entry experience
promotes football only. No final umbrella brand has been selected or applied.

`src/lib/product-release.ts` is the explicit promotion policy. Football is in
`pilot`; every other known sport and the district surface are `planned`. The
football footer consumes that policy and does not advertise the unreleased
Platform link. The default app, workout board and offense workflow remain football.

This is release visibility, not authorization or production security. Changing a
stage does not provide authentication, protect routes, filter data, or qualify a
sport for real student data. No backend/account/security work is included.

## Existing district boundary needs an owner decision

The public `/district/demo`, login, staff, Fan, Parent and Player paths existed
before the pilot. Their routes, modules, seed records, sport selectors, and export
wiring remain intact. Direct links still work, including unreleased sport demos.

Before public pilot launch, explicitly choose:

- Keep those historical demos reachable by direct link, while the football entry
  does not advertise them. Existing AD/demo links continue to work, but anyone with
  a link can still reach multi-sport previews.
- Show an unreleased-feature page on district routes until a later release.
  This provides a stricter public product boundary but changes existing demo links.
  It still would not be real authorization, and needs separate route/static-asset
  design rather than simply hiding navigation.

No choice has been made in this change; direct behavior is preserved. A strict
football-only public route boundary must not be claimed until it is selected,
implemented and verified. Existing standalone Sites are separate and unchanged.

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
6. Both production builds pass. `/district` wiring and historical demo routes still
   work under the current direct-link policy; this is regression coverage, not a
   declaration that district or other sports are released.
7. Decide and document the direct district boundary above before broader promotion.
   Production auth, persistence and student-data readiness need a separate milestone.

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
historical direct district/Fan routes still return 200. Without the environment
variable this opt-in test skips; it never starts a server or deploys a site.
