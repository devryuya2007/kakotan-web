import { useId } from "react";

import type { StageProgressEntry } from "@/features/stages/stageProgressStore";
import type { StageDefinition } from "@/features/stages/stageUtils";
import { getStageButtonClass, getStageIconColors, getStageLabelClass } from "./stageTileStyles";

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

interface StageIconProps {
  variant: "default" | "locked" | "active" | "cleared";
  stageNumber: number;
  width: number;
  height: number;
  primaryColor: string;
  primaryDeep: string;
  primaryGlow: string;
}

interface StageStartModalProps {
  stage: StageDefinition;
  progress: StageProgressEntry | null;
  accent: string;
  accentSoft: string;
  onStart: (stage: StageDefinition) => void;
}

// ステージタイル本体（押せる見た目＋ラベル）
export function StageTile({
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
  const label = `Stage ${String(stage.stageNumber).padStart(2, "0")}`;
  const variant: StageIconProps["variant"] = isCleared
    ? "cleared"
    : isActive
      ? "active"
      : "locked";

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isLocked}
      className={getStageButtonClass(isLocked)}
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
      <span className={getStageLabelClass({ isLocked, isCleared })}>
        {label}
      </span>
    </button>
  );
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
  const { isLocked, isActive, isCleared, fillBase, fillDeep, glowColor } = getStageIconColors({
    variant,
    primaryColor,
    primaryDeep,
    primaryGlow,
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={fillBase} stopOpacity="1" />
          <stop offset="100%" stopColor={fillDeep} stopOpacity="1" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="4" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {isCleared && <circle cx="60" cy="65" r="55" fill={`url(#${glowId})`} />}

      <path
        d="M60 5C68 5 110 25 115 35C120 45 120 85 115 95C110 105 68 125 60 125C52 125 10 105 5 95C0 85 0 45 5 35C10 25 52 5 60 5Z"
        fill={`url(#${gradientId})`}
        filter={`url(#${shadowId})`}
      />

      {isActive && (
        <path
          d="M60 15C65 15 100 32 103 40C106 48 106 82 103 90C100 98 65 115 60 115C55 115 20 98 17 90C14 82 14 48 17 40C20 32 55 15 60 15Z"
          fill="#ffffff"
          fillOpacity="0.18"
        />
      )}

      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontSize="32"
        fontWeight="700"
        fill="#1a1a1a"
        opacity={isLocked ? 0.4 : 0.8}
        fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      >
        {stageNumber}
      </text>
    </svg>
  );
}

// ステージ開始の確認モーダル
export function StageStartModal({
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

  return (
    <div className="space-y-4 text-left">
      <p className="text-xs uppercase tracking-[0.4em] text-white/50">
        Stage Ready
      </p>
      <p className="text-xl font-semibold uppercase text-[#f2c97d]">
        {stage.title}
      </p>
      <p className="text-sm text-white/70">
        This stage has {stage.questionCount} questions. Score 90% or higher to
        clear.
      </p>
      <p className="text-sm text-white/60">
        Last accuracy:{" "}
        {hasAttempted && lastAccuracy !== null
          ? `${lastAccuracy}%`
          : "Not attempted"}
      </p>
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-16 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accentSoft})`,
          }}
        />
        <span className="text-xs text-white/60">Clear stages one by one.</span>
      </div>
      <div className="pt-2 text-right">
        <button
          type="button"
          className="button-pressable rounded-full border border-[#f2c97d66] bg-[#14141f] px-6 py-3 text-sm font-semibold tracking-[0.3em] text-[#f2c97d] shadow-[0_0_25px_rgba(242,201,125,0.25)] transition hover:border-[#f2c97d] hover:bg-[#1c1c2a] hover:shadow-[0_0_35px_rgba(242,201,125,0.35)]"
          onClick={() => onStart(stage)}
        >
          Start
        </button>
      </div>
    </div>
  );
}
