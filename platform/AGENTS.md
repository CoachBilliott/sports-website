# Platform app — agent instructions

This folder is a **standalone Next.js app** for district sales / multi-sport / Fan / Parent.

**Do not modify** the football Team OS at the repo root (`../src/`, `../src/components/AppShell.tsx`, etc.) unless the user explicitly asks. Football UI must stay as-is.

## Run

```bash
cd platform
npm install
npm run dev    # http://localhost:3001
```

From repo root: `npm run platform`

Football app (separate): `npm run dev` → http://localhost:3000

## What already exists

- `src/lib/programConfig.ts` — sport templates, legal checklist keys, demo roster/schedule, Cy-Fair seed org
- `src/components/PlatformState.tsx` — session state (programs, audit, legal checkboxes)
- `src/components/PlatformShell.tsx` — Overview, District, Teams, Legal, Audit, Export/Delete, Fan, Parent

## Mission (build / polish the UI here)

Implement and refine the **district-ready product shell** entirely under `platform/`:

1. **District / legal readiness**
   - Tenancy: District → Campus → Programs
   - SSO status (demo only until real OIDC)
   - FERPA / PPRA / HIPAA-scope checklist, procurement (DPA, insurance, SOC2, VPAT)
   - Audit log + export / delete demos

2. **Multi-sport teams**
   - Add teams via sport templates
   - Football template = full modules (O/D/ST, depth, scout, print…)
   - Other sports = core (Team unit, resources, stats, grades…) until deepened
   - Active program switcher; preview of units/modules

3. **Fan page**
   - Public-style: schedule, results, directory roster only
   - No grades, contacts, scout, or staff tools

4. **Parent portal**
   - Linked athlete card, this-week game, announcements, eligibility summary
   - Not full coach/admin UI

## Out of scope for this app (unless asked)

- Changing Cy Creek Football Team OS screens/nav
- Real SSO, Postgres, production hard-delete
- Merging Platform into the football `AppShell`

## Design notes

- Match Cy Creek tokens: `--cc-navy`, `--cc-blue`, `--cc-field`, display font Barlow Condensed
- Avoid “UI mock only” shame copy; say “demo / session-only” where needed
- One job per section; keep AD-demo flows clickable and clear

## Suggested next UI upgrades

- Richer Fan landing (hero, next game, news strip)
- Parent “select child” + announcement composer stub
- Programs: show module chips, disable football-only pages for generic sports
- Legal: progress % + “what’s left for Cy-Fair pilot” summary card
- Overview: diagram District → Campus → Program
