import type { StageTheme } from "@/data/defaultRegistry";
import {
  buildRegistryMap,
  isYearKey,
  type RegistryMap
} from "@/hooks/getAllRegistry";

// 年度表示に使うラベル。UIで見やすい表記に揃える
export const getYearLabels = (): RegistryMap<string> =>
  buildRegistryMap((entry) => entry.label);

// 年度ごとのカラーアクセント。アプリの雰囲気は崩さず差し色で変化を出す
export const getYearThemes = (): RegistryMap<StageTheme> =>
  buildRegistryMap((entry) => entry.theme);

// URLパラメータをYearKeyへ変換するためのガード
export { isYearKey };
