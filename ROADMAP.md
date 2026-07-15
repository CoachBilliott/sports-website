# Team OS — Product roadmap

Clickable UI mock first. Real multi-team product second.  
Current live demo: https://sports-website-navy.vercel.app

---

## Now — finish the UI

Keep iterating on IA, roles, screens, and season UX in the mock. No backend required yet.

**Already in good shape (mock):** role switcher, program shell, depth charts / workout board, seasons + archive browse + roll + import-from-archive, quizzes, MaxPreps schedule **pull**, grades, admin branding/members surfaces.

**Still UI work:** polish flows coaches will live in daily before we freeze them behind real data.

---

## Next — demo + real app foundation

### 1. Create a demo

Ship a polished, shareable demo path (not just “play with the mock”):

- Fixed demo program (Cy Creek or fictional) with clean sample season data
- Role presets staff can click through (Admin / Coordinator / Coach / Player)
- Short script: “show team this at workouts” → `/workout`, depth charts, This Week
- Optional: demo-only banner + reset-to-seed control

**Goal:** sell the vision to coaches/ADs without needing accounts.

### 2. Build the actual app

Turn the mock into a durable product:

| Layer | Plan |
| --- | --- |
| Hosting | Keep Vercel (Hobby → Pro when commercial) |
| Backend | Supabase (or equivalent): auth, Postgres, file storage |
| Tenancy | Multi-tenant `program` / org model (`programId` on all data) |
| Auth | Real logins; replace role switcher with membership roles |
| Persistence | Roster, depth charts, schedule, quizzes, grades, playbook, seasons |
| Uploads | Scout / teach / week assets → object storage |
| Permissions | Keep existing role rules; bind to real users |

**First vertical slice:** auth + one program + roster + depth charts + season roll persisted.

Rough cost at one team: ~$0–50/mo. At 100 teams (multi-tenant, light–moderate media): ~$150–400/mo.

### 3. Set up onboarding

Guided wizard for a new program (reuse existing admin surfaces as steps):

1. Create program (name, logo, colors)
2. Team levels (Varsity / JV / …)
3. Position groups
4. Invite staff
5. **Import roster** (see below)
6. Depth chart schemes
7. Schedule / MaxPreps team URL
8. Start first season (empty; no archive import)

Post-signup: land admin in checklist until core setup is done.

### 4. Roster imports

Make roster setup fast enough for real programs:

- CSV / spreadsheet import (name, class year, number, position group, level)
- Column mapping + validation + dry-run preview
- Merge vs replace options
- Later: optional pull from school SIS / other tools if demand appears

Manual add/edit stays available; import is the primary onboarding path.

---

## Then — MaxPreps stats publish (selling feature)

**Direction today:** Team OS **pulls** schedule/results from MaxPreps.  
**Desired:** Enter stats here → get them onto MaxPreps.

MaxPreps does **not** offer a public write API. Plan:

1. Apply to become a **MaxPreps Stat Import Partner**
2. Build in-app box score / player stats entry (our source of truth)
3. Generate MaxPreps-compatible import files (Hudl-style path)
4. Coach flow: enter in Team OS → download import → publish in MaxPreps Coach Admin  
   **or** auto-sync if MaxPreps grants a deeper partner sync (GameChanger-style)

**Do not:** scrape coach credentials or reverse-engineer unofficial write endpoints.

Positioning: Team OS owns program ops; MaxPreps stays the public stats surface — “enter once, publish to MaxPreps.”

---

## Season rolling (keep strong)

Season archive / roll / selective import already exist in the mock. Carry forward into the real app:

- **Program-scoped (survives roll):** members, roster shell, branding, schemes, playbook/resources, goal templates
- **Season-scoped (archived then reset):** schedule assets, scout, grades, quizzes, attendance, depth placements, field fills
- After roll checklist: promote class years, prune graduated, refresh schedule from that program’s MaxPreps URL
- Soften Cy Creek hardcodes → per-program MaxPreps path + schedule seed

---

## Later — scale to many teams

- One deploy + one multi-tenant backend (not one DB project per school)
- Billing / invites / program admin controls
- Media CDN strategy if scout video grows
- Partner status + marketing for MaxPreps publish

---

## Suggested build order

1. Finish remaining UI polish  
2. **Demo** package for sharing  
3. **Actual app** foundation (auth, `program`, persistence)  
4. **Onboarding** wizard  
5. **Roster imports**  
6. Season roll persisted + post-roll checklist  
7. Stats entry in-app + **MaxPreps partner import/publish**  

---

## Out of scope for now

- Parent / fan public portal (removed from mock)
- Replacing Hudl film room (works alongside Hudl)
- Instant MaxPreps write without partner approval
