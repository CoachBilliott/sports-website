"use client";

import Link from "next/link";
import { Panel } from "@/components/ui";

export default function StudyPage() {
  return (
    <Panel title="Study guides">
      <p className="text-sm text-[var(--cc-steel)]">
        Study packs pull from Scout + Playbook + Install. Use those screens to
        build the week, then quiz athletes.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-[var(--cc-blue)]">
        <Link href="/app/team/scout">Scout →</Link>
        <Link href="/app/team/playbook">Playbook →</Link>
        <Link href="/app/team/install">Install →</Link>
        <Link href="/app/team/quizzes">Quizzes →</Link>
      </div>
    </Panel>
  );
}
