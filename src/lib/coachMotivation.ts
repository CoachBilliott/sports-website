export type CoachMotivation = {
  quote: string;
  author: string;
  note?: string;
};

/** Curated football-coach lines. AI may pick among these — not invent fake attributions. */
export const COACH_MOTIVATIONS: CoachMotivation[] = [
  {
    quote:
      "The dictionary is the only place that success comes before work.",
    author: "Vince Lombardi",
  },
  {
    quote: "Winning is not a sometime thing; it's an all the time thing.",
    author: "Vince Lombardi",
  },
  {
    quote: "It's not whether you get knocked down, it's whether you get up.",
    author: "Vince Lombardi",
  },
  {
    quote:
      "The will to win is not nearly so important as the will to prepare to win.",
    author: "Vince Lombardi",
  },
  {
    quote:
      "Perfection is not attainable, but if we chase perfection we can catch excellence.",
    author: "Vince Lombardi",
  },
  {
    quote: "Do your job.",
    author: "Bill Belichick",
  },
  {
    quote: "Ignore the noise.",
    author: "Nick Saban",
  },
  {
    quote:
      "Eliminate the clutter and all the things that are going on outside and focus on the things that you can control.",
    author: "Nick Saban",
  },
  {
    quote: "Be where your feet are.",
    author: "Nick Saban",
  },
  {
    quote: "Process over outcome. Trust the work.",
    author: "Nick Saban",
  },
  {
    quote: "The standard is the standard.",
    author: "Mike Tomlin",
  },
  {
    quote: "We don't flinch.",
    author: "Mike Tomlin",
  },
  {
    quote:
      "You either get better or you get worse. You never stay the same.",
    author: "Pete Carroll",
  },
  {
    quote: "Compete in everything you do.",
    author: "Pete Carroll",
  },
  {
    quote: "Attack each day with an enthusiasm unknown to mankind.",
    author: "Jim Harbaugh",
  },
  {
    quote: "Who's got it better than us? Nobody.",
    author: "Jim Harbaugh",
  },
  {
    quote: "Champions behave like champions before they're champions.",
    author: "Bill Walsh",
  },
  {
    quote: "Details are not details. They make the product.",
    author: "Bill Walsh",
  },
  {
    quote: "Confidence comes from demonstrated ability.",
    author: "Bill Walsh",
  },
  {
    quote:
      "Pressure is something you feel when you don't know what you're doing.",
    author: "Chuck Noll",
  },
  {
    quote: "You play the way you practice.",
    author: "Pop Warner",
  },
  {
    quote:
      "Football is a game of errors. The team that makes the fewest wins.",
    author: "Woody Hayes",
  },
  {
    quote: "Discipline is doing what you have to do, and doing it well.",
    author: "Bobby Bowden",
  },
  {
    quote: "The man who complains about the way the ball bounces is likely to be the one who dropped it.",
    author: "Lou Holtz",
  },
  {
    quote: "Ability is what you're capable of doing. Motivation determines what you do. Attitude determines how well you do it.",
    author: "Lou Holtz",
  },
  {
    quote: "Football is like life — it requires perseverance, self-denial, hard work, sacrifice, dedication and respect for authority.",
    author: "Vince Lombardi",
  },
  {
    quote: "If you want to win, do the ordinary things better than anyone else does them day in and day out.",
    author: "Chuck Noll",
  },
  {
    quote: "Physical ability can only take you so far. Character takes you the rest of the way.",
    author: "Tony Dungy",
  },
];

function hashDateKey(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function motivationForDate(dateKey: string): CoachMotivation {
  const list = COACH_MOTIVATIONS;
  const idx = hashDateKey(dateKey) % list.length;
  return list[idx]!;
}

export function todayDateKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type DailyMotivationPayload = CoachMotivation & {
  date: string;
  source: "calendar" | "ai";
};
