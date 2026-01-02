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
