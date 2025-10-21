import { useMemo, useState } from "react";
import { type QuizQuestion } from "../../../../data/vocabLoader";

type TestPageLayoutProps = {
  title: string;
  questions: QuizQuestion[];
};

export default function TestPageLayout({ questions }: TestPageLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!questions[currentIndex]) return null;
  const question = questions[currentIndex];
  const answerChoice = question.choices[question.answerIndex];

  if (!question) return null;

  const shuffled = useMemo(() => {
    return [...question.choices].sort(() => Math.random() - 0.5);
  }, [question]);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [buttonStates, setButtonStates] = useState<
    Record<string, "base" | "correct" | "incorrect">
  >({});

  function handleClick(choice: string) {
    setSelectedChoice(choice);
    const isAnswer = choice === answerChoice;
    if (!isAnswer) {
      setIsCorrect(false);
      setButtonStates((prev) => ({ ...prev, [choice]: "incorrect" }));
    }

    if (isAnswer) {
      setIsCorrect(true);
      setButtonStates((prev) => ({ ...prev, [choice]: "correct" }));

      setTimeout(() => {
        setButtonStates({});
        setSelectedChoice(null);
        setCurrentIndex((i) => i + 1);
      }, 500);
    }
  }

  function ButtonStyleSwitch(choice: string) {
    if (choice === "correct") return correctButtonStyle;

    if (choice === "incorrect") return incorrectButtonStyle;
    else return baseButtonStyle;
  }

  return (
    <div className=" rounded-2xl bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px]">
      <div className="bg-[#050509] [border-radius:inherit] px-6 py-8 text-white">
        <h1 className="mb-6 text-center text-3xl font-bold text-[#f2c97d]">
          {question.phrase}
        </h1>
        <div className="grid grid-cols-2 gap-3 text-md text-white/80">
          {shuffled.map((choice, index) => (
            <button
              onClick={() => handleClick(choice)}
              key={index}
              className={``}>
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
const baseButtonStyle =
  "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition-transform hover:-translate-y-1 hover:border-[#f2c97d] hover:bg-white/10";

const correctButtonStyle =
  "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 text-slate-950 font-semibold tracking-wide shadow-[0_15px_35px_-15px_rgba(251,191,36,0.8)] border border-amber-200/80 ring-2 ring-amber-100/60 ring-offset-2 ring-offset-slate-950";

const incorrectButtonStyle = "text-red ";

// A B C D base
// clickしたボタン要素がchoice === answerChoiceならその要素だけcorrectButtonStyle
// clickしたボタン要素がchoice !== answerChoiceならあたりのボタンだけcorrectButtonStyleをつけて、それ以外はincorrectButtonStyleをつける
