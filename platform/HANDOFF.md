# Handoff: Team OS Platform

Work only under `platform/`. Do not change football Team OS (`../src/**`) unless asked.

## Saved AD walkthrough

- URL: http://localhost:3001/demo  
- Git tag: `platform-ad-walkthrough-v1`  
- Code: `src/components/demo/*`

## Full product UI (main)

- URL: http://localhost:3001/app  
- Data: `src/lib/data/` — `PlatformRepository` + `MemoryRepository`  
- Swap backend later by implementing the repository interface and changing `getMemoryRepository()` in `AppProvider`.

### Routes

Staff: `/app`, `/app/district`, `/app/teams`, `/app/roster`, `/app/roster/import`, `/app/schedule`, `/app/members`, `/app/seasons`, `/app/legal`, `/app/audit`, `/app/data`, `/app/settings`  
Public: `/fan/[programId]`, `/parent`  
Auth: `/login`, `/signup`, `/onboarding`

### Run

```bash
cd platform && npm install && npm run dev
```

→ http://localhost:3001/app
