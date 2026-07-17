"use client";

import Link from "next/link";
import { useApp } from "./AppProvider";
import { PrimaryButton } from "@/components/ui";

/** Shown when the working campus has no teams yet. */
export function EmptyCampusCallout({ context }: { context: string }) {
  const { activeCampus, can } = useApp();

  return (
    <div className="rounded-2xl border border-dashed border-[var(--cc-blue)] bg-[var(--cc-blue)]/5 px-4 py-6 text-center">
      <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cc-navy)]">
        No team on {activeCampus.short} yet
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-[var(--cc-steel)]">
        {context} Switch campus in the header, or add a program so roster,
        schedule, and Fan can link here.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {can("manage_programs") ? (
          <Link href="/app/teams">
            <PrimaryButton>Add a team</PrimaryButton>
          </Link>
        ) : null}
        <Link
          href="/app/campuses"
          className="text-sm font-semibold text-[var(--cc-blue)]"
        >
          Pick another campus →
        </Link>
      </div>
    </div>
  );
}
