# FULL HANDOFF — Team OS / sports-website (for ChatGPT)

Copy everything below this line into ChatGPT when continuing work on this project.

---

## Who / what this is

**Product:** Team OS — high school athletics software, starting with **Cy Creek Cougars football** (Cy-Fair ISD, Houston area).

**Owner / builder:** Coach (user) building a clickable product to demo to the **Athletic Director**, then expand to all sports on campus, parents, fans, and eventually sell to school districts.

**Repo:** https://github.com/CoachBilliott/sports-website  
**Live football app (historical):** https://sports-website-navy.vercel.app  
**Workout board:** https://sports-website-navy.vercel.app/workout  

**Important:** This is currently a **UI mock / session-state app** — no real auth, no production database. Treat student-data / FERPA talk as product direction, not “already compliant.”

---

## Two apps in one repo (do not mix them)

| App | Folder | Port | Purpose |
|-----|--------|------|---------|
| **Football Team OS** | `src/` (repo root Next app) | **3000** | Cy Creek football coach/player ops UI — keep this stable |
| **Platform** | `platform/` (separate Next app) | **3001** | District sales, multi-sport teams, Fan page, Parent portal |

**User preference:** Launch and work on **football only** day-to-day. Build district / multi-sport / fan / parent **in `platform/`**, not by rewriting football menus (Offense/Defense/Special Teams stay as-is in football).

### Run commands

```bash
# Football only
npm install
npm run dev          # http://localhost:3000

# Platform only (optional, separate process)
npm run platform     # or: cd platform && npm install && npm run dev
                     # http://localhost:3001
```

---

## Football Team OS — what it is

Clickable football program shell for IA and roles.

### Stack
- Next.js 16 + React 19 + TypeScript + Tailwind 4
- Client-heavy SPA: `AppProvider` → `AppShell` (in-memory page routing, not Next file routes per screen)
- Seed data in `src/lib/mock.ts`
- APIs: `src/app/api/daily-motivation`, `weekly-quiz`, `maxpreps` (OpenAI optional via `OPENAI_API_KEY`)

### Key files
- `src/components/AppShell.tsx` — main shell, nav, most screens (very large)
- `src/context/AppState.tsx` — global state
- `src/lib/permissions.ts` — role gates (admin / coordinator / coach / player)
- `src/lib/types.ts` — `AppPage`, `Side` = offense | defense | specialTeams
- `src/lib/mock.ts` — roster, schedule, depth, staff seeds
- `src/components/WeeklyQuizzes.tsx`, `playbook/PlaybookTool.tsx`, `StaffRecruiting.tsx`

### Major feature areas (football)
- **Team ▾:** Depth Chart, Offense / Defense / Special Teams units (philosophy, playbook, scout, practice, call sheet, stats, quizzes, grades, resources)
- **Schedule / This Week** — MaxPreps-oriented games
- **My Stuff** — group room, scout notes, quizzes, grades, chat (role-gated)
- **Staff** — attendance, recruiting, inventory, handbook, rosters
- **Controls** — branding, members, teams, program (admin)
- **Roles:** Admin, Coordinator, Coach, Player (+ “View as” demo switcher)
- **Present / workout mode** — `/workout` for depth boards on a screen
- **Print** — depth board print; MYGA-style roster printouts may exist on richer branches (depth print / staff directory / one-page fit) — confirm on the branch you open

### Hard rule for agents working on football
This version of Next has breaking changes — read guides under `node_modules/next/dist/docs/` before writing Next-specific code. See root `AGENTS.md`.

---

## Platform app — what it is (`platform/`)

Separate Next app so district/multi-sport work **does not break** football UI.

### Already built screens
Overview · District · Teams · Legal · Audit · Export/Delete · Fan page · Parent

### Key files
- `platform/src/lib/programConfig.ts` — sport templates, legal checklist, Cy-Fair seed, demo roster/schedule
- `platform/src/components/PlatformState.tsx` — session state
- `platform/src/components/PlatformShell.tsx` — UI shell + all screens
- `platform/HANDOFF.md` — shorter Platform-only agent brief

