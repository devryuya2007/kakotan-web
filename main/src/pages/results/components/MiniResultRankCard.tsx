import type { MutableRefObject, RefObject } from "react";

import { MiniResultMascotSvg } from "./MiniResultMascotSvg";

interface MiniResultPalette {
  muted: string;
  highlight: string;
  accent: string;
  subtle: string;
}

interface RankInfo {
  letter: string;
  title: string;
  level: number;
  nextXp: number;
}

interface MiniResultRankCardProps {
  palette: MiniResultPalette;
  rankInfo: RankInfo;
  expRingRef: RefObject<HTMLDivElement>;
  expMascotRef: RefObject<HTMLButtonElement>;
  expPointsRef: MutableRefObject<Array<HTMLSpanElement | null>>;
  expPointCount: number;
  shouldShowMascot: boolean;
  shouldHideMascotAtStart: boolean;
  handleMascotTap: () => void;
  mascotFillRatio: number;
  prefersReducedMotion: boolean;
  displayProgress: number;
  shouldAnimateGain: boolean;
  r: number;
  circumference: number;
  dashOffset: number;
}

// ランク表示と水ちゃん演出をまとめたカード
export function MiniResultRankCard({
  palette,
  rankInfo,
  expRingRef,
  expMascotRef,
  expPointsRef,
  expPointCount,
  shouldShowMascot,
  shouldHideMascotAtStart,
  handleMascotTap,
  mascotFillRatio,
  prefersReducedMotion,
  displayProgress,
  shouldAnimateGain,
  r,
  circumference,
  dashOffset,
}: MiniResultRankCardProps) {
  const fillOffset = 190 - (170 * Math.min(100, mascotFillRatio * 100)) / 100;

  return (
    <div className="order-1 relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1524] p-5 lg:order-2">
      <div className="pointer-events-none absolute -right-24 -top-28 h-60 w-60 rounded-full bg-gradient-to-br from-[#f2c97d33] via-[#be8b381f] to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute inset-x-0 top-8 h-px bg-gradient-to-r from-transparent via-[#f2c97d33] to-transparent" />
      </div>

      <header className="relative mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className={`text-[11px] uppercase tracking-[0.6em] ${palette.subtle}`}>
            Current rank
          </p>
          <h2 className={`text-2xl font-semibold ${palette.highlight}`}>
            {rankInfo.title}
          </h2>
          <p className={`text-xs ${palette.muted}`}>
            To next rank{" "}
            <span className={`font-semibold ${palette.accent}`}>
              {rankInfo.nextXp} XP
            </span>
          </p>
        </div>
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:mx-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fdf1d7] via-[#f2c97d] to-[#b8860b] opacity-80 blur-sm" />
          <div className="relative flex h-full w-full items-center justify-center border border-[#f2c97d55] bg-[#050509]/80 shadow-[0_0_28px_rgba(242,201,125,0.38)]">
            <span className={`absolute right-[26%] top-[15%] text-[0.55rem] tracking-[0.32em] ${palette.muted}`}>
              RANK
            </span>
            <span className={`text-4xl font-black ${palette.highlight} drop-shadow-[0_0_12px_rgba(242,201,125,0.65)]`}>
              {rankInfo.letter}
            </span>
          </div>
        </div>
      </header>

      <div
        ref={expRingRef}
        className="relative mx-auto flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44"
      >
        {/* 水ちゃんはXP獲得時だけ出す */}
        {shouldShowMascot && (
          <button
            ref={expMascotRef}
            type="button"
            onClick={handleMascotTap}
            className="absolute -left-10 top-6 h-14 w-14 cursor-pointer appearance-none bg-transparent p-0 sm:-left-12 sm:top-4 sm:h-16 sm:w-16"
            style={shouldHideMascotAtStart ? { opacity: 0 } : undefined}
            aria-label="水ちゃんを動かす"
          >
            <MiniResultMascotSvg
              fillOffset={fillOffset}
              prefersReducedMotion={prefersReducedMotion}
              displayProgress={displayProgress}
            />
          </button>
        )}
        {/* ポイント粒の飛翔レイヤー */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {shouldAnimateGain &&
            Array.from({ length: expPointCount }).map((_, index) => (
              <span
                key={`exp-point-${index}`}
                ref={(element) => {
                  expPointsRef.current[index] = element;
                }}
                className="absolute h-5 w-5 rounded-full bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-400 opacity-0 shadow-[0_0_14px_rgba(16,185,129,0.6)]"
              />
            ))}
        </div>
        <svg
          className="h-full w-full -rotate-90 transform text-[#1f2333]"
          viewBox="0 0 140 140"
          role="img"
          aria-label={`Level ${rankInfo.level}`}
        >
          <circle
            className="text-white/10 transition-opacity duration-500"
            stroke="currentColor"
            strokeWidth="12"
            cx="70"
            cy="70"
            r={r}
            fill="transparent"
          />
          <circle
            className="text-[#67e8f9] transition-all duration-700 ease-out"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            cx="70"
            cy="70"
            r={r}
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-[0.6rem] tracking-[0.3em] ${palette.muted}`}>
            LEVEL
          </span>
          <span className={`text-4xl font-semibold ${palette.accent}`}>
            {rankInfo.level}
          </span>
        </div>
      </div>
    </div>
  );
}
