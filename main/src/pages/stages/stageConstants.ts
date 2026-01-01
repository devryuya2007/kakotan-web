import { yearRegistry, type YearKey, type StageTheme, isYearKey } from "@/data/defaultRegistry";

// 年度表示に使うラベル。UIで見やすい表記に揃える
export const YEAR_LABELS = yearRegistry.reduce(
  (accumulator, entry) => {
    accumulator[entry.key] = entry.label;
    return accumulator;
  },
  {} as Record<YearKey, string>
);

// 年度ごとのカラーアクセント。アプリの雰囲気は崩さず差し色で変化を出す
export const YEAR_THEMES = yearRegistry.reduce(
  (accumulator, entry) => {
    accumulator[entry.key] = entry.theme;
    return accumulator;
  },
  {} as Record<YearKey, StageTheme>
);

// URLパラメータをYearKeyへ変換するためのガード
export { isYearKey };
