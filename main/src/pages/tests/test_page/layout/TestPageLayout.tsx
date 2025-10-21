import { type QuizQuestion } from "../../../../data/vocabLoader";
import { useMemo } from "react";

type TestPageLayoutProps = {
  questions: QuizQuestion[];
  count: number;
};

export default function TestPageLayout({
  questions,
  count,
}: TestPageLayoutProps) {
  const question = questions[0];
  if (!question) return null;
  const shuffled = useMemo(() => {
    return [...question.choices].sort(() => Math.random() - 0.5);
  }, [question]);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#b8860b] to-[#f2c97d] p-[2px]">
      <div className="bg-[#050509] [border-radius:inherit] px-6 py-8 text-white">
        <p className="text-right text-gray-500 font-bold text-xl">
          {questions.indexOf(question) + 1}/{count}
        </p>
        <h1 className="mb-6 text-center text-3xl font-bold text-[#f2c97d]">
          {question.phrase}
        </h1>
        <div className="grid grid-cols-2 gap-3 text-md text-white/80">
          {shuffled.map((choice, index) => (
            <button
              onClick={}
              key={index}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transform transition hover:-translate-y-0.5 hover:border-[#f2c97d] hover:bg-white/10">
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function nextQuize() {}
// shuffle();
// const random = mulberry32(0xc0ffee);

//  questions =  result.push({
//       id: `${e.phrase}-${i}`,
//       prompt: `${e.phrase} の日本語の意味はどれ？`,
//       choices: allChoices,
//       answerIndex,
//       phrase: e.phrase,
//       mean: e.mean,
//       contextEn: e.onePhrase,
//       contextJa: e.onePhraseJa,
//     });

// 20個
