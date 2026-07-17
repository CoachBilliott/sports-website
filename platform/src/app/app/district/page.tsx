"use client";

import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton, StatTile } from "@/components/ui";

export default function DistrictPage() {
  const { snap, setSsoConnected } = useApp();
  const campus = snap.campuses.find((c) => c.id === snap.session?.campusId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="District"
        description="Tenancy, campuses, and SSO for your organization."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="District" value={snap.district.name} />
        <StatTile
          label="Campuses"
          value={snap.campuses.length}
          hint={snap.campuses.map((c) => c.name).join(" · ")}
        />
        <StatTile
          label="SSO"
          value={snap.ssoConnected ? "Connected" : "Not connected"}
          tone={snap.ssoConnected ? "good" : "default"}
        />
      </div>

      <Panel title="Campuses">
        <ul className="space-y-2">
          {snap.campuses.map((c) => (
            <li
              key={c.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                c.id === campus?.id
                  ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                  : "border-[var(--cc-line)]"
              }`}
            >
              <div>
                <p className="font-semibold text-[var(--cc-navy)]">{c.name}</p>
                <p className="text-sm text-[var(--cc-steel)]">{c.mascot}</p>
              </div>
              {c.id === campus?.id ? (
                <Badge tone="brand">Current</Badge>
              ) : (
                <Badge>Available</Badge>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Single sign-on"
        action={
          <PrimaryButton onClick={() => setSsoConnected(!snap.ssoConnected)}>
            {snap.ssoConnected ? "Disconnect" : "Mark connected"}
          </PrimaryButton>
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Wire Microsoft / Google OIDC here. UI state is ready; replace
          `setSsoConnected` with your auth provider callback later.
        </p>
      </Panel>

      <Panel title="Programs by campus">
        <ul className="space-y-2">
          {snap.programs.map((p) => {
            const camp = snap.campuses.find((c) => c.id === p.campusId);
            return (
              <li
                key={p.id}
                className="rounded-lg border border-[var(--cc-line)] px-3 py-2 text-sm"
              >
                <span className="font-semibold text-[var(--cc-navy)]">
                  {p.name}
                </span>{" "}
                <span className="text-[var(--cc-steel)]">
                  · {camp?.name} · {p.seasonLabel}
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
