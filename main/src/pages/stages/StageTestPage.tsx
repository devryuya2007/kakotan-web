import {useEffect, useState} from "react";

import {useParams} from "react-router-dom";

import {AppLayout} from "@/components/layout/AppLayout";
import {loadYearVocab} from "@/data/vocabLoader";
import type {QuizQuestion, YearKey} from "@/data/vocabLoader";
import {
  buildStageQuestions,
  createStageDefinitions,
  type StageDefinition,
} from "@/features/stages/stageUtils";
import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";
import TestPageLayout from "@/pages/tests/test_page/layout/TestPageLayout";

import {YEAR_LABELS, isYearKey} from "./stageConstants";

interface StageQuestionState {
  status: "idle" | "loading" | "ready" | "error";
  stage: StageDefinition | null;
  questions: QuizQuestion[];
  error: string | null;
}

export default function StageTestPage() {
  const {year: yearParam, stageNumber: stageParam} = useParams();
  const {config} = useUserConfig();

  // URLの年度が有効かチェックして、無効ならデフォルトに切り替える
  const isValidYear =
    typeof yearParam === "string" && isYearKey(yearParam);

  // 年度とステージ番号を確定させる
  const year: YearKey =
    typeof yearParam === "string" && isYearKey(yearParam)
      ? yearParam
      : "reiwa3";
  // ステージ番号は1以上の数値に丸めておく
  const parsedStageNumber = Number(stageParam ?? "1");
  const stageNumber =
    Number.isFinite(parsedStageNumber) && parsedStageNumber > 0
      ? parsedStageNumber
      : 1;
  const baseQuestionCount = config[year].maxCount;
  const yearLabel = YEAR_LABELS[year];

  // ステージの問題配列やエラーをまとめて管理する
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
        setState((prev) => ({...prev, status: "loading", error: null}));

        const vocab = await loadYearVocab(year);
        if (cancelled) return;

        // ステージ定義を作って、該当番号のステージを探す
        const {stages} = createStageDefinitions({
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

  // URLの年度が不正ならメニューに戻す案内を出す
  if (!isValidYear) {
    return (
      <AppLayout>
        <div className="flex w-full items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-[#0f1524] px-6 py-4 text-center text-sm text-white/70">
            年度が見つからないので、メニューに戻るよ。
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="my-auto w-full max-w-4xl rounded-2xl px-6 py-8">

        {state.status === "loading" && (
          <p className="text-white/60">データを読み込んでいます…</p>
        )}
        {state.status === "error" && (
          <p className="text-sm text-rose-200">{state.error}</p>
        )}
        {state.status === "ready" && state.stage && (
          <TestPageLayout
            count={state.questions.length}
            questions={state.questions}
            sectionId={`${yearLabel} Stage ${stageNumber}`}
            stageId={state.stage.stageId}
          />
        )}
      </div>
    </AppLayout>
  );
}
