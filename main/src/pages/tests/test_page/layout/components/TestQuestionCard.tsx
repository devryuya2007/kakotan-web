import type { CSSProperties, MouseEvent } from "react";

import type { QuizQuestion } from "../../../../data/vocabLoader";
import type { CardPresentation } from "../testPageLayoutConfig";

import { ExpIndicator } from "./ExpIndicator";

interface TestQuestionCardProps {
  cardQuestion: QuizQuestion;
  cardIndex: number;
  stackIndex: number;
  totalQuestions: number;
  isSmall: boolean;
  isTransitioning: boolean;
  isActiveCard: boolean;
  presentation: CardPresentation;
  effectiveTransitionDuration: number;
  animatedXp: number;
  isGainPulse: boolean;
  prefersReducedMotion: boolean;
  expFillRatio: number;
  answerChoice?: string;
  cardChoices: string[];
  baseButtonStyle: string;
  getChoiceButtonClass: (choice: string) => string;
  onChoiceClick: (choice: string, event: MouseEvent<HTMLButtonElement>) => void;
}

// テスト中のカード1枚分を描画するコンポーネント
export function TestQuestionCard({
  cardQuestion,
  cardIndex,
  stackIndex,
  totalQuestions,
  isSmall,
  isTransitioning,
  isActiveCard,
  presentation,
  effectiveTransitionDuration,
  animatedXp,
  isGainPulse,
  prefersReducedMotion,
  expFillRatio,
  answerChoice,
  cardChoices,
  baseButtonStyle,
  getChoiceButtonClass,
  onChoiceClick,
}: TestQuestionCardProps) {
  const cardProgress = Math.min(((cardIndex + 1) / totalQuestions) * 100, 100);
  const translateX = presentation.x;
  const translateY = presentation.y;
  const baseTransform = `translate3d(${translateX}%, ${translateY}%, 0) scale(${presentation.scale})`;
  const transform = isSmall ? `translate(-50%, -50%) ${baseTransform}` : baseTransform;
  const interactive = isActiveCard && !isTransitioning;

  const glowClass =
    stackIndex === 0
      ? "shadow-[0_42px_85px_-48px_rgba(242,201,125,0.65)]"
      : stackIndex === 1
        ? "shadow-[0_18px_60px_-54px_rgba(242,201,125,0.35)]"
        : "";

  const cardShellClass = isSmall
    ? "absolute left-1/2 top-1/2 w-full  rounded-2xl"
    : "absolute inset-0 rounded-2xl";

  const toastStyle: CSSProperties = {
    transform,
    opacity: presentation.opacity,
    zIndex: presentation.zIndex,
    transitionDuration: `${effectiveTransitionDuration}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      className={`${cardShellClass} will-change-opacity transform-gpu bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px] transition-all ease-out will-change-transform ${
        interactive ? "pointer-events-auto" : "pointer-events-none"
      } ${glowClass}`}
      style={toastStyle}
    >
      {/* カード本体。外枠のゴールドから内側はダークな背景 */}
      <div
        className={`relative bg-[#050509] text-white [border-radius:inherit] ${
          isSmall ? "px-4 py-10" : "px-6 py-[72px]"
        }`}
      >
        {/* 問題番号やプログレスバーなどのヘッダー */}
        <div className="sticky top-4 z-20 mb-6 rounded-xl bg-[#050509]/90 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-white/50">
            <span>問題 {cardIndex + 1}</span>
            <span>
              {cardIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="relative mt-2">
            {/* 水ちゃんは進捗バーの上に固定で配置する */}
            <ExpIndicator
              value={animatedXp}
              isPulse={isGainPulse}
              prefersReducedMotion={prefersReducedMotion}
              isCompact={isSmall}
              fillRatio={expFillRatio}
              className={
                isSmall
                  ? "absolute left-1/2 -top-[58px] z-[30] -translate-x-1/2"
                  : "absolute left-1/2 -top-[72px] z-[30] -translate-x-1/2"
              }
            />
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <span
                aria-label={`進捗 ${cardIndex + 1} / ${totalQuestions}`}
                aria-valuemax={totalQuestions}
                aria-valuemin={0}
                aria-valuenow={cardIndex + 1}
                role="progressbar"
                className="block h-full rounded-full bg-gradient-to-r from-[#f2c97d] via-amber-300 to-yellow-200 transition-all duration-500"
                style={{ width: `${cardProgress}%` }}
              />
            </div>
          </div>
        </div>
        {/* 出題中の単語 */}
        <h1 className="mb-6 text-center text-4xl font-bold text-[#f2c97d]">
          {cardQuestion.phrase}
        </h1>
        {/* 選択肢ボタンのグリッド */}
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 text-center text-white/80 sm:grid-cols-2">
          {cardChoices.map((choice, choiceIndex) => {
            return (
              <li key={choiceIndex} className="relative flex justify-center">
                <button
                  aria-label="正誤判定"
                  data-testid={
                    choice === answerChoice ? "correct-choice" : "incorrect-choice"
                  }
                  data-skip-click-sound
                  onClick={isActiveCard ? (event) => onChoiceClick(choice, event) : undefined}
                  disabled={!isActiveCard || isTransitioning}
                  className={`${
                    isActiveCard
                      ? getChoiceButtonClass(choice)
                      : `${baseButtonStyle} cursor-default opacity-70`
                  }`}
                >
                  {choice}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
