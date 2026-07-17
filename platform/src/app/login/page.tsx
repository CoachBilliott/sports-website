"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppProvider, useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";

function LoginForm() {
  const { signIn, snap } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("sortiz@cyfair.isd.demo");

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/cypress-creek-logo.png"
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
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            signIn(email);
            router.push("/app");
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
          Try a seeded member: {snap.members[0]?.email}
        </p>
        <div className="mt-4 flex gap-3 text-sm font-semibold text-[var(--cc-blue)]">
          <Link href="/signup">Create account</Link>
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
