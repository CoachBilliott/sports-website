"use client";

import { AppShell } from "@/components/AppShell";
import { AppProvider } from "@/context/AppState";

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
