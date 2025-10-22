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
  if (!questions[currentIndex]) return null;
  const question = questions[currentIndex];
  const answerChoice = question.choices[question.answerIndex];

  if (!question) return null;

  const shuffled = useMemo(() => {
    return [...question.choices].sort(() => Math.random() - 0.5);
  }, [question]);

  const [buttonStates, setButtonStates] = useState<
    Record<string, "base" | "correct" | "incorrect">
  >({});

  function handleClick(choice: string) {
    const isAnswer = choice === answerChoice;
    if (!isAnswer) {
      setButtonStates((prev) => ({ ...prev, [choice]: "incorrect" }));
    }

    if (isAnswer) {
      setButtonStates((prev) => ({ ...prev, [choice]: "correct" }));

      setTimeout(() => {
        setButtonStates({});
        setCurrentIndex((i) => i + 1);
      }, 500);
    }
  }

  function ButtonStyleSwitch(choice: string) {
    if (buttonStates[choice] === "correct") return correctButtonStyle;
    if (buttonStates[choice] === "incorrect") return incorrectButtonStyle;
    else return baseButtonStyle;
  }

  return (
    <div className=" rounded-2xl bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px]">
      <div className="bg-[#050509] [border-radius:inherit] px-6 py-8 text-white text-center aligin-center">
        <p className="text-right">{`${questions.indexOf(
          question
        )}/${count}`}</p>
        <h1 className="mb-6 text-center text-4xl font-bold text-[#f2c97d] ">
          {question.phrase}
        </h1>
        <div className="grid grid-cols-2 gap-3 text-white/80  text-bold justufy-center aligin-center">
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
  );
}
const baseButtonStyle =
  "group relative rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top,#1a1c26,#070811)]/90 px-5 py-4 text-center text-base font-medium tracking-wide text-white/85 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f2c97d]/70 hover:bg-[radial-gradient(circle_at_top,#202333,#0d101c)] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c97d]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const correctButtonStyle =
  "rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 px-5 py-4 text-center text-base font-semibold tracking-wide text-slate-900 shadow-[0_22px_48px_-20px_rgba(251,191,36,0.9)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_-18px_rgba(251,191,36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

const incorrectButtonStyle =
  "rounded-xl border border-rose-500/60 bg-gradient-to-br from-rose-600 via-rose-500 to-rose-400 px-5 py-4 text-center text-base font-semibold tracking-wide text-rose-50 shadow-[0_18px_38px_-18px_rgba(244,63,94,0.85)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

// A B C D base
// clickしたボタン要素がchoice === answerChoiceならその要素だけcorrectButtonStyle
// clickしたボタン要素がchoice !== answerChoiceならあたりのボタンだけcorrectButtonStyleをつけて、それ以外はincorrectButtonStyleをつける
