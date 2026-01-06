import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import {
  initialUserConfig,
  type SoundPreferenceState,
  type UserConfigState,
  type YearConfigEntry,
} from "./initialUserConfig";
import { type UserConfigContextValue, UserConfigContext } from "./userConfigStore";
import { PLAYER_REGISTRY_UPDATED_EVENT } from "@/data/userYearRegistry";
import type { YearKey } from "@/data/vocabLoader";
import { getAllRegistry } from "@/hooks/getAllRegistry";

const USER_CONFIG_STORAGE_KEY = "user-config:max-count";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

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

const loadStoredConfig = (): UserConfigState => {
  if (typeof window === "undefined") return initialUserConfig;
  try {
    const raw = window.localStorage.getItem(USER_CONFIG_STORAGE_KEY);
    if (!raw) return initialUserConfig;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return initialUserConfig;

    // 旧形式（年度ごとの設定だけ）も吸収して互換性を保つ
    if (!("years" in parsed)) {
      const legacy = parsed as Record<string, YearConfigEntry>;
      return syncConfigWithRegistry({
        ...initialUserConfig,
        years: {
          ...initialUserConfig.years,
          ...legacy,
        },
      });
    }

    const nextSoundPreference: SoundPreferenceState = {
      ...initialUserConfig.soundPreference,
      ...(isRecord(parsed.soundPreference) ? parsed.soundPreference : {}),
    };
    const nextYears = isRecord(parsed.years)
      ? { ...initialUserConfig.years, ...(parsed.years as Record<string, YearConfigEntry>) }
      : initialUserConfig.years;
    return syncConfigWithRegistry({
      ...initialUserConfig,
      ...parsed,
      years: nextYears,
      soundPreference: nextSoundPreference,
    });
  } catch (error) {
    console.warn("Failed to load user config", error);
    return initialUserConfig;
  }
};

export function UserConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UserConfigState>(() => loadStoredConfig());

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
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(USER_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn("Failed to persist user config", error);
    }
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
