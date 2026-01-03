import type { StageTheme } from "@/data/defaultRegistry";
import { getAllRegistry, isYearKey } from "@/hooks/getAllRegistry";

// 年度表示に使うラベル。UIで見やすい表記に揃える
export const getYearLabels = (): Record<string, string> => {
  return getAllRegistry().reduce(
    (accumulator, entry) => {
      accumulator[entry.key] = entry.label;
      return accumulator;
    },
    {} as Record<string, string>
  );
};

// 年度ごとのカラーアクセント。アプリの雰囲気は崩さず差し色で変化を出す
export const getYearThemes = (): Record<string, StageTheme> => {
  return getAllRegistry().reduce(
    (accumulator, entry) => {
      accumulator[entry.key] = entry.theme;
      return accumulator;
    },
    {} as Record<string, StageTheme>
  );
};

// URLパラメータをYearKeyへ変換するためのガード
export { isYearKey };
