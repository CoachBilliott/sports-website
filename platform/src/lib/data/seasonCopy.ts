export const SEASON_PROGRAM_SCOPED = [
  "Members & roles",
  "Roster shell (athletes)",
  "Branding (logo / colors)",
  "Depth chart schemes",
  "Playbook / resources",
  "Goal templates",
];

export const SEASON_SEASON_SCOPED = [
  "Schedule assets",
  "Scout packages",
  "Grades / eligibility marks",
  "Quizzes",
  "Attendance",
  "Depth placements",
  "Field fills / week installs",
];

export const SEASON_POST_ROLL = [
  {
    id: "promote",
    label: "Promote class years",
    detail: "Fr → So → Jr → Sr across the roster shell.",
  },
  {
    id: "prune",
    label: "Prune graduated athletes",
    detail: "Archive seniors who left; keep history on the old season.",
  },
  {
    id: "maxpreps",
    label: "Refresh schedule from MaxPreps",
    detail: "Pull the new season schedule from this program’s team URL.",
  },
  {
    id: "depth",
    label: "Reset depth placements",
    detail: "Schemes stay; starter slots start empty for the new year.",
  },
] as const;
