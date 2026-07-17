"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppProvider, useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";

function SignupForm() {
  const { signIn, inviteMember } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("Cy-Fair ISD");

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-center font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
        Create your Team OS account
      </h1>
      <p className="mt-1 text-center text-sm text-[var(--cc-steel)]">
        Starts onboarding for a new district program.
      </p>
      <Panel className="mt-6">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            inviteMember({
              name: name || "New admin",
              email: email || "admin@school.demo",
              role: "district_athletic_director",
              scope: district,
              programIds: [],
            });
            signIn(email || "admin@school.demo");
            router.push("/onboarding");
          }}
        >
          <label className="block text-sm">
            <span className="font-semibold">Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Work email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">District</span>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <PrimaryButton type="submit">Continue to onboarding</PrimaryButton>
        </form>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-semibold text-[var(--cc-blue)]"
        >
          Already have an account?
        </Link>
      </Panel>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AppProvider>
      <SignupForm />
    </AppProvider>
  );
}
