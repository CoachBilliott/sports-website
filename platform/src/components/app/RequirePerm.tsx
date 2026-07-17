"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "./AppProvider";
import type { Permission } from "@/lib/data/org";

/** In-page gate when nav is bypassed via deep link. */
export function RequirePerm({
  perm,
  children,
  label = "this area",
}: {
  perm: Permission;
  children: ReactNode;
  label?: string;
}) {
  const { can } = useApp();
  if (!can(perm)) {
    return (
      <div className="rounded-2xl border border-[var(--cc-line)] bg-white p-6">
        <p className="font-semibold text-[var(--cc-navy)]">
          You don’t have access to {label}
        </p>
        <p className="mt-1 text-sm text-[var(--cc-steel)]">
          Ask a higher role in the chain of command, or use{" "}
          <strong>View as</strong> (DAD/AAD) to preview.
        </p>
        <Link
          href="/app"
          className="mt-3 inline-block text-sm font-semibold text-[var(--cc-blue)]"
        >
          Back to home →
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
