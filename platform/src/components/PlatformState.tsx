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
  seedAuditEvents,
  type AuditEvent,
  type LegalChecklistKey,
  type LegalChecklistState,
  type OrgCampus,
  type OrgDistrict,
  type ProgramConfig,
  type SportId,
  type SportProgram,
} from "@/lib/programConfig";

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
  auditEvents: AuditEvent[];
  logAudit: (action: string, detail: string, actor?: string) => void;
  ssoDemoConnected: boolean;
  setSsoDemoConnected: (v: boolean) => void;
  sportOptions: typeof SPORT_OPTIONS;
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
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(seedAuditEvents);
  const [ssoDemoConnected, setSsoDemoConnectedState] = useState(false);

  const logAudit = useCallback(
    (action: string, detail: string, actor = "Admin") => {
      setAuditEvents((prev) => [
        {
          id: `aud-${Date.now()}`,
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
      setPrograms((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((p) => p.id !== id);
        if (activeProgramId === id) setActiveProgramId(next[0]!.id);
        return next;
      });
      logAudit("offboard_program", `Removed program ${id}`);
    },
    [activeProgramId, logAudit],
  );

  const setLegalItem = useCallback(
    (key: LegalChecklistKey, value: boolean) => {
      setLegalChecklist((prev) => ({ ...prev, [key]: value }));
      logAudit("legal_checklist", `${key} → ${value ? "done" : "not done"}`);
    },
    [logAudit],
  );

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
      auditEvents,
      logAudit,
      ssoDemoConnected,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlatform() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}
