# Team OS — Full Handoff for ChatGPT / Codex / Cursor

**Paste this entire file** into a new ChatGPT, Codex, or Cursor agent chat. It is the source of truth for continuing work.

**Last updated:** 2026-09-23  
**Repo:** https://github.com/CoachBilliott/sports-website  
**Live site:** https://sports-website-navy.vercel.app  

---

## 0. Who you are helping

Owner is building **Team OS** for Cy-Fair ISD / Cypress Creek athletics:

1. **Football Team OS** — coach desk for Cy Creek football (depth, scout, workouts, etc.)
2. **Platform** — district multi-sport product: DAD → Fan (org chart, Fan site, Parent site, legal/safety, HC desk)

Goal: demo-ready UI now; real backend (auth/DB) later. No local AI required.

---

## 1. Hard rules (do not violate)

1. **Two apps in one repo.** Prefer changing only the app the user asked about.
   | App | Path | Local port | Live URL |
   |-----|------|------------|----------|
   | Football Team OS | `src/` (repo root Next app) | 3000 | https://sports-website-navy.vercel.app/ |
   | Platform (district) | `platform/` | 3001 | https://sports-website-navy.vercel.app/district/… |

2. If the task is **district / multi-sport / Fan / Parent / legal / AD sales demo** → work **only** under `platform/` unless deploy wiring at repo root is required.

3. **This is Next.js 16** with breaking changes vs older Next. Before writing Next APIs, read guides under:
   - Root app: `node_modules/next/dist/docs/` (after `npm install` at root)
   - Platform: `platform/node_modules/next/dist/docs/`
   Heed deprecation notices. Do not invent old App Router patterns from memory.

4. **No real backend yet.** Data is in-memory (`MemoryRepository`). Do not pretend FERPA/HIPAA is “done” — UI + safety toggles only. Be honest in copy: local/demo until backend.

5. **Design (especially Platform / branded surfaces):**
   - Cy Creek navy/blue visual language; Barlow Condensed display + Source Sans body (already wired).
   - Avoid AI-default looks: purple gradients, cream+terracotta+serif, broadsheet newspaper layouts, glow pills, emoji clutter.
   - Landing/promotional surfaces: brand-first, one composition in first viewport, full-bleed hero when applicable; no card spam in heroes.
   - Prefer existing UI primitives in `platform/src/components/ui.tsx` and football components.

6. **Do not break the public `/district` embed** when changing Platform build:
   - Platform uses `output: "export"` (static).
   - Production sets `NEXT_PUBLIC_BASE_PATH=/district`.
   - Root `npm run build` copies `platform/out` → `public/district/`.
   - Root `src/middleware.ts` rewrites `/district/...` → `.../index.html`.
   - Public asset URLs must go through `asset()` in `platform/src/lib/asset.ts`.

---

## 2. Live URLs (send these to humans)

### Football Team OS
- App: https://sports-website-navy.vercel.app/
- Workout board: https://sports-website-navy.vercel.app/workout

### Platform (district demo)
- AD walkthrough: https://sports-website-navy.vercel.app/district/demo
- Login (role chips): https://sports-website-navy.vercel.app/district/login
- Staff app: https://sports-website-navy.vercel.app/district/app
- Fan: https://sports-website-navy.vercel.app/district/fan/football
- Parent: https://sports-website-navy.vercel.app/district/parent
- Player: https://sports-website-navy.vercel.app/district/player

**Note:** Trailing slashes are fine (`/district/demo/`). Vercel Preview URLs may show a Vercel login wall; **production** (`sports-website-navy`) is the share link.

---

## 3. How to run locally

```bash
# Football Team OS
npm install
npm run dev          # http://localhost:3000

# Platform only
npm run platform     # or: cd platform && npm install && npm run dev
                     # http://localhost:3001  (NO /district prefix locally)

# Production-like (embeds platform under /district)
npm run build && npm start   # http://localhost:3000/district/demo
```

Platform local = no `basePath`. Production embed = `NEXT_PUBLIC_BASE_PATH=/district`.

---

## 4. Deploy model (important)

- Hosting: **Vercel** project `sports-website` → https://sports-website-navy.vercel.app  
- GitHub: `CoachBilliott/sports-website` (default branch `master`)
- Root `package.json` `build` script:
  1. Builds Platform static export with `NEXT_PUBLIC_BASE_PATH=/district`
  2. Copies to `public/district/`
  3. Builds football Next app
