import { useEffect, useState } from "react";

import { loadYearVocab } from "@/data/vocabLoader";
import type { QuizQuestion } from "@/data/vocabLoader";
import {
  buildStageQuestions,
  createStageDefinitions,
  type StageDefinition,
} from "@/features/stages/stageUtils";

interface StageQuestionState {
  status: "idle" | "loading" | "ready" | "error";
  stage: StageDefinition | null;
  questions: QuizQuestion[];
  error: string | null;
}

interface UseStageQuestionStateArgs {
  year: string;
  yearLabel: string;
  baseQuestionCount: number;
  stageNumber: number;
}

// ステージの問題状態をまとめて管理するフック
export const useStageQuestionState = ({
  year,
  yearLabel,
  baseQuestionCount,
  stageNumber,
}: UseStageQuestionStateArgs): StageQuestionState => {
  const [state, setState] = useState<StageQuestionState>({
    status: "idle",
    stage: null,
    questions: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    // 年度語彙を読み込み、ステージ定義→問題配列の順で組み立てる
    const run = async () => {
      try {
        setState((prev) => ({ ...prev, status: "loading", error: null }));

        const vocab = await loadYearVocab(year);
        if (cancelled) return;

        // ステージ定義を作って、該当番号のステージを探す
        const { stages } = createStageDefinitions({
          year,
          yearLabel,
          vocab,
          baseQuestionCount,
        });

        const targetStage =
          stages.find((stage) => stage.stageNumber === stageNumber) ?? null;

        // ステージが見つからない場合はエラーを出す
        if (!targetStage) {
          setState({
            status: "error",
            stage: null,
            questions: [],
            error: "指定されたステージが見つかりませんでした。",
          });
          return;
        }

        // ステージ範囲の語彙から問題を作る
        const questions = buildStageQuestions({
          vocab,
          stage: targetStage,
        });

        setState({
          status: "ready",
          stage: targetStage,
          questions,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          stage: null,
          questions: [],
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [year, yearLabel, baseQuestionCount, stageNumber]);

  return state;
};
