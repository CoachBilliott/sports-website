# Turn on Playwright + Figma (do this in Cursor Desktop)

This Cloud Agent **cannot** finish OAuth for you. Config is already in `.cursor/mcp.json`. Finish activation on your laptop:

## 1) Playwright (no login)

Open this link on the machine with Cursor Desktop:

[Install Playwright MCP](cursor://anysphere.cursor-deeplink/mcp/install?name=playwright&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBwbGF5d3JpZ2h0L21jcEBsYXRlc3QiXX0%3D)

Or: **Settings → Tools & MCP** → confirm **playwright** is enabled (green).

## 2) Figma (login required)

**Option A — plugin (best):** in a **Desktop** Agent chat, run:

```text
/add-plugin figma
```

Then **Settings → Tools & MCP → Figma → Connect** and approve in the browser.

**Option B — one-click MCP:**

[Install Figma MCP](cursor://anysphere.cursor-deeplink/mcp/install?name=Figma&config=eyJ1cmwiOiJodHRwczovL21jcC5maWdtYS5jb20vbWNwIn0%3D)

Then click **Connect** / **Needs login** and allow Figma access.

## 3) Reload

`Cmd/Ctrl+Shift+P` → **Developer: Reload Window**

You should see both tools available in Agent chat. Paste a Figma frame link to test Figma; ask the agent to open `http://localhost:3001/app` to test Playwright.
