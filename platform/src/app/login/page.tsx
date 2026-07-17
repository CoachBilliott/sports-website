"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppProvider, useApp, ROLE_SHORT } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";
import { DISTRICT_CHAIN } from "@/lib/data/org";
import type { Role } from "@/lib/data/types";
import { asset } from "@/lib/asset";

const CHIP_ORDER: Role[] = [
  ...DISTRICT_CHAIN,
  "head_coach",
  "coach",
  "parent",
  "player",
];

function LoginForm() {
  const { signIn, snap } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("alex.nguyen.dad@cyfair.isd.demo");

  const quickRoles = useMemo(() => {
    const picks: { label: string; email: string; role: Role }[] = [];
    for (const role of CHIP_ORDER) {
      const m =
        role === "athletic_campus_coordinator" ||
        role === "assistant_athletic_campus_coordinator"
          ? snap.members.find(
              (x) =>
                x.role === role && x.campusId === snap.activeCampusId,
            )
          : snap.members.find((x) => x.role === role);
      if (m) picks.push({ label: ROLE_SHORT[m.role], email: m.email, role });
    }
    return picks;
  }, [snap]);

  const go = (addr: string) => {
    signIn(addr);
    const role = snap.members.find(
      (m) => m.email.toLowerCase() === addr.toLowerCase(),
    )?.role;
    if (role === "parent") router.push("/parent");
    else if (role === "player") router.push("/player");
    else if (role === "head_coach" || role === "coach") router.push("/app/team");
    else router.push("/app");
  };

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/cypress-creek-logo.png")}
          alt=""
          className="mx-auto h-16 w-16 object-contain"
        />
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
          Sign in to Team OS
        </h1>
        <p className="mt-1 text-sm text-[var(--cc-steel)]">
          Local session for UI — replace with OIDC / Supabase Auth later.
        </p>
      </div>
      <Panel>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--cc-steel)]">
          Try every profile
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {quickRoles.map((q) => (
            <button
              key={q.email}
              type="button"
              onClick={() => go(q.email)}
              className="rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)] px-2.5 py-1.5 text-xs font-semibold text-[var(--cc-navy)] hover:border-[var(--cc-blue)]"
            >
              {q.label}
            </button>
          ))}
        </div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            go(email);
          }}
        >
          <label className="block text-sm">
            <span className="font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Password</span>
            <input
              type="password"
              defaultValue="••••••••"
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <PrimaryButton type="submit">Sign in</PrimaryButton>
        </form>
        <p className="mt-3 text-xs text-[var(--cc-steel)]">
          Chain: {DISTRICT_CHAIN.map((r) => ROLE_SHORT[r]).join(" → ")} → HC →
          Coach → Parent → Player. Any password works in this UI.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[var(--cc-blue)]">
          <Link href="/signup">Create account</Link>
          <Link href="/parent">Parent</Link>
          <Link href="/player">Player</Link>
          <Link href="/app">Skip to app</Link>
        </div>
      </Panel>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AppProvider>
      <LoginForm />
    </AppProvider>
  );
}
