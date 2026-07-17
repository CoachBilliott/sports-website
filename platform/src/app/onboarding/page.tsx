"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/components/app/AppProvider";
import { Panel, PrimaryButton, ProgressBar } from "@/components/ui";
import { SPORT_OPTIONS, type SportId } from "@/lib/programConfig";

const STEPS = [
  "Program",
  "Levels",
  "Staff",
  "Roster",
  "MaxPreps",
  "Finish",
] as const;

function Wizard() {
  const {
    snap,
    setOnboardingStep,
    updateOnboarding,
    completeOnboarding,
    createProgram,
    inviteMember,
    updateProgram,
  } = useApp();
  const router = useRouter();
  const step = snap.onboarding.step;
  const ob = snap.onboarding;

  function next() {
    if (step >= STEPS.length - 1) {
      const created = createProgram({
        name: ob.programName || "New program",
        sport: ob.sport,
        seasonLabel: "2026",
        levels: ob.levels,
        campusId: snap.session?.campusId ?? snap.campuses[0]!.id,
      });
      if (ob.maxPrepsUrl.trim()) {
        updateProgram(created.id, { maxPrepsUrl: ob.maxPrepsUrl.trim() });
      }
      for (const email of ob.staffEmails) {
        inviteMember({
          name: email.split("@")[0] || email,
          email,
          role: "coach",
          scope: created.name,
          programIds: [created.id],
          campusId: created.campusId,
          reportsToId: snap.session?.id,
        });
      }
      completeOnboarding();
      router.push("/app/team");
      return;
    }
    setOnboardingStep(step + 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--cc-navy)]">
          Onboarding
        </h1>
        <Link href="/app" className="text-sm font-semibold text-[var(--cc-blue)]">
          Skip to app
        </Link>
      </div>
      <ProgressBar value={step + 1} max={STEPS.length} />
      <ol className="mt-3 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              i === step
                ? "bg-[var(--cc-navy)] text-white"
                : i < step
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-[var(--cc-field)] text-[var(--cc-steel)]"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <Panel className="mt-4" title={STEPS[step]}>
        {step === 0 ? (
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="font-semibold">Program name</span>
              <input
                value={ob.programName}
                onChange={(e) =>
                  updateOnboarding({ programName: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Sport</span>
              <select
                value={ob.sport}
                onChange={(e) =>
                  updateOnboarding({ sport: e.target.value as SportId })
                }
                className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              >
                {SPORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-wrap gap-2">
            {["Varsity", "JV", "Freshman"].map((level) => {
              const on = ob.levels.includes(level);
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    updateOnboarding({
                      levels: on
                        ? ob.levels.filter((l) => l !== level)
                        : [...ob.levels, level],
                    })
                  }
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    on
                      ? "bg-[var(--cc-navy)] text-white"
                      : "border border-[var(--cc-line)]"
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        ) : null}

        {step === 2 ? (
          <label className="block text-sm">
            <span className="font-semibold">Staff emails (comma-separated)</span>
            <textarea
              value={ob.staffEmails.join(", ")}
              onChange={(e) =>
                updateOnboarding({
                  staffEmails: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
            />
          </label>
        ) : null}

        {step === 3 ? (
          <p className="text-sm text-[var(--cc-steel)]">
            After finish you can import CSV from{" "}
            <Link href="/app/roster/import" className="font-semibold text-[var(--cc-blue)]">
              Roster → Import
            </Link>
            .
          </p>
        ) : null}

        {step === 4 ? (
          <label className="block text-sm">
            <span className="font-semibold">MaxPreps team URL</span>
            <input
              value={ob.maxPrepsUrl}
              onChange={(e) =>
                updateOnboarding({ maxPrepsUrl: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-[var(--cc-line)] px-3 py-2"
              placeholder="https://www.maxpreps.com/..."
            />
          </label>
        ) : null}

        {step === 5 ? (
          <div className="text-sm text-[var(--cc-steel)]">
            <p>
              Creating <strong>{ob.programName || "New program"}</strong> (
              {ob.sport}) with levels {ob.levels.join(", ") || "none"}.
            </p>
            <p className="mt-2">
              Staff invites queued: {ob.staffEmails.length || 0}
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setOnboardingStep(Math.max(0, step - 1))}
            className="rounded-lg border border-[var(--cc-line)] px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Back
          </button>
          <PrimaryButton onClick={next}>
            {step >= STEPS.length - 1 ? "Finish" : "Continue"}
          </PrimaryButton>
        </div>
      </Panel>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AppProvider>
      <Wizard />
    </AppProvider>
  );
}
