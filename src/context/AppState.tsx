"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { defaultPageForRole } from "@/lib/permissions";
import type { AppPage, Role, Side } from "@/lib/types";

type AppState = {
  role: Role;
  setRole: (r: Role) => void;
  side: Side;
  setSide: (s: Side) => void;
  page: AppPage;
  setPage: (p: AppPage) => void;
  season: string;
  teachOpen: boolean;
  setTeachOpen: (v: boolean) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("coach");
  const [side, setSide] = useState<Side>("defense");
  const [page, setPage] = useState<AppPage>("this-week");
  const [teachOpen, setTeachOpen] = useState(false);
  const season = "2026";

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    setPage(defaultPageForRole(r));
    setTeachOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      side,
      setSide,
      page,
      setPage,
      season,
      teachOpen,
      setTeachOpen,
    }),
    [role, setRole, side, page, season, teachOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
