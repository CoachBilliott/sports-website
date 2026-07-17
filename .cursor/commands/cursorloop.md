# /cursorloop

You asked for `/cursorloop`. In Cursor the built-in skill is **`/loop`** (Cursor 3.5+). This project alias runs the same kind of iterative work loop.

## How to use the real built-in

1. Open **local Agent chat** in Cursor Desktop (not a Cloud Agent run).
2. Type **`/loop`** (not `/cursorloop`).
3. Give a task + optional interval, e.g.:
   - `/loop every 2m polish Platform UX until /app feels launch-ready`
   - `/loop work the next incomplete Platform item until build is green`

`/loop` only works **locally**. For scheduled cloud runs, use **Automations** / `/automate`.

## What to do in this chat (cloud or desktop)

Run an iterative improvement loop on Team OS Platform (`platform/` only):

1. Confirm `http://localhost:3001` is up (`cd platform && npm run dev` if needed).
2. Find the highest-impact gap vs: Cy-Fair chain of command, linked UX, Fan/Parent, legal/safety, launch-ready minus backend.
3. Implement one concrete fix.
4. `npx tsc --noEmit` and/or smoke the affected route.
5. Commit + push on the current feature branch; update the PR.
6. Repeat until the user stops you or the app is show-ready.

Constraints from the repo:
- Do not modify football Team OS at repo root `src/` unless asked.
- Keep `/demo` AD walkthrough intact.
- Brand: Cy Creek navy/blue, Barlow Condensed; no purple AI-default look.
