# Handoff: Team OS Platform

Work only under `platform/`. Do not change football Team OS (`../src/**`) unless asked.

## Saved AD walkthrough

- URL: http://localhost:3001/demo  
- Git tag: `platform-ad-walkthrough-v1`  
- Code: `src/components/demo/*`

## Full product UI (main)

- URL: http://localhost:3001/app  
- Data: `src/lib/data/` — `PlatformRepository` + `MemoryRepository`  
- Org / permissions: `src/lib/data/org.ts` (Cy-Fair chain of command)  
- Swap backend later by implementing the repository interface and changing `getMemoryRepository()` in `AppProvider`.

### Chain of command (controls)

1. District Athletic Director ×2  
2. Associate Athletic Director ×4  
3. District Athletic Coordinator ×2  
4. Athletic Campus Coordinator ×12  
5. Assistant Athletic Campus Coordinator ×12  

Nav, invites, and Legal/Data gates follow this order. Use header **View as** (DAD/AAD) to preview each level.

### Routes

Staff: `/app`, `/app/district`, `/app/campuses`, `/app/permissions`, `/app/teams`, `/app/roster`, `/app/roster/import`, `/app/schedule`, `/app/announcements`, `/app/members`, `/app/seasons`, `/app/legal`, `/app/audit`, `/app/data`, `/app/settings`  
Public: `/fan/[programId]`, `/parent`  
Auth: `/login`, `/signup`, `/onboarding`

### Run

```bash
cd platform && npm install && npm run dev
```

→ http://localhost:3001/app