- `vercel.json` has rewrites for `/district` → `index.html` paths
- `src/middleware.ts` does the same rewrite for `next start` / Vercel Node

**Do not** change Vercel Root Directory to `platform/` without creating a *second* Vercel project — that would replace the football site.

`public/district/` is gitignored; it is produced at build time.

---

## 5. Platform product model

### Chain of command (rank 1 = highest)

| Rank | Role | Seed headcount |
|------|------|----------------|
| 1 | District Athletic Director (DAD) | 2 |
| 2 | Associate Athletic Director (AAD) | 4 |
| 3 | District Athletic Coordinator (DAC) | 2 |
| 4 | Athletic Campus Coordinator | 12 |
| 5 | Assistant Athletic Campus Coordinator | 12 |
| 6 | Head Coach | per program |
| 7 | Coach | per program |
| 8 | Parent | |
| 9 | Player | |

Source of truth: `platform/src/lib/data/org.ts` (`ROLE_RANK`, permissions, `canInvite`).

**Rule:** invites / controls only **below** your rank. Legal/Data/SSO gated to DAD/AAD-level perms.

### Two Platform UIs

| Surface | Path | Purpose |
|---------|------|---------|
| AD sales walkthrough | `/demo` | Pillar tour (District → Teams → Fan → Parent → Legal). Tag: `platform-ad-walkthrough-v1`. Code: `platform/src/components/demo/*` |
| Full product | `/app`, `/fan`, `/parent`, `/player`, `/login` | Interactive staff + portals |

Keep `/demo` working for AD pitches. Do not delete it.

### Seed logins (any password)

- DAD: `alex.nguyen.dad@cyfair.isd.demo`
- HC football: `cbilliott@cyfair.isd.demo`
- Parent: `parent@demo.local`
- Or use **role chips** on `/login`

---

## 6. Platform routes (complete)

### Auth / entry
- `/` → client redirect to `/app`
- `/login`, `/signup`, `/onboarding`
- `/demo` — AD walkthrough

### Staff (`/app/*`) — gated by `RequirePerm` + role
- `/app` — home / next steps
- `/app/district` — org chart
- `/app/campuses` — 12 campuses
- `/app/permissions` — controls matrix
- `/app/teams`, `/app/teams/[id]`
- `/app/roster`, `/app/roster/import`
- `/app/schedule`
- `/app/announcements`
- `/app/members`
- `/app/seasons` — season roll (UI)
- `/app/legal` — legal checklist + safety toggles
- `/app/audit`
- `/app/data` — export / delete
- `/app/settings` — district name, SSO stub, logo

### Head coach desk (`/app/team/*`)
- `/app/team` — this week
- `/app/team/depth`, `scout`, `practice`, `call-sheet`, `playbook`
- `/app/team/quizzes`, `grades`, `stats`, `resources`
- `/app/team/philosophy`, `install`, `study`, `attendance`, `staff`

### Public / family
- `/fan/[programId]` — e.g. `football`, `volleyball` (static params for export)
- `/parent`, `/player`

---

## 7. Data layer (how to add a real backend later)

```
platform/src/lib/data/
  types.ts          — domain types
  org.ts            — ranks + permissions
  repository.ts     — PlatformRepository interface
  memory.ts         — in-memory implementation
  seed.ts           — district/programs/members seed
  teamSeed.ts       — HC desk seed
  seasonCopy.ts     — season roll helpers
  importSample.ts   — roster CSV sample
```

**Wire-up:** `platform/src/components/app/AppProvider.tsx` calls `getMemoryRepository()`.

**To add Supabase/API later:**
1. Implement `PlatformRepository` against real DB.
2. Swap `getMemoryRepository()` for the new factory.
3. Keep screens talking only through `useApp()` — do not scatter fetches.

No API routes in Platform today (static export). Backend will be a separate service or a non-exported Next deploy.

---

## 8. Key files map

### Platform
| File | Role |
|------|------|
| `platform/src/components/app/AppProvider.tsx` | Session, snapshot, all mutations |
| `platform/src/components/app/AppShell.tsx` | Staff chrome + nav |
| `platform/src/components/app/TeamShell.tsx` | HC desk chrome |
| `platform/src/components/app/RequirePerm.tsx` | Permission gate |
| `platform/src/components/ui.tsx` | Buttons, panels, badges |
| `platform/src/lib/programConfig.ts` | Sport templates / modules |
| `platform/src/lib/demoContent.ts` | Rosters, schedules, Fan news, logos |
| `platform/src/lib/asset.ts` | Prefix public URLs with basePath |
| `platform/src/components/demo/*` | `/demo` AD walkthrough |
| `platform/next.config.ts` | Static export + optional basePath |
| `platform/COMPETITIVE.md` | Competitor notes (Hudl, MaxPreps, etc.) |

