import {useEffect, useId, useMemo, useReducer} from "react";

import {useLocation, useNavigate, useParams} from "react-router-dom";

import {AppLayout} from "@/components/layout/AppLayout";
import {Modal} from "@/components/modal/Modal";
import {QuickStartButton} from "@/components/buttons/QuickStartButton";
import {
  type StageProgressEntry,
  buildStageStatusMap,
  loadStageProgress,
} from "@/features/stages/stageProgressStore";
import type {StageDefinition} from "@/features/stages/stageUtils";
import type {YearKey} from "@/data/vocabLoader";
import {useUserConfig} from "@/pages/tests/test_page/hooks/useUserConfig";
import {initialStageSelectState, stageSelectReducer} from "@/pages/stages/stageSelectState";

import {useStageDefinitions} from "./hooks/useStageDefinitions";
import {YEAR_LABELS, isYearKey} from "./stageConstants";

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

  // URLの年度が有効かチェックして、無効ならデフォルトに切り替える
  const isValidYear =
    typeof yearParam === "string" && isYearKey(yearParam);

  // 年度ラベルを決める
  const year: YearKey =
    typeof yearParam === "string" && isYearKey(yearParam)
      ? yearParam
      : "reiwa3";
  const yearLabel = YEAR_LABELS[year];
  // ユーザー設定の「1ステージあたりの問題数」を取得する
  const {config} = useUserConfig();
  const baseQuestionCount = config.years[year].maxCount;

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
                <div className='flex flex-col items-center gap-3'>
                  <div className='h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#67e8f9]' />
                  <span className='text-xs uppercase tracking-[0.3em] text-white/60'>
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

interface StageTileProps {
  stage: StageDefinition;
  isLocked: boolean;
  isCleared: boolean;
  isActive: boolean;
  primaryColor: string;
  primaryDeep: string;
  primaryGlow: string;
  tileWidth: number;
  tileHeight: number;
  tileIconHeight: number;
  delayMs: number;
  onSelect: () => void;
}

