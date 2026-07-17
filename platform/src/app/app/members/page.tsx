"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { RequirePerm } from "@/components/app/RequirePerm";
import { useApp, ROLE_LABEL, ROLE_SHORT } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";
import { DISTRICT_CHAIN, ROLE_RANK } from "@/lib/data/org";
import type { Role } from "@/lib/data/types";

export default function MembersPage() {
  const {
    snap,
    activeCampus,
    activeProgram,
    inviteMember,
    removeMember,
    updateMember,
    invitableRoles,
    can,
    role,
  } = useApp();
  const [filter, setFilter] = useState<"chain" | "campus" | "all">("chain");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: (invitableRoles[0] ?? "coach") as Role,
    scope: "",
  });

  const rows = useMemo(() => {
    let list = [...snap.members];
    if (filter === "chain") {
      list = list.filter((m) =>
        DISTRICT_CHAIN.includes(m.role as (typeof DISTRICT_CHAIN)[number]),
      );
    } else if (filter === "campus") {
      list = list.filter((m) => m.campusId === activeCampus.id);
    }
    return list.sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role]);
  }, [snap.members, filter, activeCampus.id]);

  const inviteOptions = invitableRoles.length
    ? invitableRoles
    : (["coach"] as Role[]);

  return (
    <RequirePerm perm="manage_members" label="people & invites">
    <div className="space-y-4">
      <PageHeader
        title="People"
        description="District athletics staff in chain-of-command order. You can only invite roles below your level."
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["chain", "District chain"],
            ["campus", `${activeCampus.short} only`],
            ["all", "Everyone"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              filter === id
                ? "bg-[var(--cc-navy)] text-white"
                : "border border-[var(--cc-line)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Panel title={`${rows.length} people`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
                <th className="py-2">Name</th>
                <th className="py-2">Role</th>
                <th className="py-2">Scope</th>
                <th className="py-2">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const campus = snap.campuses.find((c) => c.id === m.campusId);
                return (
                  <tr key={m.id} className="border-b border-[var(--cc-line)]/60">
                    <td className="py-2">
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-[var(--cc-steel)]">{m.email}</p>
                    </td>
                    <td className="py-2">
                      <Badge>{ROLE_SHORT[m.role]}</Badge>
                      <p className="mt-0.5 text-xs text-[var(--cc-steel)]">
                        {ROLE_LABEL[m.role]}
                      </p>
                    </td>
                    <td className="py-2 text-sm">
                      {campus?.short ?? m.scope}
                    </td>
                    <td className="py-2">
                      <select
                        value={m.status}
                        onChange={(e) =>
                          updateMember(m.id, {
                            status: e.target.value as
                              | "active"
                              | "invited"
                              | "disabled",
                          })
                        }
                        className="rounded-md border border-[var(--cc-line)] px-2 py-1 text-xs font-semibold"
                        disabled={
                          !can("manage_members") ||
                          !role ||
                          ROLE_RANK[m.role] <= ROLE_RANK[role]
                        }
                      >
                        <option value="active">active</option>
                        <option value="invited">invited</option>
                        <option value="disabled">disabled</option>
                      </select>
                    </td>
                    <td className="py-2 text-right">
                      {can("manage_members") &&
                      role &&
                      ROLE_RANK[m.role] > ROLE_RANK[role] ? (
                        <button
                          type="button"
                          onClick={() => removeMember(m.id)}
                          className="text-xs font-semibold text-red-700"
                        >
                          Remove
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {can("invite_below_self") ? (
        <Panel title="Invite someone below you">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.email) return;
              inviteMember({
                name: form.name || form.email.split("@")[0]!,
                email: form.email,
                role: form.role,
                scope: form.scope || activeCampus.short,
                campusId: activeCampus.id,
                programIds: [activeProgram.id],
                reportsToId: snap.session?.id,
              });
              setForm({
                name: "",
                email: "",
                role: inviteOptions[0]!,
                scope: "",
              });
            }}
          >
            <label className="text-sm">
              <span className="font-semibold">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 block w-40 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 block w-56 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Role</span>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
                className="mt-1 block max-w-[16rem] rounded-lg border border-[var(--cc-line)] px-3 py-2"
              >
                {inviteOptions.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <PrimaryButton type="submit">Send invite</PrimaryButton>
          </form>
          {!invitableRoles.length ? (
            <p className="mt-2 text-xs text-amber-800">
              Your role cannot invite anyone else.
            </p>
          ) : null}
        </Panel>
      ) : (
        <Panel title="Invites">
          <p className="text-sm text-[var(--cc-steel)]">
            Your role cannot invite members. Ask a Campus Coordinator or above.
          </p>
        </Panel>
      )}
    </div>
    </RequirePerm>
  );
}
