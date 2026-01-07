import {useCallback, useEffect, useReducer} from "react";

import {useLocation, useNavigate, useParams} from "react-router-dom";

import {AppLayout} from "@/components/layout/AppLayout";
import {Modal} from "@/components/modal/Modal";
import {QuickStartButton} from "@/components/buttons/QuickStartButton";
import {type StageProgressState} from "@/features/stages/stageProgressStore";
import type {StageDefinition} from "@/features/stages/stageUtils";
import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";
import {initialStageSelectState, stageSelectReducer} from "@/pages/stages/stageSelectState";
import { getAllRegistry } from "@/hooks/getAllRegistry";

import {useStageDefinitions} from "./hooks/useStageDefinitions";
import { getYearLabels, isYearKey } from "./stageConstants";
import {StageGrid} from "./components/StageGrid";
import {StageLoadingOverlay} from "./components/StageLoadingOverlay";
import {StageSelectHeader} from "./components/StageSelectHeader";
import {StageStartModal} from "./components/StageTile";
import {useStageProgressSync} from "./hooks/useStageProgressSync";
import { useStageStatusMap } from "./hooks/useStageStatusMap";

export default function StageSelectPage() {
  const {year: yearParam} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(
    stageSelectReducer,
    initialStageSelectState,
  );
  // フラット系デザインの基準カラー（メインは #f2c97d）
  const primaryColor = "#f2c97d";
  const primaryDeep = "#d4a34d";
  const primaryGlow = "rgba(242, 201, 125, 0.35)";
  // タイルとトークンのサイズは固定値で扱って、位置計算を分かりやすくする
  const tileWidth = 120;
  const tileIconHeight = 130;
  const tileLabelHeight = 26;
  const tileHeight = tileIconHeight + tileLabelHeight;
  const tileGap = 24;

  const registry = getAllRegistry();
  const yearLabels = getYearLabels();
  // URLの年度が有効かチェックして、無効ならデフォルトに切り替える
  const isValidYear = typeof yearParam === "string" && isYearKey(yearParam);

  // 年度ラベルを決める
  const fallbackYear = registry[0]?.key ?? "reiwa3";
  const year = isValidYear ? yearParam : fallbackYear;
  const yearEntry = registry.find((entry) => entry.key === year);
  const yearLabel = yearLabels[year] ?? yearEntry?.label ?? year;
  // ユーザー設定の「1ステージあたりの問題数」を取得する
  const {config} = useUserConfig();
  const baseQuestionCount =
    config.years[year]?.maxCount ?? yearEntry?.defaultQuestionCount ?? 10;

  const {status, stages} = useStageDefinitions({
    year,
    yearLabel,
    baseQuestionCount,
  });
  // 読み込み中はローディングを出す
  const isLoadingStages = status === "idle" || status === "loading";

  // 進捗はマウント時にlocalStorageから読み込み、reducerのstateで更新する
  const handleProgressSync = useCallback(
    (progress: StageProgressState) => {
      dispatch({type: "setStageProgress", progress});
    },
    [dispatch],
  );

  useStageProgressSync({
    onSync: handleProgressSync,
    refreshKey: location.key,
  });

  // 画面に入ったタイミングでアニメーションを開始
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      dispatch({type: "setVisible", isVisible: true});
    });
    return () => {
      cancelAnimationFrame(raf);
      dispatch({type: "setVisible", isVisible: false});
    };
  }, []);

  // 次に挑戦すべきステージを探して、駒の位置を決める
  const { stageStatusMap, activeStageIndex, selectedStageProgress } = useStageStatusMap({
    stages,
    stageProgress: state.stageProgress,
    selectedStage: state.selectedStage,
  });

  // ステージ開始ボタン
  const handleStartStage = (stage: StageDefinition) => {
    dispatch({type: "selectStage", stage: null});
    navigate(`/stages/${year}/${stage.stageNumber}`);
  };

  // URLの年度が不正ならメニューに戻す案内を出す
  if (!isValidYear) {
    return (
      <AppLayout>
        <div className="flex w-full flex-col items-center gap-6">
          <QuickStartButton
            onClick={() => navigate("/")}
            label="Home"
          />
          <div className="rounded-2xl border border-white/10 bg-[#0f1524] px-6 py-4 text-center text-sm text-white/70">
            年度が見つからないので、メニューに戻ります。
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout mainClassName="overflow-y-auto overscroll-y-contain">
        <div
          className={`mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 transition-all duration-500 ease-out sm:px-6 ${
            state.isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <StageSelectHeader yearLabel={yearLabel} />
          <section className="relative min-h-[220px] sm:min-h-[260px]">
            <StageLoadingOverlay isVisible={isLoadingStages} />
            {status === "ready" && (
              <StageGrid
                stages={stages}
                stageStatusMap={stageStatusMap}
                activeStageIndex={activeStageIndex}
                primaryColor={primaryColor}
                primaryDeep={primaryDeep}
                primaryGlow={primaryGlow}
                tileWidth={tileWidth}
                tileHeight={tileHeight}
                tileIconHeight={tileIconHeight}
                tileGap={tileGap}
                onSelectStage={(stage) =>
                  dispatch({type: "selectStage", stage})
                }
              />
            )}
          </section>
        </div>

        <Modal
          open={Boolean(state.selectedStage)}
          onClose={() => dispatch({type: "selectStage", stage: null})}
          content={
            state.selectedStage ? (
              <StageStartModal
                stage={state.selectedStage}
                progress={selectedStageProgress}
                accent={primaryColor}
                accentSoft={primaryDeep}
                onStart={handleStartStage}
              />
            ) : null
          }
        />
      </AppLayout>

      {/* 画面スクロール中も常に右下に表示したいので画面固定で配置 */}
      <div className="fixed bottom-6 right-6 z-50">
        <QuickStartButton
          onClick={() => navigate("/")}
          label="Home"
        />
      </div>
    </>
  );
}
