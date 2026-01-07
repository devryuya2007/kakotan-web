import {useParams} from "react-router-dom";

import {AppLayout} from "@/components/layout/AppLayout";
import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";
import TestPageLayout from "@/pages/tests/test_page/layout/TestPageLayout";

import { useStageQuestionState } from "./hooks/useStageQuestionState";
import { useStageRouteParams } from "./hooks/useStageRouteParams";

export default function StageTestPage() {
  const {year: yearParam, stageNumber: stageParam} = useParams();
  const {config} = useUserConfig();
  const { isValidYear, year, yearLabel, stageNumber, baseQuestionCount } =
    useStageRouteParams({
      yearParam,
      stageParam,
      configuredCounts: config.years,
    });

  // ステージの問題配列やエラーをまとめて管理する
  const state = useStageQuestionState({
    year,
    yearLabel,
    baseQuestionCount,
    stageNumber,
  });
  // 画面表示用の問題配列は必要に応じてシャッフルする
  const displayQuestions = state.questions;
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
            count={displayQuestions.length}
            questions={displayQuestions}
            sectionId={`${yearLabel} Stage ${stageNumber}`}
            stageId={state.stage.stageId}
          />
        )}
      </div>
    </AppLayout>
  );
}
