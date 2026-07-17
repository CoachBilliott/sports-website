"use client";

import { DEMO_CAMPUSES, DEMO_STAFF } from "@/lib/demoContent";
import { usePlatform } from "../PlatformState";
import { Badge, GhostButton, Panel, PrimaryButton, StatTile } from "@/components/ui";

export function DistrictScreen() {
  const {
    district,
    campus,
    programs,
    ssoDemoConnected,
    setSsoDemoConnected,
    setPage,
  } = usePlatform();

  return (
    <div className="space-y-4">
      <Panel title="Show the district">
        <p className="text-sm text-[var(--cc-steel)]">
          One district account, many campuses and sports. Student data stays
          scoped under the district — not a separate vendor login per team.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatTile label="District" value={district.name} hint="Contract · DPA · SSO" />
          <StatTile
            label="Active campus"
            value={campus.name}
            hint="Cougars · Cypress Creek"
          />
          <StatTile
            label="Programs here"
            value={`${programs.length}`}
            hint={programs.map((p) => p.name).join(" · ")}
          />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Campus map (Cy-Fair)">
          <ul className="space-y-2">
            {DEMO_CAMPUSES.map((c) => (
              <li
                key={c.id}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  c.active
                    ? "border-[var(--cc-blue)] bg-[var(--cc-blue)]/5"
                    : "border-[var(--cc-line)] bg-[var(--cc-field)]/50 opacity-80"
                }`}
              >
                <div>
                  <p className="font-semibold text-[var(--cc-navy)]">{c.name}</p>
                  <p className="text-sm text-[var(--cc-steel)]">{c.mascot}</p>
                </div>
                {c.active ? (
                  <Badge tone="brand">In this demo</Badge>
                ) : (
                  <Badge>Coming online</Badge>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Tenancy tree">
          <ol className="space-y-3 text-sm">
            <li className="rounded-xl border border-[var(--cc-line)] bg-[var(--cc-field)] p-4">
              <span className="text-xs font-bold uppercase text-[var(--cc-steel)]">
                District
              </span>
              <p className="font-semibold text-[var(--cc-navy)]">{district.name}</p>
              <p className="mt-1 text-xs text-[var(--cc-steel)]">
                Contract, DPA, and SSO live here.
              </p>
            </li>
            <li className="ml-4 rounded-xl border border-[var(--cc-line)] bg-white p-4">
              <span className="text-xs font-bold uppercase text-[var(--cc-steel)]">
                Campus
              </span>
              <p className="font-semibold text-[var(--cc-navy)]">{campus.name}</p>
            </li>
            <li className="ml-8 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-[var(--cc-steel)]">
                  Programs / teams
                </span>
                <GhostButton onClick={() => setPage("programs")}>
                  Add teams →
                </GhostButton>
              </div>
              <ul className="space-y-1">
                {programs.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-lg border border-[var(--cc-line)] bg-[var(--cc-field)] px-3 py-2 font-medium text-[var(--cc-navy)]"
                  >
                    {p.name} · {p.sport} · {p.seasonLabel}
                  </li>
                ))}
              </ul>
            </li>
          </ol>
        </Panel>
      </div>

      <Panel title="Campus staff (roles only)">
        <p className="mb-3 text-sm text-[var(--cc-steel)]">
          Directory of roles for the AD demo — no personal phone numbers on this
          screen.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2">Scope</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_STAFF.map((s) => (
                <tr key={s.name} className="border-b border-[var(--cc-line)]/70">
                  <td className="py-2 pr-3 font-medium text-[var(--cc-navy)]">
                    {s.name}
                  </td>
                  <td className="py-2 pr-3">{s.role}</td>
                  <td className="py-2">
                    <Badge>{s.scope}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="SSO status (demo)"
        action={
          <PrimaryButton onClick={() => setSsoDemoConnected(!ssoDemoConnected)}>
            {ssoDemoConnected ? "Disconnect demo" : "Mark connected"}
          </PrimaryButton>
        }
      >
        <p className="text-sm text-[var(--cc-steel)]">
          Production uses Microsoft / Google OIDC so staff sign in with district
          accounts. This toggle is for AD demos only.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--cc-navy)]">
          Status:{" "}
          <span
            className={ssoDemoConnected ? "text-emerald-700" : "text-amber-700"}
          >
            {ssoDemoConnected ? "Connected (demo)" : "Not connected"}
          </span>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <GhostButton onClick={() => setPage("legal")}>
            Legal &amp; safety →
          </GhostButton>
          <GhostButton onClick={() => setPage("programs")}>
            Add a sport team →
          </GhostButton>
        </div>
      </Panel>
    </div>
  );
}
