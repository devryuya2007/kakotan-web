import {
  mulberry32,
  shuffle,
  type QuizQuestion,
} from "../../../../data/vocabLoader";

type TestPageLayoutProps = {
  title: string;
  questions: QuizQuestion[];
};

export default function TestPageLayout({
  title,
  questions,
}: TestPageLayoutProps) {
  return (
    <div className="bg-[#050509] rounded-xl p-6 text-white">
      <h1 className="mb-6 text-center text-3xl font-bold text-[#f2c97d]">
        {title}
      </h1>
      <p className="text-sm text-white/70">
        {/* 仮の表示。選択肢表示などの本処理はここに追記する */}
        取得した問題数: {questions.length} 件
      </p>
    </div>
  );
}
shuffle();
const random = mulberry32(0xc0ffee);

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
