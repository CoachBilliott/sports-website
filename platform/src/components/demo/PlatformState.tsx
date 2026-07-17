"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_CAMPUS,
  SEED_DISTRICT,
  SEED_PROGRAMS,
  SPORT_OPTIONS,
  configForProgram,
  emptyLegalChecklist,
  emptySafetyToggles,
  seedAuditEvents,
  type AuditEvent,
  type LegalChecklistKey,
  type LegalChecklistState,
  type OrgCampus,
  type OrgDistrict,
  type ProgramConfig,
  type SafetyToggleKey,
  type SafetyToggleState,
  type SportId,
  type SportProgram,
} from "@/lib/programConfig";
import { DEMO_SCRIPT } from "@/lib/demoContent";

export type PlatformPage =
  | "overview"
  | "district"
  | "programs"
  | "legal"
  | "audit"
  | "data"
  | "fan"
  | "parent";

type PlatformContextValue = {
  page: PlatformPage;
  setPage: (p: PlatformPage) => void;
  district: OrgDistrict;
  campus: OrgCampus;
  programs: SportProgram[];
  activeProgramId: string;
  activeProgram: SportProgram;
  activeConfig: ProgramConfig;
  setActiveProgram: (id: string) => void;
  addProgram: (input: {
    name: string;
    sport: SportId;
    seasonLabel?: string;
  }) => void;
  removeProgram: (id: string) => void;
  legalChecklist: LegalChecklistState;
  setLegalItem: (key: LegalChecklistKey, value: boolean) => void;
  safetyToggles: SafetyToggleState;
  setSafetyToggle: (key: SafetyToggleKey, value: boolean) => void;
  auditEvents: AuditEvent[];
  logAudit: (action: string, detail: string, actor?: string) => void;
  ssoDemoConnected: boolean;
  setSsoDemoConnected: (v: boolean) => void;
  sportOptions: typeof SPORT_OPTIONS;
  parentOptOuts: Set<string>;
  toggleParentOptOut: (athleteKey: string) => void;
  presentMode: boolean;
  setPresentMode: (v: boolean) => void;
  scriptStep: number;
  setScriptStep: (n: number) => void;
  advanceScript: () => void;
  scriptDone: Set<string>;
  markScriptStep: (id: string) => void;
  resetDemo: () => void;
  deletionCert: string | null;
  setDeletionCert: (v: string | null) => void;
};

