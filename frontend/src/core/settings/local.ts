import type { TokenUsageInlineMode } from "../messages/usage-model";
import type { AgentThreadContext } from "../threads";

export const DEFAULT_LOCAL_SETTINGS: LocalSettings = {
  notification: {
    enabled: true,
  },
  tokenUsage: {
    headerTotal: true,
    inlineMode: "per_turn",
  },
  context: {
    model_name: undefined,
    mode: undefined,
    reasoning_effort: undefined,
  },
};

export const LOCAL_SETTINGS_KEY = "deerflow.local-settings";
export const THREAD_MODEL_KEY_PREFIX = "deerflow.thread-model.";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Best-effort localStorage facade.
 *
 * Safari private mode, Firefox strict containers, some embedded WebViews, and
 * quotas already filled by sibling tabs throw ``SecurityError`` or
 * ``QuotaExceededError`` from ``getItem``/``setItem``. Without a guard those
 * exceptions bubble into React render handlers and break the composer /
 * settings panel. This wrapper traps every storage exception so callers can
 * always fall back to a sane default.
 */
export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (!isBrowser()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): boolean {
    if (!isBrowser()) return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem(key: string): boolean {
    if (!isBrowser()) return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

export interface LocalSettings {
  notification: {
    enabled: boolean;
  };
  tokenUsage: {
    headerTotal: boolean;
    inlineMode: TokenUsageInlineMode;
  };
  context: Omit<
    AgentThreadContext,
    | "thread_id"
    | "is_plan_mode"
    | "thinking_enabled"
    | "subagent_enabled"
    | "model_name"
    | "reasoning_effort"
  > & {
    model_name?: string | undefined;
    mode: "flash" | "thinking" | "pro" | "ultra" | undefined;
    reasoning_effort?: "minimal" | "low" | "medium" | "high";
  };
}

function mergeLocalSettings(settings?: Partial<LocalSettings>): LocalSettings {
  return {
    ...DEFAULT_LOCAL_SETTINGS,
    context: {
      ...DEFAULT_LOCAL_SETTINGS.context,
      ...settings?.context,
    },
    tokenUsage: {
      ...DEFAULT_LOCAL_SETTINGS.tokenUsage,
      ...settings?.tokenUsage,
    },
    notification: {
      ...DEFAULT_LOCAL_SETTINGS.notification,
      ...settings?.notification,
    },
  };
}

function getThreadModelStorageKey(threadId: string): string {
  return `${THREAD_MODEL_KEY_PREFIX}${threadId}`;
}

export function getThreadModelName(threadId: string): string | undefined {
  if (!isBrowser()) {
    return undefined;
  }
  return (
    safeLocalStorage.getItem(getThreadModelStorageKey(threadId)) ?? undefined
  );
}

export function saveThreadModelName(
  threadId: string,
  modelName: string | undefined,
) {
  if (!isBrowser()) {
    return;
  }
  const key = getThreadModelStorageKey(threadId);
  if (!modelName) {
    safeLocalStorage.removeItem(key);
    return;
  }
  safeLocalStorage.setItem(key, modelName);
}

export function applyThreadModelOverride(
  settings: LocalSettings,
  threadModelName: string | undefined,
): LocalSettings {
  if (!threadModelName) {
    return settings;
  }
  return {
    ...settings,
    context: {
      ...settings.context,
      model_name: threadModelName,
    },
  };
}

export function getLocalSettings(): LocalSettings {
  if (!isBrowser()) {
    return DEFAULT_LOCAL_SETTINGS;
  }
  const json = safeLocalStorage.getItem(LOCAL_SETTINGS_KEY);
  try {
    if (json) {
      const settings = JSON.parse(json) as Partial<LocalSettings>;
      return mergeLocalSettings(settings);
    }
  } catch {}
  return DEFAULT_LOCAL_SETTINGS;
}

export function saveLocalSettings(settings: LocalSettings) {
  if (!isBrowser()) {
    return;
  }
  safeLocalStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}

// --- Workspace accent (`data-accent` on <html>; cookie for SSR, localStorage legacy) ---

export const APPEARANCE_ACCENT_STORAGE_KEY = "deerflow.appearance-accent";

/** Cookie name — server reads this in root layout; client sets on save. */
export const APPEARANCE_ACCENT_COOKIE_NAME = APPEARANCE_ACCENT_STORAGE_KEY;

export const APPEARANCE_ACCENT_IDS = [
  "default",
  "ocean",
  "forest",
  "grape",
  "sunset",
  "rose",
] as const;

export type AppearanceAccentId = (typeof APPEARANCE_ACCENT_IDS)[number];

export const DEFAULT_APPEARANCE_ACCENT: AppearanceAccentId = "default";

/** Preview swatch (CSS background) for settings UI. */
export const APPEARANCE_ACCENT_SWATCH: Record<AppearanceAccentId, string> = {
  default: "oklch(0.25 0 0)",
  ocean: "oklch(0.74 0.12 255)",
  forest: "oklch(0.74 0.09 155)",
  grape: "oklch(0.76 0.14 300)",
  sunset: "oklch(0.82 0.12 55)",
  rose: "oklch(0.78 0.12 12)",
};

function isAppearanceAccentId(value: string): value is AppearanceAccentId {
  return (APPEARANCE_ACCENT_IDS as readonly string[]).includes(value);
}

export function normalizeAppearanceAccent(
  value: string | null | undefined,
): AppearanceAccentId {
  if (value && isAppearanceAccentId(value)) {
    return value;
  }
  return DEFAULT_APPEARANCE_ACCENT;
}

function getAppearanceAccentFromCookie(): AppearanceAccentId | null {
  if (!isBrowser()) {
    return null;
  }
  for (const part of document.cookie.split(";")) {
    const [name, rawValue] = part.trim().split("=");
    if (name === APPEARANCE_ACCENT_COOKIE_NAME) {
      try {
        return normalizeAppearanceAccent(decodeURIComponent(rawValue ?? ""));
      } catch {
        return normalizeAppearanceAccent(rawValue);
      }
    }
  }
  return null;
}

function setAppearanceAccentInCookie(id: AppearanceAccentId): void {
  if (!isBrowser()) {
    return;
  }
  const maxAge = 365 * 24 * 60 * 60;
  if (id === DEFAULT_APPEARANCE_ACCENT) {
    document.cookie = `${APPEARANCE_ACCENT_COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
    return;
  }
  document.cookie = `${APPEARANCE_ACCENT_COOKIE_NAME}=${encodeURIComponent(id)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

export function readAppearanceAccent(): AppearanceAccentId {
  if (!isBrowser()) {
    return DEFAULT_APPEARANCE_ACCENT;
  }
  const fromCookie = getAppearanceAccentFromCookie();
  if (fromCookie !== null) {
    return fromCookie;
  }
  const raw = safeLocalStorage.getItem(APPEARANCE_ACCENT_STORAGE_KEY);
  const fromStorage = normalizeAppearanceAccent(raw);
  if (fromStorage !== DEFAULT_APPEARANCE_ACCENT) {
    setAppearanceAccentInCookie(fromStorage);
  }
  return fromStorage;
}

export function saveAppearanceAccent(id: AppearanceAccentId) {
  if (!isBrowser()) {
    return;
  }
  safeLocalStorage.setItem(APPEARANCE_ACCENT_STORAGE_KEY, id);
  setAppearanceAccentInCookie(id);
}

export function applyAppearanceAccent(id: AppearanceAccentId) {
  if (typeof document === "undefined") {
    return;
  }
  const root = document.documentElement;
  if (id === "default") {
    root.removeAttribute("data-accent");
  } else {
    root.setAttribute("data-accent", id);
  }
}
