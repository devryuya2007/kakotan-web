import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import {
  initialUserConfig,
  type SoundPreferenceState,
  type UserConfigState,
  type YearConfigEntry,
} from "./initialUserConfig";
import { type UserConfigContextValue, UserConfigContext } from "./userConfigStore";
import { loadUserConfig, persistUserConfig } from "./userConfigStorage";
import { PLAYER_REGISTRY_UPDATED_EVENT } from "@/data/userYearRegistry";
import type { YearKey } from "@/data/vocabLoader";
import { getAllRegistry } from "@/hooks/getAllRegistry";

// レジストリの最新状態に合わせてyear設定を補完/整理する
const syncConfigWithRegistry = (current: UserConfigState): UserConfigState => {
  const registry = getAllRegistry();
  const registryKeys = new Set(registry.map((entry) => entry.key));
  let changed = false;
  const nextYears: Record<string, YearConfigEntry> = {};

  registry.forEach((entry) => {
    const stored = current.years[entry.key];
    if (stored) {
      nextYears[entry.key] = stored;
      return;
    }
    changed = true;
    nextYears[entry.key] = {
      maxCount: entry.defaultQuestionCount ?? 10,
      sectionId: entry.sectionLabel ?? entry.label,
    };
  });

  if (Object.keys(current.years).some((key) => !registryKeys.has(key))) {
    changed = true;
  }

  if (!changed) return current;
  return {
    ...current,
    years: nextYears,
  };
};

export function UserConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UserConfigState>(() =>
    loadUserConfig({
      initialConfig: initialUserConfig,
      syncConfigWithRegistry,
    })
  );

  useEffect(() => {
    const syncConfig = () => {
      setConfig((prev) => syncConfigWithRegistry(prev));
    };

    // 画面起動時に追加語彙の設定を補完する
    syncConfig();

    if (typeof window === "undefined") return;
    window.addEventListener(PLAYER_REGISTRY_UPDATED_EVENT, syncConfig);
    return () => {
      window.removeEventListener(PLAYER_REGISTRY_UPDATED_EVENT, syncConfig);
    };
  }, []);

  useEffect(() => {
    persistUserConfig(config);
  }, [config]);

  const setMaxCount = useCallback((year: YearKey, value: number) => {
    setConfig((prev) => ({
      ...prev,
      years: {
        ...prev.years,
        [year]: { ...prev.years[year], maxCount: value },
      },
    }));
  }, []);

  const updateSoundPreference = useCallback((next: Partial<SoundPreferenceState>) => {
    setConfig((prev) => ({
      ...prev,
      soundPreference: {
        ...prev.soundPreference,
        ...next,
      },
    }));
  }, []);

  const setSoundEnabled = useCallback(
    (value: boolean) => {
      updateSoundPreference({ isSoundEnabled: value });
    },
    [updateSoundPreference]
  );

  const setVibrationEnabled = useCallback(
    (value: boolean) => {
      updateSoundPreference({ isVibrationEnabled: value });
    },
    [updateSoundPreference]
  );

  const value = useMemo<UserConfigContextValue>(
    () => ({
      config,
      setMaxCount,
      setSoundEnabled,
      setVibrationEnabled,
      updateSoundPreference,
    }),
    [config, setMaxCount, setSoundEnabled, setVibrationEnabled, updateSoundPreference]
  );

  return <UserConfigContext.Provider value={value}>{children}</UserConfigContext.Provider>;
}
