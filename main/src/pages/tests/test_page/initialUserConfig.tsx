import {yearRegistry, type YearKey} from "@/data/yearRegistry";

export interface YearConfigEntry {
  maxCount: number;
  sectionId: YearKey;
}

export interface SoundPreferenceState {
  isSoundEnabled: boolean;
  isVibrationEnabled: boolean;
}

export interface UserConfigState {
  years: Record<YearKey, YearConfigEntry>;
  soundPreference: SoundPreferenceState;
}

// 年度レジストリから初期設定を自動生成する
const buildInitialYearConfig = (): Record<YearKey, YearConfigEntry> => {
  return yearRegistry.reduce(
    (accumulator, entry) => {
      accumulator[entry.key] = {
        maxCount: entry.defaultQuestionCount,
        sectionId: entry.key,
      };
      return accumulator;
    },
    {} as Record<YearKey, YearConfigEntry>,
  );
};

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
