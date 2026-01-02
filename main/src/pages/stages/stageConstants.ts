import type { StageTheme } from "@/data/defaultRegistry";
import { getAllRegistry, isYearKey } from "@/hooks/getAllRegistry";

// 年度表示に使うラベル。UIで見やすい表記に揃える
export const YEAR_LABELS = getAllRegistry().reduce(
  (accumulator, entry) => {
    accumulator[entry.key] = entry.label;
    return accumulator;
  },
  {} as Record<string, string>
);

// 年度ごとのカラーアクセント。アプリの雰囲気は崩さず差し色で変化を出す
export const YEAR_THEMES = getAllRegistry().reduce(
  (accumulator, entry) => {
    accumulator[entry.key] = entry.theme;
    return accumulator;
  },
  {} as Record<string, StageTheme>
);

// URLパラメータをYearKeyへ変換するためのガード
export { isYearKey };
