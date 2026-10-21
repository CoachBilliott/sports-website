import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not released yet · Football pilot",
  description: "Football is available for this pilot. Other sports and district experiences will be released separately.",
  robots: { index: false, follow: true },
};

export default function NotReleasedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16" data-product-release="planned">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--cc-blue)]">Football pilot</p>
      <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--cc-navy)]">Not released yet</h1>
      <p className="mt-5 text-lg leading-relaxed text-[var(--cc-steel)]">Football is available for this pilot. District and other-sport experiences will be released separately.</p>
      <p className="mt-3 text-sm text-[var(--cc-steel)]">Your link still works. This part of the website is waiting for its release.</p>
      <nav className="mt-8 flex flex-wrap gap-3" aria-label="Available football experiences">
        <Link href="/" className="rounded-lg bg-[var(--cc-navy)] px-5 py-3 font-semibold text-white">Open Football</Link>
        <Link href="/workout" className="rounded-lg border border-[var(--cc-line)] bg-white px-5 py-3 font-semibold text-[var(--cc-navy)]">Workout board</Link>
      </nav>
    </main>
  );
}
