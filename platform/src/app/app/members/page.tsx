"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";
import type { Role } from "@/lib/data/types";

const ROLES: Role[] = [
  "district_admin",
  "campus_ad",
  "head_coach",
  "coach",
  "parent",
  "player",
];

export default function MembersPage() {
  const { snap, activeProgram, inviteMember, removeMember } = useApp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "coach" as Role,
    scope: "",
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Members"
        description="Staff and parent invites. Bind to real auth memberships later."
      />

      <Panel title="People">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--cc-line)] text-xs uppercase text-[var(--cc-steel)]">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Scope</th>
              <th className="py-2">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {snap.members.map((m) => (
              <tr key={m.id} className="border-b border-[var(--cc-line)]/60">
                <td className="py-2 font-medium">{m.name}</td>
                <td className="py-2">{m.email}</td>
                <td className="py-2 font-mono text-xs">{m.role}</td>
                <td className="py-2">{m.scope}</td>
                <td className="py-2">
                  <Badge
                    tone={
                      m.status === "active"
                        ? "good"
                        : m.status === "invited"
                          ? "warn"
                          : "neutral"
                    }
                  >
                    {m.status}
                  </Badge>
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeMember(m.id)}
                    className="text-xs font-semibold text-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Invite member">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.email) return;
            inviteMember({
              name: form.name || form.email.split("@")[0]!,
              email: form.email,
              role: form.role,
              scope: form.scope || activeProgram.name,
              programIds: [activeProgram.id],
            });
            setForm({ name: "", email: "", role: "coach", scope: "" });
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
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-56 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              required
            />
          </label>
          <label className="text-sm">
            <span className="font-semibold">Role</span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as Role })
              }
              className="mt-1 block rounded-lg border border-[var(--cc-line)] px-3 py-2"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold">Scope</span>
            <input
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              placeholder={activeProgram.name}
              className="mt-1 block w-40 rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
          <PrimaryButton type="submit">Send invite</PrimaryButton>
        </form>
      </Panel>
    </div>
  );
}
