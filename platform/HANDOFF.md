# Handoff: Team OS Platform (sports-website)

**One document for a new agent.** Work only under `platform/`. Do not change football Team OS (`src/` at repo root) unless the user explicitly asks.

---

## Paste this to start a new Cloud Agent

You are working in **CoachBilliott/sports-website**.

**Scope only:** the standalone Next.js app in `platform/` (http://localhost:3001).

**Do not modify** the football Team OS under `src/` (AppShell, depth charts, schedule, etc.) unless I explicitly ask.

Read and follow this file: `platform/HANDOFF.md` (this document).

## Goal (AD demo)

Show a district buyer, start to finish:

1. **District** — Cy-Fair → Cypress Creek → programs + SSO  
2. **Add teams** — multi-sport templates (football full vs core Team unit)  
3. **Fan site** — public schedule + directory roster only  
4. **Parent site** — linked athlete, announcements, eligibility  
5. **Legal & safety** — field matrix, safety toggles, opt-outs, checklist  

Audit + Export/Delete support the “fully safe” story.

---

## What’s already built

| File | Role |
|------|------|
| `src/lib/programConfig.ts` | Sport templates, legal + safety keys, field matrix, Cy-Fair seed |
| `src/components/PlatformState.tsx` | Session state: programs, legal, safety toggles, opt-outs, audit, SSO |
| `src/components/PlatformShell.tsx` | Full shell + screens |
| `src/app/page.tsx` | Entry |
| `README.md` | How to run |

**Nav:** Overview · District · Add teams · Fan site · Parent site · Legal & safety · Audit · Export/Delete

---

## Product plan (build / polish this UI)

### Information architecture

```
Platform (localhost:3001)
├── Overview          (5-step AD tour)
├── District          (tenancy + SSO demo)
├── Add teams         (multi-sport templates)
├── Fan site          (public)
├── Parent site       (guardian view)
├── Legal & safety    (FERPA matrix + safety controls + checklist)
├── Audit             (event log)
└── Export / Delete   (data portability + offboard demo)
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

### 4. Legal & safety
- Field matrix: Fan / Parent / Staff visibility
- Live safety toggles (minimize Fan fields, block grades/contacts/scout, opt-outs, no PHI)
- Directory opt-out list (hides athletes on Fan)
- Checklist groups: Legal · Security · Procurement  
Not legal advice — demo tracker for counsel + AD conversations.

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
- [x] Switch active program updates Fan/Parent titles **and** schedule/roster data
- [x] Fan/Parent look presentable (brand logo, standings, news, present mode)
- [x] Legal & safety: field matrix, toggles, opt-outs, subprocessors, retention
- [x] Overview live demo script + readiness score + reset
- [x] Audit filters + CSV; Export JSON + offboard certificate
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
