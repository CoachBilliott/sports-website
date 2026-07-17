"use client";

import Link from "next/link";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton } from "@/components/ui";

export default function SettingsPage() {
  const { snap, resetToSeed, activeProgram } = useApp();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Workspace preferences. Hook branding uploads and env config here later."
      />

      <Panel title="Organization">
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs uppercase text-[var(--cc-steel)]">District</dt>
            <dd className="font-semibold">{snap.district.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--cc-steel)]">Signed in</dt>
            <dd className="font-semibold">
              {snap.session?.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--cc-steel)]">
              Active program
            </dt>
            <dd className="font-semibold">{activeProgram.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[var(--cc-steel)]">SSO</dt>
            <dd className="font-semibold">
              {snap.ssoConnected ? "Connected" : "Not connected"}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Branding">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cypress-creek-logo.png"
            alt=""
            className="h-16 w-16 rounded-xl border border-[var(--cc-line)] object-contain p-1"
          />
          <div>
            <p className="font-semibold">Campus logo</p>
            <p className="text-sm text-[var(--cc-steel)]">
              Upload endpoint placeholder — keep file in object storage later.
            </p>
            <button
              type="button"
              className="mt-2 rounded-lg border border-[var(--cc-line)] px-3 py-1.5 text-xs font-semibold"
            >
              Replace logo
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Setup">
        <div className="flex flex-wrap gap-2">
          <Link href="/onboarding">
            <PrimaryButton>Open onboarding wizard</PrimaryButton>
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[var(--cc-line)] px-4 py-2 text-sm font-semibold"
          >
            Auth screens
          </Link>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all local data to seed?")) resetToSeed();
            }}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
          >
            Reset local data
          </button>
        </div>
      </Panel>
    </div>
  );
}
