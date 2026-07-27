import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  DEFAULT_APPEARANCE_ACCENT,
  DEFAULT_LOCAL_SETTINGS,
  applyAppearanceAccent,
  applyThreadModelOverride,
  readAppearanceAccent,
  saveAppearanceAccent,
  type AppearanceAccentId,
  type LocalSettings,
} from "./local";
import {
  getBaseSettingsSnapshot,
  getThreadModelSnapshot,
  subscribe,
  updateLocalSettings,
  updateThreadSettings,
  type LocalSettingsSetter,
} from "./store";

export function useLocalSettings(): [LocalSettings, LocalSettingsSetter] {
  const settings = useSyncExternalStore(
    subscribe,
    getBaseSettingsSnapshot,
    () => DEFAULT_LOCAL_SETTINGS,
  );

  const setSettings = useCallback<LocalSettingsSetter>((key, value) => {
    updateLocalSettings(key, value);
  }, []);

  return [settings, setSettings];
}

export function useThreadSettings(
  threadId: string,
): [LocalSettings, LocalSettingsSetter] {
  const baseSettings = useSyncExternalStore(
    subscribe,
    getBaseSettingsSnapshot,
    () => DEFAULT_LOCAL_SETTINGS,
  );

  const threadModelName = useSyncExternalStore(
    subscribe,
    () => getThreadModelSnapshot(threadId),
    () => undefined,
  );

  const settings = useMemo(
    () => applyThreadModelOverride(baseSettings, threadModelName),
    [baseSettings, threadModelName],
  );

  const setSettings = useCallback<LocalSettingsSetter>(
    (key, value) => {
      updateThreadSettings(threadId, key, value);
    },
    [threadId],
  );

  return [settings, setSettings];
}

export function useAppearanceAccent() {
  const [accent, setAccentState] = useState<AppearanceAccentId>(() =>
    typeof window === "undefined"
      ? DEFAULT_APPEARANCE_ACCENT
      : readAppearanceAccent(),
  );

  useEffect(() => {
    const id = readAppearanceAccent();
    applyAppearanceAccent(id);
    setAccentState(id);
  }, []);

  const setAccent = useCallback((id: AppearanceAccentId) => {
    saveAppearanceAccent(id);
    applyAppearanceAccent(id);
    setAccentState(id);
  }, []);

  return { accent, setAccent };
}
