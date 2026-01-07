import type { SoundPreferenceState, UserConfigState, YearConfigEntry } from "./initialUserConfig";

const USER_CONFIG_STORAGE_KEY = "user-config:max-count";

interface LoadUserConfigOptions {
  initialConfig: UserConfigState;
  syncConfigWithRegistry: (current: UserConfigState) => UserConfigState;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

// localStorageから設定を読み出し、旧形式を吸収した上で返す
export const loadUserConfig = ({ initialConfig, syncConfigWithRegistry }: LoadUserConfigOptions) => {
  // SSR環境ではlocalStorageを触らない
  if (typeof window === "undefined") return initialConfig;
  try {
    const raw = window.localStorage.getItem(USER_CONFIG_STORAGE_KEY);
    if (!raw) return initialConfig;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return initialConfig;

    // 旧形式（年度ごとの設定だけ）も吸収して互換性を保つ
    if (!("years" in parsed)) {
      const legacy = parsed as Record<string, YearConfigEntry>;
      return syncConfigWithRegistry({
        ...initialConfig,
        years: {
          ...initialConfig.years,
          ...legacy,
        },
      });
    }

    const nextSoundPreference: SoundPreferenceState = {
      ...initialConfig.soundPreference,
      ...(isRecord(parsed.soundPreference) ? parsed.soundPreference : {}),
    };
    const nextYears = isRecord(parsed.years)
      ? { ...initialConfig.years, ...(parsed.years as Record<string, YearConfigEntry>) }
      : initialConfig.years;
    return syncConfigWithRegistry({
      ...initialConfig,
      ...parsed,
      years: nextYears,
      soundPreference: nextSoundPreference,
    });
  } catch (error) {
    console.warn("Failed to load user config", error);
    return initialConfig;
  }
};

// 設定の保存だけを担当してUIロジックから切り離す
export const persistUserConfig = (config: UserConfigState) => {
  // SSR環境ではlocalStorageを触らない
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn("Failed to persist user config", error);
  }
};
