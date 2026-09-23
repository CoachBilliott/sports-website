# Platform handoff (short)

**Canonical full handoff for ChatGPT / Codex / Cursor:** [`../HANDOFF.md`](../HANDOFF.md)

Paste that entire file into a new agent chat.

## Quick local

```bash
cd platform && npm install && npm run dev
```

- Product UI: http://localhost:3001/app  
- AD walkthrough: http://localhost:3001/demo  
- Live: https://sports-website-navy.vercel.app/district/demo  

Do not change football Team OS (`../src/**`) unless asked.  
Org / permissions: `src/lib/data/org.ts`.  
Data: `PlatformRepository` + `MemoryRepository` — swap backend later via `AppProvider`.
