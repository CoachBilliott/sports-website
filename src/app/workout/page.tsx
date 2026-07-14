"use client";

import { AppShell } from "@/components/AppShell";
import { AppProvider } from "@/context/AppState";

/** Clean board for showing coaches / players at workouts — depth charts first. */
export default function WorkoutPage() {
  return (
    <AppProvider initialPresent initialPage="personnel-depth">
      <AppShell />
    </AppProvider>
  );
}
