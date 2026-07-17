# Handoff: Team OS Platform (sports-website)

**One document for a new agent.** Work only under `platform/`. Do not change football Team OS (`src/` at repo root) unless the user explicitly asks.

---

## Paste this to start a new Cloud Agent

You are working in **CoachBilliott/sports-website**.

**Scope only:** the standalone Next.js app in `platform/` (http://localhost:3001).

**Do not modify** the football Team OS under `src/` (AppShell, depth charts, schedule, etc.) unless I explicitly ask.

Read and follow this file: `platform/HANDOFF.md` (this document).

**Goal:** Polish and expand the Platform UI for an Athletic Director demo — district/legal readiness, multi-sport “Add team”, Fan page, Parent portal, audit, export/delete.

**Run:**
```bash
cd platform && npm install && npm run dev
```
→ http://localhost:3001

Football app (leave alone): repo root `npm run dev` → http://localhost:3000

Use a branch matching `cursor/<descriptive-name>-64b7`, commit often, push, and open/update a PR against `master`.

---

## What this app is

| | Football Team OS | Platform |
|--|------------------|----------|
| Path | `src/` (repo root) | `platform/` |
| Port | 3000 | 3001 |
| Purpose | Cy Creek football ops UI | District sales + multi-sport + Fan/Parent |
| Rule | **Do not touch** | **Build here** |

Platform is a sibling Next app so the football UI stays exactly as coaches use it today.

---

## What’s already built

| File | Role |
|------|------|
| `src/lib/programConfig.ts` | Sport templates, legal checklist keys, Cy-Fair seed org, demo roster/schedule |
| `src/components/PlatformState.tsx` | Session state: programs, active program, audit, legal checkboxes, SSO demo |
| `src/components/PlatformShell.tsx` | Full shell + screens |
| `src/app/page.tsx` | Entry |
| `README.md` | How to run |

**Nav already wired:** Overview · District · Teams · Legal · Audit · Export/Delete · Fan page · Parent

---

## Product plan (build / polish this UI)

### Information architecture

```
Platform (localhost:3001)
├── Overview
├── District          (tenancy + SSO demo)
├── Teams             (add sport programs / templates)
├── Legal             (FERPA/PPRA/HIPAA scope + procurement checklist)
├── Audit             (event log)
├── Export / Delete   (data portability + offboard demo)
├── Fan page          (public)
└── Parent            (guardian view)
```

### 1. Overview
- District / campus / active program summary cards
- Legal checklist progress
- Quick links: Teams, Fan, Parent, Export

### 2. District
- Tree: **Cy-Fair ISD → Cypress Creek HS → programs**
- SSO card: Connected / Not connected (**demo toggle only**)
- Note in UI: production = Microsoft/Google OIDC later

### 3. Teams (multi-sport)
- List programs; set active; remove (always keep ≥1)
- **Add team:** name + sport template + season
- **Templates:**
  - `football` — full modules (Offense / Defense / Special Teams, depth, scout, playbook, quizzes, print formats…)
  - `volleyball` | `basketball` | `soccer` | `baseball` | `softball` | `track` | `generic` — core only (single “Team” unit, resources/stats/grades/philosophy)
- Preview active template: units + enabled modules

### 4. Legal (district sales readiness)
Session checkboxes in PlatformState, groups:
- **Legal:** entity, DPA, FERPA, PPRA, HIPAA scope
- **Security:** SSO, encryption, audit logging, export/delete
- **Procurement:** cyber insurance, SOC2, VPAT, subprocessors  

Not legal advice — progress tracker for demos + real counsel work.

### 5. Audit
Table: when / who / action / detail  
Log: add/switch program, legal toggles, SSO, export, delete

### 6. Export / Delete
- Export active program as JSON download
- Per-program delete/offboard with confirm (session-only demo)

### 7. Fan page
- Hero: campus + program name
- Schedule + results
- Public roster: #, name, position, class only
- Explicit: **directory fields only** (no grades, contacts, scout)

### 8. Parent portal
- Linked athlete card
- This week’s game
- Announcements
- Eligibility summary (not full gradebook / staff tools)

---

## Design rules

- Colors: `--cc-navy`, `--cc-blue`, `--cc-field`, `--cc-line`, `--cc-steel`
- Display font: Barlow Condensed (`--font-display`)
- Avoid “UI mock only” shame copy; use “demo / session-only” where honest
- One job per section; AD-demo flows must be clickable in ~5 minutes
- Read Next docs under `platform/node_modules/next/dist/docs/` before unfamiliar APIs (see root `AGENTS.md` Next note)

---

## Suggested UI upgrades (priority order)

1. Richer Fan landing (hero, next-game callout, news strip)
2. Overview: visual District → Campus → Program diagram
3. Legal: progress % + “what’s left for Cy-Fair pilot” card
4. Teams: module chips; clearer football vs generic template difference
5. Parent: select child + announcement list polish
6. Optional: “Open football Team OS” always visible in header (already linked)

---

## Out of scope (unless user asks)

- Editing Cy Creek Football Team OS (`../src/**`)
- Real SSO / Postgres / production hard-delete / SOC2 paperwork generation
- Merging Platform into football `AppShell`

---

## Success criteria

- [x] All Platform nav pages usable in a 5-minute AD demo
- [x] Add Volleyball → template shows single **Team** unit (not O/D/ST)
- [x] Switch active program updates Fan/Parent titles
- [x] Fan/Parent look presentable (no mock-shame footer)
- [x] Football app at `:3000` unchanged
- [x] `cd platform && npx tsc --noEmit` clean (verify on each agent run)

---

## Commands cheat sheet

```bash
# Platform only
cd platform && npm install && npm run dev     # :3001

# From repo root
npm run platform

# Football (do not break)
npm run dev                                  # :3000
```
