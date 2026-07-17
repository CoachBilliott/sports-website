"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { RequirePerm } from "@/components/app/RequirePerm";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function SettingsPage() {
  const {
    snap,
    resetToSeed,
    activeProgram,
    setSsoConnected,
    updateDistrict,
    setBrandLogoUrl,
  } = useApp();
  const [districtName, setDistrictName] = useState(snap.district.name);
  const [logoUrl, setLogoUrl] = useState(
    snap.brandLogoUrl ?? "/cypress-creek-logo.png",
  );

  return (
    <RequirePerm perm="manage_district_settings" label="settings">
      <div className="space-y-4">
        <PageHeader
          title="Settings"
          description="District workspace preferences — branding, SSO, and local demo controls."
        />

        <Panel title="Organization">
          <label className="block text-sm">
            <span className="font-semibold">District name</span>
            <input
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              className="mt-1 w-full max-w-md rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <div className="mt-3">
            <PrimaryButton
              onClick={() => updateDistrict({ name: districtName.trim() })}
            >
              Save district name
            </PrimaryButton>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-xs uppercase text-[var(--cc-steel)]">
                Signed in
              </dt>
              <dd className="font-semibold">{snap.session?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--cc-steel)]">
                Active program
              </dt>
              <dd className="font-semibold">{activeProgram.name}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="SSO">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={snap.ssoConnected ? "good" : "warn"}>
              {snap.ssoConnected ? "Connected" : "Not connected"}
            </Badge>
            <PrimaryButton
              onClick={() => setSsoConnected(!snap.ssoConnected)}
            >
              {snap.ssoConnected ? "Disconnect SSO" : "Connect SSO (demo)"}
            </PrimaryButton>
          </div>
          <p className="mt-2 text-sm text-[var(--cc-steel)]">
            Demo toggle — wire to Clever / ClassLink / Azure AD later.
          </p>
        </Panel>

        <Panel title="Branding">
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={snap.brandLogoUrl || "/cypress-creek-logo.png"}
              alt=""
              className="h-16 w-16 rounded-xl border border-[var(--cc-line)] object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Campus / district logo</p>
              <label className="mt-2 block text-sm">
                <span className="font-semibold">Image URL</span>
                <input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                  placeholder="/cypress-creek-logo.png"
                />
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <PrimaryButton onClick={() => setBrandLogoUrl(logoUrl.trim())}>
                  Save logo
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrl("/cypress-creek-logo.png");
                    setBrandLogoUrl("/cypress-creek-logo.png");
                  }}
                  className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm font-semibold"
                >
                  Reset default
                </button>
              </div>
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
    </RequirePerm>
  );
}
