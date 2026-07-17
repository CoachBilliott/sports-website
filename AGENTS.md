<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Two apps in this repo

| App | Path | Port | Notes |
|-----|------|------|--------|
| Football Team OS | `src/` | 3000 | Do not change unless asked |
| Platform (district / multi-sport / fan / parent) | `platform/` | 3001 | Full handoff: `platform/HANDOFF.md` |

If the task is district sales, legal checklist, multi-sport teams, Fan, or Parent UI — work **only** under `platform/` and follow `platform/HANDOFF.md`.
