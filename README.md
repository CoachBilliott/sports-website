# Team OS — UI Mock

Clickable football program shell for Cy Creek (2026) to pressure-test IA and roles.

## Live links (send these)

- **App:** https://sports-website-navy.vercel.app  
- **Workout board:** https://sports-website-navy.vercel.app/workout  
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
