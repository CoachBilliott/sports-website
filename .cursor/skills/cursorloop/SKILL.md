---
name: cursorloop
description: Iterative Platform improvement loop (alias for Cursor /loop). Use when the user types /cursorloop or wants continuous polish until launch-ready.
---

# cursorloop

The Cursor built-in is **`/loop`**. This skill is the project alias for `/cursorloop`.

## Local Desktop

Tell the user to run **`/loop`** in local Agent chat if they want interval wake-ups. This Cloud/Agent session cannot provide Cursor’s native `/loop` scheduler.

## When invoked here

Iterate on `platform/` until stopped:

1. Keep or start `npm run dev` on port **3001**.
2. Pick the next highest-impact UX/org/feature gap.
3. Ship a focused fix; verify build/routes.
4. Commit, push, update PR.
5. Continue to the next gap.

Never edit repo-root football `src/` unless asked. Keep `/demo` intact.
