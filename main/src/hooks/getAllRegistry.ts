import { defaultRegistry, type StageTheme } from "@/data/defaultRegistry";
import { loadPlayerRegistry, type PlayerRegistryEntry } from "@/data/userYearRegistry";
import type { VocabEntry } from "@/data/vocabTypes";

// 既存のyearRegistryとユーザー追加語彙を同じ形で扱うための共通型
export interface RegistryEntry {
  key: string;
  label: string;
  sectionLabel: string;
  vocab: VocabEntry[];
  theme: StageTheme;
  defaultQuestionCount: number;
}

// レジストリのKey->Valueマップを扱う共通型
export interface RegistryMap<T> {
  [key: string]: T;
}

// ユーザー追加語彙の見た目用テーマ（固定）
const playerTheme: StageTheme = {
  accent: "#7dd3fc",
  accentSoft: "#bae6fd",
  accentGlow: "rgba(125, 211, 252, 0.35)"
};

// playerRegistryの1件をyearRegistry互換の形に変換する
const toRegistryEntry = (entry: PlayerRegistryEntry): RegistryEntry => ({
  key: entry.key,
  label: entry.label,
  sectionLabel: entry.label,
  vocab: entry.vocab,
  theme: playerTheme,
  defaultQuestionCount: 20
});

// yearRegistry + playerRegistry を合体して返す
export const getAllRegistry = (): RegistryEntry[] => {
  const baseEntries: RegistryEntry[] = defaultRegistry.map((entry) => ({
    ...entry
  }));
  const playerEntries = loadPlayerRegistry().map(toRegistryEntry);

  return [...baseEntries, ...playerEntries];
};

// レジストリ配列からKey->Valueの形へ変換する
export const buildRegistryMap = <T>(
  builder: (entry: RegistryEntry) => T
): RegistryMap<T> => {
  return getAllRegistry().reduce((accumulator, entry) => {
    accumulator[entry.key] = builder(entry);
    return accumulator;
  }, {} as RegistryMap<T>);
};

// URLなどの文字列から有効なキーかどうか判定する
export const isYearKey = (value: string): value is string => {
  const registry = getAllRegistry();
  return registry.some((entry) => entry.key === value);
};

// 年度情報を取得する（存在しない場合は先頭年度を返す）
export const getYearEntry = (year: string): RegistryEntry => {
  const registry = getAllRegistry();
  return registry.find((entry) => entry.key === year) ?? registry[0];
};