### Sport templates
- **Football:** Offense / Defense / Special Teams + full modules (depth, scout, playbook, quizzes, print formats…)
- **Other sports** (volleyball, basketball, soccer, baseball, softball, track, generic): single “Team” unit + core modules only

### Seed org
Cy-Fair ISD → Cypress Creek High School → Football 2026 (active)

### Fan vs Parent
- **Fan:** public schedule/results + directory roster (#, name, pos, class) only
- **Parent:** linked athlete, this week’s game, announcements, eligibility summary — not staff tools

---

## Product / business context (for AD & district sales)

### Near-term demo path (football)
1. Stay Admin — not Present mode  
2. Schedule → expand a week  
3. Team → Depth Chart → move a player  
4. Print outs if available on branch  
5. Keep football looking polished (no “UI mock only” shame copy if still present)

### Bigger product vision
1. **Campus athletics OS** — all sports on one campus  
2. **Parent portal** + **Fan/public site**  
3. Sell to districts (Cy-Fair first)

### Pricing ballpark discussed (not final)
- Full campus + parent + fan: roughly **$10k–$30k / school / year**  
- Credible Cy Creek-style target discussed: ~**$12k–$20k / year** once production-ready  
- District-wide (all HS campuses): often **six figures** with volume discount  
- Prefer **per campus / year**, not per-athlete nickel-and-diming  

### Architecture direction (not fully built)
- Multi-tenant: District → Campus → Program  
- Real SSO (Microsoft/Google), audit logs, export/delete  
- Sport **config packs** (general platform + football-deep modules) — **do not** fork a new codebase per sport  
- Fan page = public publish of approved fields only; ops app stays private  

### Compliance (direction, not done)
- **FERPA** is primary for school athletics ops  
- **PPRA** if surveys/marketing of student data  
- **HIPAA** usually **not** for school-run athletics records (keep clinical PHI out unless counsel says otherwise)  
- Need: DPA with district, real auth, encryption, audit, retention/deletion, insurance, often SOC2/VPAT later  
- Current apps are **session demos** — not legally “FERPA compliant” yet  

### Explicit user decisions
- Keep **football UI as-is**; do **not** replace O/D/ST with multi-sport nav inside football  
- Build district / multi-sport / fan / parent in **`platform/`** (or a new agent scoped only there)  
- User may run **only football** locally and work Platform “on the backside” later  

---

## Git / branches (as of last Platform work)

- Repo may show branch like `cursor/district-fan-multisport-64b7` with Platform commits  
- `master` may also have related Platform/district work — **always `git status` / `git log` and check which branch you’re on** before editing  
- Prefer feature branches: `cursor/<name>-****` pattern when using Cursor Cloud Agents  

PR example from Platform work: https://github.com/CoachBilliott/sports-website/pull/2 (draft; may be outdated)

---

## What ChatGPT should do when helping

### If the user says they’re working on **football**
- Only touch `src/`, root Next app, port 3000  
- Preserve Offense/Defense/Special Teams IA  
- Prefer polish, bugs, print, depth, schedule, roles — not ripping in multi-sport  

### If the user says they’re working on **district / fan / parent / multi-sport**
- Only touch `platform/`  
- Follow `platform/HANDOFF.md`  
- Do not merge Platform into `AppShell`  

### Always
- Ask which app/port if unclear  
- Don’t invent that SSO/DB/compliance are already production  
- Prefer concrete file paths and small diffs  

---

## Suggested next work (pick lane)

**Football lane**
- Demo polish for AD (footer copy, print reliability, dead buttons)  
- Keep present mode / workout solid  

**Platform lane**
- Richer Fan landing  
- Overview diagram District → Campus → Program  
- Legal progress % + “Cy-Fair pilot leftovers”  
- Teams module chips; Parent child selector  
- Keep session-only honesty  

**Production lane (later)**
- Postgres tenancy, SSO, real audit, export/delete, DPA with Cy-Fair  

---

## One-sentence summary for ChatGPT

**Team OS is a Cy Creek football ops UI mock in `src/` (port 3000) plus a separate `platform/` app (port 3001) for district/multi-sport/Fan/Parent demos; keep those lanes separate, don’t break football O/D/ST, and treat compliance/SSO as future work.**
