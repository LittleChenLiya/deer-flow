export const SIDEBAR_WIDTH_STORAGE_KEY = "deerflow_sidebar_width_px";

export const SIDEBAR_WIDTH_DEFAULT_PX = 256;
/** Icon-only rail width (`3rem` in sidebar.tsx). */
export const SIDEBAR_WIDTH_ICON_PX = 48;
/** Narrowest width while expanded; drag below → icon-only mode. */
export const SIDEBAR_WIDTH_MIN_PX = 56;
export const SIDEBAR_WIDTH_MAX_PX = 360;

export function clampSidebarWidthPx(value: number): number {
  return Math.min(
    SIDEBAR_WIDTH_MAX_PX,
    Math.max(SIDEBAR_WIDTH_MIN_PX, Math.round(value)),
  );
}

/** True when drag target is icon-only — collapse `open` instead of clamping. */
export function isSidebarIconCollapseWidth(widthPx: number): boolean {
  return widthPx < SIDEBAR_WIDTH_MIN_PX;
}

export function readSidebarWidthPx(): number {
  if (typeof window === "undefined") {
    return SIDEBAR_WIDTH_DEFAULT_PX;
  }
  try {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (!raw) return SIDEBAR_WIDTH_DEFAULT_PX;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return SIDEBAR_WIDTH_DEFAULT_PX;
    return clampSidebarWidthPx(parsed);
  } catch {
    return SIDEBAR_WIDTH_DEFAULT_PX;
  }
}

export function writeSidebarWidthPx(width: number): void {
  try {
    localStorage.setItem(
      SIDEBAR_WIDTH_STORAGE_KEY,
      String(clampSidebarWidthPx(width)),
    );
  } catch {
    // ignore quota / private mode
  }
}
