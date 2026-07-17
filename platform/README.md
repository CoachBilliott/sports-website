# Team OS Platform

Full product UI (staff app + Fan + Parent + auth/onboarding).  
In-memory data layer — swap `MemoryRepository` for Supabase/API later.

**Saved AD walkthrough:** `/demo` (git tag `platform-ad-walkthrough-v1`)

## Org model (Cy-Fair chain of command)

1. District Athletic Director (2)  
2. Associate Athletic Director (4)  
3. District Athletic Coordinator (2)  
4. Athletic Campus Coordinator (12)  
5. Assistant Athletic Campus Coordinator (12)  
→ Head Coach → Coach → Parent / Player  

Controls and invites follow this ladder (`src/lib/data/org.ts`).

## Run

```bash
cd platform
npm install
npm run dev
```

- App: http://localhost:3001/app  
- Fan: http://localhost:3001/fan/football  
- Parent: http://localhost:3001/parent  
- Login: http://localhost:3001/login  
- Onboarding: http://localhost:3001/onboarding  
- AD walkthrough (saved): http://localhost:3001/demo  

Seeded DAD: `alex.nguyen.dad@cyfair.isd.demo` (any password). Login also has one-click role chips.

## App routes

| Path | Purpose |
|------|---------|
| `/app` | Home / guided next steps |
| `/app/district` | Org chart (chain of command) |
| `/app/campuses` | 12 campuses + coordinators |
| `/app/permissions` | Controls matrix by role |
| `/app/teams` | Programs CRUD (campus-scoped) |
| `/app/teams/[id]` | Program detail |
| `/app/roster` | Athletes |
| `/app/roster/import` | CSV import |
| `/app/schedule` | Games |
| `/app/announcements` | Staff / parent / public posts |
| `/app/members` | People & invites (below your rank) |
| `/app/seasons` | Season roll UI |
| `/app/legal` | Legal & safety (DAD/AAD) |
| `/app/audit` | Audit log |
| `/app/data` | Export / offboard |
| `/app/settings` | Workspace settings |

## Backend later

Implement `PlatformRepository` (`src/lib/data/repository.ts`) and replace `getMemoryRepository()` in `AppProvider`. Screens already call repository methods through `useApp()`.

Football Team OS (repo root, port 3000) is unchanged.
