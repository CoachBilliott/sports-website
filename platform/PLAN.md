# Platform UI — full product plan (for agents)

Source of truth for work **inside `platform/` only**. Football Team OS at repo root is out of bounds.

## Goal

A clickable UI that demos everything needed to **sell Team OS to school districts** and **run multiple sports on a campus**, including **Fan** and **Parent** surfaces — without touching the existing football app.

## Information architecture

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

## Screens to build / improve

### 1. Overview
- District / campus / active program summary
- Legal checklist progress
- Quick links into Teams, Fan, Parent, Export

### 2. District
- Tree: Cy-Fair ISD → Cypress Creek HS → programs
- SSO card: Connected / Not connected (demo toggle)
- Note: production = Microsoft/Google OIDC later

### 3. Teams (multi-sport)
- List programs; set active; remove (keep ≥1)
- **Add team**: name + sport template + season
- Templates: football (full), volleyball/basketball/soccer/baseball/softball/track/generic (core)
- Preview: units + enabled modules for active template

### 4. Legal
Grouped checklist (session-persisted in PlatformState):
- Legal: entity, DPA, FERPA, PPRA, HIPAA scope
- Security: SSO, encryption, audit, export/delete
- Procurement: cyber insurance, SOC2, VPAT, subprocessors

### 5. Audit
Table: when / who / action / detail  
Log: add/switch program, legal toggles, SSO, export, delete

### 6. Export / Delete
- Export active program JSON download
- Per-program delete/offboard with confirm

### 7. Fan page
- Hero with campus + program
- Schedule + results
- Public roster (#, name, pos, class)
- Copy: directory fields only

### 8. Parent portal
- Linked athlete
- This week’s game
- Announcements
- Eligibility summary (not full gradebook)

## Data

Use `src/lib/programConfig.ts` and `PlatformState` — no dependency on `../src` football AppState.

## Success criteria

- [ ] All nav pages usable in a 5-minute AD demo
- [ ] Add Volleyball → template shows single Team unit (not O/D/ST)
- [ ] Fan/Parent look presentable (not “mock shame”)
- [ ] Football Team OS at `:3000` unchanged
- [ ] `npx tsc --noEmit` clean inside `platform/`
