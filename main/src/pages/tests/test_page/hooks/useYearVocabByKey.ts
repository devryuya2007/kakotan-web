import {useUserConfig} from "./useUserConfig";

import {useYearVocab} from "@/hooks/useYearVocab";
import type {YearKey} from "@/data/vocabLoader";

export function useYearVocabByKey(year: YearKey) {
  const {config} = useUserConfig();
  const {sectionId, maxCount} = config[year];
  // 年度設定の問題数に合わせて語彙を読み込む
  return useYearVocab(sectionId, maxCount);
}
