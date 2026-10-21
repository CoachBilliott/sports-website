/**
 * Product rollout only. These settings control what the football entry experience
 * promotes and which unreleased surface placeholder it shows. This is not
 * authorization, data filtering, or production readiness.
 * Change a stage deliberately when that sport/surface has passed its own pilot.
 */
export type ReleaseStage = "planned" | "pilot" | "released";

export const PRODUCT_RELEASE = {
  sports: {
    football: "pilot",
    volleyball: "planned",
    basketball: "planned",
    soccer: "planned",
    baseball: "planned",
    softball: "planned",
    track: "planned",
    generic: "planned",
  },
  surfaces: {
    football: "pilot",
    district: "planned",
  },
  districtEntry: "placeholder-until-surface-release",
} as const satisfies {
  sports: Record<string, ReleaseStage>;
  surfaces: Record<string, ReleaseStage>;
  districtEntry: "placeholder-until-surface-release";
};

export type ProductSport = keyof typeof PRODUCT_RELEASE.sports;
export type ProductSurface = keyof typeof PRODUCT_RELEASE.surfaces;

export function isSportPromoted(sport: string): boolean {
  if (!Object.hasOwn(PRODUCT_RELEASE.sports, sport)) return false;
  return PRODUCT_RELEASE.sports[sport as ProductSport] !== "planned";
}

export function isSurfacePromoted(surface: string): boolean {
  if (!Object.hasOwn(PRODUCT_RELEASE.surfaces, surface)) return false;
  return PRODUCT_RELEASE.surfaces[surface as ProductSurface] !== "planned";
}

export const releasedSportIds = () => Object.keys(PRODUCT_RELEASE.sports).filter(isSportPromoted);

/** Only this list is rendered as cross-product links from the football entry. */
export function footballProductLinks(): { href: string; label: string }[] {
  return isSurfacePromoted("district") ? [{ href: "/district/demo", label: "Platform" }] : [];
}

/** One deliberate surface-stage switch restores the existing district routing. */
export function shouldShowDistrictPlaceholder(pathname: string, stage: ReleaseStage = PRODUCT_RELEASE.surfaces.district): boolean {
  const districtPath = pathname === "/district" || pathname.startsWith("/district/");
  return districtPath && stage === "planned";
}
