import {useEffect, useState} from "react";

import {loadYearVocab} from "@/data/vocabLoader";
import type {YearKey} from "@/data/vocabLoader";
import {
  createStageDefinitions,
  type StageDefinition,
} from "@/features/stages/stageUtils";

// ステージ一覧を作るためのフック。年度 + 設定問題数から自動生成する
export interface UseStageDefinitionsResult {
  status: "idle" | "loading" | "ready" | "error";
  stages: StageDefinition[];
  totalWords: number;
  normalizedQuestionCount: number;
  error: string | null;
}

// 年度を指定してステージ定義を作る
export const useStageDefinitions = ({
  year,
  yearLabel,
  baseQuestionCount,
}: {
  year: YearKey;
  yearLabel: string;
  baseQuestionCount: number;
}): UseStageDefinitionsResult => {
  // ローディング状態と生成済みステージをまとめて管理する
  const [status, setStatus] = useState<UseStageDefinitionsResult["status"]>(
    "idle",
  );
  const [stages, setStages] = useState<StageDefinition[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [normalizedQuestionCount, setNormalizedQuestionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 語彙データを読み込んでステージ定義へ変換する
    const run = async () => {
      try {
        setStatus("loading");
        setError(null);

        const vocab = await loadYearVocab(year);
        if (cancelled) return;

        const result = createStageDefinitions({
          year,
          yearLabel,
          vocab,
          baseQuestionCount,
        });

        setStages(result.stages);
        setTotalWords(result.totalWords);
        setNormalizedQuestionCount(result.normalizedQuestionCount);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [year, yearLabel, baseQuestionCount]);

  return {
    status,
    stages,
    totalWords,
    normalizedQuestionCount,
    error,
  };
};
