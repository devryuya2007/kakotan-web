import {yearRegistry, type YearKey} from "@/data/yearRegistry";

export interface YearConfigEntry {
  maxCount: number;
  sectionId: YearKey;
}

// 年度レジストリから初期設定を自動生成する
export const initialUserConfig = yearRegistry.reduce(
  (accumulator, entry) => {
    accumulator[entry.key] = {
      maxCount: entry.defaultQuestionCount,
      sectionId: entry.key,
    };
    return accumulator;
  },
  {} as Record<YearKey, YearConfigEntry>,
);
