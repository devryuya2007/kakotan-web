import { QuickStartButton } from "@/components/buttons/QuickStartButton";
import { AppLayout } from "@/components/layout/AppLayout";

// ここではテスト直後のミニ結果カードを仮で表示しておく
export default function MiniResultPage() {
  // 仮の成績データ。後で実際のテスト結果と差し替える予定
  const dummyResult = {
    title: "RESULT",
    accuracy: 92,
    studyTime: "8h 45m",
    mistakes: 18,
  };

  const summaryCards = [
    {
      label: "セクション正答率",
      value: `${dummyResult.accuracy}%`,
      tone: "text-emerald-300",
    },
    { label: "合計学習時間", value: dummyResult.studyTime },
    {
      label: "間違えた単語数",
      value: `${dummyResult.mistakes}`,
      tone: "text-rose-300",
    },
  ];

  const wrongWords = [
    { word: "accommodate", missCount: 2, accent: "text-rose-300" },
    { word: "negotiate", missCount: 2, accent: "text-rose-300" },
    { word: "implement", missCount: 1, accent: "text-amber-300" },
    { word: "perceive", missCount: 1, accent: "text-amber-300" },
    { word: "justify", missCount: 1, accent: "text-amber-300" },
    { word: "emphasize", missCount: 1, accent: "text-amber-300" },
  ];

  const weaknessMetrics = [
    { label: "不規則動詞", percent: 65, tone: "bg-rose-400" },
    { label: "句動詞", percent: 78, tone: "bg-amber-400" },
    { label: "ビジネス関連動詞", percent: 90, tone: "bg-emerald-400" },
    { label: "日常会話動詞", percent: 98, tone: "bg-sky-400" },
  ];

  return (
    <AppLayout>
      <div className="relative  flex w-full justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-[100vw] min-w-0 flex-col gap-8 pb-6 text-left text-white max-h-[calc(100dvh-4.5rem)]">
          <section className="w-full space-y-2">
            <h1 className="tracking-[0.5em] text-center text-xl font-bold tracking-tight text-white sm:text-3xl">
              {dummyResult.title}
            </h1>
            <span className="inline-flex">
              <QuickStartButton
                onClick={() => {}}
                label="Home"
                className="!w-auto !px-3 !py-1 text-xs tracking-[0.2em]"
              />
            </span>
            <span className="inline-flex">
              <QuickStartButton
                onClick={() => {}}
                label="Grades"
                className="!w-auto !px-3 !py-1 text-xs tracking-[0.2em]"
              />
            </span>
          </section>

          <section className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
            {summaryCards.map(({ label, value, tone }) => (
              <div
                key={label}
                className="flex min-w-0 flex-col gap-2 rounded-2xl border border-white/10 bg-[#0f1524]/70 p-4">
                <p className="text-xs text-white/60 sm:text-sm">{label}</p>
                <p
                  className={`text-2xl font-semibold tracking-tight sm:text-3xl ${
                    tone ?? "text-white"
                  }`}>
                  {value}
                </p>
              </div>
            ))}
          </section>

          <section className="grid mb-0 w-full min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0f1524]/70 p-5 lg:col-span-2">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white sm:text-lg">
                    間違えた単語リスト
                  </h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#f2c97d33] px-3 py-1.5 text-xs font-semibold text-[#f2c97d] transition hover:border-[#f2c97d] hover:text-[#fdf1d7] sm:px-4 sm:py-2 sm:text-sm">
                  <span aria-hidden="true">★</span>
                  弱点克服テスト
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {wrongWords.map(({ word, missCount, accent }) => (
                  <button
                    type="button"
                    key={word}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#050509]/80 px-3 py-2.5 text-left text-sm transition hover:border-[#f2c97d33] hover:bg-[#111424] sm:px-4 sm:py-3">
                    <span className="font-medium text-white">{word}</span>
                    <span
                      className={`text-[11px] font-semibold sm:text-xs ${accent}`}>
                      {missCount}回ミス
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mt-4 block w-full text-sm font-semibold text-[#f2c97d] transition hover:text-[#fdf1d7]">
                さらに表示...
              </button>
            </div>

            <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0f1524]/70 p-5">
              <h2 className="text-base font-semibold text-white sm:text-lg">
                弱点分野の分析
              </h2>
              <div className="mt-4 flex flex-col gap-3.5">
                {weaknessMetrics.map(({ label, percent, tone }) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-white/70">{label}</span>
                      <span className="font-semibold text-white">
                        {percent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${tone}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