const Ctx = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PlatformPage>("overview");
  const [programs, setPrograms] = useState<SportProgram[]>(() => [
    ...SEED_PROGRAMS,
  ]);
  const [activeProgramId, setActiveProgramId] = useState(SEED_PROGRAMS[0]!.id);
  const [legalChecklist, setLegalChecklist] =
    useState<LegalChecklistState>(emptyLegalChecklist);
  const [safetyToggles, setSafetyToggles] =
    useState<SafetyToggleState>(emptySafetyToggles);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(seedAuditEvents);
  const [ssoDemoConnected, setSsoDemoConnectedState] = useState(false);
  const [parentOptOuts, setParentOptOuts] = useState<Set<string>>(
    () => new Set(),
  );
  const [presentMode, setPresentMode] = useState(false);
  const [scriptStep, setScriptStep] = useState(0);
  const [scriptDone, setScriptDone] = useState<Set<string>>(() => new Set());
  const [deletionCert, setDeletionCert] = useState<string | null>(null);

  const logAudit = useCallback(
    (action: string, detail: string, actor = "Admin") => {
      setAuditEvents((prev) => [
        {
          id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          at: new Date().toISOString(),
          actor,
          action,
          detail,
        },
        ...prev,
      ]);
    },
    [],
  );

  const setActiveProgram = useCallback(
    (id: string) => {
      setActiveProgramId(id);
      const prog = programs.find((p) => p.id === id);
      logAudit(
        "switch_program",
        prog
          ? `Active program → ${prog.name} (${prog.sport})`
          : `Active program → ${id}`,
      );
    },
    [logAudit, programs],
  );

  const addProgram = useCallback(
    (input: { name: string; sport: SportId; seasonLabel?: string }) => {
      const id = `prog-${input.sport}-${Date.now()}`;
      const next: SportProgram = {
        id,
        name: input.name.trim() || input.sport,
        sport: input.sport,
        seasonLabel: input.seasonLabel?.trim() || "2026",
        campusId: SEED_CAMPUS.id,
      };
      setPrograms((prev) => [...prev, next]);
      setActiveProgramId(id);
      logAudit(
        "add_program",
        `Added ${next.name} · ${next.sport} · ${next.seasonLabel}`,
      );
    },
    [logAudit],
  );

  const removeProgram = useCallback(
    (id: string) => {
      const prog = programs.find((p) => p.id === id);
      setPrograms((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((p) => p.id !== id);
        if (activeProgramId === id) setActiveProgramId(next[0]!.id);
        return next;
      });
      logAudit(
        "offboard_program",
        `Removed program ${prog?.name ?? id}`,
      );
      setDeletionCert(
        `OFFBOARD CERTIFICATE (demo)\nProgram: ${prog?.name ?? id}\nAt: ${new Date().toISOString()}\nActor: Admin\nScope: session-only purge simulation`,
      );
    },
    [activeProgramId, logAudit, programs],
  );

  const setLegalItem = useCallback(
    (key: LegalChecklistKey, value: boolean) => {
      setLegalChecklist((prev) => ({ ...prev, [key]: value }));
      logAudit("legal_checklist", `${key} → ${value ? "done" : "not done"}`);
    },
    [logAudit],
  );

  const setSafetyToggle = useCallback(
    (key: SafetyToggleKey, value: boolean) => {
      setSafetyToggles((prev) => ({ ...prev, [key]: value }));
      logAudit("safety_control", `${key} → ${value ? "on" : "off"}`);
    },
    [logAudit],
  );

  const toggleParentOptOut = useCallback(
    (athleteKey: string) => {
      setParentOptOuts((prev) => {
        const next = new Set(prev);
        if (next.has(athleteKey)) next.delete(athleteKey);
        else next.add(athleteKey);
        logAudit(
          "directory_opt_out",
          `${athleteKey} → ${next.has(athleteKey) ? "opted out of Fan directory" : "visible on Fan"}`,
        );
        return next;
      });
    },
    [logAudit],
  );

  const markScriptStep = useCallback((id: string) => {
    setScriptDone((prev) => new Set(prev).add(id));
  }, []);

  const advanceScript = useCallback(() => {
    if (scriptStep >= DEMO_SCRIPT.length) {
      setScriptStep(0);
      setScriptDone(new Set());
      setPage("overview");
      return;
    }
    const step = DEMO_SCRIPT[scriptStep];
    if (step) {
      markScriptStep(step.id);
      setPage(step.page);
    }
    setScriptStep((n) => Math.min(n + 1, DEMO_SCRIPT.length));
  }, [markScriptStep, scriptStep]);

  const resetDemo = useCallback(() => {
    setPrograms([...SEED_PROGRAMS]);
    setActiveProgramId(SEED_PROGRAMS[0]!.id);
    setLegalChecklist(emptyLegalChecklist());
    setSafetyToggles(emptySafetyToggles());
    setAuditEvents(seedAuditEvents());
    setSsoDemoConnectedState(false);
    setParentOptOuts(new Set());
    setPresentMode(false);
    setScriptStep(0);
    setScriptDone(new Set());
    setDeletionCert(null);
    setPage("overview");
    logAudit("demo_reset", "Reset session to seed demo state");
  }, [logAudit]);

  const activeProgram =
    programs.find((p) => p.id === activeProgramId) ?? programs[0]!;
  const activeConfig = configForProgram(activeProgram);

  const value = useMemo<PlatformContextValue>(
    () => ({
      page,
      setPage,
      district: SEED_DISTRICT,
      campus: SEED_CAMPUS,
      programs,
      activeProgramId: activeProgram.id,
      activeProgram,
      activeConfig,
      setActiveProgram,
      addProgram,
      removeProgram,
      legalChecklist,
      setLegalItem,
      safetyToggles,
      setSafetyToggle,
      auditEvents,
      logAudit,
      ssoDemoConnected,
      setSsoDemoConnected: (v) => {
        setSsoDemoConnectedState(v);
        logAudit(
          "sso_demo",
          v ? "Marked SSO as connected (demo)" : "SSO marked disconnected",
        );
      },
      sportOptions: SPORT_OPTIONS,
      parentOptOuts,
      toggleParentOptOut,
      presentMode,
      setPresentMode: (v) => {
        setPresentMode(v);
        logAudit("present_mode", v ? "Entered present mode" : "Exited present mode");
      },
      scriptStep,
      setScriptStep,
      advanceScript,
      scriptDone,
      markScriptStep,
      resetDemo,
      deletionCert,
      setDeletionCert,
    }),
    [
      page,
      programs,
      activeProgram,
      activeConfig,
      setActiveProgram,
      addProgram,
      removeProgram,
      legalChecklist,
      setLegalItem,
      safetyToggles,
      setSafetyToggle,
      auditEvents,
      logAudit,
      ssoDemoConnected,
      parentOptOuts,
      toggleParentOptOut,
      presentMode,
      scriptStep,
      advanceScript,
      scriptDone,
      markScriptStep,
      resetDemo,
      deletionCert,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlatform() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}
