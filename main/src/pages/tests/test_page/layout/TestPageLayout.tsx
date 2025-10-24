import { useEffect, useMemo, useRef, useState } from "react";
import { type QuizQuestion } from "../../../../data/vocabLoader";

type TestPageLayoutProps = {
  questions: QuizQuestion[];
  count: number;
};

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReduced(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReduced;
}

export default function TestPageLayout({
  questions,
  count,
}: TestPageLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buttonStates, setButtonStates] = useState<
    Record<string, "base" | "correct" | "incorrect">
  >({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const shuffledChoicesRef = useRef<Record<string, string[]>>({});
  const cacheSourceRef = useRef<QuizQuestion[] | null>(null);
  const FEEDBACK_DELAY = 100; // 押下直後の余白（次操作解放まで合計0.5s）
  const TRANSITION_DURATION = 600; // アニメーション本体（FEEDBACK_DELAYと合わせて0.5s）
  const prefersReducedMotion = usePrefersReducedMotion();
  const effectiveTransitionDuration = prefersReducedMotion
    ? 0
    : TRANSITION_DURATION;

  if (cacheSourceRef.current !== questions) {
    shuffledChoicesRef.current = {};
    cacheSourceRef.current = questions;
  }

  const question = questions[currentIndex];
  const getShuffledChoices = (q: QuizQuestion) => {
    const key = q.id || q.phrase;
    const cached = shuffledChoicesRef.current[key];
    if (cached) return cached;
    const randomized = [...q.choices].sort(() => Math.random() - 0.5);
    shuffledChoicesRef.current[key] = randomized;
    return randomized;
  };
  const answerChoice = question?.choices[question?.answerIndex];
  const totalQuestions = count || questions.length || 1;
  const visibleCards = useMemo(
    () => questions.slice(currentIndex, currentIndex + 4),
    [questions, currentIndex]
  );

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  if (!question || !answerChoice) return null;

  function handleClick(choice: string) {
    if (!answerChoice || isTransitioning) return;

    const isAnswer = choice === answerChoice;
    setButtonStates((prev) => ({
      ...prev,
      [choice]: isAnswer ? "correct" : "incorrect",
    }));

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(true);
      feedbackTimeoutRef.current = null;

      const finalizeTransition = () => {
        setButtonStates({});
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      };

      if (effectiveTransitionDuration === 0) {
        finalizeTransition();
      } else {
        transitionTimeoutRef.current = setTimeout(
          finalizeTransition,
          effectiveTransitionDuration
        );
      }
    }, FEEDBACK_DELAY);
  }

  const baseButtonStyle =
    "group relative rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top,#1a1c26,#070811)]/90 px-5 py-4 text-center text-base font-medium tracking-wide text-white/85 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f2c97d]/70 hover:bg-[radial-gradient(circle_at_top,#202333,#0d101c)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  const correctButtonStyle =
    "rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  const incorrectButtonStyle =
    "rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  function ButtonStyleSwitch(choice: string) {
    if (buttonStates[choice] === "correct") return correctButtonStyle;
    if (buttonStates[choice] === "incorrect") return incorrectButtonStyle;
    else return baseButtonStyle;
  }

  const baseLayouts = [
    { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 40 },
    { x: -6, y: -4, scale: 0.94, opacity: 0.9, zIndex: 30 },
    { x: -12, y: -7, scale: 0.88, opacity: 0.7, zIndex: 20 },
    { x: -18, y: -11, scale: 0.82, opacity: 0.0, zIndex: 10 },
  ];

  const transitionLayouts = [
    { x: 14, y: 12, scale: 1.02, opacity: 0, zIndex: 5 },
    baseLayouts[0],
    baseLayouts[1],
    { x: -12, y: -7, scale: 0.88, opacity: 0.72, zIndex: 22 },
  ];

  function getCardPresentation(idx: number) {
    const layouts =
      isTransitioning && effectiveTransitionDuration > 0
        ? transitionLayouts
        : baseLayouts;
    const clampedIndex = Math.min(idx, layouts.length - 1);
    return layouts[clampedIndex];
  }

  return (
    <section className="relative flex justify-center px-4">
      <div className="relative min-h-[420px] w-full max-w-3xl">
        {visibleCards.map((cardQuestion, idx) => {
          if (!cardQuestion) return null;

          const isActiveCard = idx === 0;
          const cardIndex = currentIndex + idx;
          const cardProgress = Math.min(
            ((cardIndex + 1) / totalQuestions) * 100,
            100
          );
          const cardChoices = getShuffledChoices(cardQuestion);
          const presentation = getCardPresentation(idx);
          const transform = `translate3d(${presentation.x}%, ${presentation.y}%, 0) scale(${presentation.scale})`;
          const interactive = idx === 0 && !isTransitioning;
          const glowClass =
            idx === 0
              ? "shadow-[0_42px_85px_-48px_rgba(242,201,125,0.65)]"
              : idx === 1
              ? "shadow-[0_18px_60px_-54px_rgba(242,201,125,0.35)]"
              : "";

          return (
            <div
              key={`${cardQuestion.phrase}-${cardIndex}`}
              className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px] transform-gpu transition-all ease-out will-change-transform will-change-opacity ${
                interactive ? "pointer-events-auto" : "pointer-events-none"
              } ${glowClass}`}
              style={{
                transform,
                opacity: presentation.opacity,
                zIndex: presentation.zIndex,
                transitionDuration: `${effectiveTransitionDuration}ms`,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}>
              <div className="bg-[#050509] [border-radius:inherit] px-6 py-[72px] text-white">
                <div className="sticky top-4 z-20 mb-6 rounded-xl border border-white/10 bg-[#050509]/90 px-4 py-3 backdrop-blur-sm ">
                  <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-white/50">
                    <span>問題 {cardIndex + 1}</span>
                    <span>
                      {cardIndex + 1} / {totalQuestions}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
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
                <h1 className="mb-6 text-center text-4xl font-bold text-[#f2c97d]">
                  {cardQuestion.phrase}
                </h1>
                <div className="grid grid-cols-2 gap-3 text-center text-white/80">
                  {cardChoices.map((choice, choiceIndex) => (
                    <button
                      onClick={
                        isActiveCard ? () => handleClick(choice) : undefined
                      }
                      disabled={!isActiveCard || isTransitioning}
                      key={choiceIndex}
                      className={`${
                        isActiveCard
                          ? ButtonStyleSwitch(choice)
                          : `${baseButtonStyle} cursor-default opacity-70`
                      }`}>
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
