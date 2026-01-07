import { useMemo } from "react";

import { getAllRegistry } from "@/hooks/getAllRegistry";

import { getYearLabels, isYearKey } from "../stageConstants";

interface StageRouteParamsInput {
  yearParam: string | undefined;
  stageParam: string | undefined;
  configuredCounts: Record<string, { maxCount: number }>;
}

interface StageRouteParamsResult {
  isValidYear: boolean;
  year: string;
  yearLabel: string;
  stageNumber: number;
  baseQuestionCount: number;
}

// URLと設定からステージ表示に必要な値をまとめる
export const useStageRouteParams = ({
  yearParam,
  stageParam,
  configuredCounts,
}: StageRouteParamsInput): StageRouteParamsResult => {
  const registry = getAllRegistry();
  const yearLabels = getYearLabels();

  return useMemo(() => {
    // URLの年度が有効かチェックして、無効ならデフォルトに切り替える
    const isValidYear = typeof yearParam === "string" && isYearKey(yearParam);

    // 年度とステージ番号を確定させる
    const fallbackYear = registry[0]?.key ?? "reiwa3";
    const year =
      typeof yearParam === "string" && isYearKey(yearParam) ? yearParam : fallbackYear;

    // ステージ番号は1以上の数値に丸めておく
    const parsedStageNumber = Number(stageParam ?? "1");
    const stageNumber =
      Number.isFinite(parsedStageNumber) && parsedStageNumber > 0
        ? parsedStageNumber
        : 1;

    const yearEntry = registry.find((entry) => entry.key === year);
    const baseQuestionCount =
      configuredCounts[year]?.maxCount ?? yearEntry?.defaultQuestionCount ?? 10;
    const yearLabel = yearLabels[year] ?? yearEntry?.label ?? year;

    return {
      isValidYear,
      year,
      yearLabel,
      stageNumber,
      baseQuestionCount,
    };
  }, [configuredCounts, registry, stageParam, yearLabels, yearParam]);
};
