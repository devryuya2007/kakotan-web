import {useEffect, useMemo, useReducer} from "react";

import {useLocation, useNavigate, useParams} from "react-router-dom";

import {AppLayout} from "@/components/layout/AppLayout";
import {Modal} from "@/components/modal/Modal";
import {QuickStartButton} from "@/components/buttons/QuickStartButton";
import {
  buildStageStatusMap,
  loadStageProgress,
} from "@/features/stages/stageProgressStore";
import type {StageDefinition} from "@/features/stages/stageUtils";
import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";
import {initialStageSelectState, stageSelectReducer} from "@/pages/stages/stageSelectState";
import { getAllRegistry } from "@/hooks/getAllRegistry";

import {useStageDefinitions} from "./hooks/useStageDefinitions";
import { getYearLabels, isYearKey } from "./stageConstants";
import { StageStartModal, StageTile } from "./components/StageTile";

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
  useEffect(() => {
    const syncProgress = () => {
      dispatch({type: "setStageProgress", progress: loadStageProgress()});
    };

    // 画面表示時に必ず最新の進捗を読み込む
    syncProgress();

    const handleFocus = () => {
      syncProgress();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncProgress();
      }
    };
    const handlePageShow = () => {
      syncProgress();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "stage-progress:v1") {
        syncProgress();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("storage", handleStorage);
    };
  }, [location.key]);

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
  const stageStatusMap = useMemo(
    () => buildStageStatusMap(stages, state.stageProgress),
    [stages, state.stageProgress],
  );
  const nextPlayableIndex = stages.findIndex((stage) => {
    const status = stageStatusMap[stage.stageId];
    return Boolean(status?.isUnlocked && !status?.isCleared);
  });
  const activeStageIndex =
    stages.length === 0
      ? 0
      : nextPlayableIndex >= 0
        ? nextPlayableIndex
        : stages.length - 1;
  // 進捗をもとに、どのステージが解放されているかを計算する
  const selectedStageProgress = state.selectedStage
    ? state.stageProgress[state.selectedStage.stageId]
    : null;

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
          <div className="flex w-full items-center justify-end">
            <span className="text-xs uppercase tracking-[0.35em] text-white/40">
              {yearLabel}
            </span>
          </div>
          <section className='relative min-h-[220px] sm:min-h-[260px]'>
            {isLoadingStages && (
              <div
                className='absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[#0b0b13]/60 backdrop-blur-sm'
                role='status'
                aria-live='polite'
                aria-label='Loading stages'
              >
                <div className='flex flex-col items-center gap-4'>
                  <div className='h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-[#67e8f9]' />
                  <span className='text-sm uppercase tracking-[0.3em] text-white/70'>
                    Loading...
                  </span>
                </div>
              </div>
            )}
            {status === 'ready' && stages.length > 0 && (
              <div
                className='mx-auto grid w-full justify-center'
                style={{
                  gridTemplateColumns: `repeat(auto-fit, minmax(${tileWidth}px, ${tileWidth}px))`,
                  gap: `${tileGap}px`,
                }}
              >
                {/* ステージタイルはGridで自動配置し、初期幅が0でも崩れにくくする */}
                {stages.map((stage, index) => {
                  const stageStatus = stageStatusMap[stage.stageId];
                  const isCleared = Boolean(stageStatus?.isCleared);
                  // 進捗とステージ順から解放状態を決める
                  const isUnlocked = Boolean(stageStatus?.isUnlocked);
                  const isActive = index === activeStageIndex;

                  return (
                    <StageTile
                      key={stage.stageId}
                      stage={stage}
                      isLocked={!isUnlocked && !isCleared}
                      isCleared={isCleared}
                      isActive={isActive}
                      primaryColor={primaryColor}
                      primaryDeep={primaryDeep}
                      primaryGlow={primaryGlow}
                      tileWidth={tileWidth}
                      tileHeight={tileHeight}
                      tileIconHeight={tileIconHeight}
                      delayMs={index * 60}
                      onSelect={() => dispatch({type: "selectStage", stage})}
                    />
                  );
                })}
              </div>
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
