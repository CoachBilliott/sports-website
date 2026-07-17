# Team OS Platform (separate app)

District readiness, multi-sport teams, Fan page, and Parent portal.

This app is **separate** from the Cy Creek Football Team OS in the repo root (`src/`). Football UI is unchanged.

## Run

From repo root:

```bash
npm run platform
```

Or:

```bash
cd platform && npm install && npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

Football Team OS stays on [http://localhost:3000](http://localhost:3000).

## What’s here

- District tenancy tree + SSO demo toggle
- Add teams via sport templates (football full modules; others core)
- Legal / FERPA-style readiness checklist
- Audit log + export/delete demos
- Fan page + Parent portal previews
