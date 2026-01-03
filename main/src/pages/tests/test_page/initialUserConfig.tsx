import { buildRegistryMap, type RegistryMap } from "@/hooks/getAllRegistry";

export interface YearConfigEntry {
  maxCount: number;
  sectionId: string;
}

export interface SoundPreferenceState {
  isSoundEnabled: boolean;
  isVibrationEnabled: boolean;
}

export interface UserConfigState {
  years: Record<string, YearConfigEntry>;
  soundPreference: SoundPreferenceState;
}

// 年度レジストリから初期設定を自動生成する
const buildInitialYearConfig = (): RegistryMap<YearConfigEntry> =>
  buildRegistryMap((entry) => ({
    maxCount: entry.defaultQuestionCount,
    sectionId: entry.sectionLabel,
  }));

// 音とバイブの初期設定はONにして、既存の体験を保つ
const buildInitialSoundPreference = (): SoundPreferenceState => {
  return {
    isSoundEnabled: true,
    isVibrationEnabled: true,
  };
};

// ユーザー設定の初期値をまとめる
export const initialUserConfig: UserConfigState = {
  years: buildInitialYearConfig(),
  soundPreference: buildInitialSoundPreference(),
};
