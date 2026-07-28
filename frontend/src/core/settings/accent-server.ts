import { cookies } from "next/headers";

import {
  APPEARANCE_ACCENT_COOKIE_NAME,
  DEFAULT_APPEARANCE_ACCENT,
  normalizeAppearanceAccent,
  type AppearanceAccentId,
} from "./local";

/** Server-only: accent for root `<html data-accent>` (same source as client cookie). */
export async function detectAppearanceAccentServer(): Promise<AppearanceAccentId> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(APPEARANCE_ACCENT_COOKIE_NAME)?.value;
  if (!raw) {
    return DEFAULT_APPEARANCE_ACCENT;
  }
  try {
    return normalizeAppearanceAccent(decodeURIComponent(raw));
  } catch {
    return normalizeAppearanceAccent(raw);
  }
}
