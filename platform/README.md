# Team OS Platform

Full product UI (staff app + Fan + Parent + auth/onboarding).  
In-memory data layer — swap `MemoryRepository` for Supabase/API later.

**Saved AD walkthrough:** `/demo` (git tag `platform-ad-walkthrough-v1`)

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

## App routes

| Path | Purpose |
|------|---------|
| `/app` | Dashboard |
| `/app/district` | Tenancy + SSO |
| `/app/teams` | Programs CRUD |
| `/app/teams/[id]` | Program detail |
| `/app/roster` | Athletes |
| `/app/roster/import` | CSV import |
| `/app/schedule` | Games |
| `/app/members` | Staff invites |
| `/app/seasons` | Season roll UI |
| `/app/legal` | Legal & safety |
| `/app/audit` | Audit log |
| `/app/data` | Export / offboard |
| `/app/settings` | Workspace settings |

## Backend later

Implement `PlatformRepository` (`src/lib/data/repository.ts`) and replace `getMemoryRepository()` in `AppProvider`. Screens already call repository methods through `useApp()`.

Football Team OS (repo root, port 3000) is unchanged.
