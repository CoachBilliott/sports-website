"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { useApp } from "@/components/app/AppProvider";
import { Badge, Panel, PrimaryButton } from "@/components/ui";

export default function AnnouncementsPage() {
  const { snap, activeProgram, activeCampus, addAnnouncement, can } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"staff" | "parent" | "public">(
    "parent",
  );

  const list = snap.announcements.filter(
    (a) =>
      a.programId === activeProgram.id || a.campusId === activeCampus.id,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Announcements"
        description={`Posts for ${activeProgram.name} at ${activeCampus.short}. Parents see parent audience items.`}
      />

      {can("manage_announcements") ? (
        <Panel title="New announcement">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              addAnnouncement({
                title: title.trim(),
                body: body.trim() || title.trim(),
                audience,
                programId: activeProgram.id,
                campusId: activeCampus.id,
              });
              setTitle("");
              setBody("");
            }}
          >
            <label className="block text-sm">
              <span className="font-semibold">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Body</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Audience</span>
              <select
                value={audience}
                onChange={(e) =>
                  setAudience(e.target.value as typeof audience)
                }
                className="mt-1 rounded-lg border border-[var(--cc-line)] px-3 py-2"
              >
                <option value="parent">Parents</option>
                <option value="staff">Staff</option>
                <option value="public">Public / Fan</option>
              </select>
            </label>
            <PrimaryButton type="submit">Publish</PrimaryButton>
          </form>
        </Panel>
      ) : null}

      <Panel title={`${list.length} posts`}>
        <ul className="space-y-3">
          {list.map((a) => (
            <li
              key={a.id}
              className="flex gap-3 rounded-xl border border-[var(--cc-line)] px-3 py-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--cc-navy)] text-[10px] font-bold text-white">
                {a.dateLabel}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--cc-navy)]">{a.title}</p>
                  <Badge>{a.audience}</Badge>
                </div>
                <p className="text-sm text-[var(--cc-steel)]">{a.body}</p>
              </div>
            </li>
          ))}
          {!list.length ? (
            <li className="text-sm text-[var(--cc-steel)]">
              No announcements yet — publish one above.
            </li>
          ) : null}
        </ul>
        <p className="mt-3 text-sm">
          <Link href="/parent" className="font-semibold text-[var(--cc-blue)]">
            Open Parent portal →
          </Link>{" "}
          <span className="text-[var(--cc-steel)]">
            (parent audience posts appear there)
          </span>
        </p>
      </Panel>
    </div>
  );
}