### Football (root)
| File | Role |
|------|------|
| `src/` | Football Team OS App Router |
| `src/middleware.ts` | `/district` static HTML rewrites |
| `package.json` | `build` / `build:platform` / `platform` scripts |
| `vercel.json` | District rewrites for Vercel |
| `AGENTS.md` | Short agent rules |

---

## 9. What is already done

- Full interactive Platform UI for DAD → Fan (in-memory)
- Cy-Fair chain of command + permission matrix
- HC team workspace modules
- Fan public site + Parent + Player portals
- Login role chips, signup/onboarding stubs
- Legal checklist + safety toggles (UI)
- Season roll UI, roster import UI, settings/SSO/logo stubs
- AD walkthrough at `/demo`
- Competitive write-up
- **Public shareable deploy** at `/district` on Vercel
- Football Team OS still live at `/`

---

## 10. What is NOT done (likely next work)

Prioritize based on user ask; default roadmap:

1. **Real backend** — Auth (SSO later), Postgres/Supabase, replace `MemoryRepository`
2. **Persistence** — roster/schedule/announcements survive refresh
3. **Integrations** — MaxPreps sync, Hudl deep links, FinalForms/Rank One status (see `COMPETITIVE.md`)
4. **Mobile polish** — Parent “this week” / RSVP (TeamSnap-class UX)
5. **File uploads** — logos, PDFs, playbook assets (not static `public/docs` only)
6. **Separate Platform Vercel project** (optional) if `/district` embed becomes limiting (static export can’t do server APIs)
7. **Tests / Playwright** — smoke for `/district/demo`, login chips, Fan safety fields hidden
8. **Do not build** Hudl video editor, state eligibility system, or club payment marketplace unless asked

---

## 11. Design / copy tone

- Cy-Fair / Cypress Creek Cougars; navy + blue
- Honest: “demo / local until backend”
- District AD language for `/demo`; coach ops language for `/app/team`
- Safety: Fan must not show grades, private contacts, or scout when toggles say so (`safety` keys in snapshot)

---

## 12. Git / branch hygiene

- Default branch: `master` (production Vercel)
- Feature branches historically: `cursor/...`
- After Platform+share work merged: production includes `/district`
- Prefer small commits; don’t rewrite football unless asked
- Never commit secrets; no `.env` with keys

---

## 13. Commands cheat sheet

```bash
# Platform dev
cd platform && npm install && npm run dev

# Football dev
npm install && npm run dev

# Full production build (both)
npm run build

# Lint platform
cd platform && npm run lint
```

---

## 14. How to start a new agent session

Copy this prompt (plus this file):

> You are continuing Team OS for Cy-Fair. Read `HANDOFF.md` (this file) fully.  
> Work under `platform/` unless I ask about football Team OS or deploy.  
> Next.js 16 — check `platform/node_modules/next/dist/docs/` before new Next APIs.  
> Keep `/demo` and `/district` production embed working.  
> My next task is: **[USER FILLS IN]**

---

## 15. Quick verification checklist

After changes:

- [ ] `cd platform && npm run build` succeeds (static export)
- [ ] With `NEXT_PUBLIC_BASE_PATH=/district`, asset URLs include `/district/...`
- [ ] Root `npm run build` succeeds
- [ ] `/district/demo`, `/district/login`, `/district/fan/football` load
- [ ] Football `/` still loads
- [ ] Login role chips still navigate to the right home (DAD→`/app`, HC→`/app/team`, Parent→`/parent`)

---

## 16. Contact / product context

- Demo district: **Cy-Fair ISD**, campus **Cypress Creek**
- Seed sports: Football + Volleyball
- Owner email on cloud agents historically: `dbilliott98@gmail.com`
- Product bet: **district operating system** (chain of command + coach desk + safe Fan/Parent), integrate Hudl/MaxPreps/FinalForms rather than replace them

---

*End of handoff. If anything in the repo contradicts this file, prefer the code — then update this handoff.*
