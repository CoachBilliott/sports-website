# Team OS — UI Mock

Clickable football program shell for Cy Creek (2026) to pressure-test IA and roles.

## Live links (send these)

- **Football Team OS:** https://sports-website-navy.vercel.app  
- **Workout board:** https://sports-website-navy.vercel.app/workout  
- **District Platform (DAD → Fan demo):** https://sports-website-navy.vercel.app/district/demo/  
- **Platform login (role chips):** https://sports-website-navy.vercel.app/district/login/  
- **GitHub:** https://github.com/CoachBilliott/sports-website  

## Run (local)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the staff app.  
Open [http://localhost:3000/workout](http://localhost:3000/workout) for the **workout board** (depth charts, clean present UI).

## Show the team at workouts

1. Prefer the live **Workout board** link above (no laptop server needed).
2. Or on your laptop: `npm run dev:share`, then click **Show team** / open `/workout`.
3. On phones (same Wi‑Fi only if using local): `http://YOUR-IP:3000/workout`

Tips:

- Use **Depth Charts** filters for Varsity Offense / Defense before presenting.
- **Print** still works for paper boards.
- **Exit present** returns to the normal mock UI.

## What’s mocked

- Role switcher: Admin · Coordinator · Coach · Player
- Program bar + Offense | Defense + Teach dropdown
- This Week, Schedule (MaxPreps link), Quizzes, Groups, Staff responsibilities, Admin branding/members
- Scout / Teach / My Room / Grades (role-gated)
- Workout present mode (`/workout` or **Show team**)

No real auth, database, or uploads yet.

## Platform app (district / multi-sport / fan / parent)

Lives in [`platform/`](platform/). Does **not** change the football UI.

**Send people this:** https://sports-website-navy.vercel.app/district/demo/  
(Also `/district/login/` for one-click DAD → Player roles.)

Local:

```bash
npm run platform
```

Open [http://localhost:3001](http://localhost:3001) (no `/district` prefix locally).

Production build embeds the platform under `/district/` on the same Vercel site (`npm run build`).

**New agent handoff (everything in one file):** [`platform/HANDOFF.md`](platform/HANDOFF.md)

