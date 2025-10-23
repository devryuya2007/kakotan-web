import { useEffect, useMemo, useRef, useState } from "react";
import { type QuizQuestion } from "../../../../data/vocabLoader";

type TestPageLayoutProps = {
  questions: QuizQuestion[];
  count: number;
};

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
  const transitionTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const FEEDBACK_DELAY = 360;
  const TRANSITION_DURATION = 850;

  const question = questions[currentIndex];
  const shuffled = useMemo(() => {
    if (!question) return [];
    return [...question.choices].sort(() => Math.random() - 0.5);
  }, [question]);

  const answerChoice = question?.choices[question?.answerIndex];
  const totalQuestions = count || questions.length || 1;
  const visibleCards = useMemo(
    () => questions.slice(currentIndex, currentIndex + 3),
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

      transitionTimeoutRef.current = setTimeout(() => {
        setButtonStates({});
        setCurrentIndex((i) => i + 1);
        setIsTransitioning(false);
        transitionTimeoutRef.current = null;
      }, TRANSITION_DURATION);
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
          const cardChoices = isActiveCard ? shuffled : cardQuestion.choices;
          const baseWrapperClass =
            idx === 0
              ? "z-40 shadow-[0_42px_85px_-48px_rgba(242,201,125,0.65)]"
              : idx === 1
              ? "z-30 translate-x-[-5.5%] scale-[0.92] opacity-80 pointer-events-none"
              : "z-20 translate-x-[-10%] scale-[0.86] opacity-70 pointer-events-none";
          const entranceClass =
            idx === 0 && !isTransitioning ? "animate-fadeIn" : "";
          const animationClass =
            isTransitioning && idx === 0
              ? "animate-slideForward"
              : isTransitioning && idx > 0
              ? "animate-stackShift"
              : "";
          const cardWrapperClass = [baseWrapperClass, entranceClass, animationClass]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={`${cardQuestion.phrase}-${cardIndex}`}
              className={`absolute inset-0 rounded-2xl bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px] transition-all duration-500 ease-out ${cardWrapperClass}`}>
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
