<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- This is a single Next.js 16 (Turbopack) frontend mock — there is **no** backend, database, auth, or external service to run. Everything is mocked in-memory (`src/lib/mock.ts`, `src/context/AppState.tsx`). Roles/state are client-side only.
- Standard commands live in `package.json` and `README.md`: `npm run dev` (staff app on port 3000), `npm run dev:share` (binds `0.0.0.0:3000` for external access — use this when the port must be reachable outside localhost), `npm run build`, `npm run lint`.
- Key routes: `/` (staff app with role switcher: Admin/Coordinator/Coach/Player) and `/workout` (depth-chart / workout board with scheme filters). API routes under `src/app/api/` (`daily-motivation`, `maxpreps`, `weekly-quiz`) are self-contained route handlers.
- `npm run lint` currently reports pre-existing errors/warnings in the checked-in code (e.g. `set-state-in-effect` in `src/context/AppState.tsx`). These are not environment problems; lint itself runs fine.
