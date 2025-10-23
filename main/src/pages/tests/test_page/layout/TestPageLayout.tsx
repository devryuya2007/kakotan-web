import { useMemo, useState } from "react";
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

  const question = questions[currentIndex];
  const shuffled = useMemo(() => {
    if (!question) return [];
    return [...question.choices].sort(() => Math.random() - 0.5);
  }, [question]);

  const answerChoice = question?.choices[question?.answerIndex];
  const totalQuestions = count || questions.length || 1;
  const progress = Math.min(((currentIndex + 1) / totalQuestions) * 100, 100);

  if (!question || !answerChoice) return null;

  function handleClick(choice: string) {
    if (!answerChoice) return;
    const isAnswer = choice === answerChoice;
    if (!isAnswer) {
      setButtonStates((prev) => ({ ...prev, [choice]: "incorrect" }));

      setTimeout(() => {
        setButtonStates({});
        setCurrentIndex((i) => i + 1);
      }, 500);
    }

    if (isAnswer) {
      setButtonStates((prev) => ({ ...prev, [choice]: "correct" }));

      setTimeout(() => {
        setButtonStates({});
        setCurrentIndex((i) => i + 1);
      }, 500);
    }
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
    <section>
      <div className=" rounded-2xl bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px] animate-fadeIn">
        <div className="bg-[#050509] [border-radius:inherit] px-6 py-8 text-white">
          <div className="sticky top-4 z-20 mb-6 rounded-xl border border-white/10 bg-[#050509]/90 px-4 py-3 backdrop-blur-sm ">
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-white/50">
              <span>問題 {currentIndex + 1}</span>
              <span>
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <span
                aria-label={`進捗 ${currentIndex + 1} / ${totalQuestions}`}
                aria-valuemax={totalQuestions}
                aria-valuemin={0}
                aria-valuenow={currentIndex + 1}
                role="progressbar"
                className="block h-full rounded-full bg-gradient-to-r from-[#f2c97d] via-amber-300 to-yellow-200 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <h1 className="mb-6 text-center text-4xl font-bold text-[#f2c97d]">
            {question.phrase}
          </h1>
          <div className="grid grid-cols-2 gap-3 text-center text-white/80">
            {shuffled.map((choice, index) => (
              <button
                onClick={() => handleClick(choice)}
                key={index}
                className={`${ButtonStyleSwitch(choice)}`}>
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// A B C D base
// clickしたボタン要素がchoice === answerChoiceならその要素だけcorrectButtonStyle
// clickしたボタン要素がchoice !== answerChoiceならあたりのボタンだけcorrectButtonStyleをつけて、それ以外はincorrectButtonStyleをつける