function StageTile({
  stage,
  isLocked,
  isCleared,
  isActive,
  primaryColor,
  primaryDeep,
  primaryGlow,
  tileWidth,
  tileHeight,
  tileIconHeight,
  delayMs,
  onSelect,
}: StageTileProps) {
  const label = `Stage ${String(stage.stageNumber).padStart(2, '0')}`;
  const variant: StageIconProps['variant'] = isCleared
    ? 'cleared'
    : isActive
      ? 'active'
      : 'locked';

  return (
    <button
      type='button'
      onClick={onSelect}
      disabled={isLocked}
      className={`button-pressable group flex flex-col items-center justify-start transition-all duration-300 ${
        isLocked ? 'cursor-not-allowed' : 'hover:-translate-y-1'
      }`}
      style={{
        width: `${tileWidth}px`,
        height: `${tileHeight}px`,
        transitionDelay: `${delayMs}ms`,
      }}
    >
      <StageIcon
        variant={variant}
        stageNumber={stage.stageNumber}
        width={tileWidth}
        height={tileIconHeight}
        primaryColor={primaryColor}
        primaryDeep={primaryDeep}
        primaryGlow={primaryGlow}
      />
      <span
        className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${
          isCleared
            ? 'text-emerald-300'
            : isLocked
              ? 'text-[#f2c97d]/50'
              : 'text-[#f2c97d]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

interface StageIconProps {
  variant: 'default' | 'locked' | 'active' | 'cleared';
  stageNumber: number;
  width: number;
  height: number;
  primaryColor: string;
  primaryDeep: string;
  primaryGlow: string;
}

// 参考HTMLの形をベースに、フラットで洗練されたステージアイコンを作る
function StageIcon({
  variant,
  stageNumber,
  width,
  height,
  primaryColor,
  primaryDeep,
  primaryGlow,
}: StageIconProps) {
  const gradientId = useId();
  const shadowId = useId();
  const glowId = useId();
  const isLocked = variant === 'locked';
  const isActive = variant === 'active';
  const isCleared = variant === 'cleared';
  const lockedBase = '#b19662';
  const lockedDeep = '#8a6f42';
  const clearedBase = '#8fe3b3';
  const clearedDeep = '#4fbf7d';
  const fillBase = isCleared
    ? clearedBase
    : isLocked
      ? lockedBase
      : primaryColor;
  const fillDeep = isCleared
    ? clearedDeep
    : isLocked
      ? lockedDeep
      : primaryDeep;
  const glowColor = isCleared ? 'rgba(112, 230, 176, 0.55)' : primaryGlow;

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 120 130'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        <linearGradient id={gradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor={fillBase} stopOpacity='1' />
          <stop offset='100%' stopColor={fillDeep} stopOpacity='1' />
        </linearGradient>
        <filter id={shadowId} x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='3' />
          <feOffset dx='0' dy='4' result='offsetblur' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.3' />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
        <radialGradient id={glowId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor={glowColor} stopOpacity='0.8' />
          <stop offset='100%' stopColor={glowColor} stopOpacity='0' />
        </radialGradient>
      </defs>

      {isCleared && <circle cx='60' cy='65' r='55' fill={`url(#${glowId})`} />}

      <path
        d='M60 5C68 5 110 25 115 35C120 45 120 85 115 95C110 105 68 125 60 125C52 125 10 105 5 95C0 85 0 45 5 35C10 25 52 5 60 5Z'
        fill={`url(#${gradientId})`}
        filter={`url(#${shadowId})`}
      />

      {isActive && (
        <path
          d='M60 15C65 15 100 32 103 40C106 48 106 82 103 90C100 98 65 115 60 115C55 115 20 98 17 90C14 82 14 48 17 40C20 32 55 15 60 15Z'
          fill='#ffffff'
          fillOpacity='0.18'
        />
      )}

      <text
        x='60'
        y='78'
        textAnchor='middle'
        fontSize='32'
        fontWeight='700'
        fill='#1a1a1a'
        opacity={isLocked ? 0.4 : 0.8}
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        {stageNumber}
      </text>
    </svg>
  );
}

interface StageStartModalProps {
  stage: StageDefinition;
  progress: StageProgressEntry | null;
  accent: string;
  accentSoft: string;
  onStart: (stage: StageDefinition) => void;
}

function StageStartModal({
  stage,
  progress,
  accent,
  accentSoft,
  onStart,
}: StageStartModalProps) {
  const hasAttempted = Boolean(progress?.hasAttempted);
  const lastAccuracy = hasAttempted
    ? Math.round((progress as StageProgressEntry).lastAccuracy * 100)
    : null;
  // スタート前の説明をシンプルにまとめる
  return (
    <div className='space-y-4 text-left'>
      <p className='text-xs uppercase tracking-[0.4em] text-white/50'>
        Stage Ready
      </p>
      <p className='text-xl font-semibold uppercase text-[#f2c97d]'>
        {stage.title}
      </p>
      <p className='text-sm text-white/70'>
        This stage has {stage.questionCount} questions. Score 90% or higher to clear.
      </p>
      <p className='text-sm text-white/60'>
        Last accuracy:{' '}
        {hasAttempted && lastAccuracy !== null ? `${lastAccuracy}%` : 'Not attempted'}
      </p>
      <div className='flex items-center gap-3'>
        <div
          className='h-2 w-16 rounded-full'
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accentSoft})`,
          }}
        />
        <span className='text-xs text-white/60'>Clear stages one by one.</span>
      </div>
      <div className='pt-2 text-right'>
        <button
          type='button'
          className='button-pressable rounded-full border border-[#f2c97d66] bg-[#14141f] px-6 py-3 text-sm font-semibold tracking-[0.3em] text-[#f2c97d] shadow-[0_0_25px_rgba(242,201,125,0.25)] transition hover:border-[#f2c97d] hover:bg-[#1c1c2a] hover:shadow-[0_0_35px_rgba(242,201,125,0.35)]'
          onClick={() => onStart(stage)}
        >
          Start
        </button>
      </div>
    </div>
  );
}
