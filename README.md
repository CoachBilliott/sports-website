# Team OS — UI Mock

Clickable football program shell for Cy Creek (2026) to pressure-test IA and roles.

## Run (local)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the staff app.  
Open [http://localhost:3000/workout](http://localhost:3000/workout) for the **workout board** (depth charts, clean present UI).  
Open [http://localhost:3000/fan](http://localhost:3000/fan) for the public Fan page.

## Show the team at workouts

1. On your laptop: `npm run dev:share`
2. Click **Show team** in the header (or open `/workout`) — hides the role switcher / mock chrome, opens Depth Charts, optional fullscreen.
3. On phones (same Wi‑Fi): find your laptop’s IP (`ipconfig` → IPv4), then open  
   `http://YOUR-IP:3000/workout`

Tips:

- Use **Depth Charts** filters for Varsity Offense / Defense before presenting.
- **Print** still works for paper boards.
- **Exit present** returns to the normal mock UI.

## What’s mocked

- Role switcher: Admin · Coordinator · Coach · Player · Parent · Fan
- Program bar + Offense | Defense + Teach dropdown
- This Week, Schedule (MaxPreps link), Quizzes, Groups, Staff responsibilities, Admin branding/members
- Scout / Teach / My Room / Grades (role-gated)
- Fan public page (minimal)
- Workout present mode (`/workout` or **Show team**)

No real auth, database, or uploads yet.
