"use client";

import type { ReactNode } from "react";

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`platform-panel rounded-2xl border border-[var(--cc-line)] bg-white p-5 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title ? (
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--cc-navy)]">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--cc-steel)]">
        <span>{pct}% complete</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--cc-line)]">
        <div
          className="h-full rounded-full bg-[var(--cc-blue)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "brand" | "invert";
}) {
  const styles =
    tone === "good"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-900 ring-amber-200"
        : tone === "brand"
          ? "bg-[var(--cc-blue)]/10 text-[var(--cc-blue)] ring-[var(--cc-blue)]/20"
          : tone === "invert"
            ? "bg-white/15 text-white ring-white/20"
            : "bg-[var(--cc-field)] text-[var(--cc-navy)] ring-[var(--cc-line)]";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "good";
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === "good"
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-[var(--cc-line)] bg-[var(--cc-field)]"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-wide ${
          tone === "good" ? "text-emerald-800" : "text-[var(--cc-steel)]"
        }`}
      >
        {label}
      </p>
      <div className="mt-1 font-semibold text-[var(--cc-navy)]">{value}</div>
      {hint ? <div className="mt-1 text-sm text-[var(--cc-steel)]">{hint}</div> : null}
    </div>
  );
}

export function YesNo({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${
        ok
          ? "bg-emerald-100 text-emerald-800"
          : "bg-[var(--cc-field)] text-[var(--cc-steel)]"
      }`}
    >
      {ok ? "Yes" : "No"}
    </span>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-[var(--cc-navy)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-[var(--cc-blue)] hover:underline"
    >
      {children}
    </button>
  );
}
