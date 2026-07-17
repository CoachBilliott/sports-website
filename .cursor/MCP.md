# MCP + editor plugins for Team OS

Project MCP config: `.cursor/mcp.json`  
Editor extensions: `.vscode/extensions.json`

## Enable in Cursor Desktop

1. Open this repo in **Cursor Desktop** (MCP from project files loads there).
2. Go to **Settings → Tools & MCP** and confirm servers show up.
3. Click **Needs login** / **Connect** for:
   - **Figma** — authorize your Figma account
   - **GitHub** — authorize GitHub
   - **Vercel** — authorize Vercel
4. **Playwright** — runs locally via `npx` (no login). First use may install Chromium.
5. **Supabase** — create a personal access token at https://supabase.com/dashboard/account/tokens  
   then set it in your shell / Cursor env (never commit the token):

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."
```

Or add it in Cursor Settings → MCP → supabase → env.

6. Reload the window (**Cmd/Ctrl+Shift+P → Developer: Reload Window**).

## What each does

| Server | Use |
|--------|-----|
| Playwright | Click through Staff / Fan / Parent and catch UI bugs |
| Figma | Paste a frame link → agent matches design |
| GitHub | Issues, PRs, Actions |
| Vercel | Deploys, logs, previews |
| Supabase | Auth / DB when you wire the backend |

Cloud Agents need MCP configured in the **Cloud Agents dashboard** separately; this file primarily powers Desktop Agent.
