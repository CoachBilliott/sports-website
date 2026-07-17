# Competitive comparison — Team OS vs athletics platforms

Research snapshot for Cy-Fair / multi-campus athletics (2026). Competitors below are the ones districts most often evaluate against a product like Team OS.

## Who we compared

| Product | Focus |
|---------|--------|
| **Hudl** | Film, recruiting highlights, performance video |
| **MaxPreps** | Public schedules, scores, rankings, college exposure |
| **Rank One / FamilyID** | Eligibility, physicals, forms, registration |
| **FinalForms** | Digital athletics paperwork + compliance |
| **SportsEngine / TeamSnap** | Rec/club team ops, scheduling, messaging |
| **DragonFly / Home Campus** | State association eligibility & event ops |
| **BigTeams / Arbiter** | Assigning officials, school athletic admin |
| **Team OS (this product)** | District chain-of-command + coach desk + Fan/Parent + safety |

## What they do differently

### Hudl
- **Strength:** Best-in-class video breakdown, exchange, recruiting packages.
- **Gap vs Team OS:** Not a district org chart / AD control plane. Coach film lives in Hudl; Team OS owns depth, install, grades, attendance, Fan/Parent safety.
- **Implication:** Integrate Hudl links in Resources / Scout — don’t try to replace film.

### MaxPreps
- **Strength:** Public schedule/score authority parents already know.
- **Gap:** Little internal coaching workflow; limited district RBAC.
- **Implication:** Keep MaxPreps URL + sync as a feed into Schedule/Fan (UI ready; sync is next backend).

### Rank One / FinalForms / FamilyID
- **Strength:** Registration, physicals, concussion forms, compliance vaults.
- **Gap:** Weak day-to-day coach desk (depth, call sheets, quizzes).
- **Implication:** Parent “forms & eligibility” in Team OS should deep-link or sync status from FinalForms/Rank One rather than reinvent e-sign.

### TeamSnap / SportsEngine
- **Strength:** Consumer-grade chat, RSVPs, payments for club/rec.
- **Gap:** Not built for UIL/ISD chain of command, Fan directory minimization, or multi-sport program templates.
- **Implication:** Steal UX polish (clear “this week”, mobile parent) — keep school-admin DNA.

### DragonFly / state systems
- **Strength:** Official eligibility source of truth for many states.
- **Gap:** Poor multi-sport coaching UX; not Fan-facing brand sites.
- **Implication:** Treat as upstream compliance; Team OS is the coach/parent experience layer.

### BigTeams / Arbiter-style AD tools
- **Strength:** Officials, events, some scheduling for ADs.
- **Gap:** Rarely includes Offense/Defense unit desks or Fan safety model.
- **Implication:** Overlap on district calendars — differentiate on **coach team OS + public/parent safety**.

## Team OS differentiators (defend these)

1. **Chain of command as product** — DAD → AAD → DAC → Campus Coord → Asst → HC → Coach, with invites only below self.
2. **One staff app + Fan + Parent** with FERPA-minded safety toggles (no grades/contacts on Fan).
3. **Sport templates** — Football units (O/D/ST) vs single-unit sports.
4. **Coach desk** — Depth, scout, practice, call sheet, playbook, quizzes, grades, attendance in one week/unit context.
5. **District AD walkthrough** (`/demo`) separate from production UI (`/app`).

## What to copy from competitors next

| From | Copy |
|------|------|
| TeamSnap | Mobile-first parent “this week” + RSVP |
| Hudl | Resource embeds / deep links from scout |
| MaxPreps | Live score sync into Fan |
| FinalForms | Form completion % on Parent athlete card |
| Rank One | Physical expiration warnings |

## What not to chase

- Building a Hudl video editor
- Replacing state eligibility systems
- Club payment marketplaces (unless Cy-Fair boosters demand it)

## Bottom line

Most competitors own **one slice** (film, forms, public scores, or club chat). Team OS’s bet is the **district operating system**: permissions that match real athletics hierarchy, a coach desk that runs the week, and public/parent surfaces that stay legally safe. Win by integrating the specialists (Hudl, MaxPreps, FinalForms) instead of duplicating them.
