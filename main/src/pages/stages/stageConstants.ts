import type {YearKey} from "@/data/vocabLoader";

// 年度表示に使うラベル。UIで見やすい表記に揃える
export const YEAR_LABELS: Record<YearKey, string> = {
  reiwa3: "Reiwa 3",
  reiwa4: "Reiwa 4",
  reiwa5: "Reiwa 5",
  reiwa6: "Reiwa 6",
  reiwa7: "Reiwa 7",
};

// 年度ごとのカラーアクセント。アプリの雰囲気は崩さず差し色で変化を出す
export interface StageTheme {
  accent: string;
  accentSoft: string;
  accentGlow: string;
}

export const YEAR_THEMES: Record<YearKey, StageTheme> = {
  reiwa3: {
    accent: "#63e6c0",
    accentSoft: "#a7f3db",
    accentGlow: "rgba(99, 230, 192, 0.35)",
  },
  reiwa4: {
    accent: "#5aa9ff",
    accentSoft: "#f7b36b",
    accentGlow: "rgba(90, 169, 255, 0.35)",
  },
  reiwa5: {
    accent: "#b77bff",
    accentSoft: "#6de7ff",
    accentGlow: "rgba(183, 123, 255, 0.35)",
  },
  reiwa6: {
    accent: "#ff8ba7",
    accentSoft: "#ffd6a5",
    accentGlow: "rgba(255, 139, 167, 0.3)",
  },
  reiwa7: {
    accent: "#b9f27c",
    accentSoft: "#74f0c2",
    accentGlow: "rgba(185, 242, 124, 0.3)",
  },
};

// URLパラメータをYearKeyへ変換するためのガード
export const isYearKey = (value: string): value is YearKey =>
  Object.keys(YEAR_LABELS).includes(value);
